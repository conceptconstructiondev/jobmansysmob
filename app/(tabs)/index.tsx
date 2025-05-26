import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { JobDetailModal } from '@/components/JobDetailModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Job } from '@/constants/JobsData';
import { useJobs } from '@/contexts/JobContext';

interface JobCardProps {
  job: Job;
  jobIndex: number;
  onPress: () => void;
}

function JobCard({ job, jobIndex, onPress }: JobCardProps) {
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
    <TouchableOpacity onPress={onPress}>
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
          {job.acceptedBy && (
            <ThemedText style={styles.acceptedBy}>Assigned to: {job.acceptedBy}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.actionHint}>
          <ThemedText style={styles.actionHintText}>
            Tap to {job.status === 'accepted' ? 'mark on-site' : 'complete job'}
          </ThemedText>
          <IconSymbol name="chevron.right" size={16} color="#666" />
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { jobs, markOnSite, completeJob } = useJobs();
  const [selectedJob, setSelectedJob] = useState<{ job: Job; index: number } | null>(null);
  
  // Filter for active jobs only (accepted and onsite) - exclude completed
  const myJobs = jobs
    .map((job, index) => ({ job, index }))
    .filter(({ job }) => 
      job.status === 'accepted' || job.status === 'onsite'
    );

  const handleJobPress = (job: Job, index: number) => {
    setSelectedJob({ job, index });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">My Jobs</ThemedText>
          <ThemedText style={styles.subtitle}>Active jobs assigned to you</ThemedText>
        </ThemedView>
        
        {myJobs.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="house.fill" size={48} color="#CCC" />
            <ThemedText style={styles.emptyText}>No active jobs</ThemedText>
            <ThemedText style={styles.emptySubtext}>Accept jobs from "All Jobs" to get started</ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.jobsList}>
            {myJobs.map(({ job, index }) => (
              <JobCard 
                key={index} 
                job={job} 
                jobIndex={index}
                onPress={() => handleJobPress(job, index)}
              />
            ))}
          </ThemedView>
        )}
      </ScrollView>

      <JobDetailModal
        visible={selectedJob !== null}
        job={selectedJob?.job || null}
        jobIndex={selectedJob?.index || 0}
        onClose={() => setSelectedJob(null)}
        onMarkOnSite={markOnSite}
        onComplete={completeJob}
      />
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
  acceptedBy: {
    fontSize: 13,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  actionHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionHintText: {
    fontSize: 13,
    color: '#45B7D1',
    fontWeight: '500',
  },
});
