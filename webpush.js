// webpush.js (Node backend)
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:sana.naitnella@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);


async function sendWebPush(subscription, title, body) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    console.log("Web push sent!");
  } catch (err) {
    console.error("Error sending web push:", err);
  }
}

module.exports = { sendWebPush };
