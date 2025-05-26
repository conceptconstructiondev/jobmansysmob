import { dummyJobs, Job } from '@/constants/JobsData';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface JobContextType {
  jobs: Job[];
  acceptJob: (jobIndex: number, contractorName: string) => void;
  markOnSite: (jobIndex: number, photo: string, notes: string) => void;
  completeJob: (jobIndex: number, photo: string, notes: string) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(dummyJobs);

  const acceptJob = (jobIndex: number, contractorName: string) => {
    setJobs(prevJobs => 
      prevJobs.map((job, index) => 
        index === jobIndex 
          ? { ...job, status: 'accepted' as const, acceptedBy: contractorName }
          : job
      )
    );
  };

  const markOnSite = (jobIndex: number, photo: string, notes: string) => {
    setJobs(prevJobs => 
      prevJobs.map((job, index) => 
        index === jobIndex 
          ? { 
              ...job, 
              status: 'onsite' as const, 
              onsiteTime: new Date().toISOString(),
              workStartedImage: photo,
              workStartedNotes: notes
            }
          : job
      )
    );
  };

  const completeJob = (jobIndex: number, photo: string, notes: string) => {
    setJobs(prevJobs => 
      prevJobs.map((job, index) => 
        index === jobIndex 
          ? { 
              ...job, 
              status: 'completed' as const, 
              completedTime: new Date().toISOString(),
              workCompletedImage: photo,
              workCompletedNotes: notes
            }
          : job
      )
    );
  };

  return (
    <JobContext.Provider value={{ jobs, acceptJob, markOnSite, completeJob }}>
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