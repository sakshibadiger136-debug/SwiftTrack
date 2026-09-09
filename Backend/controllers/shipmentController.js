const Shipment = require("../models/Shipment");
const { nanoid } = require("nanoid");

// Create a new shipment (admin only)
const createShipment = async (req, res) => {
  try {
    const { sender, receiver, estimatedDelivery } = req.body;
    const trackingId = "TRK" + nanoid(8).toUpperCase();

    const shipment = new Shipment({
      trackingId,
      sender,
      receiver,
      estimatedDelivery,
      currentStatus: "Order Placed",
      statusHistory: [
        { status: "Order Placed", location: sender.address, note: "Shipment created" },
      ],
    });

    await shipment.save();
    res.status(201).json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all shipments (admin only)
const getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one shipment by trackingId (public)
const trackShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update shipment status (admin only)
const updateShipmentStatus = async (req, res) => {
  try {
    const { status, location, note } = req.body;
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });

    shipment.currentStatus = status;
    shipment.statusHistory.push({ status, location, note });
    await shipment.save();

    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Customer requests an address correction (public, no login needed)
const requestAddressCorrection = async (req, res) => {
  try {
    const { newAddress, reason } = req.body;

    if (!newAddress || !reason) {
      return res.status(400).json({ message: "New address and reason are required" });
    }

    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });

    if (!["Order Placed", "Picked Up"].includes(shipment.currentStatus)) {
      return res.status(400).json({
        message: "Address can no longer be changed — shipment is already in transit",
      });
    }

    if (shipment.correctionRequest?.status === "pending") {
      return res.status(400).json({ message: "A correction request is already pending review" });
    }

    shipment.correctionRequest = {
      requested: true,
      newAddress,
      reason,
      status: "pending",
      requestedAt: new Date(),
      adminRemarks: "",
    };

    await shipment.save();
    res.json({ message: "Correction request submitted", shipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all pending correction requests
const getCorrectionRequests = async (req, res) => {
  try {
    const shipments = await Shipment.find({ "correctionRequest.status": "pending" }).sort({
      createdAt: -1,
    });
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: approve or reject a correction request
const reviewAddressCorrection = async (req, res) => {
  try {
    const { decision, adminRemarks } = req.body; // "approved" | "rejected"

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision" });
    }

    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment || shipment.correctionRequest?.status !== "pending") {
      return res.status(400).json({ message: "No pending correction request found" });
    }

    shipment.correctionRequest.status = decision;
    shipment.correctionRequest.reviewedAt = new Date();
    shipment.correctionRequest.adminRemarks = adminRemarks || "";

    if (decision === "approved") {
      const oldAddress = shipment.receiver.address;
      shipment.receiver.address = shipment.correctionRequest.newAddress;
      shipment.statusHistory.push({
        status: shipment.currentStatus,
        location: shipment.receiver.address,
        note: `Receiver address corrected from "${oldAddress}" to "${shipment.receiver.address}" (admin approved)`,
      });
    } else {
      shipment.statusHistory.push({
        status: shipment.currentStatus,
        location: "",
        note: `Address correction request rejected: ${adminRemarks || "No reason given"}`,
      });
    }

    await shipment.save();
    res.json({ message: `Request ${decision}`, shipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createShipment,
  getAllShipments,
  trackShipment,
  updateShipmentStatus,
  requestAddressCorrection,
  getCorrectionRequests,
  reviewAddressCorrection,
};