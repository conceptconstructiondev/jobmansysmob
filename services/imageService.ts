import { supabase } from '@/config/supabase';

export const uploadImage = async (
  imageUri: string, 
  jobId: string, 
  imageType: 'workStarted' | 'workCompleted'
): Promise<string> => {
  try {
    console.log('Starting image upload to Supabase...', { imageUri, jobId, imageType });
    
    // Convert local file URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${jobId}_${imageType}_${timestamp}.jpg`;
    const filePath = `jobs/${jobId}/${fileName}`;

    console.log('Uploading to private Supabase Storage...', filePath);
    
    // Upload to private Supabase Storage
    const { data, error } = await supabase.storage
      .from('conceptapp-imageuploads')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    console.log('Image uploaded successfully to private storage:', filePath);
    
    // Return the file path instead of public URL
    // We'll generate signed URLs when we need to display images
    return filePath;
    
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};

// Get signed URL for displaying images (expires in 1 hour)
export const getSignedImageUrl = async (filePath: string): Promise<string | null> => {
  try {
    if (!filePath) return null;
    
    const { data, error } = await supabase.storage
      .from('conceptapp-imageuploads')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
};

// Delete image function
export const deleteImage = async (filePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('conceptapp-imageuploads')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}; 