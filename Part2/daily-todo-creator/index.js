const fs = require('fs');
const path = require('path');
const axios = require('axios');

const directory = path.join('files');
const fileName = 'todos.txt';
const filePath = path.join(directory, fileName);

const setupFileAndRun = async () => {
  console.log('Setting up', filePath);
  fs.mkdir(directory, function () {
    const result = fs.statSync(directory).isDirectory(); // Will be created at this point
    console.log('Directory ready status:', result); // Returns true
    console.log("TODO's below");
  });

  await run();
};

const run = async () => {
  const readToday = await getRandomWikiArticle();
  fs.appendFile(filePath, `${readToday}\n`, (err) => {
    if (err) {
      console.log('appendFile error', err);
    }
  });

  fs.readFile(filePath, (err, data) => {
    if (err) throw err;
    console.log(data.toString());
  });
};

const getRandomWikiArticle = async () => {
  const response = await axios.get(
    'https://en.wikipedia.org/wiki/Special:Random',
  );

  const today = new Date();
  const euroFormat = `${today.getMonth() + 1}/${today.getDate()}`;
  const str = `Read ${response.request.res.responseUrl} on ${euroFormat}`;
  return str;
};

setupFileAndRun();
