# AutoForm Update Plan

## Tổng quan
Cập nhật implementation AutoForm để align với official shadcn-vue auto-form API và best practices, **sử dụng Zod validation với NuxtUI UForm** (không dùng vee-validate).

## Phân tích so sánh

### Official shadcn-vue AutoForm
- Sử dụng `vee-validate` với `Form`, `FormField`, `FormItem`, `FormControl`, `FormMessage`, `FormDescription`
- Support controlled form qua `form` prop (useForm từ vee-validate)
- Support named slots cho custom field rendering
- Dependency handling đầy đủ với proper state management
- Support `ZodObjectOrWrapped` (unwrap schema nếu cần)
- Proper shape handling cho nested objects và arrays
- Support file input type
- `showLabel` trong `inputProps` thay vì `hideLabel` ở top level

### Implementation hiện tại (NuxtUI + Zod)
- ✅ Sử dụng NuxtUI `UForm`, `UFormGroup` với Zod schema validation
- ✅ Zod validation tự động qua UForm schema prop
- ❌ Dependency logic bị broken (always return false)
- ❌ Không support controlled form (có thể thêm với reactive state)
- ❌ Không support named slots
- ⚠️ Field config structure khác một chút
- ❌ Chưa support file input

### Approach: NuxtUI + Zod (không dùng vee-validate)
- **Giữ NuxtUI UForm** với Zod schema validation
- **Controlled form**: Dùng reactive state + provide/inject thay vì vee-validate form context
- **Validation**: Zod schema.parse() trong onSubmit (như hiện tại)
- **State management**: Reactive state + provide/inject cho form values
- **Dependencies**: Access form state qua inject để evaluate dependencies

### Architecture: NuxtUI + Zod

```
AutoForm.vue
├── UForm (NuxtUI) với Zod schema
│   ├── Reactive state (formState) - provide/inject
│   ├── Helper functions (getFormValue, setFormValue) - provide/inject
│   └── AutoFormField components
│       ├── Inject formState và helpers
│       ├── UFormGroup (NuxtUI) - tự động hiển thị validation errors
│       └── Field components (Input, Select, etc.)
│
Validation Flow:
1. User input → Update formState (reactive)
2. Form submit → UForm triggers @submit
3. AutoForm.onSubmit → schema.parse(event.data) (Zod validation)
4. Nếu valid → emit('submit', validatedData)
5. Nếu invalid → UFormGroup tự động hiển thị errors từ Zod
```

**Lợi ích:**
- ✅ Không cần vee-validate dependency
- ✅ NuxtUI UForm tự động handle validation errors
- ✅ Zod schema là single source of truth
- ✅ Reactive state management đơn giản
- ✅ Tương thích với NuxtUI ecosystem

## Các thay đổi cần thực hiện

### 1. Types & Interfaces (`shared/types/auto-form.ts`)

#### Cần thêm/cập nhật:
- ✅ `ZodObjectOrWrapped` type để handle wrapped schemas
- ✅ `Config` type (alias cho FieldConfig)
- ✅ `ConfigItem` type (alias cho FieldConfigItem) 
- ✅ `Shape` type để represent schema shape
- ✅ Cập nhật `Dependency` type để match official API:
  - `sourceField`, `targetField` nên là string (không phải keyof)
  - `type` nên dùng enum `DependencyType` với values: `HIDES`, `DISABLES`, `REQUIRES`, `SETS_OPTIONS`
  - `when` function signature: `(sourceValue: any, targetValue?: any) => boolean`
  - `options?` cho `SETS_OPTIONS` type
- ✅ Cập nhật `FieldConfigItem`:
  - Thêm `showLabel?: boolean` trong `inputProps` (thay vì `hideLabel` ở top level)
  - Support `Component` type cho custom component
  - Đảm bảo component types match official: `'checkbox' | 'switch' | 'date' | 'select' | 'radio' | 'textarea'`

### 2. Utils (`shared/utils/auto-form.ts`)

#### Cần thêm/cập nhật:
- ✅ Function `unwrapZodObject` để handle `ZodObjectOrWrapped`
- ✅ Cải thiện `getDefaultValueInZodStack` để handle:
  - Date defaults properly (`new Date(val)`)
  - Nested objects (recursive)
  - Arrays với default values
- ✅ Function `getNestedValue` để get value từ nested path: `getNestedValue(obj, 'address.street')`
- ✅ Function `setNestedValue` để set value cho nested path: `setNestedValue(obj, 'address.street', '123 Main St')`
- ✅ Function để extract shape từ schema (handle nested objects và arrays)
- ✅ Function để flatten nested field paths cho field config access

### 3. AutoForm.vue

#### Cần cập nhật:
- ✅ **Props:**
  - Thêm `formState?: Ref<Record<string, any>>` prop để support controlled form (optional)
  - Schema prop nên accept `ZodObjectOrWrapped`
  - Giữ `fieldConfig`, `dependencies`, `class` props

- ✅ **Logic:**
  - Nếu có `formState` prop → sử dụng controlled form state (provide formState)
  - Nếu không có `formState` prop → tạo internal reactive state như hiện tại
  - Unwrap schema nếu cần: `const unwrappedSchema = unwrapZodObject(schema)`
  - Generate shapes properly cho nested objects và arrays
  - Handle default values cho nested objects và arrays (recursive)
  - Provide form state và form methods cho child components:
    ```typescript
    provide('formState', formState)
    provide('getFormValue', (path: string) => getNestedValue(formState.value, path))
    provide('setFormValue', (path: string, value: any) => setNestedValue(formState, path, value))
    ```

- ✅ **Template:**
  - Support named slots cho custom field rendering: `<template #fieldName="slotProps">`
  - Render fields với proper shape structure (handle nested objects/arrays)
  - Pass `shapes` to default slot: `<slot :shapes="shapes" />`

- ✅ **Emits:**
  - Giữ `@submit` emit với validated data (zod.parse() như hiện tại)

### 4. AutoFormField.vue

#### Cần fix:
- ✅ **Dependency handling (CRITICAL BUG):**
  - `isHidden` và `isDisabled` hiện tại always return `false` (dòng 72, 83)
  - Cần inject form state và helper functions từ AutoForm
  - Implement proper dependency logic:
    ```typescript
    const formState = inject<Ref<Record<string, any>>>('formState')
    const getFormValue = inject<(path: string) => any>('getFormValue')
    
    const isHidden = computed(() => {
      if (!props.dependencies || !formState || !getFormValue) return false
      return props.dependencies.some(dep => {
        if (dep.targetField !== props.fieldName) return false
        if (dep.type !== DependencyType.HIDES) return false
        // Get source field value from form state
        const sourceValue = getFormValue(dep.sourceField as string)
        const targetValue = getFormValue(props.fieldName)
        return dep.when(sourceValue, targetValue)
      })
    })
    
    const isDisabled = computed(() => {
      // Similar logic for DISABLES
    })
    
    const isRequired = computed(() => {
      // Handle REQUIRES dependency type
    })
    ```

- ✅ **Field config access:**
  - Cải thiện logic để handle nested field names properly
  - Support field config cho nested objects: `address.street`

- ✅ **Component selection:**
  - Đảm bảo component map match official types
  - Support custom Component type

### 5. Field Components (AutoFormFieldInput, AutoFormFieldTextarea, etc.)

#### Cần cập nhật:
- ✅ **InputProps handling:**
  - Support `showLabel` trong `inputProps` (không dùng `hideLabel` ở top level)
  - Pass all `inputProps` properly to underlying components

- ✅ **Label rendering:**
  - Nếu `inputProps?.showLabel === false` → không render label
  - Nếu không có `showLabel` hoặc `showLabel === true` → render label như bình thường

- ✅ **FormMessage/FormDescription:**
  - Đảm bảo error messages hiển thị đúng (NuxtUI UFormGroup tự handle)
  - Description từ config hoặc zod description

### 6. AutoFormFieldObject.vue

#### Cần cải thiện:
- ✅ **UI:**
  - Có thể dùng Accordion component (như official) thay vì UCard
  - Hoặc giữ UCard nhưng improve styling
  - Support label và description từ zod schema description

- ✅ **Nested field handling:**
  - Proper field name paths: `address.street`, `address.city`
  - Field config access cho nested fields

### 7. AutoFormFieldArray.vue

#### Cần cải thiện:
- ✅ **Default values:**
  - Support default array values từ schema
  - Validate array item structure matches schema

- ✅ **UI:**
  - Improve add/remove item UX
  - Better empty state

### 8. New: AutoFormFieldFile.vue

#### Cần tạo:
- ✅ **File input support:**
  - Component mới cho file input type
  - Support `inputProps` như `accept`, `multiple`, etc.
  - Handle file selection và validation

### 9. Composables

#### Cần tạo/cập nhật:
- ✅ **useAutoFormField.ts:**
  - Tạo composable để access form state từ inject
  - Provide `fieldValue`, `setFieldValue`, `getFieldValue` helpers
  - Handle nested field paths (e.g., "address.street")
  - Support reactive updates:
    ```typescript
    export function useAutoFormField(fieldName: string) {
      const formState = inject<Ref<Record<string, any>>>('formState')
      const getFormValue = inject<(path: string) => any>('getFormValue')
      const setFormValue = inject<(path: string, value: any) => void>('setFormValue')
      
      const fieldValue = computed({
        get: () => getFormValue?.(fieldName) ?? undefined,
        set: (value) => setFormValue?.(fieldName, value)
      })
      
      return { fieldValue }
    }
    ```

- ✅ **useAutoFormDependencies.ts (optional):**
  - Composable để handle dependency logic
  - Reactive dependency evaluation
  - Support HIDES, DISABLES, REQUIRES, SETS_OPTIONS

### 10. Constants

#### Cần tạo (nếu muốn match official structure):
- ✅ **constants.ts:**
  - `INPUT_COMPONENTS` map (như official)
  - Component type constants

## Migration Notes

### Breaking Changes:
1. `hideLabel` → `inputProps.showLabel` (inverted logic)
2. Dependency `type` values: `'hides'` → `DependencyType.HIDES`
3. Field config access cho nested fields có thể thay đổi

### Backward Compatibility:
- ✅ **Giữ NuxtUI components** (UForm, UFormGroup) - không chuyển sang shadcn-vue Form
- ✅ **Giữ Zod validation** - không dùng vee-validate
- ✅ Giữ API surface tương tự để không break existing code
- ✅ Controlled form optional (nếu không pass formState, vẫn hoạt động như cũ)

### Key Differences từ Official:
- ❌ Không dùng vee-validate → dùng NuxtUI UForm + Zod
- ❌ Không có FormContext từ vee-validate → dùng reactive state + provide/inject
- ✅ Vẫn support tất cả features: dependencies, named slots, nested objects, arrays, file input

## Implementation Order

1. ✅ Update types và interfaces
2. ✅ Update utils functions
3. ✅ Fix dependency handling trong AutoFormField
4. ✅ Update AutoForm.vue (controlled form, named slots)
5. ✅ Update field components (showLabel, inputProps)
6. ✅ Improve AutoFormFieldObject và AutoFormFieldArray
7. ✅ Add AutoFormFieldFile
8. ✅ Create/update composables
9. ✅ Testing và validation

## Testing Checklist

- [ ] Basic form submission với Zod validation
- [ ] Controlled form với formState prop (optional)
- [ ] Uncontrolled form (default behavior)
- [ ] Named slots cho custom fields
- [ ] Dependency: HIDES, DISABLES, REQUIRES, SETS_OPTIONS
- [ ] Nested objects (address.street, etc.)
- [ ] Arrays với default values
- [ ] File input
- [ ] showLabel trong inputProps
- [ ] Custom components
- [ ] Enum/Select với options
- [ ] Date picker với default values
- [ ] Validation errors display (NuxtUI UFormGroup)
- [ ] Form state reactivity (nested values)
- [ ] Default values cho nested objects và arrays

