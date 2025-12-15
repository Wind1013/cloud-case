import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const email = "crisvin.habitsuela@sorsu.edu.ph";
  
  console.log(`🔍 Searching for user with email: ${email}`);
  
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        sessions: true,
        accounts: true,
        clientCases: true,
        notes: true,
      },
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found in database.`);
      return;
    }

    console.log(`✅ Found user: ${user.name} (ID: ${user.id})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Sessions: ${user.sessions.length}`);
    console.log(`   Accounts: ${user.accounts.length}`);
    console.log(`   Cases: ${user.clientCases.length}`);
    console.log(`   Notes: ${user.notes.length}`);

    // Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log(`\n✅ Successfully deleted user: ${user.name} (${email})`);
    console.log(`   All related records (sessions, accounts, cases, notes) have been deleted.`);
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\n🔌 Disconnected from database");
  });

