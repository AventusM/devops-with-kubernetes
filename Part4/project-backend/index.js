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

pool.once('connect', async (client) => {
  const tableCreateQuery = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (id SERIAL PRIMARY KEY, text VARCHAR(140), completed boolean)`;
  const valueInsertQuery = `INSERT INTO ${TABLE_NAME} VALUES (DEFAULT, 'Part 4 todo value', FALSE)`;

  try {
    const creationResult = await client.query(tableCreateQuery);
    console.log('creationResult', creationResult);
    const insertionResult = await client.query(valueInsertQuery);
    console.log('insertionResult', insertionResult);
  } catch (error) {
    console.log('db error connect');
  }
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
        `INSERT INTO ${TABLE_NAME} VALUES (DEFAULT, '${req.body.todo}', FALSE)`,
      );
      connection.release();
      res.sendStatus(200);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.connect();
    await connection.query(
      `UPDATE ${TABLE_NAME} SET completed=TRUE WHERE id=${id}`,
    );
    connection.release();
    res.sendStatus(200);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Ready when path can establish a connection to the database
app.get('/healthz', async (_req, res) => {
  try {
    const connection = await pool.connect();
    const result = await connection.query(`SELECT * FROM ${TABLE_NAME}`);
    connection.release();
    res.status(200).send({ rowCount: result.rowCount });
  } catch (error) {
    res.status(500).send(error);
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (project-backend)`);
});
