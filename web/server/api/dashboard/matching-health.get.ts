export default defineEventHandler(async () => {
  // Backend-aggregated analytics (mocked here for UI; replace with real aggregation).
  // Ratios are 0..1, distribution ratios are also 0..1.
  return {
    scoreDistribution: [
      { label: '0–20', ratio: 0.06, count: 12 },
      { label: '20–40', ratio: 0.12, count: 24 },
      { label: '40–60', ratio: 0.22, count: 44 },
      { label: '60–80', ratio: 0.28, count: 56 },
      { label: '80–100', ratio: 0.32, count: 64 },
    ],
    highQualityRatio: 0.32, // score > 80
    lowQualityRatio: 0.18, // score < 60
  }
})


