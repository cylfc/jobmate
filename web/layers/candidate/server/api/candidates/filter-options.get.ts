/**
 * Get Candidate Filter Options API
 * Returns available options for candidate filters
 */
import type { CandidateFilterOptions, FilterOption } from '@candidate/types/candidate'

export default defineEventHandler(async (event): Promise<{ options: CandidateFilterOptions }> => {
  // Mock data - will be replaced with database query in production
  const statusOptions: FilterOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Archived', value: 'archived' },
  ]

  // Mock experience range based on typical candidate data
  // In production, this would be calculated from actual candidate data
  const experienceRange = {
    min: 0,
    max: 30,
    step: 1,
  }

  // Mock skills options - in production, this would come from database
  const skillsOptions: FilterOption[] = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'React', value: 'react' },
    { label: 'Vue.js', value: 'vue' },
    { label: 'Node.js', value: 'nodejs' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'C#', value: 'csharp' },
    { label: 'Go', value: 'go' },
    { label: 'Rust', value: 'rust' },
    { label: 'PHP', value: 'php' },
    { label: 'Ruby', value: 'ruby' },
    { label: 'SQL', value: 'sql' },
    { label: 'MongoDB', value: 'mongodb' },
    { label: 'PostgreSQL', value: 'postgresql' },
    { label: 'AWS', value: 'aws' },
    { label: 'Docker', value: 'docker' },
    { label: 'Kubernetes', value: 'kubernetes' },
    { label: 'Git', value: 'git' },
    { label: 'CI/CD', value: 'cicd' },
  ]

  // Mock company options - in production, this would come from database
  const companiesOptions: FilterOption[] = [
    { label: 'Google', value: 'google' },
    { label: 'Microsoft', value: 'microsoft' },
    { label: 'Amazon', value: 'amazon' },
    { label: 'Apple', value: 'apple' },
    { label: 'Meta', value: 'meta' },
    { label: 'Netflix', value: 'netflix' },
    { label: 'Tesla', value: 'tesla' },
    { label: 'Shopify', value: 'shopify' },
    { label: 'Stripe', value: 'stripe' },
    { label: 'Airbnb', value: 'airbnb' },
  ]

  const options: CandidateFilterOptions = {
    status: statusOptions,
    experienceRange,
    skills: skillsOptions,
    companies: companiesOptions,
  }

  return { options }
})

