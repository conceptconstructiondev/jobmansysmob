import { supabase } from '@/config/supabase';
import { Job } from '@/constants/JobsData';

// Job service functions using Supabase
export const getOpenJobs = async (): Promise<(Job & { id: string })[]> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company,
      status: job.status,
      acceptedBy: job.accepted_by,
      invoiced: job.invoiced,
      onsiteTime: job.onsite_time,
      completedTime: job.completed_time,
      workStartedImage: job.work_started_image,
      workStartedNotes: job.work_started_notes,
      workCompletedImage: job.work_completed_image,
      workCompletedNotes: job.work_completed_notes,
    }));
  } catch (error) {
    console.error('Error fetching open jobs:', error);
    throw error;
  }
};

export const getUserJobs = async (userEmail: string): Promise<(Job & { id: string })[]> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('accepted_by', userEmail)
      .in('status', ['accepted', 'onsite'])
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company,
      status: job.status,
      acceptedBy: job.accepted_by,
      invoiced: job.invoiced,
      onsiteTime: job.onsite_time,
      completedTime: job.completed_time,
      workStartedImage: job.work_started_image,
      workStartedNotes: job.work_started_notes,
      workCompletedImage: job.work_completed_image,
      workCompletedNotes: job.work_completed_notes,
    }));
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    throw error;
  }
};

export const createJob = async (job: Omit<Job, 'onsiteTime' | 'completedTime' | 'acceptedBy'>): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: job.title,
        description: job.description,
        company: job.company,
        status: 'open',
        accepted_by: null,
        accepted_by_name: null,
        accepted_at: null,
        invoiced: job.invoiced,
        onsite_time: null,
        completed_time: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Job created with ID:', data.id);

    // Send notification to all users
    try {
      await notifyNewJob(data.id, job.title, job.company);
      console.log('New job notification sent successfully');
    } catch (notificationError) {
      console.error('Failed to send new job notification:', notificationError);
    }

    return data.id;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const acceptJob = async (jobId: string, userEmail: string, userName: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'accepted',
        accepted_by: userEmail,
        accepted_by_name: userName,
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) throw error;
  } catch (error) {
    console.error('Error accepting job:', error);
    throw error;
  }
};

export const markJobOnSite = async (jobId: string, photo: string, notes: string): Promise<void> => {
  try {
    const updateData: any = {
      status: 'onsite',
      onsite_time: new Date().toISOString(),
      work_started_notes: notes,
      updated_at: new Date().toISOString()
    };

    if (photo && photo.trim()) {
      updateData.work_started_image = photo;
    }

    const { error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking job on-site:', error);
    throw error;
  }
};

export const completeJob = async (jobId: string, photo: string, notes: string): Promise<void> => {
  try {
    const updateData: any = {
      status: 'completed',
      completed_time: new Date().toISOString(),
      work_completed_notes: notes,
      updated_at: new Date().toISOString()
    };

    if (photo && photo.trim()) {
      updateData.work_completed_image = photo;
    }

    const { error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId);

    if (error) throw error;
  } catch (error) {
    console.error('Error completing job:', error);
    throw error;
  }
};

// Enhanced real-time subscriptions with better filtering
export const subscribeToOpenJobs = (callback: (jobs: (Job & { id: string })[]) => void) => {
  console.log('🔄 Setting up open jobs listener...');
  
  const subscription = supabase
    .channel('open-jobs-channel')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'jobs',
        filter: 'status=eq.open' // Only listen to open jobs
      }, 
      async (payload) => {
        console.log('📡 Open jobs change detected:', {
          eventType: payload.eventType,
          table: payload.table,
          new: payload.new,
          old: payload.old
        });
        
        try {
          // Add a small delay to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Refetch data when changes occur
          const jobs = await getOpenJobs();
          console.log('✅ Fetched updated open jobs:', jobs.length);
          callback(jobs);
        } catch (error) {
          console.error('❌ Error fetching updated open jobs:', error);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Open jobs subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to open jobs changes');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel error in open jobs subscription');
      }
    });

  return () => {
    console.log('🔌 Unsubscribing from open jobs');
    supabase.removeChannel(subscription);
  };
};

export const subscribeToUserJobs = (userEmail: string, callback: (jobs: (Job & { id: string })[]) => void) => {
  console.log('🔄 Setting up user jobs listener for:', userEmail);
  
  const subscription = supabase
    .channel(`user-jobs-${userEmail}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'jobs'
      }, 
      async (payload) => {
        console.log('📡 User jobs change detected:', payload);
        try {
          // Refetch data when changes occur
          const jobs = await getUserJobs(userEmail);
          console.log('✅ Fetched updated user jobs:', jobs.length);
          callback(jobs);
        } catch (error) {
          console.error('❌ Error fetching updated user jobs:', error);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 User jobs subscription status:', status);
    });

  return () => {
    console.log('🔌 Unsubscribing from user jobs');
    supabase.removeChannel(subscription);
  };
};

// Enhanced notification token management with debugging
export const saveNotificationToken = async (userId: string, token: string): Promise<void> => {
  try {
    console.log('🔄 Attempting to save notification token:', {
      userId,
      token: token.substring(0, 20) + '...',
      platform: 'expo'
    });

    // Use upsert with conflict resolution
    const { data, error } = await supabase
      .from('notification_tokens')
      .upsert({
        user_id: userId,
        token,
        platform: 'expo',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id', // Specify the conflict column
        ignoreDuplicates: false // Update on conflict
      })
      .select();

    if (error) {
      console.error('❌ Database error saving notification token:', error);
      throw error;
    }

    console.log('✅ Notification token saved successfully:', data);
  } catch (error) {
    console.error('❌ Error saving notification token:', error);
    throw error;
  }
};

export const removeNotificationToken = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notification_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    console.log('Notification token removed successfully');
  } catch (error) {
    console.error('Error removing notification token:', error);
    throw error;
  }
};

export const getAllPushTokens = async (): Promise<string[]> => {
  try {
    console.log('🔍 Fetching all push tokens...');
    
    const { data, error } = await supabase
      .from('notification_tokens')
      .select('token, user_id, created_at');

    if (error) {
      console.error('❌ Error fetching push tokens:', error);
      throw error;
    }

    console.log('📱 Found notification tokens:', {
      count: data?.length || 0,
      tokens: data?.map(row => ({
        userId: row.user_id,
        tokenPreview: row.token?.substring(0, 20) + '...',
        createdAt: row.created_at
      }))
    });

    return data?.map(row => row.token).filter(token => token && token.length > 0) || [];
  } catch (error) {
    console.error('❌ Error fetching push tokens:', error);
    return [];
  }
};

// Import notification function
import { notifyNewJob } from './notificationService';

// Add this debug function
export const testRealTimeConnection = () => {
  console.log('🧪 Testing real-time connection...');
  
  const testChannel = supabase
    .channel('test-connection')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'jobs'
      }, 
      (payload) => {
        console.log('🎯 TEST: Real-time event received:', payload);
      }
    )
    .subscribe((status) => {
      console.log('🔗 Test connection status:', status);
    });

  // Clean up after 10 seconds
  setTimeout(() => {
    supabase.removeChannel(testChannel);
    console.log('🧹 Test connection cleaned up');
  }, 10000);
};
