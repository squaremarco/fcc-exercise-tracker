const { model, Schema, SchemaTypes } = require('mongoose');
const { capitalize } = require('lodash/fp');
const { ObjectId: SObjectId, String: SString, Number: SNumber, Date: SDate } = SchemaTypes;

const MODEL_PREFIX = 'fcc-exercise-tracker';

const required = (type) => ({ type, required: true });
const makeModelName = (name) => `${MODEL_PREFIX}-${capitalize(name)}`;

const User = model(
  makeModelName('user'),
  new Schema({
    username: required(SString),
  })
);

const Exercise = model(
  makeModelName('exercise'),
  new Schema({
    userId: required(SObjectId),
    description: required(SString),
    duration: required(SNumber),
    date: { type: SDate, default: Date.now },
  })
);

module.exports = { User, Exercise };
