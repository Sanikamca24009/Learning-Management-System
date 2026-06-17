require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { readReplicas } = require('@prisma/extension-read-replicas');

const primaryUrl = process.env.DATABASE_URL;
const replicaUrl = process.env.DATABASE_REPLICA_URL;

const adapter = new PrismaPg({ connectionString: primaryUrl });
let prismaInstance = new PrismaClient({ adapter });

if (replicaUrl) {
  console.log('Database read replicas configuration detected. Initializing read replicas...');
  prismaInstance = prismaInstance.$extends(
    readReplicas([
      {
        url: replicaUrl,
      },
    ])
  );
  console.log('Read replicas configured successfully.');
} else {
  console.log('No DATABASE_REPLICA_URL defined. Using single-node database.');
}

const connectDB = async () => {
  try {
    await prismaInstance.$connect();
    console.log('PostgreSQL Connected via Prisma');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, prisma: prismaInstance };
