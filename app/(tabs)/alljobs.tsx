import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Job } from '@/constants/JobsData';
import { useJobs } from '@/contexts/JobContext';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface JobCardProps {
  job: Job;
  jobIndex: number;
  onAccept: (jobIndex: number) => void;
}

function JobCard({ job, jobIndex, onAccept }: JobCardProps) {
  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'open': return '#FF6B6B';
      case 'accepted': return '#4ECDC4';
      case 'onsite': return '#45B7D1';
      case 'completed': return '#96CEB4';
      default: return '#666';
    }
  };

  return (
    <ThemedView style={styles.jobCard}>
      <ThemedView style={styles.jobHeader}>
        <ThemedText type="subtitle" style={styles.jobTitle}>{job.title}</ThemedText>
        <ThemedView style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <ThemedText style={styles.statusText}>{job.status}</ThemedText>
        </ThemedView>
      </ThemedView>
      
      <ThemedText style={styles.jobDescription}>{job.description}</ThemedText>
      
      <ThemedView style={styles.jobFooter}>
        <ThemedView style={styles.companyContainer}>
          <IconSymbol name="house.fill" size={16} color="#666" />
          <ThemedText style={styles.companyText}>{job.company}</ThemedText>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity style={styles.acceptButton} onPress={() => onAccept(jobIndex)}>
        <ThemedText style={styles.acceptButtonText}>Accept Job</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

export default function TabTwoScreen() {
  const { jobs, acceptJob } = useJobs();

  // Filter to only show open jobs
  const openJobs = jobs
    .map((job, index) => ({ job, index }))
    .filter(({ job }) => job.status === 'open');

  const handleAcceptJob = (jobIndex: number) => {
    Alert.alert(
      'Accept Job',
      'Are you sure you want to accept this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => acceptJob(jobIndex, 'Current User') // In real app, get from user context
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">All Jobs</ThemedText>
          <ThemedText style={styles.subtitle}>Available jobs you can accept</ThemedText>
        </ThemedView>
        
        {openJobs.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="house.fill" size={48} color="#CCC" />
            <ThemedText style={styles.emptyText}>No open jobs available</ThemedText>
            <ThemedText style={styles.emptySubtext}>Check back later for new opportunities</ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.jobsList}>
            {openJobs.map(({ job, index }) => (
              <JobCard 
                key={index} 
                job={job} 
                jobIndex={index}
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
});
