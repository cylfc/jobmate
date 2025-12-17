export default defineEventHandler(async () => {
  // UI-only mock data (replace with real logic later)
  // Keep this response stable; UI normalizes and computes flags in the composable.
  return {
    jobs: [
      {
        id: 'job-1',
        title: 'Senior Frontend Developer',
        status: 'published',
        candidatesCount: 32,
        topMatchScore: 92,
        lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
        lastMatchingRunAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
      },
      {
        id: 'job-2',
        title: 'Full Stack Developer',
        status: 'published',
        candidatesCount: 18,
        topMatchScore: 84,
        lastActivityAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
        lastMatchingRunAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2d ago
      },
      {
        id: 'job-3',
        title: 'Backend Developer',
        status: 'published',
        candidatesCount: 0,
        topMatchScore: null,
        lastActivityAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3d ago
        lastMatchingRunAt: null, // never ran
      },
      {
        id: 'job-4',
        title: 'Product Designer',
        status: 'draft',
        candidatesCount: 0,
        topMatchScore: null,
        lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5d ago
        lastMatchingRunAt: null,
      },
    ],
  }
})


