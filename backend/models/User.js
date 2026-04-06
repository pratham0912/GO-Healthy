// models/User.js — User schema (supports Google OAuth + email/password)

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    // ── Google OAuth (optional — only set for Google users) ──────────
    googleId: {
      type: String,
      sparse: true,   // sparse index allows multiple null values
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    // ── Email/Password auth (optional — only set for manual users) ───
    passwordHash: {
      type: String,
      select: false,   // never returned in queries by default
    },
    passwordSalt: {
      type: String,
      select: false,
    },
    // ── Health profile fields ─────────────────────────────────────────
    age:    { type: Number, min: 2, max: 120 },
    height: { type: Number },               // cm
    weight: { type: Number },               // kg
    gender: { type: String, enum: ['male', 'female', 'other'] },
    goal:   { type: String, enum: ['lose_weight', 'build_muscle', 'maintain'], default: 'maintain' },
    dietType: {
      type: String,
      enum: ['vegan', 'vegetarian', 'keto', 'paleo', 'balanced', 'none'],
      default: 'none',
    },
    dailyCalorieTarget: { type: Number, default: 2000, min: 500, max: 10000 },
    dailyWaterTarget:   { type: Number, default: 8, min: 1, max: 20 },  // glasses
    bmi: { type: Number },                  // auto-calculated from height + weight
    // ── Auth & role ──────────────────────────────────────────────────
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;

