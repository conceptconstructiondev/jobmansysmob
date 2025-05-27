import { supabase } from '@/config/supabase';
import { Job } from '@/constants/JobsData';
import { useAuth } from '@/contexts/AuthContext';
import {
  acceptJob,
  completeJob,
  getOpenJobs,
  getUserJobs,
  markJobOnSite,
  subscribeToOpenJobs,
  subscribeToUserJobs
} from '@/services/supabaseService';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface JobContextType {
  openJobs: (Job & { id: string })[];
  userJobs: (Job & { id: string })[];
  loading: boolean;
  refreshOpenJobs: () => Promise<void>;
  refreshUserJobs: () => Promise<void>;
  acceptJobAction: (jobId: string) => Promise<void>;
  markJobOnSiteAction: (jobId: string, photo: string, notes: string) => Promise<void>;
  completeJobAction: (jobId: string, photo: string, notes: string) => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const [openJobs, setOpenJobs] = useState<(Job & { id: string })[]>([]);
  const [userJobs, setUserJobs] = useState<(Job & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Debug Supabase client
  useEffect(() => {
    console.log('🔍 Supabase client check:', {
      hasSupabase: !!supabase,
      hasChannel: !!supabase?.channel,
      url: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      key: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
    });
  }, []);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  // Set up real-time subscriptions with error handling
  useEffect(() => {
    if (!user || !supabase?.channel) {
      console.log('⚠️ Skipping subscriptions - missing user or supabase client');
      return;
    }

    try {
      const unsubscribeOpen = subscribeToOpenJobs((jobs) => {
        setOpenJobs(jobs);
      });

      const unsubscribeUser = subscribeToUserJobs(user.email!, (jobs) => {
        setUserJobs(jobs);
      });

      return () => {
        unsubscribeOpen();
        unsubscribeUser();
      };
    } catch (error) {
      console.error('❌ Error setting up subscriptions:', error);
    }
  }, [user]);

  const loadInitialData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [openJobsData, userJobsData] = await Promise.all([
        getOpenJobs(),
        getUserJobs(user.email!)
      ]);
      
      setOpenJobs(openJobsData);
      setUserJobs(userJobsData);
    } catch (error) {
      console.error('Error loading initial job data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOpenJobs = async () => {
    try {
      const jobs = await getOpenJobs();
      setOpenJobs(jobs);
    } catch (error) {
      console.error('Error refreshing open jobs:', error);
    }
  };

  const refreshUserJobs = async () => {
    if (!user) return;
    
    try {
      const jobs = await getUserJobs(user.email!);
      setUserJobs(jobs);
    } catch (error) {
      console.error('Error refreshing user jobs:', error);
    }
  };

  const acceptJobAction = async (jobId: string) => {
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    try {
      await acceptJob(jobId, user.email!, user.user_metadata?.display_name || user.email!);
      await Promise.all([refreshOpenJobs(), refreshUserJobs()]);
    } catch (error) {
      console.error('Error accepting job:', error);
      throw error;
    }
  };

  const markJobOnSiteAction = async (jobId: string, photo: string, notes: string) => {
    try {
      await markJobOnSite(jobId, photo, notes);
      await refreshUserJobs();
    } catch (error) {
      console.error('Error marking job on-site:', error);
      throw error;
    }
  };

  const completeJobAction = async (jobId: string, photo: string, notes: string) => {
    try {
      await completeJob(jobId, photo, notes);
      await refreshUserJobs();
    } catch (error) {
      console.error('Error completing job:', error);
      throw error;
    }
  };

  return (
    <JobContext.Provider value={{
      openJobs,
      userJobs,
      loading,
      refreshOpenJobs,
      refreshUserJobs,
      acceptJobAction,
      markJobOnSiteAction,
      completeJobAction,
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