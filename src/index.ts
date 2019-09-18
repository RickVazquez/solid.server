import { removeAllContractDefinitions, addContractDefinitionsFromFaker } from './utils'

import logger from './logger';
import app from './app';

const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', async () => {
  // TODO: REMOVE AFTER DEMO
  await removeAllContractDefinitions(app)
  await addContractDefinitionsFromFaker(app)
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
});
