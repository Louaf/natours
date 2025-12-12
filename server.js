const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('uncaughtException ! 💥');
  console.log(err);
  process.exit(1);
});

const app = require('./app');

const port = process.env.PORT;
const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {}).then(() => {
  console.log('connected');
});

console.log(process.env.NODE_ENV);

const server = app.listen(port, () => {
  console.log(`running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJECTION ! 💥');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
