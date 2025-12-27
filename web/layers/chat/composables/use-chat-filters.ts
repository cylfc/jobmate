/**
 * Use Chat Filters Composable
 * Manages chat filters via URL query parameters
 * Layer 3: Query params for shareable state
 */
import type { ChatFeature } from '@chat/types/chat'

const allowedFeatures: ChatFeature[] = ['matching', 'create-candidate', 'create-job', 'create-company', 'general']

export const useChatFilters = () => {
  const route = useRoute()
  const router = useRouter()

  const selectedPurpose = computed<ChatFeature>(() => {
    const fromQuery = route.query.purpose
    if (typeof fromQuery === 'string') {
      if (allowedFeatures.includes(fromQuery as ChatFeature)) {
        return fromQuery as ChatFeature
      }
    }
    return 'matching' // default
  })

  const updatePurpose = (purpose: ChatFeature) => {
    router.push({ query: { ...route.query, purpose } })
  }

  const resetPurpose = () => {
    const { purpose: _, ...rest } = route.query
    router.push({ query: rest })
  }

  return {
    selectedPurpose,
    updatePurpose,
    resetPurpose,
  }
}

