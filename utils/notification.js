import { Expo } from 'expo-server-sdk';

// Initialize Expo SDK
const expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN, // Optional access token if you have enabled push security
    useFcmV1: true, // Use FCMv1 (default) for sending notifications
});

/**
 * Utility function to send a notification to a single Expo push token
 * @param {string} expoPushToken The Expo push token for the target device
 * @param {string} title The title of the notification
 * @param {string} body The body text of the notification
 * @param {object} data Additional data to send with the notification
 * @returns {Promise<void>} Returns nothing, but logs errors and successes.
 */
export async function sendNotificationToDevice({
    expoPushToken,
    title = "Your video is render!",
    body = "Download the video and share",
    data = { screen: "explore" }
}) {
    // Check if the provided push token is valid
    if (!Expo.isExpoPushToken(expoPushToken)) {
        console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
        return;
    }

    // Construct the notification message
    const message = {
        to: expoPushToken,
        title: title,
        sound: 'default',
        body: body,
        data: data, // Optional: include any additional data with the notification
    };

    // Chunk the notification (even for a single message, expo allows batching for efficiency)
    let chunks = expo.chunkPushNotifications([message]);

    // Send the notification
    try {
        for (let chunk of chunks) {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log('Notification sent:', ticketChunk);

            // Retrieve the receipt IDs for the notifications
            let receiptIds = ticketChunk.map(ticket => ticket.id).filter(id => id);

            // Check the receipts to confirm the delivery
            if (receiptIds.length > 0) {
                await checkNotificationReceipts(receiptIds);
            }
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

/**
 * Utility function to check the receipt of notifications and handle errors
 * @param {Array<string>} receiptIds List of receipt IDs to check
 * @returns {Promise<void>} Returns nothing, but logs errors and successes.
 */
async function checkNotificationReceipts(receiptIds) {
    // Chunk the receipt IDs for batch checking
    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    try {
        for (let chunk of receiptIdChunks) {
            let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            console.log('Receipts:', receipts);

            for (let receiptId in receipts) {
                let { status, message, details } = receipts[receiptId];
                if (status === 'ok') {
                    continue; // The notification was successfully received
                } else if (status === 'error') {
                    console.error(`Error sending notification: ${message}`);
                    if (details && details.error) {
                        console.error(`Error code: ${details.error}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error retrieving receipts:', error);
    }
}

sendNotificationToDevice({
    expoPushToken:"ExponentPushToken[qQ_SwXM8mV4IhAIFH_kde5]"
})