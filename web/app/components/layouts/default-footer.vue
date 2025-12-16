<template>
  <footer class="border-t border-default bg-muted">
    <UContainer>
      <div class="py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-lucide-briefcase" class="w-6 h-6 text-primary" />
              <span class="text-lg font-bold text-default">JobMate</span>
            </div>
            <p class="text-sm text-muted">
              {{ t('footer.tagline') }}
            </p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-default mb-4">{{ t('footer.products') }}</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/jobs" class="text-sm text-muted hover:text-primary">
                  {{ t('nav.jobs') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/candidates" class="text-sm text-muted hover:text-primary">
                  {{ t('nav.candidates') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/matching" class="text-sm text-muted hover:text-primary">
                  {{ t('nav.matching') }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-default mb-4">{{ t('footer.company') }}</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-sm text-muted hover:text-primary">
                  {{ t('footer.about-us') }}
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-muted hover:text-primary">
                  {{ t('footer.blog') }}
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-muted hover:text-primary">
                  {{ t('footer.contact') }}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-default mb-4">{{ t('footer.support') }}</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-sm text-muted hover:text-primary">
                  {{ t('footer.help-center') }}
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-muted hover:text-primary">
                  {{ t('footer.terms') }}
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-muted hover:text-primary">
                  {{ t('footer.privacy-policy') }}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-default">
          <p class="text-sm text-muted text-center">
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

