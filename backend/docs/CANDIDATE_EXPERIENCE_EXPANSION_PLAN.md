# Kế Hoạch Mở Rộng Tính Năng Kinh Nghiệm Làm Việc cho Candidate

## 📋 Tổng Quan

Mở rộng module Candidate để hỗ trợ quản lý chi tiết về:
- **Học tập**: Nơi học, chuyên ngành, loại bằng, thời gian, điểm số
- **Kỹ năng**: Tên skill, số năm kinh nghiệm hoặc level (cho ngôn ngữ)
- **Quá trình công tác**: Tên công ty, thời gian, vị trí, vai trò, thành tựu
- **Dự án tham gia**: Tên dự án, công ty, thời gian, vị trí, vai trò, thành tựu, kỹ năng sử dụng

## 🎯 Mục Tiêu

1. **Database Design**: Thiết kế schema mở rộng cao, dễ customize
2. **Backend API**: Tạo entities, DTOs, services cho các tính năng mới
3. **Frontend UI**: Bổ sung form nhập liệu chi tiết cho CV
4. **Tương thích ngược**: Đảm bảo dữ liệu cũ vẫn hoạt động

---

## 📊 Phase 1: Database Design & Migration

### 1.1. Thiết Kế Database Schema

#### Option A: Normalized Tables (Recommended - High Extensibility)
Tách thành các bảng riêng để dễ query và mở rộng:

```sql
-- 1. Education Table
CREATE TABLE candidate_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  major VARCHAR(255), -- Chuyên ngành
  degree_type VARCHAR(100), -- Loại bằng (Bachelor, Master, PhD, etc.)
  start_date DATE,
  end_date DATE,
  gpa DECIMAL(3,2), -- Điểm số (0.00 - 4.00 hoặc 0.00 - 10.00)
  gpa_scale DECIMAL(3,2) DEFAULT 4.00, -- Thang điểm (4.0 hoặc 10.0)
  description TEXT, -- Mô tả thêm
  order_index INTEGER DEFAULT 0, -- Thứ tự hiển thị
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_education_candidate_id ON candidate_education(candidate_id);
CREATE INDEX idx_education_dates ON candidate_education(start_date, end_date);

-- 2. Skills Table (với level/years)
CREATE TABLE candidate_skill (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  skill_type VARCHAR(50) DEFAULT 'technical', -- technical, language, soft, etc.
  level VARCHAR(50), -- beginner, intermediate, advanced, expert (cho ngôn ngữ)
  years_of_experience DECIMAL(4,1), -- Số năm kinh nghiệm (cho technical skills)
  proficiency_percentage INTEGER CHECK (proficiency_percentage >= 0 AND proficiency_percentage <= 100),
  last_used_date DATE, -- Lần cuối sử dụng
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(candidate_id, name) -- Mỗi skill chỉ có 1 lần cho mỗi candidate
);

CREATE INDEX idx_skill_candidate_id ON candidate_skill(candidate_id);
CREATE INDEX idx_skill_name ON candidate_skill(name);
CREATE INDEX idx_skill_type ON candidate_skill(skill_type);

-- 3. Work Experience Table
CREATE TABLE candidate_work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL, -- Vị trí
  role VARCHAR(255), -- Vai trò (Senior Developer, Team Lead, etc.)
  start_date DATE NOT NULL,
  end_date DATE, -- NULL nếu đang làm
  is_current BOOLEAN DEFAULT FALSE,
  employment_type VARCHAR(50), -- FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE
  location VARCHAR(255), -- Địa điểm làm việc
  description TEXT, -- Mô tả công việc
  achievements JSONB DEFAULT '[]', -- Array of achievements
  technologies_used TEXT[], -- Array of technologies/skills used
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_exp_candidate_id ON candidate_work_experience(candidate_id);
CREATE INDEX idx_work_exp_dates ON candidate_work_experience(start_date, end_date);
CREATE INDEX idx_work_exp_company ON candidate_work_experience(company_name);

-- 4. Projects Table
CREATE TABLE candidate_project (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255), -- Công ty thực hiện dự án
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  position VARCHAR(255), -- Vị trí trong dự án
  role VARCHAR(255), -- Vai trò (Developer, Lead, Architect, etc.)
  description TEXT,
  achievements JSONB DEFAULT '[]', -- Array of achievements
  technologies_used TEXT[], -- Array of technologies/skills
  project_url VARCHAR(500), -- Link đến project (GitHub, website, etc.)
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_candidate_id ON candidate_project(candidate_id);
CREATE INDEX idx_project_dates ON candidate_project(start_date, end_date);
```

#### Option B: JSONB Approach (Simpler but less queryable)
Giữ nguyên JSONB nhưng cấu trúc rõ ràng hơn:

```typescript
// Candidate entity sẽ có:
education: EducationEntry[]
skills: SkillEntry[]
workExperience: WorkExperienceEntry[]
projects: ProjectEntry[]
```

**Quyết định**: Chọn **Option A** vì:
- Dễ query và filter
- Dễ mở rộng (thêm fields mới)
- Performance tốt hơn với indexes
- Dễ customize cho từng user

### 1.2. Migration Strategy

1. **Migration 1**: Tạo các bảng mới (education, skill, work_experience, project)
2. **Migration 2**: Migrate dữ liệu từ JSONB cũ sang bảng mới (nếu có)
3. **Migration 3**: Giữ JSONB fields cũ như deprecated (backward compatibility)
4. **Migration 4**: Sau khi migrate xong, có thể remove JSONB fields (optional)

---

## 🔧 Phase 2: Backend Implementation

### 2.1. Entities

#### `candidate-education.entity.ts`
```typescript
@Entity('candidate_education')
export class CandidateEducation extends BaseEntity {
  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({ type: 'varchar', length: 255 })
  institution!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  major?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  degreeType?: string; // Bachelor, Master, PhD, etc.

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  gpa?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 4.0 })
  gpaScale!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 0 })
  orderIndex!: number;
}
```

#### `candidate-skill.entity.ts`
```typescript
@Entity('candidate_skill')
@Unique(['candidate', 'name'])
export class CandidateSkill extends BaseEntity {
  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 50, default: 'technical' })
  skillType!: string; // technical, language, soft, certification

  @Column({ type: 'varchar', length: 50, nullable: true })
  level?: string; // beginner, intermediate, advanced, expert, native

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  yearsOfExperience?: number;

  @Column({ type: 'integer', nullable: true })
  proficiencyPercentage?: number; // 0-100

  @Column({ type: 'date', nullable: true })
  lastUsedDate?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 0 })
  orderIndex!: number;
}
```

#### `candidate-work-experience.entity.ts`
```typescript
@Entity('candidate_work_experience')
export class CandidateWorkExperience extends BaseEntity {
  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({ type: 'varchar', length: 255 })
  companyName!: string;

  @Column({ type: 'varchar', length: 255 })
  position!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role?: string;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'boolean', default: false })
  isCurrent!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employmentType?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: '[]' })
  achievements!: string[];

  @Column({ type: 'text', array: true, default: [] })
  technologiesUsed!: string[];

  @Column({ type: 'integer', default: 0 })
  orderIndex!: number;
}
```

#### `candidate-project.entity.ts`
```typescript
@Entity('candidate_project')
export class CandidateProject extends BaseEntity {
  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'boolean', default: false })
  isCurrent!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  position?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: '[]' })
  achievements!: string[];

  @Column({ type: 'text', array: true, default: [] })
  technologiesUsed!: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  projectUrl?: string;

  @Column({ type: 'integer', default: 0 })
  orderIndex!: number;
}
```

### 2.2. DTOs

#### `create-education.dto.ts`
```typescript
export class CreateEducationDto {
  @IsString()
  @IsNotEmpty()
  institution!: string;

  @IsString()
  @IsOptional()
  major?: string;

  @IsString()
  @IsOptional()
  degreeType?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  gpa?: number;

  @IsNumber()
  @IsOptional()
  gpaScale?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  orderIndex?: number;
}
```

Tương tự cho: `CreateSkillDto`, `CreateWorkExperienceDto`, `CreateProjectDto`

### 2.3. Services

#### `candidate-education.service.ts`
- `createEducation(candidateId, dto)`
- `updateEducation(id, dto)`
- `deleteEducation(id)`
- `getEducationByCandidate(candidateId)`
- `reorderEducation(candidateId, orderIds[])`

Tương tự cho các services khác.

### 2.4. Controllers

#### Endpoints mới:
```
POST   /candidates/:id/education
GET    /candidates/:id/education
PUT    /candidates/:id/education/:educationId
DELETE /candidates/:id/education/:educationId

POST   /candidates/:id/skills
GET    /candidates/:id/skills
PUT    /candidates/:id/skills/:skillId
DELETE /candidates/:id/skills/:skillId

POST   /candidates/:id/work-experience
GET    /candidates/:id/work-experience
PUT    /candidates/:id/work-experience/:expId
DELETE /candidates/:id/work-experience/:expId

POST   /candidates/:id/projects
GET    /candidates/:id/projects
PUT    /candidates/:id/projects/:projectId
DELETE /candidates/:id/projects/:projectId
```

---

## 🎨 Phase 3: Frontend Implementation

### 3.1. Types

#### `candidate.ts` - Mở rộng types
```typescript
export interface EducationEntry {
  id?: string
  institution: string
  major?: string
  degreeType?: string
  startDate?: Date | string
  endDate?: Date | string
  gpa?: number
  gpaScale?: number
  description?: string
  orderIndex?: number
}

export interface SkillEntry {
  id?: string
  name: string
  skillType?: 'technical' | 'language' | 'soft' | 'certification'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'native'
  yearsOfExperience?: number
  proficiencyPercentage?: number
  lastUsedDate?: Date | string
  description?: string
  orderIndex?: number
}

export interface WorkExperienceEntry {
  id?: string
  companyName: string
  position: string
  role?: string
  startDate: Date | string
  endDate?: Date | string
  isCurrent?: boolean
  employmentType?: string
  location?: string
  description?: string
  achievements?: string[]
  technologiesUsed?: string[]
  orderIndex?: number
}

export interface ProjectEntry {
  id?: string
  name: string
  company?: string
  startDate?: Date | string
  endDate?: Date | string
  isCurrent?: boolean
  position?: string
  role?: string
  description?: string
  achievements?: string[]
  technologiesUsed?: string[]
  projectUrl?: string
  orderIndex?: number
}

export interface Candidate {
  // ... existing fields
  educations?: EducationEntry[]
  skills?: SkillEntry[]
  workExperiences?: WorkExperienceEntry[]
  projects?: ProjectEntry[]
}
```

### 3.2. UI Components

#### `education-form.vue`
- Form nhập thông tin học tập
- Support multiple entries
- Drag & drop để sắp xếp thứ tự

#### `skills-form.vue`
- Form nhập skills với level/years
- Support different skill types
- Auto-complete cho skill names

#### `work-experience-form.vue`
- Form nhập quá trình công tác
- Support multiple entries
- Rich text editor cho achievements

#### `projects-form.vue`
- Form nhập dự án
- Support multiple entries
- Link to project URLs

### 3.3. Update Create/Edit Modal

#### `create-candidate-modal.vue`
- Thêm tabs/sections cho:
  - Basic Info (existing)
  - Education
  - Skills
  - Work Experience
  - Projects
- Support step-by-step wizard hoặc accordion

---

## 📝 Phase 4: Implementation Steps

### Step 1: Database Migration (Backend)
1. Tạo migration files cho 4 bảng mới
2. Run migration
3. Test schema

### Step 2: Backend Entities & DTOs
1. Tạo 4 entities mới
2. Tạo DTOs cho CRUD operations
3. Update Candidate entity với relations

### Step 3: Backend Services
1. Tạo 4 services mới
2. Implement CRUD operations
3. Add validation

### Step 4: Backend Controllers
1. Tạo controllers/endpoints
2. Add authentication & authorization
3. Add Swagger documentation

### Step 5: Frontend Types
1. Update candidate types
2. Create API utility functions

### Step 6: Frontend UI Components
1. Create form components
2. Integrate vào create/edit modal
3. Add validation

### Step 7: Testing
1. Unit tests cho backend
2. Integration tests
3. E2E tests cho frontend

### Step 8: Documentation
1. Update API documentation
2. Update user guide
3. Migration guide

---

## 🔄 Backward Compatibility

### Strategy
1. **Keep JSONB fields** trong Candidate entity (deprecated)
2. **Auto-migrate** khi user update candidate
3. **Support both** old and new format trong API response
4. **Gradual migration** - không force migrate ngay

### Migration Script
```typescript
// Pseudo-code
async function migrateCandidateData(candidateId: string) {
  const candidate = await candidateRepo.findOne(candidateId);
  
  // Migrate education
  if (candidate.education && Array.isArray(candidate.education)) {
    for (const edu of candidate.education) {
      await educationRepo.save({ candidateId, ...edu });
    }
  }
  
  // Similar for skills, experience, projects
}
```

---

## 🎯 Customization Support

### Extensibility Features
1. **Custom Fields**: Thêm `metadata` JSONB field cho custom data
2. **Order Management**: `orderIndex` field để user tự sắp xếp
3. **Flexible Types**: Enum fields có thể mở rộng
4. **Rich Text**: Description fields support markdown/HTML

### Future Enhancements
- Certifications table
- Languages table (riêng với proficiency levels)
- References/Recommendations
- Publications/Articles
- Awards & Honors

---

## ⏱️ Timeline Estimate

- **Phase 1** (Database): 2-3 days
- **Phase 2** (Backend): 5-7 days
- **Phase 3** (Frontend): 7-10 days
- **Phase 4** (Testing & Docs): 3-4 days

**Total**: ~17-24 days

---

## ✅ Success Criteria

1. ✅ User có thể nhập đầy đủ thông tin CV chi tiết
2. ✅ Data được lưu structured và queryable
3. ✅ UI/UX intuitive và dễ sử dụng
4. ✅ Backward compatible với dữ liệu cũ
5. ✅ Performance tốt với large datasets
6. ✅ Dễ mở rộng cho customization

