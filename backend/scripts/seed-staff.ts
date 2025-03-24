import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding staff data...');

  // Create employment types
  const employmentTypes = [
    {
      name: 'Full-time',
      description: 'Standard 40-hour work week with full benefits package',
      color: '#4CAF50',
      benefits: ['Health Insurance', 'Paid Time Off', '401(k)', 'Dental Coverage'],
      isActive: true
    },
    {
      name: 'Part-time',
      description: 'Less than 30 hours per week with limited benefits',
      color: '#2196F3',
      benefits: ['Flexible Schedule', 'Paid Time Off'],
      isActive: true
    },
    {
      name: 'Contract',
      description: 'Fixed-term employment with specific deliverables',
      color: '#9C27B0',
      benefits: ['Higher Pay Rate', 'Remote Work Option'],
      isActive: true
    },
    {
      name: 'Seasonal',
      description: 'Temporary employment during peak business periods',
      color: '#FF9800',
      benefits: ['Flexible Schedule', 'Employee Discount'],
      isActive: true
    },
    {
      name: 'Internship',
      description: 'Training position for students or recent graduates',
      color: '#607D8B',
      benefits: ['Academic Credit', 'Professional Development', 'Mentorship'],
      isActive: true
    }
  ];

  console.log('Creating employment types...');
  for (const type of employmentTypes) {
    // Check if exists first to avoid duplicates
    const exists = await prisma.employmentType.findFirst({
      where: { name: type.name }
    });

    if (!exists) {
      await prisma.employmentType.create({
        data: type
      });
      console.log(`Created employment type: ${type.name}`);
    } else {
      console.log(`Employment type already exists: ${type.name}`);
    }
  }

  // Get the created employment types
  const fullTime = await prisma.employmentType.findFirst({
    where: { name: 'Full-time' }
  });

  const partTime = await prisma.employmentType.findFirst({
    where: { name: 'Part-time' }
  });

  // Create initial staff data
  const staffData = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      role: 'Manager',
      status: 'ACTIVE',
      hireDate: new Date('2022-01-15'),
      department: 'Sales',
      position: 'Sales Manager',
      employmentTypeId: fullTime?.id,
      bankingDetails: {
        accountName: 'John Doe',
        accountNumber: '1234567890',
        bankName: 'Example Bank',
        accountType: 'Checking',
        branchLocation: 'Main Branch'
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '098-765-4321'
      }
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '234-567-8901',
      role: 'Cashier',
      status: 'ACTIVE',
      hireDate: new Date('2022-03-10'),
      department: 'Operations',
      position: 'Senior Cashier',
      employmentTypeId: partTime?.id,
      bankingDetails: {
        accountName: 'Jane Smith',
        accountNumber: '0987654321',
        bankName: 'Sample Bank',
        accountType: 'Savings',
        branchLocation: 'Downtown Branch'
      },
      emergencyContact: {
        name: 'John Smith',
        relationship: 'Spouse',
        phone: '987-654-3210'
      }
    },
    {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@example.com',
      phone: '345-678-9012',
      role: 'Staff',
      status: 'ACTIVE',
      hireDate: new Date('2022-05-20'),
      department: 'IT',
      position: 'Support Specialist',
      employmentTypeId: fullTime?.id,
      bankingDetails: {
        accountName: 'Michael Johnson',
        accountNumber: '2345678901',
        bankName: 'Tech Bank',
        accountType: 'Checking',
        branchLocation: 'Tech District Branch'
      },
      emergencyContact: {
        name: 'Sarah Johnson',
        relationship: 'Spouse',
        phone: '456-789-0123'
      }
    }
  ];

  console.log('Creating staff data...');
  for (const staff of staffData) {
    try {
      // Check if exists first to avoid duplicates
      const exists = await prisma.staff.findFirst({
        where: { email: staff.email }
      });

      if (!exists) {
        await prisma.staff.create({
          data: staff
        });
        console.log(`Created staff: ${staff.firstName} ${staff.lastName}`);

        // Update the staff count for employment types
        if (staff.employmentTypeId) {
          await prisma.employmentType.update({
            where: { id: staff.employmentTypeId },
            data: {
              staffCount: {
                increment: 1
              }
            }
          });
        }
      } else {
        console.log(`Staff already exists: ${staff.firstName} ${staff.lastName}`);
      }
    } catch (error) {
      console.error(`Error creating staff ${staff.firstName} ${staff.lastName}:`, error);
    }
  }

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 