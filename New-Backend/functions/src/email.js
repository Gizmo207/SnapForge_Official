const admin = require("firebase-admin");
const {logger} = require("firebase-functions");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Queue a license email to be sent by the Firebase email extension
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.licenseKey - The generated license key
 * @param {string} options.orderId - Order/session ID from Stripe
 * @param {string} [options.name] - Customer name (optional)
 * @return {Promise} Promise that resolves when email is queued
 */
async function queueLicenseEmail({to, licenseKey, orderId, name}) {
  const subject = "Your SnapForge License Key 🎉";
  
  const text = `Thanks for your purchase!

Order: ${orderId}
${name ? `Name: ${name}\n` : ""}Your license key:
${licenseKey}

To activate SnapForge:
1) Open the app
2) Enter this license key when prompted
3) Enjoy premium features!

If you have any issues, just reply to this email.
— The SnapForge Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px;">
        <img src="https://firebasestorage.googleapis.com/v0/b/snapforge-ab371.appspot.com/o/email-assets%2Flogo.png?alt=media" alt="SnapForge" style="width: 120px; height: auto;" />
      </div>
      
      <h2 style="color: #2c3e50;">Thanks for your purchase! 🎉</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order:</strong> ${orderId}</p>
        ${name ? `<p><strong>Name:</strong> ${name}</p>` : ""}
        <p><strong>Your License Key:</strong></p>
        <div style="background: #fff; padding: 15px; border-radius: 4px; border-left: 4px solid #3498db; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #2c3e50;">
          ${licenseKey}
        </div>
      </div>
      
      <h3 style="color: #2c3e50;">To activate SnapForge:</h3>
      <ol style="line-height: 1.6;">
        <li>Open the SnapForge app</li>
        <li>Enter this license key when prompted</li>
        <li>Enjoy all premium features!</li>
      </ol>
      
      <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #2c3e50;">
          <strong>Need help?</strong> Just reply to this email and we'll assist you right away!
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d;">
        <p>— The SnapForge Team</p>
        <p style="font-size: 12px;">Resize & clean your images instantly.</p>
      </div>
    </div>
  `;

  // Write to the collection the extension watches (default: "mail")
  await db.collection("mail").add({
    to,
    message: {
      subject,
      text,
      html,
    },
    // Optional metadata for tracking
    orderId,
    licenseKey,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  logger.info("License email queued", {to, licenseKey, orderId});
}

module.exports = {queueLicenseEmail};
