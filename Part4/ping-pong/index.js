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

pool.once('connect', async (client) => {
  const tableCreateQuery = `CREATE TABLE ${TABLE_NAME} (id SERIAL PRIMARY KEY, amount INT)`;
  const valueInsertQuery = `INSERT INTO ${TABLE_NAME} VALUES (DEFAULT, 0)`;

  try {
    const creationResult = await client.query(tableCreateQuery);
    console.log('creationResult', creationResult);
    const insertionResult = await client.query(valueInsertQuery);
    console.log('insertionResult', insertionResult);
  } catch (error) {
    console.log('db error connect');
  }
});

app.get('/increase', async (_req, res) => {
  try {
    const connection = await pool.connect();
    await connection.query(
      `UPDATE ${TABLE_NAME} SET amount = amount+1 WHERE id=1`,
    );
    res.redirect('/'); // To the "root" within the ingress
  } catch (err) {
    res.send(err);
  }
});

app.get('/', async (_req, res) => {
  try {
    const connection = await pool.connect();
    const result = await connection.query(
      `SELECT amount FROM ${TABLE_NAME} WHERE id=1`,
    );
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

// Ready when path can establish a connection to the database
app.get('/healthz', async (_req, res) => {
  try {
    const connection = await pool.connect();
    const result = await connection.query(
      `SELECT amount FROM ${TABLE_NAME} WHERE id=1`,
    );
    connection.release();
    res.status(200).send({ rowCount: result.rowCount });
  } catch (error) {
    res.status((500).send(error));
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
