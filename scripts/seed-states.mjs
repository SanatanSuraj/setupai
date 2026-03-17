import { connectDB } from '../lib/mongodb.js';
import { License } from '../models/License.js';
import mongoose from 'mongoose';

const STATES_DISTRICTS = {
  'Maharashtra': {
    ceaStatus: 'Partially adopted',
    bmwAuthority: 'MPCB',
    districts: ['Mumbai', 'Pune', 'Nagpur'],
    cmos: ['Mumbai Division', 'Pune Division']
  },
  'Karnataka': {
    ceaStatus: 'Adopted',
    bmwAuthority: 'KSPCB',
    districts: ['Bengaluru', 'Mysuru'],
    cmos: ['BBMP Bengaluru', 'District DHOs']
  },
  'Tamil Nadu': {
    ceaStatus: 'State own Act',
    bmwAuthority: 'TNPCB',
    districts: ['Chennai', 'Coimbatore'],
    cmos: ['District CMOH offices']
  },
  'Delhi': {
    ceaStatus: 'Fully adopted',
    bmwAuthority: 'DPCC',
    districts: ['NDMC', 'MCD East', 'MCD South'],
    cmos: ['Zone offices']
  },
  // Add more from PRD
};

async function seedStates() {
  await connectDB();
  
  // Clear existing
  await License.deleteMany({});
  
  const seedData = [];
  for (const [state, data] of Object.entries(STATES_DISTRICTS)) {
    for (const district of data.districts) {
      seedData.push({
        organizationId: new mongoose.Types.ObjectId(), // dummy
        type: 'template',
        state,
        district,
        status: 'template',
        isHardGate: false,
        notes: JSON.stringify(data)
      });
    }
  }
  
  await License.insertMany(seedData);
  console.log(`Seeded ${seedData.length} state/district templates`);
  process.exit(0);
}

seedStates().catch(console.error);

