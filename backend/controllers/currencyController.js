// controllers/currencyController.js — Currency Converter (ESM)

import CurrencyHistory from '../models/CurrencyHistory.js';

export const convert = async (req, res, next) => {
  try {
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({ success: false, error: 'from, to, and amount are required' });
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'amount must be a positive number' });
    }
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(502).json({ success: false, error: `Failed to fetch rates for ${from.toUpperCase()}` });
    }
    const data = await response.json();
    const rate = data.rates[to.toUpperCase()];
    if (!rate) {
      return res.status(400).json({ success: false, error: `Currency "${to.toUpperCase()}" not found` });
    }
    const result = numAmount * rate;
    const userId = req.user?.id || null;
    await CurrencyHistory.create({ userId, from: from.toUpperCase(), to: to.toUpperCase(), amount: numAmount, rate, result });
    res.json({ success: true, data: { from: from.toUpperCase(), to: to.toUpperCase(), amount: numAmount, rate: parseFloat(rate.toFixed(6)), result: parseFloat(result.toFixed(2)) } });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = await CurrencyHistory.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

export const getRates = async (req, res, next) => {
  try {
    const base = (req.query.base || 'USD').toUpperCase();
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${base}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(502).json({ success: false, error: `Failed to fetch rates for ${base}` });
    }
    const data = await response.json();
    res.json({ success: true, data: { base: data.base, date: data.date, rates: data.rates } });
  } catch (error) {
    next(error);
  }
};
