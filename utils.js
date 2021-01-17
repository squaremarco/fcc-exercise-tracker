const { overSome, isNil, isEmpty, negate } = require('lodash/fp');

const isNilOrEmpty = overSome([isNil, isEmpty]);
const isNotNilOrEmpty = negate(isNilOrEmpty);

module.exports = { isNilOrEmpty, isNotNilOrEmpty };
