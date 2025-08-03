import { db } from './firebase';
import { collection, doc, getDoc, setDoc, getDocs, query, where, orderBy, limit, onSnapshot, Unsubscribe, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile, Incident, Individual, Vehicle, Comm } from '@/types';

// User Management
export const createUserProfile = async (data: Omit<UserProfile, 'uid'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'users'), data);
  return docRef.id;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid, ...docSnap.data() } as UserProfile;
  }
  return null;
};

export const findUserByEmail = async (email: string): Promise<UserProfile | null> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);
  const users: UserProfile[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ uid: doc.id, ...doc.data() } as UserProfile);
  });
  return users;
};

export const updateUserRole = async (uid: string, role: UserProfile['role']): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
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

export const addComm = async (data: { unit: string; message: string }): Promise<void> => {
  await addDoc(collection(db, 'comms'), {
    ...data,
    timestamp: serverTimestamp(),
  });
};
