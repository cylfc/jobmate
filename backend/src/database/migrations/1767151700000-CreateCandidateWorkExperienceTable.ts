import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: Create Candidate Work Experience Table
 * Creates table for storing detailed work experience information
 */
export class CreateCandidateWorkExperienceTable1767151700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const tableExists = await queryRunner.hasTable('candidate_work_experience');
    if (tableExists) {
      return; // Table already exists, skip migration
    }

    await queryRunner.createTable(
      new Table({
        name: 'candidate_work_experience',
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
            name: 'company_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'position',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
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
            name: 'employment_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'location',
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
    const table = await queryRunner.getTable('candidate_work_experience');
    if (!table) {
      throw new Error('Candidate work experience table was not created');
    }

    // Create foreign key (if not exists)
    const foreignKeyExists = table.foreignKeys.some(
      (fk) => fk.columnNames.indexOf('candidate_id') !== -1,
    );
    if (!foreignKeyExists) {
      await queryRunner.createForeignKey(
        'candidate_work_experience',
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
      (idx) => idx.name === 'idx_work_exp_candidate_id',
    );
    if (!indexCandidateIdExists) {
      await queryRunner.createIndex(
        'candidate_work_experience',
        new TableIndex({
          name: 'idx_work_exp_candidate_id',
          columnNames: ['candidate_id'],
        }),
      );
    }

    const indexDatesExists = table.indices.some(
      (idx) => idx.name === 'idx_work_exp_dates',
    );
    if (!indexDatesExists) {
      await queryRunner.createIndex(
        'candidate_work_experience',
        new TableIndex({
          name: 'idx_work_exp_dates',
          columnNames: ['start_date', 'end_date'],
        }),
      );
    }

    const indexCompanyExists = table.indices.some(
      (idx) => idx.name === 'idx_work_exp_company',
    );
    if (!indexCompanyExists) {
      await queryRunner.createIndex(
        'candidate_work_experience',
        new TableIndex({
          name: 'idx_work_exp_company',
          columnNames: ['company_name'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('candidate_work_experience');
  }
}

