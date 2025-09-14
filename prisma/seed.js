import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: "john@example.com",
      name: "John Doe",
      role: "CLIENT",
      id: "1",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: "2",
      email: "lawyer@gmail.com",
      name: "Lawyer",
      role: "LAWYER",
    },
  });

  // Create cases
  // await prisma.case.create({
  //   data: {
  //     title: "First Case",
  //     description: "This is the first test case",
  //     status: "OPEN",
  //     userId: user1.id,
  //   },
  // });

  // await prisma.case.create({
  //   data: {
  //     title: "Second Case",
  //     description: "This is the second test case",
  //     status: "IN_PROGRESS",
  //     userId: user2.id,
  //   },
  // });
}

main()
  .catch(e => {
    console.error(e);
    // process.exit(1);
  })
  .finally(async () => {
    // await prisma.$disconnect();
  });
