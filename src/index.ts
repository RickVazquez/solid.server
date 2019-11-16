import { app, logger } from '@solid-explorer/server'

const port = app.get('port');

export const startServer = () => {
    const server = app.listen(port);

    process.on('unhandledRejection', (reason, p) =>
        logger.error('Unhandled Rejection at: Promise ', p, reason)
    );

    server.on('listening', async () => {
        logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
    });
}

startServer()
