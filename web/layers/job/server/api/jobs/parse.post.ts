/**
 * Parse Job from Text API
 * Server API route for parsing job information from text input using AI
 */
import type { Job, CreateJobInput } from '@job/types/job'
import type { ApiResponse } from '../../../../../../types/api-response'

export default defineEventHandler(async (event): Promise<ApiResponse<Job>> => {
  const body = await readBody<{ text: string; link?: string }>(event)
  
  if (!body.text || body.text.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job text is required',
    })
  }

  // Parse job from text
  const parsed = parseJobFromText(body.text, body.link)
  
  const job: Job = {
    id: `job-${Date.now()}`,
    ...parsed,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // TODO: Implement AI extraction logic
  // For now, use basic parsing

  // Return in standard format
  return {
    data: job,
    meta: undefined,
    status: 200,
  } as ApiResponse<Job>
})

/**
 * Parse job information from text
 * Extracts title, company, location, requirements, and other basic info
 */
function parseJobFromText(text: string, link?: string): CreateJobInput {
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  const firstLine = lines[0] || ''
  
  // Extract title (usually first line or after "Title:", "Position:", etc.)
  let title = firstLine
  const titleMatch = text.match(/(?:title|position|job title|vị trí):\s*(.+)/i)
  if (titleMatch) {
    title = titleMatch[1].trim()
  }

  // Extract company
  let company = ''
  const companyMatch = text.match(/(?:company|công ty|employer):\s*(.+)/i)
  if (companyMatch) {
    company = companyMatch[1].trim()
  }

  // Extract location
  let location = ''
  const locationMatch = text.match(/(?:location|địa điểm|address):\s*(.+)/i)
  if (locationMatch) {
    location = locationMatch[1].trim()
  }

  // Extract requirements (look for "Requirements:", "Skills:", etc.)
  const requirements: string[] = []
  const requirementsMatch = text.match(/(?:requirements|yêu cầu|skills|kỹ năng):\s*([\s\S]+?)(?:\n\n|\n[A-Z]|$)/i)
  if (requirementsMatch) {
    const reqText = requirementsMatch[1]
    requirements.push(...reqText.split(/[,\n•-]/).map(r => r.trim()).filter(r => r.length > 0))
  }

  // Extract salary
  let salary: { min: number; max: number; currency: string } | undefined
  const salaryMatch = text.match(/(?:salary|lương):\s*(\d+)\s*-\s*(\d+)\s*(\w+)/i)
  if (salaryMatch) {
    salary = {
      min: parseInt(salaryMatch[1], 10),
      max: parseInt(salaryMatch[2], 10),
      currency: salaryMatch[3] || 'USD',
    }
  }

  // Extract description (everything else or after "Description:")
  let description = text
  const descMatch = text.match(/(?:description|mô tả):\s*([\s\S]+)/i)
  if (descMatch) {
    description = descMatch[1].trim()
  }

  return {
    title: title || 'Job Title',
    description: description || text,
    company: company || 'Company',
    location: location || 'Location',
    requirements: requirements.length > 0 ? requirements : [],
    salary,
    link,
  }
}

