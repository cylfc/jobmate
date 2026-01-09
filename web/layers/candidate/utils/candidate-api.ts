/**
 * Candidate API Utilities
 * API utility functions for candidate-related operations
 * Stateless functions - no reactive state
 */
import type {
  Candidate,
  CreateCandidateInput,
  CandidateFilter,
  EducationEntry,
  SkillEntry,
  WorkExperienceEntry,
  ProjectEntry,
} from '@candidate/types/candidate'
import type { ApiResponse } from '../../../../types/api-response'
import { logError } from '@shared/logging'

export const useCandidate = () => {
  const { $api } = useNuxtApp()

  const getCandidates = async (filters?: CandidateFilter) => {
    try {
      const response = await $api<ApiResponse<Candidate[]>>('/api/candidates', {
        method: 'GET',
        query: filters,
      })
      return response.data || []
    } catch (error) {
      logError('Error fetching candidates', error, 'candidate-api')
      return []
    }
  }

  const getCandidateById = async (id: string): Promise<Candidate | null> => {
    try {
      const response = await $api<ApiResponse<Candidate>>(`/api/candidates/${id}`, {
        method: 'GET',
      })
      return response.data || null
    } catch (error) {
      logError('Error fetching candidate', error, 'candidate-api')
      return null
    }
  }

  const createCandidate = async (input: CreateCandidateInput) => {
    try {
      const response = await $api<ApiResponse<Candidate>>('/api/candidates', {
        method: 'POST',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error creating candidate', error, 'candidate-api')
      throw error
    }
  }

  const updateCandidate = async (id: string, input: Partial<CreateCandidateInput> & { status?: Candidate['status'] }) => {
    try {
      const response = await $api<ApiResponse<Candidate>>(`/api/candidates/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error updating candidate', error, 'candidate-api')
      throw error
    }
  }

  const deleteCandidate = async (id: string) => {
    try {
      await $api(`/api/candidates/${id}`, {
        method: 'DELETE',
      })
      return true
    } catch (error) {
      logError('Error deleting candidate', error, 'candidate-api')
      throw error
    }
  }

  const inviteCandidate = async (id: string) => {
    try {
      await $fetch(`/api/candidates/${id}/invite`, {
        method: 'POST',
      })
      return true
    } catch (error) {
      logError('Error inviting candidate', error, 'candidate-api')
      throw error
    }
  }

  /**
   * Parse candidate from text input using AI
   * Uses $fetch for client-side API call
   */
  const parseCandidateFromText = async (text: string): Promise<Candidate | null> => {
    try {
      const response = await $api<ApiResponse<Candidate>>('/api/candidates/parse', {
        method: 'POST',
        body: { text },
      })
      return response.data
    } catch (error) {
      logError('Error parsing candidate from text', error, 'candidate-api')
      throw error
    }
  }

  /**
   * Get filter options for candidate filters
   */
  const getFilterOptions = async () => {
    try {
      const response = await $api<ApiResponse<import('@candidate/types/candidate').CandidateFilterOptions>>('/api/candidates/filter-options', {
        method: 'GET',
      })
      return response.data
    } catch (error) {
      logError('Error fetching filter options', error, 'candidate-api')
      throw error
    }
  }

  // ========== Education APIs ==========
  const getEducation = async (candidateId: string): Promise<EducationEntry[]> => {
    try {
      const response = await $api<ApiResponse<EducationEntry[]>>(`/api/candidates/${candidateId}/education`, {
        method: 'GET',
      })
      return response.data || []
    } catch (error) {
      logError('Error fetching education', error, 'candidate-api')
      throw error
    }
  }

  const createEducation = async (candidateId: string, input: Omit<EducationEntry, 'id'>): Promise<EducationEntry> => {
    try {
      const response = await $api<ApiResponse<EducationEntry>>(`/api/candidates/${candidateId}/education`, {
        method: 'POST',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error creating education', error, 'candidate-api')
      throw error
    }
  }

  const updateEducation = async (candidateId: string, id: string, input: Partial<EducationEntry>): Promise<EducationEntry> => {
    try {
      const response = await $api<ApiResponse<EducationEntry>>(`/api/candidates/${candidateId}/education/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error updating education', error, 'candidate-api')
      throw error
    }
  }

  const deleteEducation = async (candidateId: string, id: string): Promise<void> => {
    try {
      await $api(`/api/candidates/${candidateId}/education/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      logError('Error deleting education', error, 'candidate-api')
      throw error
    }
  }

  // ========== Skills APIs ==========
  const getSkills = async (candidateId: string): Promise<SkillEntry[]> => {
    try {
      const response = await $api<ApiResponse<SkillEntry[]>>(`/api/candidates/${candidateId}/skills`, {
        method: 'GET',
      })
      return response.data || []
    } catch (error) {
      logError('Error fetching skills', error, 'candidate-api')
      throw error
    }
  }

  const createSkill = async (candidateId: string, input: Omit<SkillEntry, 'id'>): Promise<SkillEntry> => {
    try {
      const response = await $api<ApiResponse<SkillEntry>>(`/api/candidates/${candidateId}/skills`, {
        method: 'POST',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error creating skill', error, 'candidate-api')
      throw error
    }
  }

  const updateSkill = async (candidateId: string, id: string, input: Partial<SkillEntry>): Promise<SkillEntry> => {
    try {
      const response = await $api<ApiResponse<SkillEntry>>(`/api/candidates/${candidateId}/skills/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error updating skill', error, 'candidate-api')
      throw error
    }
  }

  const deleteSkill = async (candidateId: string, id: string): Promise<void> => {
    try {
      await $api(`/api/candidates/${candidateId}/skills/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      logError('Error deleting skill', error, 'candidate-api')
      throw error
    }
  }

  // ========== Work Experience APIs ==========
  const getWorkExperience = async (candidateId: string): Promise<WorkExperienceEntry[]> => {
    try {
      const response = await $api<ApiResponse<WorkExperienceEntry[]>>(`/api/candidates/${candidateId}/work-experience`, {
        method: 'GET',
      })
      return response.data || []
    } catch (error) {
      logError('Error fetching work experience', error, 'candidate-api')
      throw error
    }
  }

  const createWorkExperience = async (candidateId: string, input: Omit<WorkExperienceEntry, 'id'>): Promise<WorkExperienceEntry> => {
    try {
      const response = await $api<ApiResponse<WorkExperienceEntry>>(`/api/candidates/${candidateId}/work-experience`, {
        method: 'POST',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error creating work experience', error, 'candidate-api')
      throw error
    }
  }

  const updateWorkExperience = async (candidateId: string, id: string, input: Partial<WorkExperienceEntry>): Promise<WorkExperienceEntry> => {
    try {
      const response = await $api<ApiResponse<WorkExperienceEntry>>(`/api/candidates/${candidateId}/work-experience/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error updating work experience', error, 'candidate-api')
      throw error
    }
  }

  const deleteWorkExperience = async (candidateId: string, id: string): Promise<void> => {
    try {
      await $api(`/api/candidates/${candidateId}/work-experience/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      logError('Error deleting work experience', error, 'candidate-api')
      throw error
    }
  }

  // ========== Projects APIs ==========
  const getProjects = async (candidateId: string): Promise<ProjectEntry[]> => {
    try {
      const response = await $api<ApiResponse<ProjectEntry[]>>(`/api/candidates/${candidateId}/projects`, {
        method: 'GET',
      })
      return response.data || []
    } catch (error) {
      logError('Error fetching projects', error, 'candidate-api')
      throw error
    }
  }

  const createProject = async (candidateId: string, input: Omit<ProjectEntry, 'id'>): Promise<ProjectEntry> => {
    try {
      const response = await $api<ApiResponse<ProjectEntry>>(`/api/candidates/${candidateId}/projects`, {
        method: 'POST',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error creating project', error, 'candidate-api')
      throw error
    }
  }

  const updateProject = async (candidateId: string, id: string, input: Partial<ProjectEntry>): Promise<ProjectEntry> => {
    try {
      const response = await $api<ApiResponse<ProjectEntry>>(`/api/candidates/${candidateId}/projects/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error updating project', error, 'candidate-api')
      throw error
    }
  }

  const deleteProject = async (candidateId: string, id: string): Promise<void> => {
    try {
      await $api(`/api/candidates/${candidateId}/projects/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      logError('Error deleting project', error, 'candidate-api')
      throw error
    }
  }

  return {
    getCandidates,
    getCandidateById,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    inviteCandidate,
    parseCandidateFromText,
    getFilterOptions,
    // Education
    getEducation,
    createEducation,
    updateEducation,
    deleteEducation,
    // Skills
    getSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    // Work Experience
    getWorkExperience,
    createWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    // Projects
    getProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}

