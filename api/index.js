const server = require("../server/server.js");

module.exports = (req, res) => {
  // Directly invoke request listener in serverless environment
  server.emit('request', req, res);
};
