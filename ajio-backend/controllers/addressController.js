const Address = require("../models/Address");

exports.getAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required"
      });
    }

    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      addresses
    });

  } catch (error) {
    console.error("GET ADDRESS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.addAddress = async (req, res) => {
  try {
    const { userId, firstName, lastName, address1, address2, state } = req.body;

    if (!userId || !firstName || !lastName || !address1 || !state) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
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

