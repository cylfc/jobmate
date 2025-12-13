/**
 * Matching Types
 * TypeScript types for matching layer
 */
export interface Matching {
  id: string
  candidateId: string
  jobId: string
  score: number
  status: MatchingStatus
  createdAt: Date
  updatedAt: Date
}

export type MatchingStatus = 'pending' | 'accepted' | 'rejected'

export interface CreateMatchingInput {
  candidateId: string
  jobId: string
}

