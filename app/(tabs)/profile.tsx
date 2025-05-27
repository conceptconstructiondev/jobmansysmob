import { ThemedView } from '@/components/ThemedView';
import { UserProfile } from '@/components/UserProfile';
import { ScrollView, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <UserProfile />
        
    
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