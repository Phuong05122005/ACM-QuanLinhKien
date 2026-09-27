import { pool } from '@/lib/pg';
import { LoanStateMachine, LoanState, Role } from './loan.state-machine';
import { LoanPolicy } from './loan.policy';

export async function createLoan(userId: string, expectedReturnDate: string, items: { component_id: string, quantity: number }[]) {
  // Policy validation
  LoanPolicy.validateComponentLimit(items.length);
  LoanPolicy.validateDuration(new Date(), new Date(expectedReturnDate));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check concurrent active conflicting loans? 
    // The prompt says "conflicting loans" - usually means if the user already has too many active loans.
    // Check component availability and lock components
    // Map items...
    const loanCode = `L-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const loanRes = await client.query(`
      INSERT INTO loans (id, user_id, loan_code, status, due_date, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, 'PENDING', $3, NOW(), NOW())
      RETURNING *
    `, [userId, loanCode, expectedReturnDate]);
    
    const loanId = loanRes.rows[0].id;
    
    // Insert items
    for (const item of items) {
      if (item.quantity <= 0) throw new Error('Item quantity must be > 0');
      
      await client.query(`
        INSERT INTO loan_items (id, loan_id, component_id, quantity)
        VALUES (gen_random_uuid(), $1, $2, $3)
      `, [loanId, item.component_id, item.quantity]);
    }
    
    await client.query(`
      INSERT INTO loan_status_histories (id, loan_id, status, changed_by, notes, created_at)
      VALUES (gen_random_uuid(), $1, 'PENDING', $2, 'Loan created', NOW())
    `, [loanId, userId]);

    await client.query('COMMIT');
    return loanRes.rows[0];
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function transitionLoanState(loanId: string, nextState: LoanState, userId: string, role: Role) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Get current loan state with locking
    const loanRes = await client.query(`
      SELECT * FROM loans WHERE id = $1 FOR UPDATE
    `, [loanId]);
    
    if (loanRes.rows.length === 0) throw new Error('Loan not found');
    const loan = loanRes.rows[0];
    const currentState = loan.status as LoanState;
    
    // Idempotency check
    if (currentState === nextState) {
      await client.query('COMMIT');
      return loan; // Already in target state, success
    }

    // 2. State Machine Validation
    LoanStateMachine.validateTransition(currentState, nextState, role);

    // 3. Inventory Adjustments on specific transitions
    if (currentState === 'PENDING' && nextState === 'APPROVED') {
      // Must deduct inventory and prevent overselling!
      const itemsRes = await client.query(`SELECT * FROM loan_items WHERE loan_id = $1`, [loanId]);
      
      for (const item of itemsRes.rows) {
        if (item.component_id) {
          const updateRes = await client.query(`
            UPDATE components 
            SET available_quantity = available_quantity - $1
            WHERE id = $2 AND available_quantity >= $1
            RETURNING id
          `, [item.quantity, item.component_id]);
          
          if (updateRes.rowCount === 0) {
            throw new Error(`Insufficient inventory for component ${item.component_id}`);
          }
          
          await client.query(`
            INSERT INTO inventory_transactions (id, component_id, quantity_change, transaction_type, reference_id, created_at)
            VALUES (gen_random_uuid(), $1, $2, 'BORROW', $3, NOW())
          `, [item.component_id, -item.quantity, loanId]);
        }
        
        if (item.kit_id) {
          // Resolve kit components and decrement
          const kcRes = await client.query(`
            SELECT component_id, expected_quantity FROM kit_components WHERE kit_id = $1
          `, [item.kit_id]);
          
          for (const kc of kcRes.rows) {
            const requiredQty = kc.expected_quantity * item.quantity;
            const updateRes = await client.query(`
              UPDATE components 
              SET available_quantity = available_quantity - $1
              WHERE id = $2 AND available_quantity >= $1
              RETURNING id
            `, [requiredQty, kc.component_id]);
            
            if (updateRes.rowCount === 0) {
              throw new Error(`Insufficient inventory for kit ${item.kit_id} (component ${kc.component_id})`);
            }
            
            await client.query(`
              INSERT INTO inventory_transactions (id, component_id, quantity_change, transaction_type, reference_id, created_at)
              VALUES (gen_random_uuid(), $1, $2, 'BORROW', $3, NOW())
            `, [kc.component_id, -requiredQty, loanId]);
          }
        }
      }
    }
    
    // For returns, we would normally RESTORE inventory. The prompt requires us to transition it to RETURNED.
    if (['BORROWED', 'OVERDUE', 'RETURN_REQUIRES_INSPECTION'].includes(currentState) && nextState === 'RETURNED') {
      const itemsRes = await client.query(`SELECT * FROM loan_items WHERE loan_id = $1`, [loanId]);
      for (const item of itemsRes.rows) {
        if (item.component_id) {
          await client.query(`
            UPDATE components SET available_quantity = available_quantity + $1 WHERE id = $2
          `, [item.quantity, item.component_id]);
          
          await client.query(`
            INSERT INTO inventory_transactions (id, component_id, quantity_change, transaction_type, reference_id, created_at)
            VALUES (gen_random_uuid(), $1, $2, 'RETURN', $3, NOW())
          `, [item.component_id, item.quantity, loanId]);
        }
        if (item.kit_id) {
          const kcRes = await client.query(`SELECT component_id, expected_quantity FROM kit_components WHERE kit_id = $1`, [item.kit_id]);
          for (const kc of kcRes.rows) {
            const requiredQty = kc.expected_quantity * item.quantity;
            await client.query(`
              UPDATE components SET available_quantity = available_quantity + $1 WHERE id = $2
            `, [requiredQty, kc.component_id]);
            
            await client.query(`
              INSERT INTO inventory_transactions (id, component_id, quantity_change, transaction_type, reference_id, created_at)
              VALUES (gen_random_uuid(), $1, $2, 'RETURN', $3, NOW())
            `, [kc.component_id, requiredQty, loanId]);
          }
        }
      }
    }

    // 4. Update state
    const updateRes = await client.query(`
      UPDATE loans 
      SET status = $1, 
          updated_at = NOW(),
          actual_return_date = CASE WHEN $1 = 'RETURNED' THEN NOW() ELSE actual_return_date END
      WHERE id = $2
      RETURNING *
    `, [nextState, loanId]);
    
    await client.query(`
      INSERT INTO loan_status_histories (id, loan_id, status, changed_by, notes, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
    `, [loanId, nextState, userId, `Transitioned to ${nextState}`]);

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function forceReturnLoan(loanId: string, adminId: string, reason: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const loanRes = await client.query("SELECT * FROM loans WHERE id = $1 FOR UPDATE", [loanId]);
    if (loanRes.rows.length === 0) throw new Error("Loan not found");
    const loan = loanRes.rows[0];
    await client.query("UPDATE loans SET status = $1, updated_at = NOW() WHERE id = $2", ["RETURNED", loanId]);
    await client.query("INSERT INTO loan_status_histories (id, loan_id, status, changed_by, notes, created_at) VALUES (gen_random_uuid(), $1, 'RETURNED', $2, $3, NOW())", [loanId, adminId, `[EMERGENCY FORCE RETURN] ${reason}`]);
    const itemsRes = await client.query("SELECT component_id, quantity FROM loan_items WHERE loan_id = $1", [loanId]);
    for (const item of itemsRes.rows) {
      if (item.component_id) {
        await client.query("UPDATE components SET available_quantity = available_quantity + $1 WHERE id = $2", [item.quantity, item.component_id]);
      }
    }
    await client.query("COMMIT");
    return loan;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function forceInventorySync(componentId: string, adminId: string, reason: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const compRes = await client.query("SELECT * FROM components WHERE id = $1 FOR UPDATE", [componentId]);
    if (compRes.rows.length === 0) throw new Error("Component not found");
    const activeRes = await client.query("SELECT SUM(li.quantity) as borrowed FROM loan_items li JOIN loans l ON li.loan_id = l.id WHERE li.component_id = $1 AND l.status IN ('APPROVED', 'READY_FOR_PICKUP', 'BORROWED')", [componentId]);
    const borrowed = parseInt(activeRes.rows[0].borrowed || '0');
    const expectedAvailable = compRes.rows[0].total_quantity - borrowed;
    await client.query("UPDATE components SET available_quantity = $1, updated_at = NOW() WHERE id = $2", [expectedAvailable, componentId]);
    await client.query("INSERT INTO audit_logs (id, user_id, action, resource, details) VALUES (gen_random_uuid(), $1, 'INVENTORY_SYNC', 'components', $2)", [adminId, `[EMERGENCY SYNC] Comp: ${componentId}, Calculated: ${expectedAvailable}. Reason: ${reason}`]);
    await client.query("COMMIT");
    return { expectedAvailable };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
