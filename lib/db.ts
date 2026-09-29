import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  addDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';


export interface Listing {
  id?: string;
  title: string;
  category: 'skills' | 'health' | 'activities';
  description: string;
  location: string;
  hostId: string;
  hostName: string;
  createdAt?: any;
}

export interface Submission {
  id?: string;
  listingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: any;
}

export async function createListing(data: Omit<Listing, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'listings'), {
    ...data,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getListings() {
  const querySnapshot = await getDocs(collection(db, 'listings'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Listing[];
}

export async function createSubmission(data: Omit<Submission, 'id' | 'status' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'submissions'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getSubmissionsForHost(hostId: string) {
  const q = query(collection(db, 'submissions'), where('hostId', '==', hostId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Submission[];
}

export async function updateSubmissionStatus(submissionId: string, status: 'accepted' | 'rejected') {
  const subRef = doc(db, 'submissions', submissionId);
  await updateDoc(subRef, { status });
}

export async function deleteSubmission(submissionId: string) {
  await deleteDoc(doc(db, 'submissions', submissionId));
}
