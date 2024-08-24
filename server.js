const dotenv = require('dotenv');
const mongoose = require('mongoose');

// connecting our config.env file
dotenv.config({ path: './config.env' });
const app = require('./app');

// function eventHnadleErrors(err) {}
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION. Shutting down the server. . .');
  console.log(err.name, err.message);
  process.exit(1);
  // server.close(() => {
  // });
});
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => {
    console.log('Database connection successfull');
  });

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION. Shutting down the server. . .');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
