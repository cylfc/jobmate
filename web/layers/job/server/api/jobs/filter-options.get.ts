/**
 * Get Job Filter Options API
 * Returns available options for job filters
 */
import type { JobFilterOptions, FilterOption } from '@job/types/job'

export default defineEventHandler(async (event): Promise<{ options: JobFilterOptions }> => {
  // Mock data - will be replaced with database query in production
  const statusOptions: FilterOption[] = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Closed', value: 'closed' },
  ]

  // Mock companies options - in production, this would come from database
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
    { label: 'Uber', value: 'uber' },
    { label: 'LinkedIn', value: 'linkedin' },
  ]

  // Mock locations options - in production, this would come from database
  const locationsOptions: FilterOption[] = [
    { label: 'Ho Chi Minh City', value: 'ho-chi-minh-city' },
    { label: 'Hanoi', value: 'hanoi' },
    { label: 'Da Nang', value: 'da-nang' },
    { label: 'Can Tho', value: 'can-tho' },
    { label: 'Hai Phong', value: 'hai-phong' },
    { label: 'Remote', value: 'remote' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Singapore', value: 'singapore' },
    { label: 'Bangkok', value: 'bangkok' },
    { label: 'Jakarta', value: 'jakarta' },
  ]

  const options: JobFilterOptions = {
    status: statusOptions,
    companies: companiesOptions,
    locations: locationsOptions,
  }

  return { options }
})

