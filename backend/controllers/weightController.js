import WeightEntry from '../models/WeightEntry.js';

export const saveWeight = async (req, res) => {
  try {
    const userId = req.user.id;
    const { weight, unit } = req.body;

    if (!weight || weight < 20 || weight > 500) {
      return res.status(400).json({ success: false, error: 'Valid weight is required' });
    }

    const entry = await WeightEntry.create({ userId, weight, unit });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getWeightHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await WeightEntry.find({ userId })
      .sort({ loggedAt: -1 })
      .limit(30);
    
    // Return chronologically for charts
    res.status(200).json({ success: true, data: history.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
