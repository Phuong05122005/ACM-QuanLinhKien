import { pool } from '@/lib/pg';

export async function processInventoryTransaction({
  componentId,
  quantityChange,
  transactionType,
  referenceId,
  userId
}: {
  componentId: string;
  quantityChange: number;
  transactionType: string;
  referenceId?: string;
  userId: string;
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Atomic update
    let updateQuery = '';
    let updateValues: unknown[] = [];

    if (quantityChange < 0) {
      // Must ensure we don't go below zero
      updateQuery = `
        UPDATE components 
        SET available_quantity = available_quantity + $1,
            total_quantity = CASE WHEN $3 = true THEN total_quantity + $1 ELSE total_quantity END
        WHERE id = $2 AND available_quantity >= ABS($1)
        RETURNING available_quantity, total_quantity
      `;
      const reducesTotal = ['STOCK_OUT', 'DAMAGE', 'MISSING'].includes(transactionType);
      updateValues = [quantityChange, componentId, reducesTotal];
    } else {
      updateQuery = `
        UPDATE components 
        SET available_quantity = available_quantity + $1,
            total_quantity = CASE WHEN $3 = true THEN total_quantity + $1 ELSE total_quantity END
        WHERE id = $2
        RETURNING available_quantity, total_quantity
      `;
      const increasesTotal = ['STOCK_IN', 'ADJUSTMENT'].includes(transactionType);
      updateValues = [quantityChange, componentId, increasesTotal];
    }

    const res = await client.query(updateQuery, updateValues);

    if (res.rowCount === 0) {
      throw new Error('INSUFFICIENT_INVENTORY');
    }

    // Record transaction
    await client.query(`
      INSERT INTO inventory_transactions (id, component_id, quantity_change, transaction_type, reference_id, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
    `, [componentId, quantityChange, transactionType, referenceId || null]);

    // Audit log
    await client.query(`
      INSERT INTO audit_logs (id, user_id, action, resource, details)
      VALUES (gen_random_uuid(), $1, $2, 'inventory', $3)
    `, [userId, transactionType, `Changed inventory by ${quantityChange} for component ${componentId}`]);

    await client.query('COMMIT');
    return res.rows[0];
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
