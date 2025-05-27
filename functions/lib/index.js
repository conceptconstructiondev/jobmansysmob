"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendJobNotification = void 0;
const admin = require("firebase-admin");
const firestore_1 = require("firebase-functions/v2/firestore");
// Initialize Firebase Admin
admin.initializeApp();
// Cloud Function that triggers when a new job is created
exports.sendJobNotification = (0, firestore_1.onDocumentCreated)('jobs/{jobId}', async (event) => {
    var _a;
    const jobData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    const jobId = event.params.jobId;
    console.log('🚨 New job created:', jobId, jobData === null || jobData === void 0 ? void 0 : jobData.title);
    // Only send notifications for open jobs
    if ((jobData === null || jobData === void 0 ? void 0 : jobData.status) !== 'open') {
        console.log('Job is not open, skipping notification');
        return;
    }
    try {
        // Get all push tokens from Firestore
        const tokensSnapshot = await admin.firestore()
            .collection('notificationTokens')
            .get();
        const tokens = tokensSnapshot.docs
            .map(doc => doc.data().token)
            .filter((token) => token && token.length > 0);
        console.log('📱 Found push tokens:', tokens.length);
        if (tokens.length === 0) {
            console.log('❌ No push tokens found');
            return;
        }
        // Prepare notification messages
        const messages = tokens.map((token) => ({
            to: token,
            sound: 'default',
            title: '🚨 New Job Available!',
            body: `${jobData.title} at ${jobData.company}`,
            data: {
                type: 'NEW_JOB',
                jobId,
                jobTitle: jobData.title,
                company: jobData.company,
            },
            priority: 'high',
        }));
        // Send notifications via Expo Push API
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });
        const result = await response.json();
        console.log('✅ Notification sent successfully:', result);
        return result;
    }
    catch (error) {
        console.error('❌ Error sending notification:', error);
        throw error;
    }
});
//# sourceMappingURL=index.js.map