import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UserProfile } from '@/components/UserProfile';
import { createJob } from '@/services/jobService';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      const jobId = await createJob({
        title: "Test Job " + Date.now(),
        description: "Testing Firebase connection",
        company: "Test Company",
        status: 'open',
        acceptedBy: null,
        invoiced: false,
      });
      console.log('Test job created successfully:', jobId);
      alert('Firebase connection working! Job ID: ' + jobId);
    } catch (error) {
      console.error('Firebase test failed:', error);
      alert('Firebase test failed: ' + error.message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <UserProfile />
        
        <TouchableOpacity style={styles.testButton} onPress={testFirebaseConnection}>
          <ThemedText style={styles.testButtonText}>Test Firebase Connection</ThemedText>
        </TouchableOpacity>
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
    flex: 1,
    justifyContent: 'center',
  },
  testButton: {
    backgroundColor: '#45B7D1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 