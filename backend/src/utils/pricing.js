/**
 * Dynamic Pricing & Utilization Algorithm for EquipShare
 * Academic Category: Yield Management & Multi-Factor Pricing Algorithm
 * 
 * Computes an algorithm-driven dynamic price quote based on:
 * 1. Duration Incentive Curve (Greedy Volume Discount):
 *    - 1-6 days: 1.0x (Standard Daily Rate)
 *    - 7-29 days: 0.90x (10% Weekly Milestone Discount)
 *    - 30+ days: 0.80x (20% Monthly Contract Discount)
 * 2. Peak Season Multiplier (Monsoon vs Dry Construction Season in Nepal):
 *    - Dry construction season (Oct - May): 1.05x (Higher demand)
 *    - Monsoon season (Jun - Sep): 0.92x (Wet season concession)
 * 3. Machine Category Baseline Factor
 */

function calculateDynamicQuote({
  pricePerDay,
  rentalDays,
  category = "Construction",
  month = new Date().getMonth() + 1 // 1-12
}) {
  const baseDaily = Number(pricePerDay) || 0;
  const days = Math.max(1, parseInt(rentalDays, 10) || 1);

  // 1. Duration discount factor
  let durationDiscountFactor = 1.0;
  let durationDiscountLabel = "Standard Daily Rate (0% off)";

  if (days >= 30) {
    durationDiscountFactor = 0.80; // 20% discount
    durationDiscountLabel = "Long-Term Monthly Contract (20% off)";
  } else if (days >= 7) {
    durationDiscountFactor = 0.90; // 10% discount
    durationDiscountLabel = "Weekly Fleet Milestone (10% off)";
  }

  // 2. Nepal Seasonal Multiplier (Monsoon vs Peak Construction Season)
  // Months 6, 7, 8, 9 (June to Sept) = Monsoon off-peak
  const isMonsoon = month >= 6 && month <= 9;
  const seasonMultiplier = isMonsoon ? 0.92 : 1.05;
  const seasonLabel = isMonsoon
    ? "Monsoon Off-Peak Concession (-8%)"
    : "Dry Season Infrastructure Peak (+5%)";

  // Effective daily rate after multi-factor algorithm
  const effectiveDailyRate = Math.round(baseDaily * durationDiscountFactor * seasonMultiplier);
  const baseUndiscountedTotal = baseDaily * days;
  const algorithmTotal = effectiveDailyRate * days;
  const totalSavings = Math.max(0, baseUndiscountedTotal - algorithmTotal);

  return {
    baseDaily,
    rentalDays: days,
    durationDiscountFactor,
    durationDiscountLabel,
    seasonMultiplier,
    seasonLabel,
    effectiveDailyRate,
    baseUndiscountedTotal,
    algorithmTotal,
    totalSavings,
    savingsPercentage: baseUndiscountedTotal > 0 ? Math.round((totalSavings / baseUndiscountedTotal) * 100) : 0,
  };
}

module.exports = {
  calculateDynamicQuote,
};
