const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ["Order Placed", "Picked Up", "In Transit", "Out for Delivery", "Delivered"],
  },
  location: { type: String, default: "" },
  note: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

const shipmentSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
    },
    sender: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    receiver: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    currentStatus: {
      type: String,
      default: "Order Placed",
      enum: ["Order Placed", "Picked Up", "In Transit", "Out for Delivery", "Delivered"],
    },
    estimatedDelivery: { type: Date },
    statusHistory: [statusHistorySchema],

    correctionRequest: {
      requested: { type: Boolean, default: false },
      newAddress: { type: String, default: "" },
      reason: { type: String, default: "" },
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
      },
      requestedAt: { type: Date },
      reviewedAt: { type: Date },
      adminRemarks: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);