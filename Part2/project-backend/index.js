require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
});

const TABLE_NAME = 'todos';

pool.once('connect', (client) => {
  const tableCreateQuery = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (id SERIAL PRIMARY KEY, text VARCHAR(140))`;
  // Should cover the potential edge case for the time being (query failing on no entries. Fix it or keep this)
  const valueInsertQuery = `INSERT INTO ${TABLE_NAME} VALUES (DEFAULT, 'This is an example todo')`;
  client.query(tableCreateQuery, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log(res.rows[0]);
    }
  });

  client.query(valueInsertQuery, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log(res.rows[0]);
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, _res, next) => {
  console.log('--- BACKEND/TODOS REQUEST---');
  console.log(`Method ${req.method} /// Path ${req.path}`);
  console.log('BODY', req.body);
  next();
});

app.get('/', async (_req, res) => {
  try {
    const connection = await pool.connect();
    const result = await connection.query(`SELECT * FROM ${TABLE_NAME}`);
    connection.release();
    res.send({ list: result.rows });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/', async (req, res) => {
  try {
    if (`${req.body.todo}`.length > 140) {
      const errorMessage = 'Todo length is over 140 characters';
      console.log(errorMessage);
      res.status(401).end(errorMessage);
    } else {
      const connection = await pool.connect();
      await connection.query(
        `INSERT INTO ${TABLE_NAME} VALUES (DEFAULT, '${req.body.todo}')`,
      );
      connection.release();
      res.sendStatus(200);
    }
  } catch (error) {
    res.send(error);
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (project-backend)`);
});
