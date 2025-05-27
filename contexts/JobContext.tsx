import { Job } from '@/constants/JobsData';
import { useAuth } from '@/contexts/AuthContext';
import {
    acceptJob as acceptJobService,
    completeJob as completeJobService,
    markJobOnSite as markJobOnSiteService,
    subscribeToOpenJobs,
    subscribeToUserJobs
} from '@/services/jobService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface JobContextType {
  openJobs: (Job & { id: string })[];
  userJobs: (Job & { id: string })[];
  openJobsLoading: boolean;
  userJobsLoading: boolean;
  acceptJob: (jobId: string) => Promise<void>;
  markOnSite: (jobId: string, photo: string, notes: string) => Promise<void>;
  completeJob: (jobId: string, photo: string, notes: string) => Promise<void>;
  setOpenJobsTabActive: (active: boolean) => void;
  setUserJobsTabActive: (active: boolean) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const [openJobs, setOpenJobs] = useState<(Job & { id: string })[]>([]);
  const [userJobs, setUserJobs] = useState<(Job & { id: string })[]>([]);
  const [openJobsLoading, setOpenJobsLoading] = useState(true);
  const [userJobsLoading, setUserJobsLoading] = useState(true);
  const { user } = useAuth();

  // Only subscribe when user is actively viewing the tab
  const [isOpenJobsTabActive, setIsOpenJobsTabActive] = useState(false);
  const [isUserJobsTabActive, setIsUserJobsTabActive] = useState(false);

  useEffect(() => {
    console.log('Setting up open jobs subscription...');
    
    const unsubscribe = subscribeToOpenJobs((jobs) => {
      console.log('Open jobs updated:', jobs.length, 'jobs');
      setOpenJobs(jobs);
      setOpenJobsLoading(false);
    });

    return () => {
      console.log('Cleaning up open jobs subscription');
      unsubscribe();
    };
  }, []); // Remove the isOpenJobsTabActive dependency

  // Subscribe to user's jobs (for "My Jobs" tab)
  useEffect(() => {
    if (!user || !user.email) {
      console.log('No user or email, clearing user jobs');
      setUserJobs([]);
      setUserJobsLoading(false);
      return;
    }

    console.log('Setting up user jobs subscription for:', user.email);

    const unsubscribe = subscribeToUserJobs(user.email, (jobs) => {
      console.log('User jobs updated:', jobs.length, 'jobs for user', user.email);
      setUserJobs(jobs);
      setUserJobsLoading(false);
    });

    return () => {
      console.log('Cleaning up user jobs subscription');
      unsubscribe();
    };
  }, [user]);

  const acceptJob = async (jobId: string) => {
    if (!user) {
      console.error('No user authenticated');
      throw new Error('User not authenticated');
    }
    
    console.log('Attempting to accept job:', jobId, 'for user:', user.email);
    
    try {
      const userName = user.displayName || user.email || 'Unknown';
      const userEmail = user.email || 'unknown@email.com';
      
      await acceptJobService(jobId, userEmail, userName);
      console.log('Job accepted successfully:', jobId);
      
    } catch (error) {
      console.error('Error accepting job:', error);
      throw error;
    }
  };

  const markOnSite = async (jobId: string, photo: string, notes: string) => {
    console.log('Marking job on-site:', jobId);
    try {
      await markJobOnSiteService(jobId, photo, notes);
      console.log('Job marked on-site successfully:', jobId);
    } catch (error) {
      console.error('Error marking job on-site:', error);
      throw error;
    }
  };

  const completeJob = async (jobId: string, photo: string, notes: string) => {
    console.log('Completing job:', jobId);
    try {
      await completeJobService(jobId, photo, notes);
      console.log('Job completed successfully:', jobId);
    } catch (error) {
      console.error('Error completing job:', error);
      throw error;
    }
  };

  const setOpenJobsTabActive = (active: boolean) => {
    setIsOpenJobsTabActive(active);
  };

  const setUserJobsTabActive = (active: boolean) => {
    setIsUserJobsTabActive(active);
  };

  return (
    <JobContext.Provider value={{ 
      openJobs,
      userJobs,
      openJobsLoading,
      userJobsLoading,
      acceptJob, 
      markOnSite, 
      completeJob,
      setOpenJobsTabActive,
      setUserJobsTabActive
    }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
} 