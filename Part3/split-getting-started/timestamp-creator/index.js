const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const FIVE_SECONDS_IN_MILLIS = 5000;

const directory = path.join('files');
const fileName = 'log.txt';
const filePath = path.join(directory, fileName);

const setupFileAndRun = () => {
  console.log('Setting up file');
  fs.mkdir(directory, function () {
    const result = fs.statSync(directory).isDirectory(); // Will be created at this point
    console.log('Directory created', result); // Returns true
  });

  console.log('Lets go');
  run();
};

const run = () => {
  const timeStamp = new Date().toUTCString();
  const appendedText = `${timeStamp}`;

  fs.writeFile(filePath, appendedText, (err) => {
    // Can also use appendFile to show history data. Changed to writeFile in exercise 2.6 to scroll less
    if (err) {
      console.log('writeFile error', err);
    } else {
      console.log('replaced data:', timeStamp);
    }
  });

  setTimeout(run, FIVE_SECONDS_IN_MILLIS);
};

setupFileAndRun();
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (timestamp-creator)`);
});
