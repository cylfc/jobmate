import type { JobStatus } from '@dashboard/types/dashboard'

export interface ActiveJobsApiItem {
  id: string
  title: string
  status: JobStatus
  candidatesCount: number
  topMatchScore: number | null
  lastActivityAt: string // ISO string
  lastMatchingRunAt: string | null // ISO string
}

export interface ActiveJobsApiResponse {
  jobs: ActiveJobsApiItem[]
}

export interface ActiveJob {
  id: string
  title: string
  status: JobStatus
  candidatesCount: number
  topMatchScore: number | null
  lastActivityAt: string
  lastMatchingRunAt: string | null
}

const ACTIVE_JOBS_ASYNC_KEY = 'dashboard:active-jobs'

const toEpoch = (iso: string | null | undefined) => {
  if (!iso) return 0
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? ms : 0
}

export function hasRunMatching(job: Pick<ActiveJob, 'lastMatchingRunAt' | 'topMatchScore'>) {
  // Prefer explicit signal, fallback to any computed score.
  return Boolean(job.lastMatchingRunAt) || job.topMatchScore !== null
}

export function needsAttention(job: Pick<ActiveJob, 'status' | 'lastMatchingRunAt' | 'topMatchScore'>) {
  // Keep it deliberately minimal and deterministic: attention needed when a published job has never run matching.
  return job.status === 'published' && !hasRunMatching(job)
}

export function useActiveJobs() {
  const { data, pending, error, refresh } = useAsyncData<ActiveJobsApiResponse>(
    ACTIVE_JOBS_ASYNC_KEY,
    () => $fetch('/api/dashboard/active-jobs'),
    {
      // prepare for caching later
      dedupe: 'defer',
    }
  )

  const jobs = computed<ActiveJob[]>(() => {
    const raw = data.value?.jobs ?? []
    return raw
      .map((j) => ({
        id: String(j.id),
        title: String(j.title ?? ''),
        status: j.status,
        candidatesCount: Number.isFinite(Number(j.candidatesCount)) ? Number(j.candidatesCount) : 0,
        topMatchScore:
          j.topMatchScore === null || j.topMatchScore === undefined
            ? null
            : Number.isFinite(Number(j.topMatchScore))
              ? Number(j.topMatchScore)
              : null,
        lastActivityAt: String(j.lastActivityAt ?? ''),
        lastMatchingRunAt: j.lastMatchingRunAt ?? null,
      }))
      .sort((a, b) => toEpoch(b.lastActivityAt) - toEpoch(a.lastActivityAt))
  })

  return {
    data,
    pending,
    error,
    refresh,
    jobs,
    hasRunMatching,
    needsAttention,
  }
}




