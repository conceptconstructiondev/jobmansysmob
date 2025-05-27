import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Job } from '@/constants/JobsData';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobContext';
import { useJobCache } from '@/hooks/useJobCache';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface JobCardProps {
  job: Job & { id: string };
  onAccept: (jobId: string) => void;
}

function JobCard({ job, onAccept }: JobCardProps) {
  return (
    <ThemedView style={styles.jobCard}>
      <ThemedView style={styles.jobHeader}>
        <ThemedText type="subtitle" style={styles.jobTitle}>{job.title}</ThemedText>
        <ThemedView style={[styles.statusBadge, { backgroundColor: '#FF6B6B' }]}>
          <ThemedText style={styles.statusText}>open</ThemedText>
        </ThemedView>
      </ThemedView>
      
      <ThemedText style={styles.jobDescription}>{job.description}</ThemedText>
      
      <ThemedView style={styles.jobFooter}>
        <ThemedView style={styles.companyContainer}>
          <IconSymbol name="house.fill" size={16} color="#666" />
          <ThemedText style={styles.companyText}>{job.company}</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.debugInfo}>
        <ThemedText style={styles.debugText}>Job ID: {job.id}</ThemedText>
        <ThemedText style={styles.debugText}>Status: {job.status}</ThemedText>
      </ThemedView>

      <TouchableOpacity style={styles.acceptButton} onPress={() => onAccept(job.id)}>
        <ThemedText style={styles.acceptButtonText}>Accept Job</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

export default function TabTwoScreen() {
  const { openJobs, openJobsLoading, acceptJob } = useJobs();
  const { user } = useAuth();
  const { getCachedOpenJobs, cacheOpenJobs } = useJobCache();
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  console.log('AllJobs render:', { 
    openJobsCount: openJobs.length, 
    loading: openJobsLoading, 
    userEmail: user?.email,
    userId: user?.uid 
  });

  useEffect(() => {
    // Set tab as active to trigger the listener
    // You'd need to expose setOpenJobsTabActive from JobContext first
    
    const loadJobs = async () => {
      // Try cache first
      const cached = await getCachedOpenJobs();
      if (cached) {
        // Don't set local state, the context will handle this
        setLoading(false);
        return;
      }
      
      // The context's real-time listener will handle loading jobs
      setLoading(false);
    };
    
    loadJobs();
  }, []);

  const handleAcceptJob = async (jobId: string) => {
    console.log('=== ACCEPT JOB START ===');
    console.log('handleAcceptJob called with jobId:', jobId);
    console.log('Current user:', { email: user?.email, uid: user?.uid });

    if (!user) {
      Alert.alert('Error', 'You must be logged in to accept jobs');
      return;
    }

    // TEMPORARILY REMOVE ALERT FOR TESTING
    console.log('=== BYPASSING ALERT - ACCEPTING JOB DIRECTLY ===');
    try {
      console.log('Calling acceptJob with:', jobId);
      await acceptJob(jobId);
      console.log('=== JOB ACCEPTED SUCCESSFULLY ===');
      Alert.alert('Success', 'Job accepted successfully!');
    } catch (error) {
      console.error('=== ERROR ACCEPTING JOB ===', error);
      Alert.alert('Error', `Failed to accept job: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <ThemedText style={styles.loadingText}>Loading available jobs...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">All Jobs</ThemedText>
          <ThemedText style={styles.subtitle}>Available jobs you can accept</ThemedText>
          <ThemedText style={styles.debugText}>
            Showing {openJobs.length} open jobs | User: {user?.email}
          </ThemedText>
        </ThemedView>
        
        {openJobs.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="house.fill" size={48} color="#CCC" />
            <ThemedText style={styles.emptyText}>No open jobs available</ThemedText>
            <ThemedText style={styles.emptySubtext}>Check back later for new opportunities</ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.jobsList}>
            {openJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onAccept={handleAcceptJob}
              />
            ))}
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Extra bottom padding for tab bar
  },
  titleContainer: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.4,
    marginTop: 8,
    textAlign: 'center',
  },
  jobsList: {
    gap: 16,
  },
  jobCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    flex: 1,
    fontWeight: '600',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  jobDescription: {
    marginBottom: 12,
    lineHeight: 20,
    opacity: 0.8,
  },
  jobFooter: {
    gap: 8,
    marginBottom: 12,
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyText: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#4ECDC4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  debugInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 2,
  },
});
