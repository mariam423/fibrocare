const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const u = await p.user.findUnique({ where: { email: "test@gmail.com" } });
  console.log("USER:", JSON.stringify({ id: u.id, name: u.name, email: u.email }));
  const logs = await p.painLog.findMany({
    where: { userId: u.id },
    select: { id: true, painLevel: true, moodTag: true, notes: true, loggedAt: true },
    orderBy: { loggedAt: "asc" },
  });
  console.log(`LOGS (${logs.length}):`);
  for (const l of logs)
    console.log(JSON.stringify({ id: l.id, level: l.painLevel, mood: l.moodTag, notes: l.notes, at: l.loggedAt }));
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
