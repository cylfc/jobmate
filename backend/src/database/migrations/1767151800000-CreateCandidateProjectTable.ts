import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: Create Candidate Project Table
 * Creates table for storing detailed project information
 */
export class CreateCandidateProjectTable1767151800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const tableExists = await queryRunner.hasTable('candidate_project');
    if (tableExists) {
      return; // Table already exists, skip migration
    }

    await queryRunner.createTable(
      new Table({
        name: 'candidate_project',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'candidate_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'company',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'is_current',
            type: 'boolean',
            default: false,
          },
          {
            name: 'position',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'achievements',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'technologies_used',
            type: 'text',
            isArray: true,
            default: "'{}'",
          },
          {
            name: 'project_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'order_index',
            type: 'integer',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Get table to check for existing constraints/indexes
    const table = await queryRunner.getTable('candidate_project');
    if (!table) {
      throw new Error('Candidate project table was not created');
    }

    // Create foreign key (if not exists)
    const foreignKeyExists = table.foreignKeys.some(
      (fk) => fk.columnNames.indexOf('candidate_id') !== -1,
    );
    if (!foreignKeyExists) {
      await queryRunner.createForeignKey(
        'candidate_project',
        new TableForeignKey({
          columnNames: ['candidate_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'candidate',
          onDelete: 'CASCADE',
        }),
      );
    }

    // Create indexes (if not exists)
    const indexCandidateIdExists = table.indices.some(
      (idx) => idx.name === 'idx_project_candidate_id',
    );
    if (!indexCandidateIdExists) {
      await queryRunner.createIndex(
        'candidate_project',
        new TableIndex({
          name: 'idx_project_candidate_id',
          columnNames: ['candidate_id'],
        }),
      );
    }

    const indexDatesExists = table.indices.some(
      (idx) => idx.name === 'idx_project_dates',
    );
    if (!indexDatesExists) {
      await queryRunner.createIndex(
        'candidate_project',
        new TableIndex({
          name: 'idx_project_dates',
          columnNames: ['start_date', 'end_date'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('candidate_project');
  }
}

