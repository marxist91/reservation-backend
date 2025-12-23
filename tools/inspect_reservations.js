const mysql = require('mysql2/promise');
(async function(){
  try{
    const c = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT
    });
    const [fks] = await c.execute("SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME, COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='reservations' AND REFERENCED_TABLE_NAME IS NOT NULL;");
    console.log('FKs:', JSON.stringify(fks, null, 2));
    const [ddl] = await c.execute('SHOW CREATE TABLE reservations');
    if(ddl && ddl[0] && ddl[0]['Create Table']){
      console.log('\nSHOW CREATE TABLE reservations:\n');
      console.log(ddl[0]['Create Table']);
    } else {
      console.log('No CREATE TABLE output');
    }
    await c.end();
  }catch(err){
    console.error('Error:', err && err.stack ? err.stack : err);
    process.exitCode = 2;
  }
})();
