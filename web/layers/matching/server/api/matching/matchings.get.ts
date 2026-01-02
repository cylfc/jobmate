/**
 * Get Matchings API
 * Server API route for fetching matchings
 */
import type { Matching } from '@matching/types/matching'
import type { ApiResponse } from '../../../../../../types/api-response'

export default defineEventHandler(async (event): Promise<ApiResponse<(Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]>> => {
  // TODO: Implement get matchings logic from database
  // For now, return sample data for testing
  const sampleMatchings: (Matching & { candidateName: string; candidateEmail?: string; candidatePhone?: string })[] = [
    {
      id: 'matching-1',
      candidateId: 'candidate-1',
      jobId: 'job-1',
      score: 95,
      status: 'pending',
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@example.com',
      candidatePhone: '+1 (555) 123-4567',
      analysis: {
        strengths: ['Excellent technical skills', '5+ years of relevant experience', 'Strong problem-solving abilities'],
        weaknesses: ['Limited experience with cloud technologies'],
        recommendations: ['Highly recommended for interview', 'Consider for senior position'],
        detailedScore: {
          skills: 98,
          experience: 92,
          education: 90,
          cultural: 95,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'matching-2',
      candidateId: 'candidate-2',
      jobId: 'job-1',
      score: 87,
      status: 'pending',
      candidateName: 'Jane Smith',
      candidateEmail: 'jane.smith@example.com',
      candidatePhone: '+1 (555) 234-5678',
      analysis: {
        strengths: ['Strong communication skills', 'Relevant industry experience'],
        weaknesses: ['Less experience with modern frameworks'],
        recommendations: ['Good fit for mid-level position'],
        detailedScore: {
          skills: 85,
          experience: 88,
          education: 90,
          cultural: 88,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'matching-3',
      candidateId: 'candidate-3',
      jobId: 'job-1',
      score: 78,
      status: 'pending',
      candidateName: 'Bob Johnson',
      candidateEmail: 'bob.johnson@example.com',
      candidatePhone: '+1 (555) 345-6789',
      analysis: {
        strengths: ['Solid foundation', 'Eager to learn'],
        weaknesses: ['Limited professional experience', 'Needs more training'],
        recommendations: ['Consider for junior position', 'Good potential'],
        detailedScore: {
          skills: 75,
          experience: 70,
          education: 85,
          cultural: 82,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'matching-4',
      candidateId: 'candidate-4',
      jobId: 'job-1',
      score: 82,
      status: 'accepted',
      candidateName: 'Alice Williams',
      candidateEmail: 'alice.williams@example.com',
      candidatePhone: '+1 (555) 456-7890',
      analysis: {
        strengths: ['Strong analytical skills', 'Good team player'],
        weaknesses: ['Needs improvement in leadership'],
        recommendations: ['Suitable for team member role'],
        detailedScore: {
          skills: 80,
          experience: 85,
          education: 88,
          cultural: 75,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'matching-5',
      candidateId: 'candidate-5',
      jobId: 'job-1',
      score: 91,
      status: 'pending',
      candidateName: 'Charlie Brown',
      candidateEmail: 'charlie.brown@example.com',
      candidatePhone: '+1 (555) 567-8901',
      analysis: {
        strengths: ['Expert-level skills', 'Proven track record', 'Leadership experience'],
        weaknesses: ['May be overqualified'],
        recommendations: ['Excellent candidate', 'Consider for lead position'],
        detailedScore: {
          skills: 95,
          experience: 92,
          education: 88,
          cultural: 90,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // Return in standard format
  return {
    data: sampleMatchings,
    meta: undefined,
    status: 200,
  } as ApiResponse<(Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]>
})

