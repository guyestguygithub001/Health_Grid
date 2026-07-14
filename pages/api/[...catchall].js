const server = require("../../server/server.js");

export default function handler(req, res) {
  return new Promise((resolve) => {
    server.emit("request", req, res);
    res.on("finish", resolve);
  });
}

// Disable body parsing so the existing collectBody logic in server.js can read the stream directly
export const config = {
  api: {
    bodyParser: false,
  },
};
