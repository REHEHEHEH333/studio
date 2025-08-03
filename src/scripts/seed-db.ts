import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config();

// IMPORTANT:
// 1. Download your Firebase service account key JSON file from:
//    Firebase Console > Project Settings > Service accounts > Generate new private key
// 2. Save it in the root of your project as 'serviceAccountKey.json'.
// 3. Make sure this file is in your .gitignore to keep it private.
const serviceAccount = require('../../serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

const incidentsData = [
  { unit: '1A23', type: 'Traffic Stop', location: 'Main St & 1st Ave', status: 'Active', timestamp: new Date() },
  { unit: '4B11', type: 'Suspicious Person', location: 'Oak Park', status: 'Active', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { unit: '3C05', type: 'Medical Assist', location: '123 Pine Ln', status: 'Resolved', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { unit: '2D45', type: 'Welfare Check', location: '456 Elm St', status: 'Pending', timestamp: new Date(Date.now() - 1000 * 60 * 2) },
  { unit: '1A24', type: 'B&E in Progress', location: '890 Maple Dr', status: 'Active', timestamp: new Date(Date.now() - 1000 * 60 * 1) },
];

const individualsData = [
  { name: 'John A. Smith', dob: '1985-05-15', address: '123 Pine Ln, Cityville', license_status: 'Valid' },
  { name: 'Jane B. Doe', dob: '1992-11-20', address: '456 Elm St, Cityville', license_status: 'Suspended' },
  { name: 'Robert C. Johnson', dob: '1978-02-10', address: '789 Oak Ave, Cityville', license_status: 'Expired' },
];

const vehiclesData = [
  { plate: 'ABC-123', model: '2020 Toyota Camry', owner: 'John A. Smith', registration_status: 'Valid' },
  { plate: 'XYZ-789', model: '2018 Ford F-150', owner: 'Jane B. Doe', registration_status: 'Expired' },
  { plate: 'LMN-456', model: '2022 Honda Civic', owner: 'Michael Brown', registration_status: 'Valid' },
];

const commsData = [
  { unit: 'Dispatch', message: 'All units, be advised of a traffic collision at I-5 and exit 23.', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
  { unit: '1A23', message: '1A23, en route.', timestamp: new Date(Date.now() - 1000 * 60 * 9) },
  { unit: '4B11', message: '4B11, clear from Oak Park, no contact.', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { unit: 'Dispatch', message: '1A23, what is your 20?', timestamp: new Date(Date.now() - 1000 * 60 * 2) },
  { unit: '1A23', message: 'On scene, requesting medical.', timestamp: new Date(Date.now() - 1000 * 60 * 1) },
];

async function seedCollection(collectionName: string, data: any[], clear: boolean = true) {
  console.log(`Seeding ${collectionName}...`);
  const collectionRef = db.collection(collectionName);
  
  if (clear) {
    // Clear existing documents
    const snapshot = await collectionRef.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Cleared ${collectionName}.`);

    // Add new documents
    for (const item of data) {
      await collectionRef.add(item);
    }
    console.log(`Seeded ${data.length} documents into ${collectionName}.`);
  }
}

async function setCommissioner(userId: string) {
    try {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({ role: 'commissioner' });
        console.log(`User ${userId} has been updated to commissioner.`);
    } catch (error) {
        console.error(`Error setting commissioner role for user ${userId}:`, error);
        console.log(`Note: The user with ID ${userId} may not exist yet. Please sign up with this user first, then re-run the script or manually set the role in Firestore.`);
    }
}


async function main() {
  console.log('Starting database seed...');
  await seedCollection('incidents', incidentsData);
  await seedCollection('individuals', individualsData);
  await seedCollection('vehicles', vehiclesData);
  await seedCollection('comms', commsData);
  
  // Set the specific user to be a commissioner
  // IMPORTANT: Replace 'obY34xqVaFYzrgPfOB50' with the actual document ID of the user
  // in your Firestore 'users' collection after they have signed up.
  await setCommissioner('obY34xqVaFYzrgPfOB50');

  console.log('Database seeding complete.');
}

main().catch(error => {
  console.error('Error seeding database:', error);
});
