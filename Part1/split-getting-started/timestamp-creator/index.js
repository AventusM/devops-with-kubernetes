const express = require('express')
const app = express()

const fs = require('fs')
const path = require('path')
const FIVE_SECONDS_IN_MILLIS = 5000

const directory = path.join('files')
const fileName = "log.txt"
const filePath = path.join(directory, fileName)

const setupFileAndRun = () => {
  console.log("Setting up file")
  fs.mkdir(directory, function() {
    const result = fs.statSync(directory).isDirectory(); // Will be created at this point
    console.log('Directory created', result) // Returns true
  });

  console.log("Lets go")
  run()
}


const run = () => {
  setInterval(() => {
    const timeStamp = new Date().toUTCString();
    const separator = "\n"
    const appendedText = `${timeStamp}${separator}`
    fs.appendFile(filePath, appendedText, (err) => {
      if(err){
        console.log("appendFile error", err)
      } else {
        console.log("appended data:", timeStamp)
      }
    })
  }, FIVE_SECONDS_IN_MILLIS)
}


setupFileAndRun()
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (timestamp-creator)`);
});
