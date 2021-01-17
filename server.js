require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connect } = require('mongoose');
const { pipe, omitBy, isDate, isNil, isEmpty, overSome, negate, cond, constant, T, identity } = require('lodash/fp');

const { isNilOrEmpty } = require('./utils');
const { User, Exercise } = require('./model');

const app = express();

const port = process.env.PORT || 3000;

(async () => {
  await connect(process.env.MONGO_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });
})();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/exercise/users', async (_, res) => {
  try {
    res.json(await User.find());
  } catch ({ message, stack }) {
    res.json({ error: `couldn't retrieve user list`, e: { message, stack } });
  }
});

app.get('/api/exercise/log', async (req, res) => {
  try {
    const { userId, from, to, limit } = req.query || {};

    if (isNilOrEmpty(userId)) throw new Error('userId parameter is mandatory!');

    const dateFilter = pipe(
      omitBy(overSome(negate(isDate), isNil)),
      cond([
        [isEmpty, constant(null)],
        [T, identity],
      ])
    )({
      $gte: from ? new Date(from) : null,
      $lte: to ? new Date(to) : null,
    });

    res.json(await Exercise.find(omitBy(isNilOrEmpty, { userId, date: dateFilter }), null, { limit }));
  } catch ({ message, stack }) {
    res.json({ error: `couldn't retrieve user list`, e: { message, stack } });
  }
});

app.post('/api/exercise/add', async ({ body } = {}, res) => {
  try {
    res.json(await Exercise.create(body));
  } catch ({ message, stack }) {
    res.json({ error: `couldn't create new user`, e: { message, stack } });
  }
});

app.post('/api/exercise/new-user', async ({ body } = {}, res) => {
  try {
    res.json(await User.create(body));
  } catch ({ message, stack }) {
    res.json({ error: `couldn't create new user`, e: { message, stack } });
  }
});

app.listen(port, () => {
  console.log(`Your app is listening on port: ${port}`);
});
