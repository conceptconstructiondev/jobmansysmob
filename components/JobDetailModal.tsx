import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Job } from '@/constants/JobsData';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Modal, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface JobDetailModalProps {
  visible: boolean;
  job: Job | null;
  jobIndex: number;
  onClose: () => void;
  onMarkOnSite: (jobIndex: number, photo: string, notes: string) => void;
  onComplete: (jobIndex: number, photo: string, notes: string) => void;
}

export function JobDetailModal({ 
  visible, 
  job, 
  jobIndex, 
  onClose, 
  onMarkOnSite, 
  onComplete 
}: JobDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  if (!job) return null;

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
      console.error('Gallery error:', error);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: selectFromGallery },
      ]
    );
  };

  const handleMarkOnSite = () => {
    if (!notes.trim()) {
      Alert.alert('Error', 'Please enter work start notes');
      return;
    }
    
    if (!capturedPhoto) {
      Alert.alert('Error', 'Please take a photo to mark on-site');
      return;
    }
    
    onMarkOnSite(jobIndex, capturedPhoto, notes);
    setNotes('');
    setCapturedPhoto(null);
    onClose();
  };

  const handleComplete = () => {
    if (!notes.trim()) {
      Alert.alert('Error', 'Please enter completion notes');
      return;
    }
    
    if (!capturedPhoto) {
      Alert.alert('Error', 'Please take a completion photo');
      return;
    }
    
    onComplete(jobIndex, capturedPhoto, notes);
    setNotes('');
    setCapturedPhoto(null);
    onClose();
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'open': return '#FF6B6B';
      case 'accepted': return '#4ECDC4';
      case 'onsite': return '#45B7D1';
      case 'completed': return '#96CEB4';
      default: return '#666';
    }
  };

  const resetModal = () => {
    setNotes('');
    setCapturedPhoto(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>Job Details</ThemedText>
          <TouchableOpacity onPress={resetModal} style={styles.closeButton}>
            <IconSymbol name="chevron.right" size={24} color="#666" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedView style={styles.jobHeader}>
            <ThemedText type="subtitle" style={styles.jobTitle}>{job.title}</ThemedText>
            <ThemedView style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
              <ThemedText style={styles.statusText}>{job.status}</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.company}>{job.company}</ThemedText>
          <ThemedText style={styles.description}>{job.description}</ThemedText>

          {job.status === 'accepted' && (
            <ThemedView style={styles.actionSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Mark as On-Site</ThemedText>
              <ThemedText style={styles.instructions}>Take a photo and add notes about work started</ThemedText>
              
              <TextInput
                style={styles.textInput}
                placeholder="Enter work start notes..."
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
              
              <TouchableOpacity style={styles.photoButton} onPress={showPhotoOptions}>
                <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color="white" />
                <ThemedText style={styles.photoButtonText}>
                  {capturedPhoto ? 'Change Photo' : 'Take Photo'}
                </ThemedText>
              </TouchableOpacity>

              {capturedPhoto && (
                <ThemedView style={styles.photoPreview}>
                  <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removePhotoButton} 
                    onPress={() => setCapturedPhoto(null)}
                  >
                    <ThemedText style={styles.removePhotoText}>Remove</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              )}

              <TouchableOpacity 
                style={[styles.actionButton, !capturedPhoto && styles.disabledButton]} 
                onPress={handleMarkOnSite}
                disabled={!capturedPhoto}
              >
                <ThemedText style={styles.actionButtonText}>Mark On-Site</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {job.status === 'onsite' && (
            <ThemedView style={styles.actionSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Complete Job</ThemedText>
              <ThemedText style={styles.instructions}>Take a completion photo and add final notes</ThemedText>
              
              <TextInput
                style={styles.textInput}
                placeholder="Enter completion notes..."
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
              
              <TouchableOpacity style={styles.photoButton} onPress={showPhotoOptions}>
                <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color="white" />
                <ThemedText style={styles.photoButtonText}>
                  {capturedPhoto ? 'Change Photo' : 'Take Completion Photo'}
                </ThemedText>
              </TouchableOpacity>

              {capturedPhoto && (
                <ThemedView style={styles.photoPreview}>
                  <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removePhotoButton} 
                    onPress={() => setCapturedPhoto(null)}
                  >
                    <ThemedText style={styles.removePhotoText}>Remove</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              )}

              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton, !capturedPhoto && styles.disabledButton]} 
                onPress={handleComplete}
                disabled={!capturedPhoto}
              >
                <ThemedText style={styles.actionButtonText}>Complete Job</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {job.workStartedImage && (
            <ThemedView style={styles.noteSection}>
              <ThemedText type="subtitle">Work Started:</ThemedText>
              <Image source={{ uri: job.workStartedImage }} style={styles.existingImage} />
              {job.workStartedNotes && (
                <ThemedText style={styles.noteText}>{job.workStartedNotes}</ThemedText>
              )}
            </ThemedView>
          )}

          {job.workCompletedImage && (
            <ThemedView style={styles.noteSection}>
              <ThemedText type="subtitle">Work Completed:</ThemedText>
              <Image source={{ uri: job.workCompletedImage }} style={styles.existingImage} />
              {job.workCompletedNotes && (
                <ThemedText style={styles.noteText}>{job.workCompletedNotes}</ThemedText>
              )}
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    flex: 1,
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
  company: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.7,
  },
  description: {
    lineHeight: 20,
    marginBottom: 24,
    opacity: 0.8,
  },
  actionSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  instructions: {
    opacity: 0.7,
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
    backgroundColor: 'white',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  photoButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  photoPreview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  removePhotoButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removePhotoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#45B7D1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#96CEB4',
  },
  disabledButton: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  noteSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
  },
  existingImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  noteText: {
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
}); 