export default defineEventHandler(async () => {
  // Backend-aggregated activity feed (mocked for UI; replace with real source).
  // Keep it pagination-ready: return events + cursor signals.

  const now = Date.now()
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString()

  return {
    events: [
      {
        id: 'act-1',
        type: 'matching_completed',
        occurredAt: iso(5 * 60 * 1000),
        meta: { jobTitle: 'Senior Frontend Developer', candidates: 5 },
      },
      {
        id: 'act-2',
        type: 'cv_uploaded',
        occurredAt: iso(55 * 60 * 1000),
        meta: { candidateName: 'Nguyễn Văn A' },
      },
      {
        id: 'act-3',
        type: 'interview_scheduled',
        occurredAt: iso(3 * 60 * 60 * 1000),
        meta: { candidateName: 'Trần Thị B', jobTitle: 'Full Stack Developer' },
      },
      {
        id: 'act-4',
        type: 'job_saved',
        occurredAt: iso(26 * 60 * 60 * 1000), // yesterday-ish
        meta: { jobTitle: 'Backend Developer' },
      },
      {
        id: 'act-5',
        type: 'cv_uploaded',
        occurredAt: iso(28 * 60 * 60 * 1000),
        meta: { candidateName: 'Lê Văn C' },
      },
    ].slice(0, 20),
    nextCursor: null,
    hasMore: false,
  }
})

