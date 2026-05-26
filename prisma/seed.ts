import { PrismaClient } from '../generated/prisma/client';
import { PrismaPostgresAdapter } from '@prisma/adapter-ppg';
import 'dotenv/config';

const adapter = new PrismaPostgresAdapter({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const exercises = [
    { name: 'Course à pied',  category: 'cardio',      icon: '🏃', caloriesPerMin: 11 },
    { name: 'Vélo',           category: 'cardio',      icon: '🚴', caloriesPerMin: 9  },
    { name: 'Natation',       category: 'cardio',      icon: '🏊', caloriesPerMin: 10 },
    { name: 'Musculation',    category: 'strength',    icon: '🏋️', caloriesPerMin: 6  },
    { name: 'Yoga',           category: 'flexibility', icon: '🧘', caloriesPerMin: 3  },
    { name: 'HIIT',           category: 'hiit',        icon: '⚡', caloriesPerMin: 14 },
    { name: 'Football',       category: 'sports',      icon: '⚽', caloriesPerMin: 11 },
    { name: 'Tennis',         category: 'sports',      icon: '🎾', caloriesPerMin: 9  },
    { name: 'Boxe',           category: 'hiit',        icon: '🥊', caloriesPerMin: 12 },
    { name: 'Corde à sauter', category: 'cardio',      icon: '🪢', caloriesPerMin: 13 },
    { name: 'Pilates',        category: 'flexibility', icon: '🤸', caloriesPerMin: 4  },
    { name: 'Marche rapide',  category: 'cardio',      icon: '🚶', caloriesPerMin: 6  },
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { id: exercises.indexOf(ex) + 1 },
      update: {},
      create: ex as any,
    });
  }

  console.log('✅ Exercises seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());