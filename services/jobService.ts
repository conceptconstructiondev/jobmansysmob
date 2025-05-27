import { db } from '@/config/firebase';
import { Job } from '@/constants/JobsData';
import { notifyNewJob } from '@/services/notificationService';
import {
    addDoc,
    collection,
    doc,
    DocumentData,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    startAfter,
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
      where('status', 'in', ['accepted', 'onsite']), // Filter at DB level
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
    where('status', 'in', ['accepted', 'onsite']), // Filter at DB level
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    console.log('User jobs snapshot received, docs:', querySnapshot.docs.length);
    
    const jobs = querySnapshot.docs.map(doc => {
      const jobData = convertFirestoreJob(doc.id, doc.data());
      console.log('User job:', doc.id, jobData.title, jobData.status, 'acceptedBy:', jobData.acceptedBy);
      return jobData;
    });
    
    callback(jobs);
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
    const updateData: any = {
      status: 'onsite' as const,
      onsiteTime: Timestamp.now(),
      workStartedNotes: notes,
      updatedAt: Timestamp.now()
    };
    
    // Only add photo if provided
    if (photo && photo.trim()) {
      updateData.workStartedImage = photo;
    }
    
    await updateDoc(jobRef, updateData);
  } catch (error) {
    console.error('Error marking job on-site:', error);
    throw error;
  }
};

// Complete job
export const completeJob = async (jobId: string, photo: string, notes: string): Promise<void> => {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    const updateData: any = {
      status: 'completed' as const,
      completedTime: Timestamp.now(),
      workCompletedNotes: notes,
      updatedAt: Timestamp.now()
    };
    
    // Only add photo if provided
    if (photo && photo.trim()) {
      updateData.workCompletedImage = photo;
    }
    
    await updateDoc(jobRef, updateData);
  } catch (error) {
    console.error('Error completing job:', error);
    throw error;
  }
};

// Create new job (for testing)
export const createJob = async (job: Omit<Job, 'onsiteTime' | 'completedTime' | 'acceptedBy'>): Promise<string> => {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    
    // Create the job data object without undefined fields
    const jobData: any = {
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Only add image/notes fields if they exist (don't add undefined)
    // Remove these lines that set undefined:
    // workStartedImage: undefined,
    // workStartedNotes: undefined,
    // workCompletedImage: undefined,
    // workCompletedNotes: undefined,
    
    const docRef = await addDoc(jobsRef, jobData);
    
    console.log('Job created with ID:', docRef.id);
    
    // Send notification to all users
    try {
      await notifyNewJob(docRef.id, job.title, job.company);
      console.log('New job notification sent successfully');
    } catch (notificationError) {
      console.error('Failed to send new job notification:', notificationError);
      // Don't throw here - job creation should succeed even if notification fails
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

// Instead of individual reads for push tokens
export const batchGetPushTokens = async (userIds: string[]): Promise<string[]> => {
  // Use 'in' query to get multiple tokens in one read
  const q = query(
    collection(db, 'pushTokens'),
    where('userId', 'in', userIds.slice(0, 10)) // Firestore limit
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().token);
};

export const getOpenJobsPaginated = async (pageSize = 20, lastDoc?: any) => {
  let q = query(
    collection(db, 'jobs'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  return {
    jobs: snapshot.docs.map(doc => convertFirestoreJob(doc.id, doc.data())),
    lastDoc: snapshot.docs[snapshot.docs.length - 1]
  };
}; 