import { app, logger } from './app';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`API Gateway listening at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
