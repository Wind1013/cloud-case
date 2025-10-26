import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  await prisma.document.deleteMany();
  await prisma.case.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared existing data");

  // Create Users (5-10 items)
  const users = await Promise.all([
    // Lawyers
    prisma.user.create({
      data: {
        id: "lawyer-1",
        name: "Sarah Johnson",
        firstName: "Sarah",
        lastName: "Johnson",
        middleName: "Marie",
        gender: "FEMALE",
        birthday: new Date("1985-03-15"),
        phone: "+1-555-0101",
        email: "sarah.johnson@lawfirm.com",
        emailVerified: true,
        role: "LAWYER",
        image:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      },
    }),
    prisma.user.create({
      data: {
        id: "lawyer-2",
        name: "Michael Chen",
        firstName: "Michael",
        lastName: "Chen",
        gender: "MALE",
        birthday: new Date("1978-11-22"),
        phone: "+1-555-0102",
        email: "michael.chen@lawfirm.com",
        emailVerified: true,
        role: "LAWYER",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      },
    }),
    prisma.user.create({
      data: {
        id: "lawyer-3",
        name: "Emily Rodriguez",
        firstName: "Emily",
        lastName: "Rodriguez",
        middleName: "Carmen",
        gender: "FEMALE",
        birthday: new Date("1982-07-08"),
        phone: "+1-555-0103",
        email: "emily.rodriguez@lawfirm.com",
        emailVerified: true,
        role: "LAWYER",
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      },
    }),
    // Staff
    prisma.user.create({
      data: {
        id: "staff-1",
        name: "David Wilson",
        firstName: "David",
        lastName: "Wilson",
        gender: "MALE",
        birthday: new Date("1990-01-12"),
        phone: "+1-555-0201",
        email: "david.wilson@lawfirm.com",
        emailVerified: true,
        role: "STAFF",
      },
    }),
    prisma.user.create({
      data: {
        id: "staff-2",
        name: "Lisa Thompson",
        firstName: "Lisa",
        lastName: "Thompson",
        middleName: "Ann",
        gender: "FEMALE",
        birthday: new Date("1988-09-25"),
        phone: "+1-555-0202",
        email: "lisa.thompson@lawfirm.com",
        emailVerified: true,
        role: "STAFF",
      },
    }),
    // Clients
    prisma.user.create({
      data: {
        id: "client-1",
        name: "John Smith",
        firstName: "John",
        lastName: "Smith",
        middleName: "Robert",
        gender: "MALE",
        birthday: new Date("1975-05-30"),
        phone: "+1-555-0301",
        email: "john.smith@email.com",
        emailVerified: true,
        role: "CLIENT",
      },
    }),
    prisma.user.create({
      data: {
        id: "client-2",
        name: "Maria Garcia",
        firstName: "Maria",
        lastName: "Garcia",
        middleName: "Isabella",
        gender: "FEMALE",
        birthday: new Date("1983-12-03"),
        phone: "+1-555-0302",
        email: "maria.garcia@email.com",
        emailVerified: true,
        role: "CLIENT",
      },
    }),
    prisma.user.create({
      data: {
        id: "client-3",
        name: "Robert Brown",
        firstName: "Robert",
        lastName: "Brown",
        gender: "MALE",
        birthday: new Date("1970-08-17"),
        phone: "+1-555-0303",
        email: "robert.brown@email.com",
        emailVerified: false,
        role: "CLIENT",
      },
    }),
    prisma.user.create({
      data: {
        id: "client-4",
        name: "Jennifer Davis",
        firstName: "Jennifer",
        lastName: "Davis",
        middleName: "Lynn",
        gender: "FEMALE",
        birthday: new Date("1992-04-14"),
        phone: "+1-555-0304",
        email: "jennifer.davis@email.com",
        emailVerified: true,
        role: "CLIENT",
      },
    }),
    prisma.user.create({
      data: {
        id: "client-5",
        name: "Alex Johnson",
        firstName: "Alex",
        lastName: "Johnson",
        gender: "MALE",
        birthday: new Date("1987-06-21"),
        phone: "+1-555-0305",
        email: "alex.johnson@email.com",
        emailVerified: true,
        role: "CLIENT",
      },
    }),
  ]);

  console.log(`👥 Created ${users.length} users`);

  // Create Sessions (5-7 items for active users)
  const sessions = await Promise.all([
    prisma.session.create({
      data: {
        id: "session-1",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session1",
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        userId: "lawyer-1",
      },
    }),
    prisma.session.create({
      data: {
        id: "session-2",
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session2",
        ipAddress: "10.0.0.50",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
        userId: "client-1",
      },
    }),
    prisma.session.create({
      data: {
        id: "session-3",
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session3",
        ipAddress: "172.16.0.25",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        userId: "client-2",
      },
    }),
    prisma.session.create({
      data: {
        id: "session-4",
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session4",
        ipAddress: "203.0.113.42",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        userId: "staff-1",
      },
    }),
    prisma.session.create({
      data: {
        id: "session-5",
        expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session5",
        ipAddress: "198.51.100.15",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
        userId: "lawyer-2",
      },
    }),
  ]);

  console.log(`🔐 Created ${sessions.length} sessions`);

  // Create Accounts (6-8 items)
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        id: "account-1",
        accountId: "google-12345",
        providerId: "google",
        userId: "lawyer-1",
        accessToken: "ya29.a0AfH6SMC...",
        refreshToken: "1//04...",
        idToken: "eyJhbGciOiJSUzI1NiIs...",
        accessTokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
        scope: "openid email profile",
      },
    }),
    prisma.account.create({
      data: {
        id: "account-2",
        accountId: "github-67890",
        providerId: "github",
        userId: "client-1",
        accessToken: "ghp_xxxxxxxxxxxxxxxxxxxx",
        scope: "user:email",
      },
    }),
    prisma.account.create({
      data: {
        id: "account-3",
        accountId: "credentials-1",
        providerId: "credentials",
        userId: "client-2",
        password: "$2a$12$hashedpassword123", // This would be properly hashed
      },
    }),
    prisma.account.create({
      data: {
        id: "account-4",
        accountId: "google-54321",
        providerId: "google",
        userId: "lawyer-2",
        accessToken: "ya29.b0AfH6SMD...",
        refreshToken: "1//05...",
        idToken: "eyJhbGciOiJSUzI1NiJt...",
        accessTokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        scope: "openid email profile",
      },
    }),
    prisma.account.create({
      data: {
        id: "account-5",
        accountId: "credentials-2",
        providerId: "credentials",
        userId: "staff-1",
        password: "$2a$12$anotherhashpassword456",
      },
    }),
    prisma.account.create({
      data: {
        id: "account-6",
        accountId: "google-98765",
        providerId: "google",
        userId: "client-4",
        accessToken: "ya29.c0AfH6SME...",
        refreshToken: "1//06...",
        scope: "openid email profile",
      },
    }),
  ]);

  console.log(`🔑 Created ${accounts.length} accounts`);

  // Create Verifications (5 items)
  const verifications = await Promise.all([
    prisma.verification.create({
      data: {
        id: "verify-1",
        identifier: "robert.brown@email.com",
        value: "123456",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    }),
    prisma.verification.create({
      data: {
        id: "verify-2",
        identifier: "password-reset-client-3",
        value: "abc123def456",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    }),
    prisma.verification.create({
      data: {
        id: "verify-3",
        identifier: "newuser@email.com",
        value: "789012",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    }),
    prisma.verification.create({
      data: {
        id: "verify-4",
        identifier: "2fa-lawyer-1",
        value: "345678",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    }),
    prisma.verification.create({
      data: {
        id: "verify-5",
        identifier: "email-change-client-2",
        value: "xyz789abc123",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    }),
  ]);

  console.log(`✅ Created ${verifications.length} verifications`);

  // Create Cases (7-10 items)
  const cases = await Promise.all([
    prisma.case.create({
      data: {
        title: "Personal Injury Claim - Car Accident",
        description:
          "Client involved in rear-end collision. Seeking compensation for medical expenses and lost wages.",
        type: "CIVIL",
        status: "PRELIMINARY_CONFERENCE",
        clientId: "client-1",
      },
    }),
    prisma.case.create({
      data: {
        title: "Divorce Proceedings - Garcia vs Garcia",
        description:
          "Contested divorce case involving child custody and property division.",
        type: "CIVIL",
        status: "PRELIMINARY_CONFERENCE",
        clientId: "client-2",
      },
    }),
    prisma.case.create({
      data: {
        title: "Contract Dispute - Business Partnership",
        description:
          "Commercial dispute over partnership agreement and profit sharing.",
        type: "CIVIL",
        status: "PRELIMINARY_CONFERENCE",
        clientId: "client-3",
      },
    }),
    prisma.case.create({
      data: {
        title: "Employment Discrimination Case",
        description: "Workplace discrimination claim based on gender and age.",
        type: "ADMINISTRATIVE",
        status: "PRELIMINARY_CONFERENCE",
        clientId: "client-4",
      },
    }),
    prisma.case.create({
      data: {
        title: "Real Estate Transaction Dispute",
        description:
          "Issues with property disclosure and contract terms in home purchase.",
        type: "CIVIL",
        status: "DECISION",
        clientId: "client-5",
      },
    }),
    prisma.case.create({
      data: {
        title: "Criminal Defense - DUI Charge",
        description: "First-time DUI offense, negotiating plea agreement.",
        type: "CRIMINAL",
        status: "ARRAIGNMENT",
        clientId: "client-1",
      },
    }),
    prisma.case.create({
      data: {
        title: "Bankruptcy Filing - Chapter 7",
        description: "Personal bankruptcy case due to medical debt.",
        type: "CIVIL",
        status: "PRELIMINARY_CONFERENCE",
        clientId: "client-2",
      },
    }),
    prisma.case.create({
      data: {
        title: "Immigration Case - Green Card Application",
        description: "Family-based green card application process.",
        type: "ADMINISTRATIVE",
        status: "PRELIMINARY_CONFERENCE",
        clientId: "client-3",
      },
    }),
    prisma.case.create({
      data: {
        title: "Estate Planning - Will and Trust",
        description:
          "Comprehensive estate planning including will, trust, and power of attorney.",
        type: "CIVIL",
        status: "DECISION",
        clientId: "client-4",
      },
    }),
    prisma.case.create({
      data: {
        title: "Intellectual Property - Trademark Filing",
        description:
          "Trademark registration for client's business logo and brand name.",
        type: "ADMINISTRATIVE",
        status: "DECISION",
        clientId: "client-5",
      },
    }),
  ]);

  console.log(`⚖️ Created ${cases.length} cases`);

  // Create Documents (15-20 items across different cases)
  const documents = await Promise.all([
    // Documents for Personal Injury Case
    prisma.document.create({
      data: {
        name: "Police Report - Accident #2024-001234",
        url: "https://storage.example.com/docs/police-report-001234.pdf",
        type: "application/pdf",
        size: 2048576, // 2MB
        caseId: cases[0].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "Medical Records - Dr. Smith",
        url: "https://storage.example.com/docs/medical-records-smith.pdf",
        type: "application/pdf",
        size: 5242880, // 5MB
        caseId: cases[0].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "Insurance Claim Form",
        url: "https://storage.example.com/docs/insurance-claim-form.pdf",
        type: "application/pdf",
        size: 1048576, // 1MB
        caseId: cases[0].id,
      },
    }),
    // Documents for Divorce Case
    prisma.document.create({
      data: {
        name: "Marriage Certificate",
        url: "https://storage.example.com/docs/marriage-certificate.pdf",
        type: "application/pdf",
        size: 512000, // 512KB
        caseId: cases[1].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "Financial Statements - Joint Account",
        url: "https://storage.example.com/docs/financial-statements.xlsx",
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 3145728, // 3MB
        caseId: cases[1].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "Child Custody Agreement Draft",
        url: "https://storage.example.com/docs/custody-agreement.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 1572864, // 1.5MB
        caseId: cases[1].id,
      },
    }),
    // Documents for Contract Dispute
    prisma.document.create({
      data: {
        name: "Original Partnership Agreement",
        url: "https://storage.example.com/docs/partnership-agreement.pdf",
        type: "application/pdf",
        size: 2097152, // 2MB
        caseId: cases[2].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "Email Communications",
        url: "https://storage.example.com/docs/email-thread.eml",
        type: "message/rfc822",
        size: 256000, // 256KB
        caseId: cases[2].id,
      },
    }),
    // Documents for Employment Discrimination
    prisma.document.create({
      data: {
        name: "Employment Contract",
        url: "https://storage.example.com/docs/employment-contract.pdf",
        type: "application/pdf",
        size: 1024000, // 1MB
        caseId: cases[3].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "HR Complaint Filing",
        url: "https://storage.example.com/docs/hr-complaint.pdf",
        type: "application/pdf",
        size: 768000, // 768KB
        caseId: cases[3].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "Witness Statement - Jane Doe",
        url: "https://storage.example.com/docs/witness-statement-jane.pdf",
        type: "application/pdf",
        size: 512000, // 512KB
        caseId: cases[3].id,
      },
    }),
    // Documents for Real Estate Dispute
    prisma.document.create({
      data: {
        name: "Property Deed",
        url: "https://storage.example.com/docs/property-deed.pdf",
        type: "application/pdf",
        size: 1536000, // 1.5MB
        caseId: cases[4].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "Home Inspection Report",
        url: "https://storage.example.com/docs/inspection-report.pdf",
        type: "application/pdf",
        size: 4194304, // 4MB
        caseId: cases[4].id,
      },
    }),
    // Documents for Criminal Defense
    prisma.document.create({
      data: {
        name: "Arrest Report",
        url: "https://storage.example.com/docs/arrest-report.pdf",
        type: "application/pdf",
        size: 1024000, // 1MB
        caseId: cases[5].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "Breathalyzer Test Results",
        url: "https://storage.example.com/docs/breathalyzer-results.pdf",
        type: "application/pdf",
        size: 256000, // 256KB
        caseId: cases[5].id,
      },
    }),
    // Documents for Bankruptcy Case
    prisma.document.create({
      data: {
        name: "Asset Declaration Form",
        url: "https://storage.example.com/docs/asset-declaration.pdf",
        type: "application/pdf",
        size: 2048000, // 2MB
        caseId: cases[6].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "Creditor List",
        url: "https://storage.example.com/docs/creditor-list.xlsx",
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 512000, // 512KB
        caseId: cases[6].id,
      },
    }),
    // Documents for Immigration Case
    prisma.document.create({
      data: {
        name: "Birth Certificate (Translated)",
        url: "https://storage.example.com/docs/birth-certificate-translated.pdf",
        type: "application/pdf",
        size: 1024000, // 1MB
        caseId: cases[7].id,
      },
    }),
    prisma.document.create({
      data: {
        name: "Form I-485 - Application",
        url: "https://storage.example.com/docs/form-i485.pdf",
        type: "application/pdf",
        size: 3072000, // 3MB
        caseId: cases[7].id,
      },
    }),
    // Documents for Estate Planning
    prisma.document.create({
      data: {
        name: "Last Will and Testament - Final",
        url: "https://storage.example.com/docs/last-will-testament.pdf",
        type: "application/pdf",
        size: 2560000, // 2.5MB
        caseId: cases[8].id,
      },
    }),
  ]);

  console.log(`📄 Created ${documents.length} documents`);

  console.log("\n✨ Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Users: ${users.length}`);
  console.log(`   Sessions: ${sessions.length}`);
  console.log(`   Accounts: ${accounts.length}`);
  console.log(`   Verifications: ${verifications.length}`);
  console.log(`   Cases: ${cases.length}`);
  console.log(`   Documents: ${documents.length}`);
  console.log(
    `   Total records: ${
      users.length +
      sessions.length +
      accounts.length +
      verifications.length +
      cases.length +
      documents.length
    }`
  );
}

main()
  .catch(e => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Disconnected from database");
  });
