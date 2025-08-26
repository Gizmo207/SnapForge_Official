const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const {initializeApp, getApps} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

/**
 * getLicenseForSession
 * Input: { sessionId: string }
 * Looks up a license created by the webhook with stripeSessionId == sessionId
 * Returns: { licenseKey, email, status, orderId }
 */
exports.getLicenseForSession = onCall({
  region: "us-east1",
}, async (request) => {
  const { sessionId } = request.data || {};
  if (!sessionId || typeof sessionId !== "string") {
    throw new HttpsError("invalid-argument", "sessionId is required");
  }

  const q = await db
    .collection("licenses")
    .where("stripeSessionId", "==", sessionId.trim())
    .limit(1)
    .get();

  if (q.empty) {
    throw new HttpsError("not-found", "License not found for this session");
  }

  const doc = q.docs[0];
  const lic = doc.data();

  return {
    licenseKey: lic.key || doc.id,
    email: lic.email || null,
    status: lic.activated ? "active" : "issued",
    orderId: lic.orderId || lic.stripeSessionId || doc.id,
  };
});
