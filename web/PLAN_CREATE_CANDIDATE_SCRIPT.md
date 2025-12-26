# Plan: Create Candidate Script Feature

## 📋 Tổng quan

Tính năng "Create Candidate Script" cho phép người dùng tạo candidate thông qua chat interface với các bước hướng dẫn. Script này sẽ sử dụng store để quản lý state và composable để thao tác, tránh props drilling.

## 🎯 Mục tiêu

1. Tạo script flow để hướng dẫn người dùng tạo candidate
2. Hỗ trợ nhiều phương thức input: text, upload file, chọn từ database
3. Parse và validate dữ liệu candidate
4. Lưu candidate vào database
5. Sử dụng store pattern để quản lý shared state
6. Sử dụng composable pattern để thao tác với state

## 📁 Cấu trúc Files

### 1. Script Definition
```
layers/chat/scripts/
  └── create-candidate-script.ts          # Định nghĩa script flow
```

### 2. Store (State Management)
```
layers/chat/stores/
  └── create-candidate-state.ts            # Store quản lý state của create candidate flow
```

### 3. Composable (Business Logic)
```
layers/chat/composables/
  └── use-create-candidate-chat-handler.ts # Handler chính cho chat flow
  └── use-create-candidate-state.ts        # Composable để thao tác với store
```

### 4. Types
```
layers/chat/types/
  └── create-candidate.ts                  # Types cho create candidate feature
```

### 5. Components (nếu cần mới)
```
layers/chat/components/chat-components/
  └── candidate-form-preview.vue          # Component preview candidate trước khi save (optional)
```

## 🔄 Script Flow

### Step 1: Select Input Method
- **ID**: `step-1-select-method`
- **Message**: "Hãy chọn phương thức nhập thông tin ứng viên"
- **Component**: `input-method-selector`
  - Methods:
    - Text input (default)
    - Upload CV file
    - Select from database
- **Validation**: Optional (user có thể type trực tiếp)

### Step 2: Input Candidate Data
- **ID**: `step-2-input-candidate`
- **Message**: "Vui lòng nhập thông tin ứng viên vào ô chat phía dưới:"
- **Component**: 
  - `candidate-input` (nếu text)
  - `file-upload-area` (nếu upload)
  - `candidate-selector` (nếu chọn từ DB)
- **Validation**: 
  - Phải có ít nhất: firstName, lastName, email
  - Hoặc có file upload
  - Hoặc có candidateId từ database

### Step 3: Parse & Review
- **ID**: `step-3-parse-review`
- **Message**: "Đang phân tích thông tin ứng viên..."
- **Action**: 
  - Parse text/file nếu cần
  - Hiển thị preview candidate data
- **Component**: `candidate-form-preview` (optional)

### Step 4: Confirm & Save
- **ID**: `step-4-confirm-save`
- **Message**: "Xác nhận và lưu thông tin ứng viên?"
- **Action**: 
  - Validate final data
  - Call API create candidate
  - Show success message
- **Component**: `step-action-buttons` (Save/Cancel)

## 📊 State Structure

### Store State (`create-candidate-state.ts`)
```typescript
interface CreateCandidateState {
  // Current step
  currentStep: number
  
  // Input method selected
  inputMethod: 'text' | 'upload' | 'database' | null
  
  // Raw input data
  rawInput: {
    text?: string
    files?: File[]
    candidateId?: string
  }
  
  // Parsed candidate data
  parsedCandidate: CreateCandidateInput | null
  
  // Validation errors
  errors: Record<string, string>
  
  // Loading states
  isParsing: boolean
  isSaving: boolean
  
  // Created candidate (after save)
  createdCandidate: Candidate | null
}
```

## 🔧 Implementation Details

### 1. Script Definition (`create-candidate-script.ts`)
- Export function `createCreateCandidateScript(t?: i18n function)`
- Define các steps với validation rules
- Return `ChatScript` object

### 2. Store (`create-candidate-state.ts`)
- Sử dụng Pinia store
- Actions:
  - `setInputMethod(method)`
  - `setRawInput(input)`
  - `setParsedCandidate(candidate)`
  - `setErrors(errors)`
  - `setCurrentStep(step)`
  - `reset()`
- Getters:
  - `canProceed()`
  - `isValid()`
  - `hasErrors()`

### 3. Composable (`use-create-candidate-state.ts`)
- Wrap store để dễ sử dụng
- Provide reactive state
- Provide actions as methods
- Return computed values

### 4. Handler (`use-create-candidate-chat-handler.ts`)
- Implement `ChatHandler` interface
- Handle messages cho từng step
- Handle component updates
- Integrate với candidate API (parse, create)
- Use store để lưu state

### 5. Types (`create-candidate.ts`)
```typescript
export interface CreateCandidateScriptData {
  inputMethod?: 'text' | 'upload' | 'database'
  candidateText?: string
  files?: File[]
  candidateId?: string
  parsedCandidate?: CreateCandidateInput
}

export interface CreateCandidateStepData {
  stepId: string
  data: any
}
```

## 🔗 Integration Points

### 1. Candidate Layer
- Sử dụng `useCandidate()` composable
- Methods:
  - `parseCandidateFromText(text)`
  - `createCandidate(input)`

### 2. Chat Handlers Store
- Register handler factory trong `chat-handlers.ts`
- Feature: `'create-candidate'`

### 3. Chat Setup Store
- Feature đã có trong `purposes` array
- Value: `'create-candidate'`

### 4. Component Registry
- Reuse existing components:
  - `input-method-selector`
  - `candidate-input`
  - `file-upload-area`
  - `candidate-selector`
  - `step-action-buttons`

## 📝 Implementation Steps

### Phase 1: Foundation
1. ✅ Create types file (`create-candidate.ts`)
2. ✅ Create store file (`create-candidate-state.ts`)
3. ✅ Create state composable (`use-create-candidate-state.ts`)

### Phase 2: Script & Handler
4. ✅ Create script definition (`create-candidate-script.ts`)
5. ✅ Create chat handler (`use-create-candidate-chat-handler.ts`)

### Phase 3: Integration
6. ✅ Register handler in `chat-handlers.ts`
7. ✅ Update component registry if needed
8. ✅ Add i18n keys

### Phase 4: Testing
9. ✅ Test flow từng step
10. ✅ Test validation
11. ✅ Test API integration

## 🎨 UI/UX Flow

```
1. User chọn "Create Candidate" từ purpose selector
   ↓
2. Hiển thị step 1: Select input method
   - User có thể chọn method hoặc type trực tiếp
   ↓
3. Hiển thị step 2: Input candidate data
   - Nếu text: hiển thị candidate-input
   - Nếu upload: hiển thị file-upload-area
   - Nếu database: hiển thị candidate-selector
   ↓
4. Step 3: Parse & Review
   - Parse data (nếu cần)
   - Hiển thị preview
   ↓
5. Step 4: Confirm & Save
   - Validate
   - Save candidate
   - Show success message
```

## 🔐 Validation Rules

### Required Fields
- `firstName`: string, min 1 char
- `lastName`: string, min 1 char
- `email`: string, valid email format

### Optional Fields
- `phone`: string, valid phone format
- `skills`: string[]
- `experience`: number >= 0
- `currentCompany`: string
- `expectedSalary`: { min, max, currency }

## 📦 Dependencies

- `@candidate/composables/use-candidate` - Candidate operations
- `@chat/types/chat` - Chat types
- `@chat/types/script` - Script types
- `pinia` - State management
- Existing chat components

## 🚀 Future Enhancements

1. Edit candidate flow (reuse script với update mode)
2. Bulk create candidates
3. AI suggestions cho missing fields
4. Template support
5. Import from external sources (LinkedIn, etc.)

