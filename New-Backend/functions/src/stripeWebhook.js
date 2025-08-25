const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp, getApps} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const crypto = require("crypto");

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

function generateLicenseKey() {
  const prefix = "SF";
  const randomPart = crypto.randomBytes(16).toString("hex").toUpperCase();
  const part1 = randomPart.substring(0, 4);
  const part2 = randomPart.substring(4, 8);
  const part3 = randomPart.substring(8, 12);
  const part4 = randomPart.substring(12, 16);
  return `${prefix}-${part1}-${part2}-${part3}-${part4}`;
}

exports.stripeWebhook = onRequest({
  cors: false,
  secrets: ["STRIPE_SECRET_KEY"],
}, async (req, res) => {
  try {
    const event = req.body;
    console.log("Stripe webhook event:", event.type);

    if (event.type === "checkout.session.completed" ||
        event.type === "payment_intent.succeeded") {
      const session = event.data.object;
      const licenseKey = generateLicenseKey();

      let customerEmail = "";
      if (session.customer_details && session.customer_details.email) {
        customerEmail = session.customer_details.email;
      } else if (session.customer_email) {
        customerEmail = session.customer_email;
      }

      const licenseData = {
        licenseKey: licenseKey,
        email: customerEmail,
        stripeSessionId: session.id,
        paymentStatus: "completed",
        createdAt: new Date(),
        isActive: true,
        productType: "snapforge-license",
      };

      await db.collection("licenses").doc(licenseKey).set(licenseData);
      console.log("License created:", licenseKey, "for email:", customerEmail);

      res.status(200).json({
        success: true,
        licenseKey: licenseKey,
        message: "License generated successfully",
      });
    } else {
      console.log("Unhandled event type:", event.type);
      res.status(200).json({success: true, message: "Event received"});
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({error: "Webhook failed", details: error.message});
  }
});
