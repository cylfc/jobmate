<!-- pages/example.vue -->
<script setup lang="ts">
  import { z } from 'zod'
  import { DependencyType } from '@shared/types/auto-form'
  import AutoForm from '@shared/components/AutoForm.vue'
  
  // 1. Basic Example
  const basicSchema = z.object({
    username: z
      .string()
      .min(2, 'Username must be at least 2 characters')
      .describe('Your username'),
    email: z
      .string()
      .email('Invalid email address')
      .describe('Email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    bio: z
      .string()
      .max(500)
      .optional()
      .describe('Tell us about yourself'),
    age: z
      .number()
      .min(18, 'Must be at least 18')
      .optional(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
      }),
  })
  
  const basicFieldConfig = {
    password: {
      label: 'Your secure password',
      inputProps: {
        type: 'password',
        placeholder: '••••••••',
      },
    },
    bio: {
      component: 'textarea' as const,
      placeholder: 'Write a short bio...',
    },
    acceptTerms: {
      label: 'I agree to the terms and conditions',
    },
  }
  
  const handleBasicSubmit = (values: z.infer<typeof basicSchema>) => {
    console.log('Form submitted:', values)
    alert(JSON.stringify(values, null, 2))
  }
  
  // 2. Enum/Select Example
  const roleSchema = z.object({
    role: z.enum(['user', 'admin', 'moderator']).describe('User Role'),
    status: z.enum(['active', 'inactive', 'pending']),
    department: z.enum(['engineering', 'design', 'marketing', 'sales']),
  })
  
  const roleFieldConfig = {
    status: {
      component: 'radio' as const,
    },
  }
  
  const handleRoleSubmit = (values: z.infer<typeof roleSchema>) => {
    console.log('Role form submitted:', values)
  }
  
  // 3. Object Example (Nested)
  const addressSchema = z.object({
    personalInfo: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
    }).describe('Personal Information'),
    address: z.object({
      street: z.string(),
      city: z.string(),
      zipCode: z.string().regex(/^\d{5}$/, 'Must be 5 digits'),
    }).describe('Address Details'),
  })
  
  const handleAddressSubmit = (values: z.infer<typeof addressSchema>) => {
    console.log('Address form submitted:', values)
  }
  
  // 4. Array Example
  const invitationSchema = z.object({
    eventName: z.string().min(3).describe('Event Name'),
    guests: z.array(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        plusOne: z.boolean().default(false),
      })
    ).default([
      { name: 'John Doe', email: 'john@example.com', plusOne: false }
    ]).describe('Guest List'),
  })
  
  const handleInvitationSubmit = (values: z.infer<typeof invitationSchema>) => {
    console.log('Invitation form submitted:', values)
  }
  
  // 5. Dependencies Example
  const surveySchema = z.object({
    age: z.number().min(1).max(120).describe('Your Age'),
    hasChildren: z.boolean().describe('Do you have children?'),
    numberOfChildren: z.number().min(1).optional(),
    subscribeNewsletter: z.boolean().describe('Subscribe to newsletter'),
    email: z.string().email().optional(),
  })
  
  const surveyDependencies = [
    {
      sourceField: 'hasChildren' as const,
      targetField: 'numberOfChildren' as const,
      type: DependencyType.HIDES,
      when: (hasChildren: boolean) => !hasChildren,
    },
    {
      sourceField: 'subscribeNewsletter' as const,
      targetField: 'email' as const,
      type: DependencyType.REQUIRES,
      when: (subscribe: boolean) => subscribe,
    },
  ]
  
  const handleSurveySubmit = (values: z.infer<typeof surveySchema>) => {
    console.log('Survey submitted:', values)
  }
  
  // 6. Toggle/Switch Example  
  const settingsSchema = z.object({
    notifications: z.boolean().default(true).describe('Enable notifications'),
    darkMode: z.boolean().default(false).describe('Dark mode'),
    autoSave: z.boolean().default(true).describe('Auto-save'),
  })
  
  const settingsFieldConfig = {
    notifications: {
      component: 'toggle' as const,
    },
    darkMode: {
      component: 'toggle' as const,
    },
    autoSave: {
      component: 'toggle' as const,
    },
  }
  
  const handleSettingsSubmit = (values: z.infer<typeof settingsSchema>) => {
    console.log('Settings saved:', values)
  }
  </script>
  
  <template>
    <div class="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 class="text-3xl font-bold mb-2">NuxtUI AutoForm Examples</h1>
        <p class="text-gray-600">Automatically generate forms from Zod schemas</p>
      </div>
  
      <!-- Basic Example -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">1. Basic Form</h2>
        </template>
        
        <AutoForm
          :schema="basicSchema"
          :field-config="basicFieldConfig"
          @submit="handleBasicSubmit"
        >
          <UButton type="submit" class="mt-4">
            Submit
          </UButton>
        </AutoForm>
      </UCard>
  
      <!-- Enum/Select Example -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">2. Select & Radio Groups</h2>
        </template>
        
        <AutoForm
          :schema="roleSchema"
          :field-config="roleFieldConfig"
          @submit="handleRoleSubmit"
        >
          <UButton type="submit" class="mt-4">
            Save Role
          </UButton>
        </AutoForm>
      </UCard>
  
      <!-- Object Example -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">3. Nested Objects</h2>
        </template>
        
        <AutoForm
          :schema="addressSchema"
          @submit="handleAddressSubmit"
        >
          <UButton type="submit" class="mt-4">
            Save Address
          </UButton>
        </AutoForm>
      </UCard>
  
      <!-- Array Example -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">4. Arrays (Dynamic Fields)</h2>
        </template>
        
        <AutoForm
          :schema="invitationSchema"
          @submit="handleInvitationSubmit"
        >
          <UButton type="submit" class="mt-4">
            Send Invitations
          </UButton>
        </AutoForm>
      </UCard>
  
      <!-- Dependencies Example -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">5. Field Dependencies</h2>
          <p class="text-sm text-gray-600 mt-1">
            Fields show/hide based on other field values
          </p>
        </template>
        
        <AutoForm
          :schema="surveySchema"
          :dependencies="surveyDependencies"
          @submit="handleSurveySubmit"
        >
          <UButton type="submit" class="mt-4">
            Submit Survey
          </UButton>
        </AutoForm>
      </UCard>
  
      <!-- Toggle Example -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">6. Toggle Switches</h2>
        </template>
        
        <AutoForm
          :schema="settingsSchema"
          :field-config="settingsFieldConfig"
          @submit="handleSettingsSubmit"
        >
          <UButton type="submit" class="mt-4">
            Save Settings
          </UButton>
        </AutoForm>
      </UCard>
    </div>
  </template>