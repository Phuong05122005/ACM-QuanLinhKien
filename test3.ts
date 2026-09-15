import { db } from './src/lib/db';
async function run() {
  console.log(Object.keys(db.orm.public));
}
run();
