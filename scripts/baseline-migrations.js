#!/usr/bin/env node
/**
 * Baseline Prisma migrations for existing database
 * This script marks all existing migrations as applied
 * Use this when you've already pushed the schema with `prisma db push`
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../prisma/migrations');

// Get all migration directories
const migrations = fs.readdirSync(migrationsDir)
  .filter(dir => {
    const dirPath = path.join(migrationsDir, dir);
    return fs.statSync(dirPath).isDirectory() && dir !== 'migration_lock.toml';
  })
  .sort();

console.log(`Found ${migrations.length} migrations to baseline`);

// Mark each migration as applied
migrations.forEach((migration, index) => {
  try {
    console.log(`[${index + 1}/${migrations.length}] Marking ${migration} as applied...`);
    execSync(`npx prisma migrate resolve --applied ${migration}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log(`✅ ${migration} marked as applied`);
  } catch (error) {
    console.log(`⚠️  ${migration} - may already be applied or error occurred`);
  }
});

console.log('\n✅ Migration baselining complete!');
console.log('You can now run `prisma migrate deploy` safely.');

