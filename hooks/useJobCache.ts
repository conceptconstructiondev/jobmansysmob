import { Job } from '@/constants/JobsData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';

interface CachedJobData {
  jobs: (Job & { id: string })[];
  timestamp: number;
  userEmail?: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const OPEN_JOBS_CACHE_KEY = 'cached_open_jobs';
const USER_JOBS_CACHE_KEY = 'cached_user_jobs';

export function useJobCache() {
  const [openJobsCache, setOpenJobsCache] = useState<CachedJobData | null>(null);
  const [userJobsCache, setUserJobsCache] = useState<CachedJobData | null>(null);

  const isCacheValid = useCallback((cachedData: CachedJobData | null): boolean => {
    if (!cachedData) return false;
    return Date.now() - cachedData.timestamp < CACHE_DURATION;
  }, []);

  const getCachedOpenJobs = useCallback(async (): Promise<(Job & { id: string })[] | null> => {
    try {
      if (openJobsCache && isCacheValid(openJobsCache)) {
        console.log('Using cached open jobs');
        return openJobsCache.jobs;
      }

      const cached = await AsyncStorage.getItem(OPEN_JOBS_CACHE_KEY);
      if (cached) {
        const parsedCache: CachedJobData = JSON.parse(cached);
        if (isCacheValid(parsedCache)) {
          console.log('Using persisted cached open jobs');
          setOpenJobsCache(parsedCache);
          return parsedCache.jobs;
        }
      }
    } catch (error) {
      console.error('Error reading open jobs cache:', error);
    }
    return null;
  }, [openJobsCache, isCacheValid]);

  const getCachedUserJobs = useCallback(async (userEmail: string): Promise<(Job & { id: string })[] | null> => {
    try {
      if (userJobsCache && isCacheValid(userJobsCache) && userJobsCache.userEmail === userEmail) {
        console.log('Using cached user jobs');
        return userJobsCache.jobs;
      }

      const cached = await AsyncStorage.getItem(`${USER_JOBS_CACHE_KEY}_${userEmail}`);
      if (cached) {
        const parsedCache: CachedJobData = JSON.parse(cached);
        if (isCacheValid(parsedCache) && parsedCache.userEmail === userEmail) {
          console.log('Using persisted cached user jobs');
          setUserJobsCache(parsedCache);
          return parsedCache.jobs;
        }
      }
    } catch (error) {
      console.error('Error reading user jobs cache:', error);
    }
    return null;
  }, [userJobsCache, isCacheValid]);

  const cacheOpenJobs = useCallback(async (jobs: (Job & { id: string })[]) => {
    const cacheData: CachedJobData = {
      jobs,
      timestamp: Date.now(),
    };
    
    setOpenJobsCache(cacheData);
    
    try {
      await AsyncStorage.setItem(OPEN_JOBS_CACHE_KEY, JSON.stringify(cacheData));
      console.log('Open jobs cached successfully');
    } catch (error) {
      console.error('Error caching open jobs:', error);
    }
  }, []);

  const cacheUserJobs = useCallback(async (jobs: (Job & { id: string })[], userEmail: string) => {
    const cacheData: CachedJobData = {
      jobs,
      timestamp: Date.now(),
      userEmail,
    };
    
    setUserJobsCache(cacheData);
    
    try {
      await AsyncStorage.setItem(`${USER_JOBS_CACHE_KEY}_${userEmail}`, JSON.stringify(cacheData));
      console.log('User jobs cached successfully');
    } catch (error) {
      console.error('Error caching user jobs:', error);
    }
  }, []);

  const clearCache = useCallback(async () => {
    setOpenJobsCache(null);
    setUserJobsCache(null);
    
    try {
      await AsyncStorage.multiRemove([OPEN_JOBS_CACHE_KEY]);
      // Note: User-specific caches would need to be cleared individually
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  return {
    getCachedOpenJobs,
    getCachedUserJobs,
    cacheOpenJobs,
    cacheUserJobs,
    clearCache,
    isCacheValid: (cache: CachedJobData | null) => isCacheValid(cache),
  };
} 