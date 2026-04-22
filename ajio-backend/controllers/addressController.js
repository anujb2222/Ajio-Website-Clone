const mongoose = require("mongoose");
const Address = require("../models/Address");

// GET addresses for a user
exports.getAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing User ID"
      });
    }

    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      addresses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ADD address
exports.addAddress = async (req, res) => {
  try {
    const { userId, firstName, lastName, address1, address2, state } = req.body;

    // validation
    if (!userId || !firstName || !lastName || !address1 || !state) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID"
      });
    }

    const newAddress = new Address({
      userId,
      firstName,
      lastName,
      address1,
      address2,
      state
    });

    await newAddress.save();

    res.json({
      success: true,
      address: newAddress
    });

  } catch (error) {
    console.error("ADD ADDRESS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE address
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID"
      });
    }

    const deleted = await Address.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};