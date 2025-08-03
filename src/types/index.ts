
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'commissioner' | 'user' | 'civilian' | 'dispatch';
  password?: string; // Insecure: For demonstration only
}

export interface Incident {
  id: string;
  unit: string;
  type: string;
  location: string;
  status: 'Active' | 'Pending' | 'Resolved';
  timestamp: Timestamp;
  description?: string;
  reporterId?: string;
}

export interface Individual {
  id: string;
  name: string;
  dob: string;
  address: string;
  license_status: 'Valid' | 'Suspended' | 'Expired';
  gunLicenseStatus: 'Valid' | 'Expired' | 'None';
  insuranceStatus: 'Valid' | 'Expired' | 'None';
  guns: string[];
}

export interface Vehicle {
  id:string;
  plate: string;
  model: string;
  owner: string;
  registration_status: 'Valid' | 'Expired';
}

export interface Comm {
  id: string;
  unit: string;
  message: string;
  timestamp: Timestamp;
}

    