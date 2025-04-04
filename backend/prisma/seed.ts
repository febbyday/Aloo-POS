import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default loyalty tiers
  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      minimumSpend: 0,
      discount: 0,
      benefits: ['Basic rewards', 'Birthday bonus'],
      color: '#CD7F32',
    },
    {
      id: 'silver',
      name: 'Silver',
      minimumSpend: 1000,
      discount: 5,
      benefits: ['5% discount', 'Birthday bonus', 'Special events'],
      color: '#C0C0C0',
    },
    {
      id: 'gold',
      name: 'Gold',
      minimumSpend: 5000,
      discount: 10,
      benefits: ['10% discount', 'Birthday bonus', 'Special events', 'Priority support'],
      color: '#FFD700',
    },
    {
      id: 'platinum',
      name: 'Platinum',
      minimumSpend: 10000,
      discount: 15,
      benefits: ['15% discount', 'Birthday bonus', 'Special events', 'Priority support', 'Exclusive offers'],
      color: '#E5E4E2',
    },
  ];

  for (const tier of tiers) {
    await prisma.loyaltyTier.upsert({
      where: { id: tier.id },
      update: tier,
      create: {
        ...tier,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // Create default loyalty rewards
  const rewards = [
    {
      id: 'coffee',
      name: 'Free Coffee',
      description: 'Get a free coffee of your choice',
      pointsCost: 100,
      isActive: true,
    },
    {
      id: 'discount-10',
      name: '$10 Off Purchase',
      description: 'Get $10 off your next purchase',
      pointsCost: 200,
      isActive: true,
    },
    {
      id: 'discount-25',
      name: '$25 Off Purchase',
      description: 'Get $25 off your next purchase',
      pointsCost: 500,
      isActive: true,
    },
    {
      id: 'discount-50',
      name: '$50 Off Purchase',
      description: 'Get $50 off your next purchase',
      pointsCost: 1000,
      isActive: true,
    },
  ];

  for (const reward of rewards) {
    await prisma.loyaltyReward.upsert({
      where: { id: reward.id },
      update: reward,
      create: {
        ...reward,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // Create default loyalty events
  const events = [
    {
      id: 'welcome',
      name: 'Welcome Bonus',
      description: 'Welcome bonus for new customers',
      pointsAwarded: 100,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      isActive: true,
    },
    {
      id: 'holiday-2024',
      name: 'Holiday Season 2024',
      description: 'Special holiday season bonus points',
      pointsAwarded: 200,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    },
  ];

  for (const event of events) {
    await prisma.loyaltyEvent.upsert({
      where: { id: event.id },
      update: event,
      create: {
        ...event,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // Create default loyalty settings
  const settings = {
    id: 'default',
    pointsPerDollar: 1,
    pointValueInCents: 1,
    minimumRedemption: 100,
    expiryPeriodInDays: 365,
    enableBirthdayBonus: true,
    birthdayBonusPoints: 50,
    enableReferralBonus: true,
    referralBonusPoints: 100,
    autoTierUpgrade: true,
    tierDowngradeEnabled: false,
    tierDowngradePeriodDays: 365,
    spendingCalculationPeriod: 'LIFETIME',
  };

  await prisma.loyaltySettings.upsert({
    where: { id: settings.id },
    update: settings,
    create: {
      ...settings,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 