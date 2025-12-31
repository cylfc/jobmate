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

export const useCandidate = () => {
  const { $api } = useNuxtApp()

  const getCandidates = async (filters?: CandidateFilter) => {
    try {
      const response = await $api<{ candidates: Candidate[] }>('/api/candidates', {
        method: 'GET',
        query: filters,
      })
      return response.candidates || []
    } catch (error) {
      console.error('Error fetching candidates:', error)
      return []
    }
  }

  const getCandidateById = async (id: string): Promise<Candidate | null> => {
    try {
      const response = await $api<{ candidate: Candidate }>(`/api/candidates/${id}`, {
        method: 'GET',
      })
      return response.candidate || null
    } catch (error) {
      console.error('Error fetching candidate:', error)
      return null
    }
  }

  const createCandidate = async (input: CreateCandidateInput) => {
    try {
      const response = await $api<{ candidate: Candidate }>('/api/candidates', {
        method: 'POST',
        body: input,
      })
      return response.candidate
    } catch (error) {
      console.error('Error creating candidate:', error)
      throw error
    }
  }

  const updateCandidate = async (id: string, input: Partial<CreateCandidateInput> & { status?: Candidate['status'] }) => {
    try {
      const response = await $api<{ candidate: Candidate }>(`/api/candidates/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response.candidate
    } catch (error) {
      console.error('Error updating candidate:', error)
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
      console.error('Error deleting candidate:', error)
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
      console.error('Error inviting candidate:', error)
      throw error
    }
  }

  /**
   * Parse candidate from text input using AI
   * Uses $fetch for client-side API call
   */
  const parseCandidateFromText = async (text: string): Promise<Candidate | null> => {
    try {
      const { candidate } = await $api<{ candidate: Candidate }>('/api/candidates/parse', {
        method: 'POST',
        body: { text },
      })
      return candidate
    } catch (error) {
      console.error('Error parsing candidate from text:', error)
      throw error
    }
  }

  /**
   * Get filter options for candidate filters
   */
  const getFilterOptions = async () => {
    try {
      const response = await $api<{ options: import('@candidate/types/candidate').CandidateFilterOptions }>('/api/candidates/filter-options', {
        method: 'GET',
      })
      return response.options
    } catch (error) {
      console.error('Error fetching filter options:', error)
      throw error
    }
  }

  // ========== Education APIs ==========
  const getEducation = async (candidateId: string): Promise<EducationEntry[]> => {
    try {
      const response = await $api<EducationEntry[]>(`/api/candidates/${candidateId}/education`, {
        method: 'GET',
      })
      return response || []
    } catch (error) {
      console.error('Error fetching education:', error)
      throw error
    }
  }

  const createEducation = async (candidateId: string, input: Omit<EducationEntry, 'id'>): Promise<EducationEntry> => {
    try {
      const response = await $api<EducationEntry>(`/api/candidates/${candidateId}/education`, {
        method: 'POST',
        body: input,
      })
      return response
    } catch (error) {
      console.error('Error creating education:', error)
      throw error
    }
  }

  const updateEducation = async (candidateId: string, id: string, input: Partial<EducationEntry>): Promise<EducationEntry> => {
    try {
      const response = await $api<EducationEntry>(`/api/candidates/${candidateId}/education/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response
    } catch (error) {
      console.error('Error updating education:', error)
      throw error
    }
  }

  const deleteEducation = async (candidateId: string, id: string): Promise<void> => {
    try {
      await $api(`/api/candidates/${candidateId}/education/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error deleting education:', error)
      throw error
    }
  }

  // ========== Skills APIs ==========
  const getSkills = async (candidateId: string): Promise<SkillEntry[]> => {
    try {
      const response = await $api<SkillEntry[]>(`/api/candidates/${candidateId}/skills`, {
        method: 'GET',
      })
      return response || []
    } catch (error) {
      console.error('Error fetching skills:', error)
      throw error
    }
  }

  const createSkill = async (candidateId: string, input: Omit<SkillEntry, 'id'>): Promise<SkillEntry> => {
    try {
      const response = await $api<SkillEntry>(`/api/candidates/${candidateId}/skills`, {
        method: 'POST',
        body: input,
      })
      return response
    } catch (error) {
      console.error('Error creating skill:', error)
      throw error
    }
  }

  const updateSkill = async (candidateId: string, id: string, input: Partial<SkillEntry>): Promise<SkillEntry> => {
    try {
      const response = await $api<SkillEntry>(`/api/candidates/${candidateId}/skills/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response
    } catch (error) {
      console.error('Error updating skill:', error)
      throw error
    }
  }

  const deleteSkill = async (candidateId: string, id: string): Promise<void> => {
    try {
      await $api(`/api/candidates/${candidateId}/skills/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error deleting skill:', error)
      throw error
    }
  }

  // ========== Work Experience APIs ==========
  const getWorkExperience = async (candidateId: string): Promise<WorkExperienceEntry[]> => {
    try {
      const response = await $api<WorkExperienceEntry[]>(`/api/candidates/${candidateId}/work-experience`, {
        method: 'GET',
      })
      return response || []
    } catch (error) {
      console.error('Error fetching work experience:', error)
      throw error
    }
  }

  const createWorkExperience = async (candidateId: string, input: Omit<WorkExperienceEntry, 'id'>): Promise<WorkExperienceEntry> => {
    try {
      const response = await $api<WorkExperienceEntry>(`/api/candidates/${candidateId}/work-experience`, {
        method: 'POST',
        body: input,
      })
      return response
    } catch (error) {
      console.error('Error creating work experience:', error)
      throw error
    }
  }

  const updateWorkExperience = async (candidateId: string, id: string, input: Partial<WorkExperienceEntry>): Promise<WorkExperienceEntry> => {
    try {
      const response = await $api<WorkExperienceEntry>(`/api/candidates/${candidateId}/work-experience/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response
    } catch (error) {
      console.error('Error updating work experience:', error)
      throw error
    }
  }

  const deleteWorkExperience = async (candidateId: string, id: string): Promise<void> => {
    try {
      await $api(`/api/candidates/${candidateId}/work-experience/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error deleting work experience:', error)
      throw error
    }
  }

  // ========== Projects APIs ==========
  const getProjects = async (candidateId: string): Promise<ProjectEntry[]> => {
    try {
      const response = await $api<ProjectEntry[]>(`/api/candidates/${candidateId}/projects`, {
        method: 'GET',
      })
      return response || []
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  }

  const createProject = async (candidateId: string, input: Omit<ProjectEntry, 'id'>): Promise<ProjectEntry> => {
    try {
      const response = await $api<ProjectEntry>(`/api/candidates/${candidateId}/projects`, {
        method: 'POST',
        body: input,
      })
      return response
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  const updateProject = async (candidateId: string, id: string, input: Partial<ProjectEntry>): Promise<ProjectEntry> => {
    try {
      const response = await $api<ProjectEntry>(`/api/candidates/${candidateId}/projects/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  }

  const deleteProject = async (candidateId: string, id: string): Promise<void> => {
    try {
      await $api(`/api/candidates/${candidateId}/projects/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error deleting project:', error)
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

