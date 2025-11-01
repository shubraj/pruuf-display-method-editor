#!/usr/bin/env node

/**
 * Utility script to generate bcrypt password hash for admin authentication
 * Usage: node scripts/generate-password-hash.js <password>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generate-password-hash.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\n✅ Password hash generated:');
    console.log(hash);
    console.log('\n📋 Add this to your .env.local file:');
    console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  })
  .catch(error => {
    console.error('Error generating hash:', error);
    process.exit(1);
  });
