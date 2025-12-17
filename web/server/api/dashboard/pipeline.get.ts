export default defineEventHandler(async () => {
  // Backend-aggregated pipeline counts (mocked for UI; replace with real aggregation).
  return {
    stages: [
      { id: 'uploaded', count: 120 },
      { id: 'matched', count: 78 },
      { id: 'contacted', count: 34 },
      { id: 'interviewing', count: 12 },
      { id: 'offer', count: 3 },
    ],
  }
})


