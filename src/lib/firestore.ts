import { db } from './firebase';
import { collection, doc, getDoc, setDoc, getDocs, query, where, orderBy, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { UserProfile, Incident, Individual, Vehicle, Comm } from '@/types';

// User Management
export const createUserProfile = async (uid: string, data: Omit<UserProfile, 'uid'>): Promise<void> => {
  await setDoc(doc(db, 'users', uid), data);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid, ...docSnap.data() } as UserProfile;
  }
  return null;
};

export const isFirstUser = async (): Promise<boolean> => {
  const usersCollection = collection(db, 'users');
  const q = query(usersCollection, limit(1));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};


// Incident Data
export const getIncidents = (callback: (data: Incident[]) => void): Unsubscribe => {
    const q = query(collection(db, "incidents"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (querySnapshot) => {
        const incidents: Incident[] = [];
        querySnapshot.forEach((doc) => {
            incidents.push({ id: doc.id, ...doc.data() } as Incident);
        });
        callback(incidents);
    });
};

// Records Search
export const searchIndividuals = async (searchQuery: string): Promise<Individual[]> => {
    if (!searchQuery) return [];
    const individualsRef = collection(db, 'individuals');
    // Firestore doesn't support full-text search natively. This is a basic starts-with search.
    const q = query(individualsRef, where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'));
    const querySnapshot = await getDocs(q);
    const individuals: Individual[] = [];
    querySnapshot.forEach((doc) => {
        individuals.push({ id: doc.id, ...doc.data() } as Individual);
    });
    return individuals;
};

export const searchVehicles = async (searchQuery: string): Promise<Vehicle[]> => {
    if (!searchQuery) return [];
    const vehiclesRef = collection(db, 'vehicles');
    const q = query(vehiclesRef, where('plate', '==', searchQuery.toUpperCase()));
    const querySnapshot = await getDocs(q);
    const vehicles: Vehicle[] = [];
    querySnapshot.forEach((doc) => {
        vehicles.push({ id: doc.id, ...doc.data() } as Vehicle);
    });
    return vehicles;
};


// Comms Data
export const getComms = (callback: (data: Comm[]) => void): Unsubscribe => {
    const q = query(collection(db, "comms"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (querySnapshot) => {
        const comms: Comm[] = [];
        querySnapshot.forEach((doc) => {
            comms.push({ id: doc.id, ...doc.data() } as Comm);
        });
        callback(comms);
    });
};
