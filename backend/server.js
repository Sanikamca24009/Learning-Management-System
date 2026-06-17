require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { initRedis } = require('./src/config/redis');
const { initWorkers } = require('./src/workers');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();
  await initRedis();
  initWorkers();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
