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

    // Check for appointments created by this user
    const createdAppointments = await prisma.appointment.findMany({
      where: { createdById: user.id },
    });
    console.log(`   Appointments created: ${createdAppointments.length}`);

    // Delete appointments created by this user first
    if (createdAppointments.length > 0) {
      console.log(`\n🗑️  Deleting ${createdAppointments.length} appointment(s) created by this user...`);
      await prisma.appointment.deleteMany({
        where: { createdById: user.id },
      });
      console.log(`✅ Deleted appointments`);
    }

    // Delete cases owned by this user (this will cascade delete documents)
    if (user.clientCases.length > 0) {
      console.log(`\n🗑️  Deleting ${user.clientCases.length} case(s) owned by this user...`);
      await prisma.case.deleteMany({
        where: { clientId: user.id },
      });
      console.log(`✅ Deleted cases and related documents`);
    }

    // Now delete the user (cascade will handle sessions, accounts, notes)
    console.log(`\n🗑️  Deleting user...`);
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

