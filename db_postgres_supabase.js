import pgPromise from 'pg-promise';
const pgp = pgPromise({});
const cn = {
  host: 'db.iiwgpiixwjyrrjokkxqe.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'plmedeiros1q2w3e4r123',
  max: 30
};
/* const db = pgp('postgres://postgres:Plmedeiros1q2w3e4r@@db.iiwgpiixwjyrrjokkxqe.supabase.co:5432/postgres') */
export const db = pgp(cn);
db.connect()
  .then((obj) => {
    console.log('Connected to database');
    obj.done(); // success, release connection;
  })
  .catch((error) => {
    console.error('ERROR:', error.message);
  });


