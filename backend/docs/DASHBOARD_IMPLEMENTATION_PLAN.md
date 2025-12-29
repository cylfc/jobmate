# Dashboard Module Implementation Plan

## Overview

This document outlines the implementation plan for the Dashboard module in the backend. The dashboard provides aggregated statistics, KPIs, and insights for recruiters and users to monitor their hiring pipeline.

## Architecture

The Dashboard module follows NestJS best practices and integrates with existing modules:
- **Job Module**: For job statistics
- **Candidate Module**: For candidate statistics
- **JobApplication Module**: For application pipeline statistics
- **Auth Module**: For user context and permissions

## Module Structure

```
backend/src/dashboard/
├── dashboard.module.ts          # Module definition
├── dashboard.controller.ts      # API endpoints
├── services/
│   ├── dashboard.service.ts     # Main dashboard service
│   ├── kpi.service.ts           # KPI calculations
│   ├── pipeline.service.ts       # Pipeline aggregations
│   └── activity.service.ts      # Activity tracking
├── models/
│   ├── dto/
│   │   ├── query-dashboard.dto.ts
│   │   └── dashboard-filters.dto.ts
│   └── types/
│       ├── dashboard-kpis.type.ts
│       ├── dashboard-pipeline.type.ts
│       └── dashboard-activity.type.ts
└── utils/
    └── dashboard-aggregations.ts  # SQL aggregation helpers
```

## API Endpoints

### 1. GET /dashboard/kpis
**Description**: Get dashboard KPIs (Key Performance Indicators)

**Response**:
```typescript
{
  openJobs: number;              // Count of published jobs
  candidatesInPipeline: number;  // Total candidates in pipeline
  matchesThisWeek: number;       // Matches created this week
  averageMatchScore: number;     // Average match score (0-100)
  timeToShortlist: number;      // Average days to shortlist
}
```

**Business Logic**:
- `openJobs`: Count jobs with status = 'PUBLISHED' and created by current user
- `candidatesInPipeline`: Count distinct candidates with applications
- `matchesThisWeek`: Count applications created in last 7 days
- `averageMatchScore`: Average of match scores (if available, otherwise 0)
- `timeToShortlist`: Average days between job creation and first application with status 'SHORTLISTED'

**Query Filters**:
- Optional `userId` filter (defaults to current user)
- Optional date range filters

### 2. GET /dashboard/active-jobs
**Description**: Get list of active jobs with statistics

**Query Parameters**:
- `limit` (optional, default: 10)
- `status` (optional): Filter by job status

**Response**:
```typescript
{
  jobs: [
    {
      id: string;
      title: string;
      status: 'published' | 'draft' | 'closed';
      candidatesCount: number;
      topMatchScore: number | null;
      lastActivityAt: string;      // ISO string
      lastMatchingRunAt: string | null; // ISO string
    }
  ]
}
```

**Business Logic**:
- Get jobs created by current user
- Count applications per job
- Get highest match score per job (if available)
- Get last activity (most recent application or job update)
- Get last matching run timestamp (if available)

### 3. GET /dashboard/pipeline
**Description**: Get candidate pipeline stage counts

**Response**:
```typescript
{
  stages: [
    {
      id: 'uploaded' | 'matched' | 'contacted' | 'interviewing' | 'offer';
      count: number;
    }
  ]
}
```

**Business Logic**:
- `uploaded`: Count candidates created by user
- `matched`: Count candidates with at least one application
- `contacted`: Count applications with status 'REVIEWING' or 'SHORTLISTED'
- `interviewing`: Count applications with status 'INTERVIEWED'
- `offer`: Count applications with status 'ACCEPTED'

**Note**: Pipeline stages map to application statuses:
- `uploaded` → Candidate exists
- `matched` → Application exists
- `contacted` → Application status: REVIEWING, SHORTLISTED
- `interviewing` → Application status: INTERVIEWED
- `offer` → Application status: ACCEPTED

### 4. GET /dashboard/matching-health
**Description**: Get matching health metrics and score distribution

**Response**:
```typescript
{
  scoreDistribution: [
    {
      label: string;  // e.g., "0-20", "20-40", "40-60", "60-80", "80-100"
      ratio: number;  // 0-1, share of matches in this bin
      count?: number; // Optional absolute count
    }
  ];
  highQualityRatio: number;  // 0-1, share of matches with score > 80
  lowQualityRatio: number;  // 0-1, share of matches with score < 60
}
```

**Business Logic**:
- Aggregate match scores into bins: 0-20, 20-40, 40-60, 60-80, 80-100
- Calculate ratio of high-quality matches (score > 80)
- Calculate ratio of low-quality matches (score < 60)
- Only include applications with match scores

**Note**: Match scores are currently not stored in the database. This endpoint will return default/empty data until matching functionality is implemented.

### 5. GET /dashboard/alerts
**Description**: Get dashboard alerts and tasks

**Response**:
```typescript
{
  alerts: [
    {
      id: string;
      type: string;
      message: string;
      actionUrl: string;
      severity: 'info' | 'warning' | 'critical';
    }
  ]
}
```

**Business Logic**:
- Generate alerts based on:
  - Jobs without applications (warning)
  - Jobs without matching runs (info)
  - Expired jobs (critical)
  - High number of pending applications (info)

### 6. GET /dashboard/activities
**Description**: Get recent activity timeline

**Query Parameters**:
- `limit` (optional, default: 20)
- `cursor` (optional): Pagination cursor

**Response**:
```typescript
{
  events: [
    {
      id: string;
      type: 'cv_uploaded' | 'job_saved' | 'matching_completed' | 'interview_scheduled';
      occurredAt: string;  // ISO string
      meta?: Record<string, unknown>;  // Additional metadata
    }
  ];
  nextCursor?: string | null;
  hasMore?: boolean;
}
```

**Business Logic**:
- Aggregate activities from:
  - Candidate creation → `cv_uploaded`
  - Job creation/update → `job_saved`
  - Application creation → `matching_completed` (if match score exists)
  - Application status change to INTERVIEWED → `interview_scheduled`
- Order by `occurredAt` DESC
- Support cursor-based pagination

## Database Queries

### KPIs Query Example
```sql
-- Open Jobs
SELECT COUNT(*) FROM job 
WHERE status = 'PUBLISHED' AND created_by_id = :userId;

-- Candidates in Pipeline
SELECT COUNT(DISTINCT candidate_id) 
FROM job_application ja
JOIN job j ON ja.job_id = j.id
WHERE j.created_by_id = :userId;

-- Matches This Week
SELECT COUNT(*) FROM job_application
WHERE created_at >= NOW() - INTERVAL '7 days'
AND job_id IN (SELECT id FROM job WHERE created_by_id = :userId);
```

### Pipeline Query Example
```sql
-- Pipeline Stages
SELECT 
  COUNT(DISTINCT c.id) as uploaded,
  COUNT(DISTINCT CASE WHEN ja.id IS NOT NULL THEN c.id END) as matched,
  COUNT(DISTINCT CASE WHEN ja.status IN ('REVIEWING', 'SHORTLISTED') THEN c.id END) as contacted,
  COUNT(DISTINCT CASE WHEN ja.status = 'INTERVIEWED' THEN c.id END) as interviewing,
  COUNT(DISTINCT CASE WHEN ja.status = 'ACCEPTED' THEN c.id END) as offer
FROM candidate c
LEFT JOIN job_application ja ON ja.candidate_id = c.id
LEFT JOIN job j ON ja.job_id = j.id
WHERE c.user_id = :userId
  AND (j.created_by_id = :userId OR j.id IS NULL);
```

## Implementation Steps

### Phase 1: Core Module Setup
1. Create `dashboard.module.ts`
2. Create `dashboard.controller.ts` with all endpoints
3. Create `dashboard.service.ts` as main service
4. Register module in `app.module.ts`

### Phase 2: KPI Service
1. Create `kpi.service.ts`
2. Implement KPI calculations using TypeORM QueryBuilder
3. Add caching for performance (optional, future enhancement)

### Phase 3: Pipeline Service
1. Create `pipeline.service.ts`
2. Implement pipeline stage aggregations
3. Optimize queries with proper indexes

### Phase 4: Activity Service
1. Create `activity.service.ts`
2. Implement activity aggregation from multiple sources
3. Add cursor-based pagination

### Phase 5: DTOs and Types
1. Create DTOs for query parameters
2. Create response types
3. Add Swagger documentation

### Phase 6: Integration
1. Update frontend server routes to call backend APIs
2. Test all endpoints
3. Add error handling

## Security Considerations

1. **User Isolation**: All queries must filter by `userId` or `createdById` to ensure users only see their own data
2. **JWT Authentication**: All endpoints require JWT authentication via `JwtAuthGuard`
3. **Role-Based Access**: Consider role-based filtering (recruiter vs. admin) if needed

## Performance Considerations

1. **Database Indexes**: Ensure indexes on:
   - `job.created_by_id`
   - `job.status`
   - `candidate.user_id`
   - `job_application.job_id`
   - `job_application.candidate_id`
   - `job_application.status`
   - `job_application.created_at`

2. **Query Optimization**:
   - Use `QueryBuilder` for complex aggregations
   - Consider materialized views for heavy aggregations (future)
   - Add pagination for large datasets

3. **Caching** (Future Enhancement):
   - Cache KPIs for 5 minutes
   - Cache pipeline stats for 1 minute
   - Invalidate cache on data changes

## Testing Strategy

1. **Unit Tests**: Test service methods with mocked repositories
2. **Integration Tests**: Test API endpoints with test database
3. **E2E Tests**: Test full flow from frontend to backend

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live dashboard updates
2. **Custom Date Ranges**: Allow users to filter by custom date ranges
3. **Export Functionality**: Export dashboard data as CSV/PDF
4. **Advanced Analytics**: More detailed analytics and trends
5. **Match Score Integration**: Integrate with matching algorithm when available

## Dependencies

- `@nestjs/common`
- `@nestjs/typeorm`
- `typeorm`
- Existing modules: `JobModule`, `CandidateModule`, `JobApplicationModule`, `AuthModule`

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Query Builder](https://typeorm.io/select-query-builder)
- Frontend Dashboard Types: `web/layers/dashboard/types/dashboard.ts`

