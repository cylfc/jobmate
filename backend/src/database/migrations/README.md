# Database Migrations

This directory contains TypeORM migration files for the JobMate backend database.

## Migration Commands

### Run Migrations
```bash
npm run migration:run
```
Runs all pending migrations against the database.

### Revert Last Migration
```bash
npm run migration:revert
```
Reverts the last executed migration.

### Show Migration Status
```bash
npm run migration:show
```
Shows which migrations have been executed and which are pending.

### Generate New Migration
```bash
npm run migration:generate src/database/migrations/YourMigrationName
```
Generates a new migration file based on entity changes.

### Create Empty Migration
```bash
npm run migration:create src/database/migrations/YourMigrationName
```
Creates an empty migration file that you can fill in manually.

## Migration Files

- `1738000000000-CreateUserSettings.ts` - Creates the `user_settings` table with JSONB columns for user preferences

## Best Practices

1. **Always test migrations** in development before applying to production
2. **Never modify existing migrations** - create new ones instead
3. **Use descriptive names** for migration files
4. **Include both `up` and `down` methods** for rollback capability
5. **Review generated migrations** before committing

## Production Deployment

In production, migrations are automatically run when the application starts (if `migrationsRun: true` is set in TypeORM config).

Alternatively, you can run migrations manually before starting the application:
```bash
npm run migration:run
npm run start:prod
```

## Troubleshooting

If you encounter issues:

1. Check database connection settings in `.env`
2. Ensure the database exists
3. Verify migration files are in the correct directory
4. Check TypeORM logs for detailed error messages

