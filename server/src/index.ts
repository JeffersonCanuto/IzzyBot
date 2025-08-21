import logger from 'jet-logger';
import '../config';

import ENV from '@src/configs/ENV';
import server from './server';

const SERVER_START_MSG = `Express server started on port: ${ENV.Port}`;

// Start the server
server.listen(ENV.Port, err => {
  if (err) {
    logger.err(err.message);
  } else {
    logger.info(SERVER_START_MSG);
  }
});