const mongoose = require('mongoose');
const dotenv = require('dotenv');
const initAdmin = require('./utils/initAdmin');

dotenv.config({ path: './config/dev.env' });

// Unclean state e.g. missing variable
// process.on('uncaughtException', err => {
//   console.log('UNCAUGHT EXCEPTION! Shutting down...');
//   console.log(`${err.name}: ${err.message}`);
//   process.exit(1);
// });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(initAdmin)
  .then(() => {
    console.log('DB connection ok!');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Unhandled promise rejection e.g. DB login failed
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
