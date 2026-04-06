// controllers/textController.js — Text Save (ESM)

import TextInput from '../models/TextInput.js';

export const saveText = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content, type } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Content cannot be empty' });
    }
    const textInput = await TextInput.create({
      userId, content: content.trim(), type: type || 'submitted', characterCount: content.trim().length,
    });
    res.status(201).json({ success: true, data: { id: textInput._id, content: textInput.content, characterCount: textInput.characterCount, type: textInput.type, createdAt: textInput.createdAt } });
  } catch (error) {
    next(error);
  }
};

export const getUserTexts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const texts = await TextInput.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: texts });
  } catch (error) {
    next(error);
  }
};

export const deleteText = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const text = await TextInput.findOneAndDelete({ _id: req.params.id, userId });
    if (!text) return res.status(404).json({ success: false, error: 'Text not found' });
    res.json({ success: true, data: { message: 'Text deleted' } });
  } catch (error) {
    next(error);
  }
};
