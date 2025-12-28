# Database Schema Reference

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                         JOB                             │
├─────────────────────────────────────────────────────────┤
│ PK  id                    UUID                          │
│     title                 VARCHAR(255)                  │
│     description           TEXT                          │
│     company               VARCHAR(255)                  │
│     location              VARCHAR(255)                  │
│     salary_min            DECIMAL(10,2)                 │
│     salary_max            DECIMAL(10,2)                 │
│     employment_type       ENUM                          │
│     status                ENUM                          │
│     requirements          JSONB                         │
│     benefits              JSONB                         │
│     posted_at             TIMESTAMP                     │
│     expires_at            TIMESTAMP                     │
│     created_at            TIMESTAMP                     │
│     updated_at            TIMESTAMP                     │
│                                                         │
│ INDEX: status, posted_at, company                      │
└─────────────────────────────────────────────────────────┘
                            │
                            │ 1
                            │
                            │
                            │ N
┌─────────────────────────────────────────────────────────┐
│                   JOB_APPLICATION                        │
├─────────────────────────────────────────────────────────┤
│ PK  id                    UUID                          │
│ FK  job_id                UUID → job.id                 │
│ FK  candidate_id          UUID → candidate.id           │
│     status                ENUM                          │
│     cover_letter          TEXT                          │
│     resume_url            VARCHAR(500)                  │
│     notes                 TEXT                          │
│     applied_at            TIMESTAMP                     │
│     created_at            TIMESTAMP                     │
│     updated_at            TIMESTAMP                     │
│                                                         │
│ UNIQUE: (job_id, candidate_id)                         │
│ INDEX: job_id, candidate_id, status, applied_at        │
└─────────────────────────────────────────────────────────┘
                            │
                            │ N
                            │
                            │
                            │ 1
┌─────────────────────────────────────────────────────────┐
│                       CANDIDATE                          │
├─────────────────────────────────────────────────────────┤
│ PK  id                    UUID                      │
│     email                 VARCHAR(255) UNIQUE             │
│     first_name           VARCHAR(100)                   │
│     last_name            VARCHAR(100)                   │
│     phone                VARCHAR(20)                    │
│     resume_url           VARCHAR(500)                   │
│     skills               JSONB                          │
│     experience           JSONB                          │
│     education            JSONB                          │
│     created_at           TIMESTAMP                      │
│     updated_at           TIMESTAMP                      │
│                                                         │
│ INDEX: email                                            │
└─────────────────────────────────────────────────────────┘
```

## Enums

### EmploymentType
```typescript
enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  REMOTE = 'REMOTE',
}
```

### JobStatus
```typescript
enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}
```

### ApplicationStatus
```typescript
enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWED = 'INTERVIEWED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}
```

## Table Details

### job
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| title | VARCHAR(255) | NOT NULL | Job title |
| description | TEXT | NULL | Full job description |
| company | VARCHAR(255) | NOT NULL | Company name |
| location | VARCHAR(255) | NULL | Job location |
| salary_min | DECIMAL(10,2) | NULL | Minimum salary |
| salary_max | DECIMAL(10,2) | NULL | Maximum salary |
| employment_type | employment_type | NOT NULL, DEFAULT 'FULL_TIME' | Type of employment |
| status | job_status | NOT NULL, DEFAULT 'DRAFT' | Job status |
| requirements | JSONB | DEFAULT '[]' | Array of requirements |
| benefits | JSONB | DEFAULT '[]' | Array of benefits |
| posted_at | TIMESTAMP | NULL | When job was posted |
| expires_at | TIMESTAMP | NULL | Job expiration date |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_job_status` on `status`
- `idx_job_posted_at` on `posted_at`
- `idx_job_company` on `company`

### candidate
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email address |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| phone | VARCHAR(20) | NULL | Phone number |
| resume_url | VARCHAR(500) | NULL | Resume file URL |
| skills | JSONB | DEFAULT '[]' | Array of skills |
| experience | JSONB | DEFAULT '[]' | Work experience array |
| education | JSONB | DEFAULT '[]' | Education history array |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Update timestamp |

**Indexes:**
- `idx_candidate_email` on `email` (UNIQUE)

### job_application
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| job_id | UUID | NOT NULL, FK → job.id | Reference to job |
| candidate_id | UUID | NOT NULL, FK → candidate.id | Reference to candidate |
| status | application_status | NOT NULL, DEFAULT 'PENDING' | Application status |
| cover_letter | TEXT | NULL | Cover letter text |
| resume_url | VARCHAR(500) | NULL | Resume URL for this application |
| notes | TEXT | NULL | Internal notes |
| applied_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Application timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Update timestamp |

**Constraints:**
- UNIQUE constraint on `(job_id, candidate_id)` - One application per candidate per job
- FOREIGN KEY on `job_id` → `job.id` ON DELETE CASCADE
- FOREIGN KEY on `candidate_id` → `candidate.id` ON DELETE CASCADE

**Indexes:**
- `idx_application_job_id` on `job_id`
- `idx_application_candidate_id` on `candidate_id`
- `idx_application_status` on `status`
- `idx_application_applied_at` on `applied_at`

## Relationships

1. **Job → JobApplication**: One-to-Many
   - One job can have many applications
   - Cascade delete: When a job is deleted, all its applications are deleted

2. **Candidate → JobApplication**: One-to-Many
   - One candidate can have many applications
   - Cascade delete: When a candidate is deleted, all their applications are deleted

3. **JobApplication**: Many-to-Many relationship between Job and Candidate
   - Junction table with additional fields (status, cover_letter, etc.)
   - Unique constraint ensures one application per candidate per job

## Sample Data Structures

### Job.requirements (JSONB)
```json
[
  "5+ years of experience in Node.js",
  "Bachelor's degree in Computer Science",
  "Experience with NestJS framework",
  "Strong problem-solving skills"
]
```

### Job.benefits (JSONB)
```json
[
  "Health insurance",
  "Remote work options",
  "Flexible working hours",
  "Professional development budget"
]
```

### Candidate.skills (JSONB)
```json
[
  "JavaScript",
  "TypeScript",
  "Node.js",
  "NestJS",
  "PostgreSQL",
  "MikroORM"
]
```

### Candidate.experience (JSONB)
```json
[
  {
    "company": "Tech Corp",
    "position": "Senior Developer",
    "startDate": "2020-01-01",
    "endDate": "2023-12-31",
    "description": "Led development team..."
  }
]
```

### Candidate.education (JSONB)
```json
[
  {
    "institution": "University of Technology",
    "degree": "Bachelor of Science",
    "field": "Computer Science",
    "graduationYear": 2019
  }
]
```

## Query Patterns

### Common Queries

1. **Get all published jobs**
   ```sql
   SELECT * FROM job 
   WHERE status = 'PUBLISHED' 
   AND (expires_at IS NULL OR expires_at > NOW())
   ORDER BY posted_at DESC;
   ```

2. **Get applications for a job**
   ```sql
   SELECT ja.*, c.email, c.first_name, c.last_name
   FROM job_application ja
   JOIN candidate c ON ja.candidate_id = c.id
   WHERE ja.job_id = :jobId
   ORDER BY ja.applied_at DESC;
   ```

3. **Get applications for a candidate**
   ```sql
   SELECT ja.*, j.title, j.company, j.status as job_status
   FROM job_application ja
   JOIN job j ON ja.job_id = j.id
   WHERE ja.candidate_id = :candidateId
   ORDER BY ja.applied_at DESC;
   ```

4. **Check for duplicate application**
   ```sql
   SELECT COUNT(*) FROM job_application
   WHERE job_id = :jobId AND candidate_id = :candidateId;
   ```

## Migration Notes

- All tables use UUID as primary key
- All tables have `created_at` and `updated_at` timestamps
- Foreign keys use CASCADE delete
- JSONB fields allow flexible schema for complex data
- Indexes are created for frequently queried fields
- Unique constraints prevent data duplication

