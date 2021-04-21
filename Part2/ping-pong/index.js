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

pool.on('connect', (client) => {
  const tableCreateQuery =
    'CREATE TABLE IF NOT EXISTS counts (ID INT PRIMARY KEY NOT NULL, AMOUNT INT)';
  const valueInsertQuery = 'INSERT INTO counts (ID, AMOUNT) VALUES (1, 0)';
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

// NOTICE: This causes the counter to reset on application restart etc.
//let pongCounter = 0

app.get('/increase', async (_req, res) => {
  try {
    //pongCounter = pongCounter + 1
    const connection = await pool.connect();
    await connection.query('UPDATE counts SET amount = amount+1 WHERE id=1');
    res.redirect('/pingpong'); // To the "root" within the ingress
  } catch (err) {
    res.send(err);
  }
});

app.get('/', async (_req, res) => {
  try {
    const connection = await pool.connect();
    const result = await connection.query(
      'SELECT amount FROM counts WHERE id=1',
    );
    connection.release();
    res.send({ counter: result.rows[0].amount || 0 });
  } catch (err) {
    res.send(err);
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
