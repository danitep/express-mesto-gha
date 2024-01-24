const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const helmet = require('helmet');
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

app.all('/:any', (req, res) => {
  const err = new Error('Неверный путь');
  err.name = 'Not Found';
  err.status = 404;
  const { message } = err;
  res.status(err.status).send({ message });
});

app.use(errors());

app.use((err, req, res, next) => {
  if (err.code === 11000) {
    res.status(409).send({ message: 'Пользователь с такой почтой уже существует' });
  } else if (err.statusCode) {
    res.status(err.statusCode).send({ message: err.message });
  } else {
    // res.status(500).send({ message: 'Произошла ошибка на сервере' });
  }
});

app.listen(PORT, () => {
});
