import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(env.PORT, () => console.log(`Server listening on port ${env.PORT}`));
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
