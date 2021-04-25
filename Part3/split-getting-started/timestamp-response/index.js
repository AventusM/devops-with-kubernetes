require('dotenv').config();
const express = require('express');
const app = express();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const directory = path.join('files');
const logFileName = 'log.txt';
const timestampHashLogFilePath = path.join(directory, logFileName);
const randomInitHash = Math.random().toString(36).substring(3, 8);
const ENV_MESSAGE = process.env.MESSAGE || 'Message variable not applied';

// Copied from app3/images-response
const getFileContents = async (paramFilePath) =>
  new Promise((res) => {
    fs.readFile(paramFilePath, (err, buffer) => {
      if (err) {
        console.log('error:::', err);
        res(false);
      } else {
        res(buffer.toString());
      }
    });
  });

app.get('/', async (_req, res) => {
  try {
    const timestampData = await getFileContents(timestampHashLogFilePath);
    const pingPongDataResponse = await axios.get(
      'http://ping-pong-service.course-exercises:2347/pingpong',
    ); // Should get the current value without increasing it

    const renderedMessage = `<p>${ENV_MESSAGE}</p>`;
    const hashTimestamp = `<p>${timestampData} ${randomInitHash}</p>`;
    const responseCounter = `<p>Pings / Pongs: ${pingPongDataResponse.data.counter}</p>`;
    res
      .status(200)
      .send(`${renderedMessage} ${hashTimestamp} ${responseCounter}`);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (timestamp-response)`);
});
