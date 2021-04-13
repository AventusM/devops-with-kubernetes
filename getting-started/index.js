const randomString = Math.random().toString(36).substring(3, 8);
const printTimestampedString = () => {
  const timeStamp = new Date().toUTCString();
  console.log(`${timeStamp} /// ${randomString}`);
  setTimeout(printTimestampedString, 5000);
};

printTimestampedString();
