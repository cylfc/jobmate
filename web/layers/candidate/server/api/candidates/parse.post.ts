/**
 * Parse Candidate from Text API
 * Server API route for parsing candidate information from text input using AI
 * 
 * Note: Backend does not have a dedicated AI parsing endpoint yet.
 * This endpoint uses basic text parsing. Future implementation could:
 * - Call AI service (OpenAI, Claude, etc.) for better extraction
 * - Use NLP libraries for structured data extraction
 * - Integrate with backend AI service when available
 */
import type { Candidate, CreateCandidateInput } from '@candidate/types/candidate'
import type { ApiResponse } from '../../../../../../types/api-response'

export default defineEventHandler(async (event): Promise<ApiResponse<Candidate>> => {
  try {
    const body = await readBody<{ text: string }>(event)
    
    if (!body.text || body.text.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Candidate text is required',
      })
    }

    // Parse candidate from text using basic parsing
    // TODO: Replace with AI-powered extraction when backend endpoint is available
    const parsed = parseCandidateFromText(body.text)
    
    const candidate: Candidate = {
      id: `candidate-${Date.now()}`,
      ...parsed,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Return in standard format
    return {
      data: candidate,
      meta: undefined,
      status: 200,
    } as ApiResponse<Candidate>
  } catch (error) {
    // Handle errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to parse candidate from text',
    })
  }
})

/**
 * Parse candidate information from text
 * Extracts name, email, phone, and other basic info
 */
function parseCandidateFromText(text: string): CreateCandidateInput {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  const firstLine = lines[0] || ''
  const nameParts = firstLine.split(/\s+/).filter(p => p.length > 0)
  
  // Extract skills (look for common patterns)
  const skills: string[] = []
  const skillKeywords = ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes']
  skillKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      skills.push(keyword)
    }
  })
  
  // Extract experience (look for patterns like "5 years", "3+ years")
  const experienceMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?|year|yr)\s*(?:of\s*)?experience/i)
  const experience = experienceMatch ? parseInt(experienceMatch[1], 10) : 0

  return {
    firstName: nameParts[0] || 'Candidate',
    lastName: nameParts.slice(1).join(' ') || '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : undefined,
    skills,
    experience,
  }
}

