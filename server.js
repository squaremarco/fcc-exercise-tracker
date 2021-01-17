require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connect } = require('mongoose');
const { omitBy, size, conformsTo, toNumber, cond, constant, T, identity, pipe } = require('lodash/fp');

const { isNilOrEmpty, isNotNilOrEmpty } = require('./utils');
const { User, Exercise } = require('./model');

const app = express();

const port = process.env.PORT || 3000;

(async () => {
  await connect(process.env.MONGO_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });
})();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/exercise/users', async (_, res) => {
  try {
    return res.json(await User.find());
  } catch ({ message, stack }) {
    return res.json({ error: `couldn't retrieve user list`, e: { message, stack } });
  }
});

app.get('/api/exercise/log', async ({ query } = {}, res) => {
  try {
    if (!conformsTo({ userId: isNotNilOrEmpty }, query)) throw new Error('userId parameter is mandatory!');

    const { userId, from, to, limit } = query;

    const dateFilter = pipe(
      omitBy(isNilOrEmpty),
      cond([
        [isNilOrEmpty, constant(null)],
        [T, identity],
      ])
    )({
      $gte: from,
      $lte: to,
    });

    const { _id, username } = await User.findById(userId, 'username');
    const log = await Exercise.find(
      omitBy(isNilOrEmpty, { userId, date: dateFilter }),
      'description duration date -_id',
      {
        limit: toNumber(limit),
      }
    );

    return res.json({ _id, username, count: size(log), log });
  } catch ({ message, stack }) {
    return res.json({ error: `couldn't retrieve user logs`, e: { message, stack } });
  }
});

app.post('/api/exercise/add', async ({ body } = {}, res) => {
  try {
    if (
      !conformsTo(
        {
          userId: isNotNilOrEmpty,
          description: isNotNilOrEmpty,
          duration: isNotNilOrEmpty,
        },
        body
      )
    ) {
      throw new Error(`userId, description and duration  fields are mandatory! body: ${body}`);
    }

    const { userId, description: descr, duration: dur, date: d } = body;

    const { _id, username } = (await User.findById(userId)) || {};

    if (isNilOrEmpty(username)) throw new Error(`user doesn't exists`);

    const { description, duration, date } = await Exercise.create({
      userId,
      date: isNotNilOrEmpty(d) ? d : undefined,
      duration: dur,
      description: descr,
    });

    return res.json({
      _id,
      username,
      date,
      duration,
      description,
    });
  } catch ({ message, stack }) {
    return res.json({ error: `couldn't create new exercise`, e: { message, stack } });
  }
});

app.post('/api/exercise/new-user', async ({ body } = {}, res) => {
  try {
    if (!conformsTo({ username: isNotNilOrEmpty }, body)) throw new Error('username parameter is mandatory!');

    const { username } = body;

    if (await User.findOne({ username })) throw new Error('username is already taken');

    return res.json(await User.create(body));
  } catch ({ message, stack }) {
    return res.json({ error: `couldn't create new user`, e: { message, stack } });
  }
});

app.listen(port, () => {
  console.log(`Your app is listening on port: ${port}`);
});
