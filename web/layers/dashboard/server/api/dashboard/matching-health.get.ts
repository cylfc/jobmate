export default defineEventHandler(async () => {
  // Backend-aggregated analytics (mocked here for UI; replace with real aggregation).
  // Ratios are 0..1, distribution ratios are also 0..1.
  return {
    scoreDistribution: [
      { label: '0–10', ratio: 0.02, count: 4 },
      { label: '10–20', ratio: 0.04, count: 8 },
      { label: '20–30', ratio: 0.06, count: 12 },
      { label: '30–40', ratio: 0.06, count: 12 },
      { label: '40–50', ratio: 0.10, count: 20 },
      { label: '50–60', ratio: 0.12, count: 24 },
      { label: '60–70', ratio: 0.14, count: 28 },
      { label: '70–80', ratio: 0.14, count: 28 },
      { label: '80–90', ratio: 0.18, count: 36 },
      { label: '90–100', ratio: 0.14, count: 28 },
    ],
    highQualityRatio: 0.32, // score > 80
    lowQualityRatio: 0.18, // score < 60
  }
})

