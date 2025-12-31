# Tóm Tắt Kế Hoạch Mở Rộng Candidate Experience

## 🎯 Mục Tiêu
Mở rộng module Candidate để quản lý chi tiết:
- **Học tập**: Nơi học, chuyên ngành, bằng cấp, thời gian, điểm số
- **Kỹ năng**: Tên, số năm/level, proficiency
- **Công tác**: Công ty, thời gian, vị trí, vai trò, thành tựu
- **Dự án**: Tên, công ty, thời gian, vị trí, vai trò, thành tựu, kỹ năng

## 📊 Database Design

### 4 Bảng Mới (Normalized)
1. **`candidate_education`** - Học tập
2. **`candidate_skill`** - Kỹ năng (với level/years)
3. **`candidate_work_experience`** - Quá trình công tác
4. **`candidate_project`** - Dự án tham gia

**Lý do chọn normalized tables:**
- ✅ Dễ query và filter
- ✅ Performance tốt với indexes
- ✅ Dễ mở rộng (thêm fields)
- ✅ Dễ customize cho từng user

## 🔧 Backend Changes

### Entities (4 entities mới)
- `CandidateEducation`
- `CandidateSkill`
- `CandidateWorkExperience`
- `CandidateProject`

### API Endpoints (16 endpoints mới)
```
POST/GET/PUT/DELETE /candidates/:id/education
POST/GET/PUT/DELETE /candidates/:id/skills
POST/GET/PUT/DELETE /candidates/:id/work-experience
POST/GET/PUT/DELETE /candidates/:id/projects
```

## 🎨 Frontend Changes

### Types (4 interfaces mới)
- `EducationEntry`
- `SkillEntry`
- `WorkExperienceEntry`
- `ProjectEntry`

### UI Components (4 components mới)
- `education-form.vue`
- `skills-form.vue`
- `work-experience-form.vue`
- `projects-form.vue`

### Update Modal
- Thêm tabs/sections trong `create-candidate-modal.vue`
- Support multiple entries với drag & drop

## 📝 Implementation Order

1. **Database Migration** → Tạo 4 bảng mới
2. **Backend Entities & DTOs** → Define structure
3. **Backend Services** → Business logic
4. **Backend Controllers** → API endpoints
5. **Frontend Types** → TypeScript definitions
6. **Frontend Components** → UI forms
7. **Integration** → Connect frontend với backend
8. **Testing** → Unit, integration, E2E

## ⏱️ Timeline
- **Database**: 2-3 days
- **Backend**: 5-7 days
- **Frontend**: 7-10 days
- **Testing**: 3-4 days
- **Total**: ~17-24 days

## 🔄 Backward Compatibility
- Giữ JSONB fields cũ (deprecated)
- Auto-migrate khi user update
- Support cả old và new format

## 📖 Chi Tiết
Xem file đầy đủ: `backend/docs/CANDIDATE_EXPERIENCE_EXPANSION_PLAN.md`

