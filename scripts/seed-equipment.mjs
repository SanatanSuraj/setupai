import { connectDB } from '../lib/mongodb.js';
import { Equipment } from '../models/Equipment.js';
import mongoose from 'mongoose';

const EQUIPMENT_CATALOG = [
  {
    name: 'Biochemistry Analyser',
    category: 'biochemistry',
    vendor: 'Mobilab/Erba',
    price: 650000,
    specs: { power: 2.5, footprint: 1.2, amcCost: 65000 }
  },
  {
    name: 'CBC Analyser (5-part)',
    category: 'hematology',
    vendor: 'Sysmex',
    price: 750000,
    specs: { power: 1.8, footprint: 0.8, amcCost: 75000 }
  },
  {
    name: 'Spandan ECG Machine',
    category: 'ecg',
    vendor: 'Spandan',
    price: 150000,
    specs: { power: 0.5, footprint: 0.4, amcCost: 15000 }
  },
  {
    name: 'FIA Analyser',
    category: 'immunoassay',
    vendor: 'Mobilab',
    price: 850000,
    specs: { power: 3.0, footprint: 1.5, amcCost: 85000 }
  },
  // Add centrifuge, refrigerator, etc. from PRD
];

async function seedEquipment() {
  await connectDB();
  await Equipment.deleteMany({});
  const seedData = EQUIPMENT_CATALOG.map(eq => ({
    ...eq,
    organizationId: new mongoose.Types.ObjectId(), // dummy
    status: 'catalog'
  }));
  await Equipment.insertMany(seedData);
  console.log(`Seeded ${seedData.length} equipment items`);
  process.exit(0);
}

seedEquipment().catch(console.error);

