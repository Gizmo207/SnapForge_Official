const {onRequest} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const {queueLicenseEmail} = require("./email");

exports.testEmail = onRequest({
  cors: true,
  region: "us-central1",
}, async (req, res) => {
  try {
    await queueLicenseEmail({
      to: "snapforgellc@gmail.com",
      licenseKey: "SF-TEST-1234-5678-ABCD",
      orderId: "test_order_123",
      name: "Test User",
    });

    res.status(200).json({
      success: true,
      message: "Test email queued successfully",
    });
  } catch (error) {
    logger.error("Test email error", {error: error.message});
    res.status(500).json({error: error.message});
  }
});
