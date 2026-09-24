const _ = require('lodash');
const env = process.env.NODE_ENV || 'development';

const config = _.merge(
    require('./default.json'),
    require(`./${env}.json`)
);

module.exports = config;