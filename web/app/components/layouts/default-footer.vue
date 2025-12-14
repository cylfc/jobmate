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
              Nền tảng tuyển dụng thông minh với AI
            </p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Sản phẩm</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/jobs" class="text-sm text-gray-600 hover:text-primary-600">
                  Việc làm
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/candidates" class="text-sm text-gray-600 hover:text-primary-600">
                  Ứng viên
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/matching" class="text-sm text-gray-600 hover:text-primary-600">
                  Matching
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Công ty</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Hỗ trợ</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  Điều khoản
                </a>
              </li>
              <li>
                <a href="#" class="text-sm text-gray-600 hover:text-primary-600">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-600 text-center">
            © {{ new Date().getFullYear() }} JobMate. All rights reserved.
          </p>
        </div>
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
// Default footer for landing page
</script>

