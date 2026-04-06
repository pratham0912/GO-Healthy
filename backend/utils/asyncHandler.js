// utils/asyncHandler.js — Wraps async controller functions to avoid try/catch boilerplate

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
