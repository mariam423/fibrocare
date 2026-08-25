/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS dev script */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to database...");
    const log = await prisma.painLog.create({
      data: {
        painLevel: 5,
        moodTag: "Test Mood",
      },
    });
    console.log("Successfully created log:", log);
  } catch (e) {
    console.error("Error creating log:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
