---
alwaysApply: true
---
# Vue/Nuxt State Management Rules

You are an expert Vue 3 and Nuxt 3 developer. Follow these state management rules strictly.

## Core Principle

This project uses a 4-layer state management strategy:
1. Pinia (Global application state)
2. createSharedComposable (Module-scoped state)
3. Query params / Provide-Inject (Page-scoped state)
4. ref/reactive (Component-local state)

## Layer 1: Pinia Stores (Global State)

Use Pinia ONLY for truly global state: authentication, user profile, app configuration, theme, locale, feature flags, permissions.

Location: `/stores/`
Naming: `use[Domain]Store`

When creating Pinia stores:
- Use TypeScript with proper types
- Include loading and error states for async operations
- Use getters for derived state
- Keep stores focused and single-responsibility
- Never duplicate this data in other layers

Example:
```typescript
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    loading: false,
    error: null as string | null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name || 'Guest'
  },
  
  actions: {
    async login(credentials: LoginCredentials) {
      this.loading = true
      this.error = null
      try {
        const data = await $fetch('/api/auth/login', {
          method: 'POST',
          body: credentials
        })
        this.user = data.user
        this.token = data.token
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
```

## Layer 2: Shared Composables (Module State)

Use createSharedComposable from @vueuse/core for state shared across components within a feature module.

Location: `/modules/[module-name]/composables/`
Naming: `use[Feature][Action]`

When creating shared composables:
- ALWAYS wrap with createSharedComposable
- Use readonly() for state that shouldn't be mutated externally
- Include loading, error, and data states
- Provide reset/cleanup functions
- Can reference Pinia stores for global context, but don't duplicate their data

Example:
```typescript
import { createSharedComposable } from '@vueuse/core'

const _useProductList = () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref({
    search: '',
    category: null
  })
  
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch('/api/products', {
        query: filters.value
      })
      products.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }
  
  const resetFilters = () => {
    filters.value = { search: '', category: null }
  }
  
  onMounted(() => {
    fetchProducts()
  })
  
  return {
    products: readonly(products),
    loading: readonly(loading),
    error: readonly(error),
    filters,
    fetchProducts,
    resetFilters
  }
}

export const useProductList = createSharedComposable(_useProductList)
```

## Layer 3: Page-Scoped State

### Option A: Query Parameters (for shareable state)

Use for: filters, pagination, tabs, sorting, search - anything that should be shareable via URL.

Always use useRoute() and useRouter() from Nuxt.

Example:
```typescript
const route = useRoute()
const router = useRouter()

const currentPage = computed(() => Number(route.query.page) || 1)
const searchQuery = computed(() => route.query.search as string || '')

const updatePage = (page: number) => {
  router.push({ query: { ...route.query, page } })
}

const updateSearch = (search: string) => {
  router.push({ query: { ...route.query, search, page: 1 } })
}
```

### Option B: Provide/Inject (for page tree context)

Use for: context shared between parent page and deeply nested child components to avoid prop drilling.

Always define TypeScript interfaces for the context.

Example:
```typescript
// Parent page
interface PageContext {
  selectedDate: Ref<Date>
  filters: Ref<Filters>
  updateFilters: (filters: Filters) => void
}

const selectedDate = ref(new Date())
const filters = ref<Filters>({})

const updateFilters = (newFilters: Filters) => {
  filters.value = newFilters
}

const context: PageContext = {
  selectedDate,
  filters,
  updateFilters
}

provide('pageContext', context)

// Child component
const context = inject<PageContext>('pageContext')
if (!context) throw new Error('Page context not provided')
```

For better type safety, use injection keys:
```typescript
// types/injection-keys.ts
import type { InjectionKey } from 'vue'

export const PageContextKey = Symbol() as InjectionKey<PageContext>

// Use: provide(PageContextKey, context) and inject(PageContextKey)
```

## Layer 4: Component Local State

Use ref/reactive for state that only exists within a single component: UI state, form data, local computations.

Use ref() for primitives and reactive() for objects.

Example:
```typescript
const isModalOpen = ref(false)
const isLoading = ref(false)

const form = reactive({
  name: '',
  email: '',
  message: ''
})

const errors = ref<Record<string, string>>({})

const isValid = computed(() => {
  return form.name && form.email.includes('@')
})

const handleSubmit = async () => {
  isLoading.value = true
  try {
    await $fetch('/api/submit', { method: 'POST', body: form })
    isModalOpen.value = false
  } catch (e) {
    errors.value.submit = e.message
  } finally {
    isLoading.value = false
  }
}
```

## Decision Tree

Before creating any state, ask:

1. Is it used across the entire app (auth, theme, config)? → Use Pinia
2. Is it shared across components in one feature module? → Use createSharedComposable
3. Is it shared within a page tree?
   - Should it be in URL? → Use query params
   - Deep nesting without URL? → Use provide/inject
4. Is it only used in one component? → Use ref/reactive

## Critical Rules

❌ NEVER duplicate state across layers
❌ NEVER use Pinia for module-specific data
❌ NEVER use shared composables for component-local UI state
❌ NEVER prop drill more than 2 levels (use provide/inject)
❌ NEVER forget readonly() on shared composable state that shouldn't be mutated
❌ NEVER create shared composables without wrapping in createSharedComposable
❌ NEVER use localStorage or sessionStorage in artifacts (use in-memory state only)

✅ ALWAYS use TypeScript with proper types
✅ ALWAYS include loading/error states for async operations
✅ ALWAYS provide cleanup functions where needed
✅ ALWAYS use readonly() to protect internal state in shared composables
✅ ALWAYS document injection keys and contexts
✅ ALWAYS follow the decision tree

## File Structure

```
stores/
├── auth.ts              # Global: useAuthStore
├── app.ts               # Global: useAppStore
└── user.ts              # Global: useUserStore

modules/
└── products/
    ├── composables/
    │   ├── useProductList.ts      # Shared in module
    │   ├── useProductDetail.ts    # Shared in module
    │   └── useProductCart.ts      # Shared in module
    ├── components/
    ├── pages/
    └── types.ts

composables/
├── useApi.ts           # Global utility (stateless)
└── useNotification.ts  # Global utility (may have state)

pages/
└── products/
    └── index.vue       # Uses query params, provide/inject
```

## Common Patterns

### Accessing global state in module composables:
```typescript
const _useProductModule = () => {
  const authStore = useAuthStore() // Reference, don't duplicate
  // Use authStore.user, authStore.permissions, etc.
}
```

### Resetting module state:
```typescript
export const useProductList = createSharedComposable(() => {
  const products = ref([])
  
  const reset = () => {
    products.value = []
  }
  
  // Reset on unmount
  onUnmounted(() => {
    reset()
  })
  
  return { products: readonly(products), reset }
})
```

### Page context with TypeScript:
```typescript
interface DashboardContext {
  dateRange: Ref<{ start: Date; end: Date }>
  updateDateRange: (range: { start: Date; end: Date }) => void
}

const DashboardKey = Symbol() as InjectionKey<DashboardContext>

// Provide
provide(DashboardKey, dashboardContext)

// Inject
const dashboard = inject(DashboardKey)
if (!dashboard) throw new Error('Dashboard context missing')
```

## Testing Guidance

Test Pinia stores:
```typescript
import { setActivePinia, createPinia } from 'pinia'
beforeEach(() => setActivePinia(createPinia()))
```

Test shared composables:
```typescript
// Mock dependencies
vi.mock('#app', () => ({ $fetch: vi.fn() }))
```

Test components with provide/inject:
```typescript
const wrapper = mount(Component, {
  global: {
    provide: {
      [PageContextKey]: mockContext
    }
  }
})
```

When writing tests, respect the same layer boundaries.

## Code Review Checklist

Before approving code, verify:
- [ ] State is in the correct layer per decision tree
- [ ] No state duplication across layers
- [ ] TypeScript types are properly defined
- [ ] Loading/error states included for async operations
- [ ] readonly() used appropriately in shared composables
- [ ] createSharedComposable used for module state
- [ ] Provide/inject has proper TypeScript interfaces
- [ ] No prop drilling (use provide/inject if needed)
- [ ] Naming conventions followed
- [ ] Cleanup/reset functions provided where needed

## When in Doubt

Choose the most local scope possible. It's easier to promote state to a higher layer later than to refactor distributed global state.

If a component needs state from a parent, prefer this order:
1. Props (if 1-2 levels)
2. Provide/inject (if 3+ levels)
3. Shared composable (if multiple unrelated components need it)
4. Pinia (only if truly global)

Always add a comment explaining your choice if it's not obvious.