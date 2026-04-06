// controllers/userController.js — User profile operations (ESM)
// Extended with health fields (age, height, weight, goal, etc.) and BMI calculation.

import User from '../models/User.js';
import { calculateBMI } from '../services/calorieService.js';

/**
 * GET /api/user/profile
 * Get logged-in user's full profile including health fields.
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select('-googleId -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        isActive: user.isActive,
        // Health fields
        age: user.age,
        height: user.height,
        weight: user.weight,
        gender: user.gender,
        goal: user.goal,
        dietType: user.dietType,
        dailyCalorieTarget: user.dailyCalorieTarget,
        dailyWaterTarget: user.dailyWaterTarget,
        bmi: user.bmi,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(`[userController.getProfile] Error: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * PUT /api/user/profile
 * Update user's profile including health fields.
 * Auto-calculates BMI when height and weight are provided.
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name, profilePicture,
      age, height, weight, gender, goal, dietType,
      dailyCalorieTarget, dailyWaterTarget,
    } = req.body;

    const updateFields = {};
    if (name !== undefined)               updateFields.name = name;
    if (profilePicture !== undefined)     updateFields.profilePicture = profilePicture;
    if (age !== undefined)                updateFields.age = age;
    if (height !== undefined)             updateFields.height = height;
    if (weight !== undefined)             updateFields.weight = weight;
    if (gender !== undefined)             updateFields.gender = gender;
    if (goal !== undefined)               updateFields.goal = goal;
    if (dietType !== undefined)           updateFields.dietType = dietType;
    if (dailyCalorieTarget !== undefined) updateFields.dailyCalorieTarget = dailyCalorieTarget;
    if (dailyWaterTarget !== undefined)   updateFields.dailyWaterTarget = dailyWaterTarget;

    // Auto-calculate BMI if height and weight are being updated
    const existingUser = await User.findById(userId).lean();
    const finalHeight = height || existingUser?.height;
    const finalWeight = weight || existingUser?.weight;
    if (finalHeight && finalWeight) {
      const { bmi } = calculateBMI(finalHeight, finalWeight);
      if (bmi) updateFields.bmi = bmi;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .select('-googleId -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        age: user.age,
        height: user.height,
        weight: user.weight,
        gender: user.gender,
        goal: user.goal,
        dietType: user.dietType,
        dailyCalorieTarget: user.dailyCalorieTarget,
        dailyWaterTarget: user.dailyWaterTarget,
        bmi: user.bmi,
      },
    });
  } catch (error) {
    console.error(`[userController.updateProfile] Error: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * GET /api/user/bmi
 * Calculate and return BMI from stored height + weight.
 */
export const getBMI = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('height weight bmi').lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.height || !user.weight) {
      return res.status(400).json({
        success: false,
        error: 'Height and weight are required to calculate BMI. Update your profile first.',
      });
    }

    const result = calculateBMI(user.height, user.weight);

    // Persist BMI on user doc
    await User.findByIdAndUpdate(userId, { $set: { bmi: result.bmi } });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(`[userController.getBMI] Error: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
