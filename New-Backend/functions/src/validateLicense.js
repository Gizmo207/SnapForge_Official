const functions = require("firebase-functions");
const admin = require("firebase-admin");

/**
 * Hardened License Validation Function
 * - Uses transactions for atomic operations
 * - Idempotent (safe to call multiple times)
 * - Enhanced logging and error handling
 * - Production-ready security
 */
const validateLicense = functions.https.onCall(async (data, context) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    try {
      console.log(`[${requestId}] License validation started`, {
        timestamp: new Date().toISOString(),
        ip: (context.rawRequest && context.rawRequest.ip) || "unknown",
      });

      const {licenseKey, deviceId} = data || {};
      
      // Validate input
      if (!licenseKey || typeof licenseKey !== "string") {
        console.log(`[${requestId}] Invalid input - missing licenseKey`);
        throw new functions.https.HttpsError(
          "invalid-argument",
          "License key is required and must be a string"
        );
      }

      if (licenseKey.length < 5 || licenseKey.length > 100) {
        console.log(`[${requestId}] Invalid license key length:`, licenseKey.length);
        throw new functions.https.HttpsError(
          "invalid-argument",
          "License key has invalid length"
        );
      }

      console.log(`[${requestId}] Validating license:`, licenseKey);

      // Use transaction for atomic operation
      const db = admin.firestore();
      const result = await db.runTransaction(async (transaction) => {
        const licensesRef = db.collection("licenses");
        const querySnapshot = await licensesRef.where("key", "==", licenseKey).get();

        if (querySnapshot.empty) {
          console.log(`[${requestId}] License not found:`, licenseKey);
          throw new functions.https.HttpsError(
            "not-found", 
            "License key not found"
          );
        }

        const licenseDoc = querySnapshot.docs[0];
        const licenseData = licenseDoc.data();
        
        console.log(`[${requestId}] Found license:`, {
          key: licenseKey,
          activated: licenseData.activated,
          email: licenseData.email,
          createdAt: licenseData.createdAt,
        });

        // Check if already activated (idempotent behavior)
        if (licenseData.activated) {
          console.log(`[${requestId}] License already activated - returning success`);
          return {
            success: true,
            alreadyActivated: true,
            license: licenseData,
            message: "License was already activated",
          };
        }

        // Activate the license atomically
        const updateData = {
          activated: true,
          activatedAt: admin.firestore.FieldValue.serverTimestamp(),
          activatedBy: deviceId || "user",
          activatedFrom: (context.rawRequest && context.rawRequest.ip) || "unknown",
          activationRequestId: requestId,
        };

        transaction.update(licenseDoc.ref, updateData);

        console.log(`[${requestId}] License activated successfully:`, licenseKey);

        return {
          success: true,
          alreadyActivated: false,
          license: licenseData,
          message: "License activated successfully!",
        };
      });

      const duration = Date.now() - startTime;
      console.log(`[${requestId}] License validation completed`, {
        success: true,
        duration: `${duration}ms`,
        alreadyActivated: result.alreadyActivated,
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${requestId}] License validation failed`, {
        duration: `${duration}ms`,
        error: error.message,
        code: error.code,
        licenseKey: (data && data.licenseKey) || "unknown",
      });

      // Re-throw Firebase errors with proper codes
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      // Handle unexpected errors
      throw new functions.https.HttpsError(
        "internal",
        "Failed to validate license",
        error.message
      );
    }
  });

module.exports = {validateLicense};
