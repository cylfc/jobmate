<template>
  <header class="border-b border-default bg-default">
    <UContainer>
      <div class="flex items-center justify-between h-16">
        <TheLogo to="/" />
        <div class="flex items-center gap-4">
          <UButton
            v-if="!isLoginPage"
            to="/auth/login"
            color="neutral"
            variant="ghost"
            size="sm"
          >
            {{ t("auth.login") }}
          </UButton>
          <UButton
            v-if="!isRegisterPage"
            to="/auth/register"
            color="primary"
            size="sm"
          >
            {{ t("auth.register") }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();

const isLoginPage = computed(() => route.path === "/auth/login");
const isRegisterPage = computed(() => route.path === "/auth/register");
</script>
