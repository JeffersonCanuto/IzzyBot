import logger from 'jet-logger';

import ENV from '@src/configs/ENV';
import server from './server';

const SERVER_START_MSG = `Express server started on port: ${ENV.ServerInnerPort}`;

// Start the server
server.listen(ENV.ServerInnerPort, err => {
  if (err) {
    logger.err(err.message);
  } else {
    logger.info(SERVER_START_MSG);
  }
});