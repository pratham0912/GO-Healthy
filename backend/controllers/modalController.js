// controllers/modalController.js — Dynamic Modal (ESM)

import ModalContent from '../models/ModalContent.js';

export const getActiveModal = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { active: true };
    if (type) query.type = type;
    const modal = await ModalContent.findOne(query).sort({ priority: -1, createdAt: -1 }).lean();
    res.json({ success: true, data: modal || null });
  } catch (error) {
    next(error);
  }
};

export const getAllModals = async (req, res, next) => {
  try {
    const modals = await ModalContent.find().sort({ priority: -1, createdAt: -1 }).lean();
    res.json({ success: true, data: modals });
  } catch (error) {
    next(error);
  }
};

export const createModal = async (req, res, next) => {
  try {
    const { title, body, type, icon, ctaText, ctaLink, priority, active } = req.body;
    const modal = await ModalContent.create({
      title, body, type: type || 'health-tip', icon: icon || 'bi-info-circle',
      ctaText, ctaLink, priority: priority || 0, active: active !== undefined ? active : true,
    });
    res.status(201).json({ success: true, data: modal });
  } catch (error) {
    next(error);
  }
};
