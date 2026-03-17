import { connectDB } from '../lib/mongodb.js';
import { License } from '../models/License.js';
import mongoose from 'mongoose';

const BMW_VENDORS = {
  'Maharashtra': ['Biomed Waste Solutions Mumbai', 'GreenCare Nagpur'],
  'Karnataka': ['Karnataka BioWaste Bengaluru'],
  // Map from PRD
};

async function seedBMW() {
  await connectDB();
  
  const seedData = [];
  for (const [state, vendors] of Object.entries(BMW_VENDORS)) {
    seedData.push({
      organizationId: new mongoose.Types.ObjectId(),
      type: 'BMW',
      state,
      district: 'default',
      status: 'pending',
      documents: [],
      isHardGate: true,
      notes: JSON.stringify({ vendors })
    });
  }
  
  await License.insertMany(seedData);
  console.log('Seeded BMW templates');
  process.exit(0);
}

seedBMW().catch(console.error);

