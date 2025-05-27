import { ThemedView } from '@/components/ThemedView';
import { UserProfile } from '@/components/UserProfile';
import { registerForPushNotificationsAsync } from '@/constants/Notifications';
import * as Notifications from 'expo-notifications';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  
  const testNotification = async () => {
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
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <UserProfile />
        <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <ThemedText style={styles.testButtonText}>Test Notifications</ThemedText>
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