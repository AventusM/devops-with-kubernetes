require('dotenv').config();
const express = require('express');
const app = express();
const { Pool } = require('pg');

// Part 2.1 - Communication happens now between endpoints instead of volumes --> Removed code related to filesystems
const cors = require('cors');
app.use(cors());

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,
});

const TABLE_NAME = 'counts';
const GKEROOT = '/pingpong';
const BASE_PATH = '/';
const INCREASE_COUNTER_PATH = '/increase';

/*pool.once('connect', async (client) => {
  const tableCreateQuery = `CREATE TABLE ${TABLE_NAME} (id SERIAL PRIMARY KEY, amount INT)`;
  const valueInsertQuery = `INSERT INTO ${TABLE_NAME} VALUES (DEFAULT, 0)`;

  const creationResult = await client.query(tableCreateQuery);
  console.log('creationResult', creationResult);
  const insertionResult = await client.query(valueInsertQuery);
  console.log('insertionResult', insertionResult);

  let runValueInsert = false;
  client.query(tableCreateQuery, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      runValueInsert = true;
      console.log('tableCreateQuery rows', res.rows[0]);
    }
  });

  if (runValueInsert === true) {
    console.log('Attempting to insert a value to the table', TABLE_NAME);
    client.query(valueInsertQuery, (err, res) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log('valueInsertQuery rows', res.rows[0]);
      }
    });
  }
});*/

app.get(`${GKEROOT}${INCREASE_COUNTER_PATH}`, async (_req, res) => {
  try {
    const connection = await pool.connect();
    await connection.query(
      `UPDATE ${TABLE_NAME} SET amount = amount+1 WHERE id=1`,
    );
    res.redirect(`${GKEROOT}${BASE_PATH}`); // To the "root" within the ingress
  } catch (err) {
    res.send(err);
  }
});

app.get(`${GKEROOT}${BASE_PATH}`, async (_req, res) => {
  try {
    const connection = await pool.connect();
    const result = await connection.query(
      `SELECT amount FROM ${TABLE_NAME} WHERE id=1`,
    );
    console.log('result rows', result.rows);
    console.log('result rowcount', result.rowCount);
    connection.release();
    res.status(200).send({
      counter: result.rows[0].amount || -1,
      message: 'Wow what an annoying exercise 3.02 was',
    });
  } catch (err) {
    console.log('/pingpong error', err);
    res.send(err);
  }
});

// Mandatory
app.get('/', (_req, res) => {
  res.status(200).send({ message: '/ GKE ingress health check test' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
