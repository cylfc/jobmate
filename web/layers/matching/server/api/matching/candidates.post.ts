/**
 * Create/Parse Candidates from Text API
 * Server API route for creating or parsing candidates from text input
 */
import type { Candidate, CreateCandidateInput } from '@matching/types/matching'
import type { ApiResponse } from '../../../../../../types/api-response'

export default defineEventHandler(async (event): Promise<ApiResponse<Candidate[]>> => {
  const body = await readBody<{ text: string }>(event)
  
  if (!body.text || body.text.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Candidate text is required',
    })
  }

  // Parse multiple candidates from text (separated by double newlines)
  const candidateBlocks = body.text.split(/\n\s*\n/).filter(block => block.trim().length > 0)
  
  // If no double newlines, treat entire text as one candidate
  if (candidateBlocks.length === 0) {
    candidateBlocks.push(body.text)
  }

  const candidates: Candidate[] = candidateBlocks.map((block, index) => {
    const parsed = parseCandidateFromText(block)
    return {
      id: `candidate-${Date.now()}-${index}`,
      ...parsed,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })

  // TODO: Save to database
  // For now, just return the parsed candidates

  // Return in standard format
  return {
    data: candidates,
    meta: undefined,
    status: 200,
  } as ApiResponse<Candidate[]>
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

