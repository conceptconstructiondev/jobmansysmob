import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UserProfile } from '@/components/UserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { registerForPushNotificationsAsync } from '@/services/notificationService';
import { createJob, getAllPushTokens, notifyNewJob, saveNotificationToken } from '@/services/supabaseService';
import * as Notifications from 'expo-notifications';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  const { user } = useAuth();

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

  const testTokenSaving = async () => {
    try {
      console.log('🧪 Testing token saving...');
      
      if (!user) {
        console.log('❌ No user logged in');
        return;
      }

      console.log('👤 Current user:', { id: user.id, email: user.email });

      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log('📱 Got token, attempting to save...');
        await saveNotificationToken(user.id, token);
        console.log('✅ Token saved successfully');
        
        // Test fetching tokens
        const tokens = await getAllPushTokens();
        console.log('📋 All tokens:', tokens);
      } else {
        console.log('❌ Failed to get token');
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
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

  const testNotificationWithManualToken = async () => {
    try {
      console.log('🧪 Testing notification with manual token...');
      
      // Use a test token format (this won't actually send, but tests the flow)
      const testToken = 'ExponentPushToken[test-token-for-debugging]';
      
      if (user) {
        await saveNotificationToken(user.id, testToken);
        console.log('✅ Test token saved');
        
        // Test fetching tokens
        const tokens = await getAllPushTokens();
        console.log('📋 All tokens in database:', tokens);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  };

  const testNotificationFlow = async () => {
    try {
      console.log('🧪 Testing full notification flow...');
      
      // Test 1: Check if we can save a token
      if (user) {
        const testToken = 'ExponentPushToken[test-' + Date.now() + ']';
        await saveNotificationToken(user.id, testToken);
        console.log('✅ Token saving works');
      }
      
      // Test 2: Check if we can retrieve tokens
      const tokens = await getAllPushTokens();
      console.log('📱 Retrieved tokens:', tokens.length);
      
      // Test 3: Test the notification sending logic (without actual sending)
      if (tokens.length > 0) {
        console.log('📤 Would send notification to', tokens.length, 'devices');
        console.log('✅ Notification flow is ready');
      } else {
        console.log('❌ No tokens found - need to fix token generation');
      }
      
    } catch (error) {
      console.error('❌ Flow test failed:', error);
    }
  };

  const testActualNotification = async () => {
    try {
      console.log('🧪 Testing actual notification sending...');
      
      // Get tokens from database
      const tokens = await getAllPushTokens();
      console.log('📱 Found tokens:', tokens);
      
      if (tokens.length > 0) {
        // Send a test notification using Expo's API
        const messages = tokens.map(token => ({
          to: token,
          sound: 'default',
          title: '🧪 Test Notification',
          body: 'This is a test notification from your app!',
          data: { test: true },
          priority: 'high' as const,
        }));

        console.log('📤 Sending test notification...');
        
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });

        const result = await response.json();
        console.log('📬 Notification API response:', result);
        
        if (result.data && result.data[0].status === 'ok') {
          console.log('✅ Test notification sent successfully!');
        } else {
          console.log('❌ Notification failed:', result);
        }
      } else {
        console.log('❌ No tokens found');
      }
    } catch (error) {
      console.error('❌ Test notification failed:', error);
    }
  };

  const testJobNotification = async () => {
    try {
      console.log('🧪 Testing job creation notification...');
      
      // Simulate what happens when a job is created
      const testJobData = {
        id: 'test-job-' + Date.now(),
        title: 'Test Job Notification',
        company: 'Test Company'
      };
      
      // Call your notification function directly
      await notifyNewJob(testJobData.id, testJobData.title, testJobData.company);
      
      console.log('✅ Job notification test completed');
    } catch (error) {
      console.error('❌ Job notification test failed:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <UserProfile />
        <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <ThemedText style={styles.testButtonText}>Test Notifications</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={testTokenSaving}>
          <ThemedText style={styles.testButtonText}>Test Token Saving</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={testNewJobNotification}>
          <ThemedText style={styles.testButtonText}>Test New Job + Notification</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={testNotificationWithManualToken}>
          <ThemedText style={styles.testButtonText}>Test Notification with Manual Token</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={testNotificationFlow}>
          <ThemedText style={styles.testButtonText}>Test Notification Flow</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={testActualNotification}>
          <ThemedText style={styles.testButtonText}>Test Actual Notification</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={testJobNotification}>
          <ThemedText style={styles.testButtonText}>Test Job Notification</ThemedText>
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