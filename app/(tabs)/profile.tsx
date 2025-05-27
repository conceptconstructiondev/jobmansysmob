import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UserProfile } from '@/components/UserProfile';
import { registerForPushNotificationsAsync } from '@/services/notificationService';
import { createJob } from '@/services/supabaseService';
import * as Notifications from 'expo-notifications';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  
  const testNotification = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      console.log('Push token:', token);
      
      // Test local notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification!",
        },
        trigger: { seconds: 1 },
      });
      
      console.log('Test notification scheduled');
    } catch (error) {
      console.error('Error testing notification:', error);
    }
  };

  const testNewJobNotification = async () => {
    try {
      console.log('🧪 Testing new job notification flow...');
      
      // Create a test job
      const testJob = {
        title: "Test Notification Job " + Date.now(),
        description: "This is a test job to check notifications",
        company: "Test Company",
        invoiced: false
      };
      
      console.log('📝 Creating test job...');
      const jobId = await createJob(testJob);
      console.log('✅ Test job created with ID:', jobId);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <UserProfile />
        <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <ThemedText style={styles.testButtonText}>Test Notifications</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={testNewJobNotification}>
          <ThemedText style={styles.testButtonText}>Test New Job + Notification</ThemedText>
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