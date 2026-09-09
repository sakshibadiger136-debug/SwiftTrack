const express = require("express");
const router = express.Router();
const {
  createShipment,
  getAllShipments,
  trackShipment,
  updateShipmentStatus,
  requestAddressCorrection,
  getCorrectionRequests,
  reviewAddressCorrection,
} = require("../controllers/shipmentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createShipment);
router.get("/", protect, getAllShipments);

// NEW: must come before "/:trackingId" so "admin" isn't treated as a trackingId
router.get("/admin/correction-requests", protect, getCorrectionRequests);

router.get("/:trackingId", trackShipment); // public tracking
router.patch("/:trackingId/status", protect, updateShipmentStatus);

// NEW: address correction routes
router.post("/:trackingId/request-correction", requestAddressCorrection); // public — no login
router.put("/:trackingId/review-correction", protect, reviewAddressCorrection);

module.exports = router;