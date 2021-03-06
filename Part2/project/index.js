const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const directory = path.join('public');
const imageFilePath = path.join(directory, 'picsum.jpg');
const lastUpdatedFilePath = path.join(directory, 'lastupdated.txt'); // Should go in the cookies or something. State of the art programming right here folks
const IMAGE_URL = 'https://picsum.photos/1200';
const TODO_BACKEND_BASEURL = 'http://kube-node-service.course-exercises:2346'; // Redirects to /todos. Accessible from browser via localhost:8081/todos. NOTICE THE NAMESPACE
// const TODO_BACKEND_BASEURL = "http://localhost:3002" Local dev --> Should use envs here rly

const todaysFileAlreadyExists = async () =>
  new Promise((res) => {
    // Check if image doesn't exist
    fs.stat(imageFilePath, (err, stats) => {
      if (err || !stats) return res(false);
      // return res(true) --> Can still be an old image. Proceed with the check
    });

    const now = new Date();
    const dayOfMonthNow = now.getDate();

    fs.readFile(lastUpdatedFilePath, (err, buffer) => {
      // Edge case --> 1 month forward match, so unlikely that I count this as sufficient enough
      const isUpdatedToday =
        buffer && buffer.toString() === dayOfMonthNow.toString();
      if (err || !isUpdatedToday) return res(false);
      return res(true);
    });
  });

const findAFile = async () => {
  if (await todaysFileAlreadyExists()) return;

  await new Promise((res) => fs.mkdir(directory, (err) => res()));

  const response = await axios.get(IMAGE_URL, { responseType: 'stream' });
  response.data.pipe(fs.createWriteStream(imageFilePath));

  const onCreateTime = new Date();
  const dayOfMonth = onCreateTime.getDate();

  fs.writeFile(lastUpdatedFilePath, dayOfMonth.toString(), (err) => {
    if (err) {
      console.log('failed to write a date', error);
    } else {
      console.log('new date added');
    }
  });
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set('view engine', 'pug');
app.use(express.static('public'));

app.use((req, _res, next) => {
  console.log('--- GATEWAY REQUEST ---');
  console.log(`Method ${req.method} /// Path ${req.path}`);
  console.log('BODY', req.body);
  next();
});

app.get('/', async (_req, res) => {
  try {
    await findAFile();
    const response = await axios.get(TODO_BACKEND_BASEURL);
    res.render('index', { todos: response.data.list });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.post('/new', async (req, res) => {
  try {
    const { todo } = req.body;
    await axios.post(TODO_BACKEND_BASEURL, { todo: todo }); // Should probably check the response status provided in the object
    res.redirect('/');
  } catch (error) {
    res.send(error.message);
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (project-gateway)`);
});
