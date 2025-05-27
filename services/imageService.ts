import { supabase } from '@/config/supabase';

// Add this helper function
const prepareFileForUpload = async (imageUri: string) => {
  try {
    console.log('Preparing file for upload, original URI:', imageUri);
    
    // For Android, we might need to handle content:// URIs differently
    if (imageUri.startsWith('content://')) {
      console.log('Handling Android content URI');
      // The fetch should still work, but let's add more logging
    }
    
    const response = await fetch(imageUri);
    console.log('Fetch response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Blob details:', {
      size: blob.size,
      type: blob.type,
      sizeInMB: (blob.size / (1024 * 1024)).toFixed(2)
    });
    
    // Check if blob is too large (Supabase has limits)
    const maxSizeInMB = 50; // Adjust based on your Supabase plan
    if (blob.size > maxSizeInMB * 1024 * 1024) {
      throw new Error(`Image too large: ${(blob.size / (1024 * 1024)).toFixed(2)}MB. Max size: ${maxSizeInMB}MB`);
    }
    
    return blob;
  } catch (error) {
    console.error('Error preparing file:', error);
    throw error;
  }
};

// Add this function to create the bucket if it doesn't exist
export const ensureBucketExists = async (): Promise<void> => {
  try {
    console.log('🔍 Checking if conceptapp-imageuploads bucket exists...');
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw listError;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'conceptapp-imageuploads');
    
    if (!bucketExists) {
      console.log('🪣 Creating conceptapp-imageuploads bucket...');
      
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('conceptapp-imageuploads', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
        fileSizeLimit: '50MB'
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        throw error;
      }
      
      console.log('✅ Bucket created successfully:', data);
    } else {
      console.log('✅ Bucket already exists');
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
};

// Update the uploadImage function to use this helper
export const uploadImage = async (
  imageUri: string, 
  jobId: string, 
  imageType: 'workStarted' | 'workCompleted'
): Promise<string> => {
  try {
    console.log('Starting image upload to Supabase...', { imageUri, jobId, imageType });
    
    // Ensure bucket exists first
    await ensureBucketExists();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication check failed:', authError);
      throw new Error('User not authenticated. Please log in again.');
    }
    console.log('User authenticated:', user.email);
    
    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${jobId}_${imageType}_${timestamp}.jpg`;
    const filePath = `jobs/${jobId}/${fileName}`;

    console.log('Uploading to Supabase Storage...', filePath);
    
    // Try upload with retry logic using file URI
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`🔄 Upload attempt ${retryCount + 1}/${maxRetries}`);
        
        // Use the Supabase client but with file URI directly
        const { data, error } = await supabase.storage
          .from('conceptapp-imageuploads')
          .upload(filePath, {
            uri: imageUri,
            type: 'image/jpeg',
            name: fileName,
          } as any, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (error) {
          console.error('Supabase upload error details:', {
            message: error.message,
            statusCode: error.statusCode,
            error: error
          });
          
          // If it's a network error, retry
          if (error.message.includes('Network request failed') && retryCount < maxRetries - 1) {
            retryCount++;
            console.log(`⏳ Retrying upload in 3 seconds... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }
          
          throw error;
        }

        console.log('✅ Image uploaded successfully:', filePath);
        return filePath;
        
      } catch (uploadError) {
        console.error(`❌ Upload attempt ${retryCount + 1} failed:`, uploadError);
        
        if (retryCount < maxRetries - 1) {
          retryCount++;
          console.log(`⏳ Retrying upload in 3 seconds... (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          throw uploadError;
        }
      }
    }
    
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
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

// Add this test function
export const testStorageConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing Supabase Storage connection...');
    
    // Test 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Auth test failed:', authError);
      return false;
    }
    console.log('✅ User authenticated:', user.email);
    
    // Test 2: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('❌ Buckets list failed:', bucketsError);
      return false;
    }
    console.log('✅ Available buckets:', buckets?.map(b => b.name));
    
    // Test 3: Check our specific bucket
    const bucketExists = buckets?.some(bucket => bucket.name === 'conceptapp-imageuploads');
    if (!bucketExists) {
      console.error('❌ conceptapp-imageuploads bucket not found');
      return false;
    }
    console.log('✅ conceptapp-imageuploads bucket exists');
    
    // Test 4: Try to list files in the bucket (this tests permissions)
    const { data: files, error: listError } = await supabase.storage
      .from('conceptapp-imageuploads')
      .list('', { limit: 1 });
    
    if (listError) {
      console.error('❌ File list failed:', listError);
      return false;
    }
    console.log('✅ Can access bucket contents');
    
    return true;
  } catch (error) {
    console.error('❌ Storage connection test failed:', error);
    return false;
  }
};

export const debugSupabaseConnection = async () => {
  try {
    console.log('🔍 Debugging Supabase connection...');
    console.log('📍 Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('🔑 Supabase Key (first 10 chars):', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10));
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Current user:', user?.email);
    
    // Test storage access
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('🪣 Storage buckets response:', { buckets, error: bucketsError });
    
    // Test database access
    const { data: tables, error: tablesError } = await supabase
      .from('jobs')
      .select('count')
      .limit(1);
    console.log('🗄️ Database access test:', { tables, error: tablesError });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}; 