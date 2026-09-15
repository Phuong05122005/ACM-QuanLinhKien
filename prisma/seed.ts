import { Client } from 'pg';
import { randomUUID } from 'crypto';

async function main() {
  console.log('Seeding development data...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Roles
    const roles = [
      { id: '1', name: 'SUPER_ADMIN', description: 'Super Administrator' },
      { id: '2', name: 'ADMIN', description: 'Administrator' },
      { id: '3', name: 'STUDENT', description: 'Student' },
    ];
    for (const r of roles) {
      await client.query(`
        INSERT INTO roles (id, name, description) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (name) DO NOTHING;
      `, [r.id, r.name, r.description]);
    }

    // Super Admin
    const saId = randomUUID();
    await client.query(`
      INSERT INTO users (id, email, password_hash, full_name, username, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
      ON CONFLICT (username) DO NOTHING;
    `, [saId, 'superadmin@example.com', 'hashed_password', 'Super Admin', 'superadmin']);

    await client.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT id, '1' FROM users WHERE username = 'superadmin'
      ON CONFLICT DO NOTHING;
    `);

    // Admins
    for (let i = 1; i <= 2; i++) {
      const aId = randomUUID();
      await client.query(`
        INSERT INTO users (id, email, password_hash, full_name, username, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
        ON CONFLICT (username) DO NOTHING;
      `, [aId, `admin${i}@example.com`, 'hashed_password', `Admin ${i}`, `admin${i}`]);

      await client.query(`
        INSERT INTO user_roles (user_id, role_id)
        SELECT id, '2' FROM users WHERE username = $1
        ON CONFLICT DO NOTHING;
      `, [`admin${i}`]);
    }

    // Students
    for (let i = 1; i <= 10; i++) {
      const sId = randomUUID();
      await client.query(`
        INSERT INTO users (id, email, password_hash, full_name, username, student_code, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
        ON CONFLICT (username) DO NOTHING;
      `, [sId, `student${i}@example.com`, 'hashed_password', `Student ${i}`, `student${i}`, `STU00${i}`]);

      await client.query(`
        INSERT INTO user_roles (user_id, role_id)
        SELECT id, '3' FROM users WHERE username = $1
        ON CONFLICT DO NOTHING;
      `, [`student${i}`]);
    }

    // Categories
    const categoryNames = ['Microcontrollers', 'Sensors', 'Motors', 'Power Supplies', 'Displays'];
    for (const name of categoryNames) {
      const cId = randomUUID();
      await client.query(`
        INSERT INTO component_categories (id, name, description) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (name) DO NOTHING;
      `, [cId, name, `${name} category`]);
    }

    // Components
    for (let i = 1; i <= 20; i++) {
      const catName = categoryNames[i % categoryNames.length];
      const compId = randomUUID();
      await client.query(`
        INSERT INTO components (id, name, category_id, total_quantity, available_quantity, identifier, created_at) 
        SELECT $1, $2, id, 100, 100, $3, NOW() FROM component_categories WHERE name = $4
        ON CONFLICT (identifier) DO NOTHING;
      `, [compId, `Component ${i}`, `COMP00${i}`, catName]);
    }

    // Kits
    for (let i = 1; i <= 5; i++) {
      const kitId = randomUUID();
      await client.query(`
        INSERT INTO kits (id, name, description, kit_code) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (kit_code) DO NOTHING;
      `, [kitId, `Kit ${i}`, `Description for Kit ${i}`, `KIT00${i}`]);

      await client.query(`
        INSERT INTO kit_components (kit_id, component_id, quantity)
        SELECT $1, id, 2 FROM components WHERE identifier = $2
        ON CONFLICT DO NOTHING;
      `, [kitId, `COMP00${(i * 1) % 20 || 1}`]);
    }

    // QR Code
    const qrId = randomUUID();
    await client.query(`
      INSERT INTO qr_codes (id, code, entity_type, entity_id) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (code) DO NOTHING;
    `, [qrId, 'QR_DEMO_1', 'KIT', 'dummy-id']);

    console.log('Seeding finished.');
  } catch (err) {
    console.error('Seeding failed (DB might be offline):', err);
  } finally {
    await client.end();
  }
}

main();
