import { execSync } from 'child_process';
import path from 'path';

console.log('🚀 Setting up database...');

// Run Prisma migrations
try {
  console.log('📊 Running Prisma migrations...');
  execSync('npx prisma migrate dev --name add-staff-model', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Error running migrations:', error);
  process.exit(1);
}

// Generate Prisma client
try {
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error);
  process.exit(1);
}

// Seed staff data
try {
  console.log('🌱 Seeding staff data...');
  execSync('npm run seed-staff', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Staff data seeded successfully');
} catch (error) {
  console.error('❌ Error seeding staff data:', error);
  // Don't exit on seed error, as migrations may have completed successfully
  console.log('⚠️ Database setup completed with warnings!');
  process.exit(0);
}

console.log('🎉 Database setup completed successfully!'); 