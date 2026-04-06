export const calculateStreak = (currentStreak, lastActiveDate, loggedMealsYesterday, loggedMealsToday) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  let newStreak = currentStreak || 0;
  let updatedLastActive = lastActiveDate || new Date(0);

  // If already processed today, return exactly what it is.
  if (updatedLastActive >= startOfToday) {
    return { streak: newStreak, lastActiveAt: updatedLastActive };
  }

  // If handled yesterday, check yesterday's meals
  if (loggedMealsYesterday > 0) {
    if (updatedLastActive < startOfYesterday) {
        newStreak += 1;
    }
  } else if (loggedMealsToday === 0) {
    // Neither yesterday nor today has meals
    newStreak = 0;
  }

  // If they just logged today and streak was 0
  if (loggedMealsToday > 0 && newStreak === 0) {
    newStreak = 1;
  }

  return { streak: newStreak, lastActiveAt: new Date() };
};
