const express = require("express");
const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')
const axios = require('axios')

const app = express();
const directory = path.join('public')
const imageFilePath = path.join(directory, 'picsum.jpg')
const lastUpdatedFilePath = path.join(directory, 'lastupdated.txt') // Should go in the cookies or something. State of the art programming right here folks
const URL = "https://picsum.photos/1200"

const todaysFileAlreadyExists = async () => new Promise(res => {
  // Check if image doesn't exist
  fs.stat(imageFilePath, (err, stats) => {
    if (err || !stats) return res(false)
    // return res(true) --> Can still be an old image. Proceed with the check
  })

  const now = new Date()
  const dayOfMonthNow = now.getDate()

  fs.readFile(lastUpdatedFilePath, (err, buffer) => {
    // Edge case --> 1 month forward match, so unlikely that I count this as sufficient enough
    const isUpdatedToday = buffer && buffer.toString() === dayOfMonthNow.toString()
    if(err || !isUpdatedToday) return res(false)
    return res(true)
  })
})

const findAFile = async () => {
  if (await todaysFileAlreadyExists()) return

  await new Promise(res => fs.mkdir(directory, (err) => res()))

  const response = await axios.get(URL, {responseType: 'stream'})
  response.data.pipe(fs.createWriteStream(imageFilePath))

  const onCreateTime = new Date()
  const dayOfMonth = onCreateTime.getDate()

  fs.writeFile(lastUpdatedFilePath, dayOfMonth.toString(), (err) => {
    if(err){
      console.log('failed to write a date', error)
    } else {
      console.log('new date added')
    }
  })
}

app.set("view engine", "njk");

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  watch: true // requires 'chokidar' to be installed as a dependency --> allows to update njk files on refresh alone
});

app.use(express.json());
app.use(express.static("public"));

app.get("/", async (_req, res) => {
  await findAFile()
  const todos = [{text: "Lets go"}, {text: "My guy!"}]
  res.render("index.njk", {todos})
})

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
