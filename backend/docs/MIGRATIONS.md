# Database Migrations Guide

## Overview

This project uses TypeORM migrations to manage database schema changes. Migrations ensure that database changes are version-controlled and can be applied consistently across different environments.

## Setup

### Prerequisites

- PostgreSQL database running
- Environment variables configured in `.env` file
- Dependencies installed: `npm install` or `pnpm install`

### Required Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jobmate_db
NODE_ENV=development
```

## Migration Commands

### Run Migrations

```bash
npm run migration:run
```

Runs all pending migrations against the database. This command:
- Connects to the database using settings from `.env`
- Executes all migrations that haven't been run yet
- Updates the `migrations` table to track executed migrations

### Revert Last Migration

```bash
npm run migration:revert
```

Reverts the last executed migration. Useful for testing or fixing issues.

### Show Migration Status

```bash
npm run migration:show
```

Shows which migrations have been executed and which are pending.

### Generate New Migration

```bash
npm run migration:generate src/database/migrations/YourMigrationName
```

Generates a new migration file based on entity changes. TypeORM compares your entities with the current database schema and generates the necessary SQL.

**Example:**
```bash
npm run migration:generate src/database/migrations/AddNewColumnToUser
```

### Create Empty Migration

```bash
npm run migration:create src/database/migrations/YourMigrationName
```

Creates an empty migration file that you can fill in manually. Use this when you need custom SQL or complex migrations.

**Example:**
```bash
npm run migration:create src/database/migrations/CustomDataMigration
```

## Migration Files

All migration files are located in `src/database/migrations/`.

### Current Migrations

- `1738000000000-CreateUserSettings.ts` - Creates the `user_settings` table with JSONB columns for user preferences

### Migration File Naming

Migration files follow the pattern: `{timestamp}-{Description}.ts`

The timestamp ensures migrations run in the correct order.

## Development Workflow

### Adding a New Entity or Changing Schema

1. **Modify your entity file** (e.g., `src/settings/entities/user-settings.entity.ts`)

2. **Generate migration:**
   ```bash
   npm run migration:generate src/database/migrations/YourMigrationName
   ```

3. **Review the generated migration** file to ensure it's correct

4. **Test the migration:**
   ```bash
   npm run migration:run
   ```

5. **If needed, revert and fix:**
   ```bash
   npm run migration:revert
   # Fix the migration file
   npm run migration:run
   ```

### Best Practices

1. **Always test migrations** in development before applying to production
2. **Never modify existing migrations** - create new ones instead
3. **Use descriptive names** for migration files
4. **Include both `up` and `down` methods** for rollback capability
5. **Review generated migrations** before committing
6. **Commit migration files** to version control
7. **Document complex migrations** with comments

## Production Deployment

### Automatic Migration (Recommended)

In production, migrations are automatically run when the application starts if `migrationsRun: true` is set in TypeORM config (see `src/database/config/typeorm.config.ts`).

This ensures the database is always up-to-date when deploying.

### Manual Migration

Alternatively, you can run migrations manually before starting the application:

```bash
# Run migrations
npm run migration:run

# Start the application
npm run start:prod
```

### Docker Deployment

If using Docker, you can run migrations in a separate step:

```dockerfile
# In your Dockerfile or docker-compose.yml
RUN npm run migration:run
CMD ["npm", "run", "start:prod"]
```

Or use an init container in Kubernetes to run migrations before the main application starts.

## Troubleshooting

### Migration Fails

1. **Check database connection:**
   - Verify `.env` file has correct database credentials
   - Ensure PostgreSQL is running
   - Test connection: `psql -h localhost -U postgres -d jobmate_db`

2. **Check migration file syntax:**
   - Ensure TypeScript compiles: `npm run build`
   - Review migration file for syntax errors

3. **Check migration status:**
   ```bash
   npm run migration:show
   ```

4. **Revert and retry:**
   ```bash
   npm run migration:revert
   # Fix the issue
   npm run migration:run
   ```

### Migration Already Executed

If a migration shows as already executed but you need to re-run it:

1. **Manually remove from migrations table:**
   ```sql
   DELETE FROM migrations WHERE name = 'YourMigrationName';
   ```

2. **Re-run the migration:**
   ```bash
   npm run migration:run
   ```

⚠️ **Warning:** Only do this in development. Never modify the migrations table in production.

### Database Out of Sync

If your database schema doesn't match your entities:

1. **In development:** Set `synchronize: true` temporarily (not recommended for production)
2. **Generate a migration** to sync:
   ```bash
   npm run migration:generate src/database/migrations/SyncSchema
   ```
3. **Review and run** the generated migration

## Migration File Structure

A typical migration file looks like this:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class YourMigrationName1234567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration logic here
    // This runs when applying the migration
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback logic here
    // This runs when reverting the migration
  }
}
```

## Additional Resources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- Project README: `README.md`

