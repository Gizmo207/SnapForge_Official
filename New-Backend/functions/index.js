/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// IMPORTANT: initialize admin once
if (!admin.apps.length) admin.initializeApp();

// Pin the REGION
const REGION = "us-east1";

// Import payment webhook handlers
const { stripeWebhook } = require("./src/stripeWebhook");
const { testEmail } = require("./src/testEmail");

// ---- VALIDATE LICENSE (single source) ----
exports.validateLicense = onCall(
  {region: REGION},
  async (request) => {
    const requestId = Math.random().toString(36).slice(2);
    const data = request.data;
    const context = request;

    try {
      const { licenseKey, deviceId } = data || {};

      if (!licenseKey || typeof licenseKey !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "License key is required and must be a string"
        );
      }

      const trimmedKey = licenseKey.trim();
      if (trimmedKey.length < 3) {
        throw new functions.https.HttpsError("invalid-argument", "License key is too short");
      }

      const db = admin.firestore();
      const result = await db.runTransaction(async (tx) => {
        const q = await db.collection("licenses").where("key", "==", trimmedKey).get();
        if (q.empty) {
          throw new functions.https.HttpsError("not-found", "License key not found");
        }

        const doc = q.docs[0];
        const data = doc.data();

        if (data.activated) {
          return { success: true, alreadyActivated: true, license: data, message: "License already activated" };
        }

        tx.update(doc.ref, {
          activated: true,
          activatedAt: admin.firestore.FieldValue.serverTimestamp(),
          activatedBy: deviceId || "user",
          activatedFrom: (context.rawRequest && context.rawRequest.ip) || "unknown",
          activationRequestId: requestId,
        });

        return { success: true, alreadyActivated: false, license: data, message: "License activated successfully!" };
      });

      return result;
    } catch (err) {
      if (err instanceof functions.https.HttpsError) throw err;
      throw new functions.https.HttpsError("internal", "Failed to validate license", err.message);
    }
  }
);

// ---- OTHER EXPORTS (keep these) ----
exports.stripeWebhook = stripeWebhook;
exports.testEmail = testEmail;

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
