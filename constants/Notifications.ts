// Remove the setNotificationHandler - keep only the interface
export interface NotificationData {
  jobId?: string;
  type?: 'job_created' | 'job_updated' | 'job_completed';
  title?: string;
  message?: string;
} 