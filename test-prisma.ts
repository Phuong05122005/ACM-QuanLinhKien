import { db } from './src/lib/db';

async function test() {
  const u = await db.orm.public.User.where({ username: 'superadmin' }).first();
  if (u) {
    await db.orm.public.User.where({ id: u.id }).update({ failed_attempts: 1 });
  }
}
