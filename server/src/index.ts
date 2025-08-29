import fs from "fs";
import https from "https";
import logger from 'jet-logger';

import ENV from '@src/configs/ENV';
import server from './server';

const SERVER_START_MSG = `Express server started on port: ${ENV.ServerInnerPort}`;
const options = {
  key: fs.readFileSync("certs/key.pem"),
  cert: fs.readFileSync("certs/cert.pem")
};

// Start the server
const httpsServer = https.createServer(options, server);

httpsServer.listen(ENV.ServerInnerPort, () => {
  logger.info(SERVER_START_MSG);
});

httpsServer.on("error", err => {
  logger.err(err.message);
});