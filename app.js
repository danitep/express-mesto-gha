const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '65718f9c08adf1f05bc211ce', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.patch('/:any', (req, res) => {
  const err = new Error('Неверный путь');
  err.name = 'Not Found';
  err.status = 404;
  const { message } = err;
  res.status(err.status).send({ message });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
