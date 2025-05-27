import { db } from '@/config/firebase';
import { Job } from '@/constants/JobsData';
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';

const JOBS_COLLECTION = 'jobs';

// Define Firestore job type
interface FirestoreJob {
  title: string;
  description: string;
  company: string;
  status: 'open' | 'accepted' | 'onsite' | 'completed';
  acceptedBy: string | null;
  acceptedByName: string | null;
  acceptedAt: Timestamp | null;
  invoiced: boolean;
  onsiteTime: Timestamp | null;
  completedTime: Timestamp | null;
  workStartedImage?: string;
  workStartedNotes?: string;
  workCompletedImage?: string;
  workCompletedNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Convert Firestore document to app format
const convertFirestoreJob = (docId: string, data: DocumentData): Job & { id: string } => {
  const firestoreJob = data as FirestoreJob;
  return {
    id: docId,
    title: firestoreJob.title,
    description: firestoreJob.description,
    company: firestoreJob.company,
    status: firestoreJob.status,
    acceptedBy: firestoreJob.acceptedBy,
    invoiced: firestoreJob.invoiced,
    onsiteTime: firestoreJob.onsiteTime?.toDate().toISOString() || null,
    completedTime: firestoreJob.completedTime?.toDate().toISOString() || null,
    workStartedImage: firestoreJob.workStartedImage,
    workStartedNotes: firestoreJob.workStartedNotes,
    workCompletedImage: firestoreJob.workCompletedImage,
    workCompletedNotes: firestoreJob.workCompletedNotes,
  };
};

// Get only OPEN jobs (for "All Jobs" tab)
export const getOpenJobs = async (): Promise<(Job & { id: string })[]> => {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    const q = query(
      jobsRef, 
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => 
      convertFirestoreJob(doc.id, doc.data())
    );
  } catch (error) {
    console.error('Error fetching open jobs:', error);
    throw error;
  }
};

// Get only jobs for the current user (for "My Jobs" tab)
export const getUserJobs = async (userEmail: string): Promise<(Job & { id: string })[]> => {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    const q = query(
      jobsRef,
      where('acceptedBy', '==', userEmail),
      where('status', 'in', ['accepted', 'onsite']), // Only active jobs
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => 
      convertFirestoreJob(doc.id, doc.data())
    );
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    throw error;
  }
};

// Real-time listener for OPEN jobs only
export const subscribeToOpenJobs = (callback: (jobs: (Job & { id: string })[]) => void) => {
  console.log('Setting up open jobs listener...');
  
  const jobsRef = collection(db, JOBS_COLLECTION);
  const q = query(
    jobsRef, 
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    console.log('Open jobs snapshot received, docs:', querySnapshot.docs.length);
    
    const jobs = querySnapshot.docs.map(doc => {
      const jobData = convertFirestoreJob(doc.id, doc.data());
      console.log('Open job:', doc.id, jobData.title, jobData.status);
      return jobData;
    });
    
    callback(jobs);
  }, (error) => {
    console.error('Error in open jobs listener:', error);
  });
};

// Real-time listener for USER's jobs only
export const subscribeToUserJobs = (userEmail: string, callback: (jobs: (Job & { id: string })[]) => void) => {
  console.log('Setting up user jobs listener for:', userEmail);
  
  const jobsRef = collection(db, JOBS_COLLECTION);
  const q = query(
    jobsRef,
    where('acceptedBy', '==', userEmail),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    console.log('User jobs snapshot received, docs:', querySnapshot.docs.length);
    
    const jobs = querySnapshot.docs.map(doc => {
      const jobData = convertFirestoreJob(doc.id, doc.data());
      console.log('User job:', doc.id, jobData.title, jobData.status, 'acceptedBy:', jobData.acceptedBy);
      return jobData;
    });
    
    // Filter in memory for active jobs only
    const activeJobs = jobs.filter(job => 
      job.status === 'accepted' || job.status === 'onsite'
    );
    
    console.log('Active user jobs:', activeJobs.length);
    callback(activeJobs);
  }, (error) => {
    console.error('Error in user jobs listener:', error);
  });
};

// Accept a job
export const acceptJob = async (jobId: string, userEmail: string, userName: string): Promise<void> => {
  console.log('acceptJob called with:', { jobId, userEmail, userName });
  
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    
    const updateData = {
      status: 'accepted' as const,
      acceptedBy: userEmail,
      acceptedByName: userName,
      acceptedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    console.log('Updating job with data:', updateData);
    
    await updateDoc(jobRef, updateData);
    
    console.log('Job update completed successfully');
    
  } catch (error) {
    console.error('Error in acceptJob service:', error);
    throw error;
  }
};

// Mark job as on-site
export const markJobOnSite = async (jobId: string, photo: string, notes: string): Promise<void> => {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      status: 'onsite' as const,
      onsiteTime: Timestamp.now(),
      workStartedImage: photo,
      workStartedNotes: notes,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking job on-site:', error);
    throw error;
  }
};

// Complete job
export const completeJob = async (jobId: string, photo: string, notes: string): Promise<void> => {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      status: 'completed' as const,
      completedTime: Timestamp.now(),
      workCompletedImage: photo,
      workCompletedNotes: notes,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error completing job:', error);
    throw error;
  }
};

// Create new job (for testing)
export const createJob = async (job: Omit<Job, 'onsiteTime' | 'completedTime' | 'acceptedBy'>): Promise<string> => {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    const docRef = await addDoc(jobsRef, {
      title: job.title,
      description: job.description,
      company: job.company,
      status: 'open' as const,
      acceptedBy: null,
      acceptedByName: null,
      acceptedAt: null,
      invoiced: job.invoiced,
      onsiteTime: null,
      completedTime: null,
      workStartedImage: undefined,
      workStartedNotes: undefined,
      workCompletedImage: undefined,
      workCompletedNotes: undefined,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('Job created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}; 