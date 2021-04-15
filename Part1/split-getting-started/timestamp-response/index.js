const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')

const directory = path.join('files')
const logFileName = "log.txt"
const pingPongFileName = "pingpong.txt"

const timestampHashLogFilePath = path.join(directory, logFileName)
const pingpongFilePath = path.join(directory, pingPongFileName)

const randomInitHash = Math.random().toString(36).substring(3, 8);

// Copied from app3/images-response
const getFileContents = async (paramFilePath) => new Promise(res => {
  fs.readFile(paramFilePath, (err, buffer) => {
    if (err) {
      console.log('error:::', err)
      res(false)
    }
    else {
      res(buffer.toString())
    }
  })
})

app.get("/", async (_req, res) => {
  const timestampData = await getFileContents(timestampHashLogFilePath)
  const pingPongData = await getFileContents(pingpongFilePath) || 0 // Requires ping-pong pod to be deployed

  console.log('pingpong data -->', pingPongData)
  const arrayData = timestampData.split(`\n`)
  arrayData.pop() // Remove the empty ',' array item that was included
  const htmlHash = `<p>Hash: ${randomInitHash}</p>`
  const htmlPingPong = `<p>Ping / Pongs: ${pingPongData}</p>`
  res.send(`${htmlHash} ---------------- ${htmlPingPong} ---------------- ${getHtmlList(arrayData)}`)
})

// Returns random commas but not going to wasting time on doing html completely by hand anymore...
const getHtmlList = (array) => {
  return `<div>
  ${array.map(item => `<p>${item}</p>`)}
  </div>`
}


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (timestamp-response)`);
});
