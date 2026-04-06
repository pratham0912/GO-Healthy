export const calculateHealthScore = ({
  waterGlasses,
  waterGoal = 8,
  caloriesToday,
  calorieGoal = 2000,
  streak,
  mealsLoggedToday,
  weightLoggedThisWeek
}) => {
  let score = 0;

  if (waterGlasses >= waterGoal) score += 20;
  else score += Math.floor((waterGlasses / waterGoal) * 20);

  if (caloriesToday > 0) {
    const calDiff = Math.abs(caloriesToday - calorieGoal) / calorieGoal;
    if (calDiff <= 0.10) score += 25;
    else if (calDiff <= 0.25) score += 15;
    else score += 5;
  }

  if (streak >= 1) score += 20;
  if (mealsLoggedToday >= 1) score += 20;
  if (weightLoggedThisWeek) score += 15;

  return Math.min(100, Math.max(0, score));
};
