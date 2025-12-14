<template>
  <footer class="border-t border-gray-200 bg-gray-50">
    <UContainer>
      <div class="py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-lucide-briefcase" class="w-6 h-6 text-primary-600" />
              <span class="text-lg font-bold text-gray-900">JobMate</span>
            </div>
            <p class="text-sm text-gray-600">
              {{ t('footer.tagline') }}
            </p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ t('footer.products') }}</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/jobs" class="text-sm text-gray-600 hover:text-primary-600">
                  {{ t('nav.jobs') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/candidates" class="text-sm text-gray-600 hover:text-primary-600">
                  {{ t('nav.candidates') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/matching" class="text-sm text-gray-600 hover:text-primary-600">
                  {{ t('nav.matching') }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ t('footer.company') }}</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  {{ t('footer.about-us') }}
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  {{ t('footer.blog') }}
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  {{ t('footer.contact') }}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ t('footer.support') }}</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  {{ t('footer.help-center') }}
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  {{ t('footer.terms') }}
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  {{ t('footer.privacy-policy') }}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-600 text-center">
            © {{ new Date().getFullYear() }} JobMate. {{ t('common.all-rights-reserved') }}.
          </p>
        </div>
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

