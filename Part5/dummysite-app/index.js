require('dotenv').config();
const express = require('express');
app = express();

const axios = require('axios');
const URL = process.env.website_url || 'https://example.com';

app.get('/', async (_req, res) => {
  const response = await axios.get(URL);
  res.send(response.data);
});

const PORT = 3008;
app.listen(PORT, () => {
  console.log(`Running dummysite-app in port ${PORT}`);
});
