const Deal = require("../models/Deals");

// get all deals

const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ deals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

// create a new deal

const createDeal = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      category,
      color,
      image,
      storeName,
      storeLocation,
      expiresAt,
    } = req.body;

    const deal = new Deal({
      title,
      subtitle,
      category,
      color,
      image,
      storeName,
      storeLocation,
      expiresAt,
      createdBy: req.user._id,
    });

    const result = await deal.save();

    res
      .status(201)
      .json({ message: "Deal created successfully!", deal: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

// update a deal

const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found!" });
    }

    const {
      title,
      subtitle,
      category,
      color,
      image,
      storeName,
      storeLocation,
      expiresAt,
      isActive,
    } = req.body;

    deal.title = title || deal.title;
    deal.subtitle = subtitle || deal.subtitle;
    deal.category = category || deal.category;
    deal.color = color || deal.color;
    deal.image = image || deal.image;
    deal.storeName = storeName || deal.storeName;
    deal.storeLocation = storeLocation || deal.storeLocation;
    deal.expiresAt = expiresAt || deal.expiresAt;
    deal.isActive = isActive !== undefined ? isActive : deal.isActive;

    await deal.save();

    res.status(200).json({ message: "Deal updated successfully!", deal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

// delete a deal

const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found!" });
    }

    await deal.deleteOne();

    res.status(200).json({ message: "Deal deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

module.exports = { getDeals, createDeal, updateDeal, deleteDeal };
