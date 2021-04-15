const express = require('express')
const app = express();

const fs = require('fs')
const path = require('path')

const directory = path.join('files')
const fileName = "pingpong.txt"
const filePath = path.join(directory, fileName)

// NOTICE: This causes the counter to reset on application restart etc.
let pongCounter = 0


const setupPongCounter = () => {
  console.log("Setting up file: " + fileName)
  fs.mkdir(directory, function() {
    const result = fs.statSync(directory).isDirectory(); // Will be created at this point
    console.log('Directory created', result) // Returns true
  });

  updatePongCounter()
}

const updatePongCounter = () => {
  fs.writeFile(filePath, pongCounter.toString(), (err) => {
    if(err){
      console.log('pongcounter counter update error', error)
    } else {
      console.log('Succeeded in updating the pongcounter file')
    }
  })
}


app.get("/", (req, res) => {
  pongCounter = pongCounter + 1
  updatePongCounter()
  res.send(`Pong ${pongCounter}`)
})

// Used in excercise 111
setupPongCounter()

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
