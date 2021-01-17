const { overSome, isNil, isEmpty } = require('lodash/fp');

const isNilOrEmpty = overSome(isNil, isEmpty);

module.exports = { isNilOrEmpty };
