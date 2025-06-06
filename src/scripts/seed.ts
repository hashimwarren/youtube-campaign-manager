import { prisma } from '@/lib/db';

const sampleCreators = [
  {
    name: 'Tech Reviews Pro',
    channelId: 'UCtech123456789',
    email: 'contact@techreviewspro.com',
    status: 'SELECTED' as const,
  },
  {
    name: 'Gaming Galaxy',
    channelId: 'UCgaming987654321',
    email: 'hello@gaminggalaxy.net',
    status: 'PITCHED' as const,
  },
  {
    name: 'Lifestyle Vlogger',
    channelId: 'UClifestyle111222',
    email: 'collab@lifestylevlogger.com',
    status: 'AGREEMENT' as const,
  },
  {
    name: 'Fitness Journey',
    channelId: 'UCfitness333444',
    email: 'partnerships@fitnessjourney.tv',
    status: 'PUBLISHED' as const,
  },
  {
    name: 'Cooking Master',
    channelId: 'UCcooking555666',
    email: 'business@cookingmaster.com',
    status: 'SELECTED' as const,
  },
  {
    name: 'DIY Home Projects',
    channelId: 'UCdiy777888',
    email: 'sponsorships@diyhome.org',
    status: 'PITCHED' as const,
  },
];

async function main() {
  console.log('🌱 Seeding database with sample creators...');

  for (const creator of sampleCreators) {
    try {
      await prisma.creator.upsert({
        where: { channelId: creator.channelId },
        update: creator,
        create: creator,
      });
      console.log(`✅ Created/updated creator: ${creator.name}`);
    } catch (error) {
      console.error(`❌ Error creating creator ${creator.name}:`, error);
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
