const express = require("express");
const app = express();

const randomString = Math.random().toString(36).substring(3, 8);
const printTimestampedString = () => {
  const timeStamp = new Date().toUTCString();
  console.log(`${timeStamp} /// ${randomString}`);
  setTimeout(printTimestampedString, 5000);
};

printTimestampedString();

app.get("/", (_req, res) => {
  const timeStamp = new Date().toUTCString();
  res.send(`${timeStamp} /// ${randomString}`)
})

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

