import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: Create UserSettings Table
 * Creates the user_settings table with JSONB columns for flexible settings storage
 * 
 * To generate a new migration:
 * npm run migration:generate src/database/migrations/CreateUserSettings
 * 
 * To run migrations:
 * npm run migration:run
 */
export class CreateUserSettings1738000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const tableExists = await queryRunner.hasTable('user_settings');
    
    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'user_settings',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'user_id',
              type: 'uuid',
              isUnique: true,
              isNullable: false,
            },
            {
              name: 'notificationSettings',
              type: 'jsonb',
              default: JSON.stringify({
                emailJobMatches: true,
                emailNewCandidates: true,
                emailWeeklyDigest: true,
                pushJobMatches: true,
                pushNewCandidates: true,
                pushMessages: true,
                inAppJobMatches: true,
                inAppNewCandidates: true,
                inAppMessages: true,
              }),
            },
            {
              name: 'systemConfig',
              type: 'jsonb',
              default: JSON.stringify({
                timezone: 'UTC',
                dateFormat: 'YYYY-MM-DD',
                timeFormat: '24h',
                language: 'en',
                theme: 'auto',
              }),
            },
            {
              name: 'securitySettings',
              type: 'jsonb',
              default: JSON.stringify({
                twoFactorEnabled: false,
                sessionTimeout: 30,
                loginNotifications: true,
              }),
            },
            {
              name: 'additionalSettings',
              type: 'jsonb',
              isNullable: true,
              default: '{}',
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true,
      );
    }

    // Create index on user_id for faster lookups (if not exists)
    const table = await queryRunner.getTable('user_settings');
    if (table) {
      const indexExists = table.indices.some(
        (idx) => idx.name === 'IDX_user_settings_user_id',
      );
      if (!indexExists) {
        await queryRunner.createIndex(
          'user_settings',
          new TableIndex({
            name: 'IDX_user_settings_user_id',
            columnNames: ['user_id'],
          }),
        );
      }

      // Create foreign key to user table (if not exists)
      const foreignKeyExists = table.foreignKeys.some(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (!foreignKeyExists) {
        await queryRunner.createForeignKey(
          'user_settings',
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('user_settings');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('user_settings', foreignKey);
      }
    }

    // Drop index
    await queryRunner.dropIndex('user_settings', 'IDX_user_settings_user_id');

    // Drop table
    await queryRunner.dropTable('user_settings');
  }
}

