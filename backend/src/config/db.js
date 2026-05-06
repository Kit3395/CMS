const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['warn', 'error']
});

async function connectDB() {
  await prisma.$connect();
  console.log('✅ PostgreSQL connected via Prisma');
}

module.exports = {
  prisma,
  connectDB
};
