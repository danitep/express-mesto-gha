const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');
const NotFoundError = require('./errors/not-found-err');

const {
  PORT = 3000,
  DB_URL = 'mongodb://127.0.0.1:27017/mestodb',
  STATUS_CONFLICT,
  STATUS_SERVER_ERROR,
} = process.env;

const auth = require('./middlewares/auth');

const app = express();
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(DB_URL);

const login = require('./routes/signin');
const createUser = require('./routes/signup');

app.use('/signin', login);
app.use('/signup', createUser);

app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.all('/:any', () => {
  throw new NotFoundError('Неверный путь');
});

app.use(errors());

app.use((err, req, res, next) => {
  if (err.code === 11000) {
    res.status(STATUS_CONFLICT).send({ message: 'Пользователь с такой почтой уже существует' });
  } else if (err.statusCode) {
    res.status(err.statusCode).send({ message: err.message });
  } else {
    res.status(STATUS_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
});

app.listen(PORT, () => {
});
