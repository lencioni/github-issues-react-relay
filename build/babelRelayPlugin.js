const getbabelRelayPlugin = require('babel-relay-plugin');
const schema = require('../data/schema.json');

module.exports = getbabelRelayPlugin(schema.data);
