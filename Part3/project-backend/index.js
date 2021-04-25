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

const GKEROOT = '/todos';
const BASE_PATH = '/';
const TABLE_NAME = 'todos';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, _res, next) => {
  console.log('--- BACKEND/TODOS REQUEST---');
  console.log(`Method ${req.method} /// Path ${req.path}`);
  console.log('BODY', req.body);
  next();
});

app.get(`${GKEROOT}${BASE_PATH}`, async (_req, res) => {
  try {
    const connection = await pool.connect();
    const result = await connection.query(`SELECT * FROM ${TABLE_NAME}`);
    connection.release();
    res.send({ list: result.rows });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post(`${GKEROOT}${BASE_PATH}`, async (req, res) => {
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

app.get(BASE_PATH, (_req, res) => {
  res.status(200).send({ message: 'GKE ingress health check ok' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (project-backend)`);
});
