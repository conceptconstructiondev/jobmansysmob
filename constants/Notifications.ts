// Only keep the interface - remove the duplicate setNotificationHandler
export interface NotificationData {
  jobId?: string;
  type?: 'job_created' | 'job_updated' | 'job_completed';
  title?: string;
  message?: string;
} 