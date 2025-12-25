export default defineEventHandler(async () => {
  // UI-only mock data (replace with real logic later)
  return {
    alerts: [
      {
        id: 'jobs-without-matching',
        type: 'jobs_without_matching',
        message: '2 jobs have never run matching. Run matching to get initial recommendations.',
        actionUrl: '/dashboard#active-jobs',
        severity: 'critical',
      },
      {
        id: 'cvs-waiting-parse',
        type: 'cvs_waiting_parse',
        message: '5 CVs are waiting to be parsed. Parse now to keep the pipeline fresh.',
        actionUrl: '/candidates?filter=unparsed',
        severity: 'warning',
      },
      {
        id: 'candidates-awaiting-response',
        type: 'candidates_awaiting_response',
        message: '3 candidates are awaiting a response. Reply to maintain engagement.',
        actionUrl: '/chat?tab=needs-reply',
        severity: 'warning',
      },
      {
        id: 'ai-recommend-rerun',
        type: 'ai_recommendation_rerun_matching',
        message: 'AI recommends rerunning matching for 1 job after recent profile updates.',
        actionUrl: '/matching',
        severity: 'info',
      },
    ],
  }
})

