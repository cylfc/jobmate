import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

/**
 * Migration: Create Candidate Skill Table
 * Creates table for storing detailed skill information with levels and years of experience
 */
export class CreateCandidateSkillTable1767151600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const tableExists = await queryRunner.hasTable('candidate_skill');
    if (tableExists) {
      return; // Table already exists, skip migration
    }

    await queryRunner.createTable(
      new Table({
        name: 'candidate_skill',
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
            name: 'skill_type',
            type: 'varchar',
            length: '50',
            default: "'technical'",
          },
          {
            name: 'level',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'years_of_experience',
            type: 'decimal',
            precision: 4,
            scale: 1,
            isNullable: true,
          },
          {
            name: 'proficiency_percentage',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'last_used_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
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
    const table = await queryRunner.getTable('candidate_skill');
    if (!table) {
      throw new Error('Candidate skill table was not created');
    }

    // Create unique constraint (if not exists)
    const uniqueConstraintExists = table.uniques.some(
      (uq) => uq.name === 'UQ_candidate_skill_candidate_name',
    );
    if (!uniqueConstraintExists) {
      await queryRunner.createUniqueConstraint(
        'candidate_skill',
        new TableUnique({
          name: 'UQ_candidate_skill_candidate_name',
          columnNames: ['candidate_id', 'name'],
        }),
      );
    }

    // Create foreign key (if not exists)
    const foreignKeyExists = table.foreignKeys.some(
      (fk) => fk.columnNames.indexOf('candidate_id') !== -1,
    );
    if (!foreignKeyExists) {
      await queryRunner.createForeignKey(
        'candidate_skill',
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
      (idx) => idx.name === 'idx_skill_candidate_id',
    );
    if (!indexCandidateIdExists) {
      await queryRunner.createIndex(
        'candidate_skill',
        new TableIndex({
          name: 'idx_skill_candidate_id',
          columnNames: ['candidate_id'],
        }),
      );
    }

    const indexNameExists = table.indices.some(
      (idx) => idx.name === 'idx_skill_name',
    );
    if (!indexNameExists) {
      await queryRunner.createIndex(
        'candidate_skill',
        new TableIndex({
          name: 'idx_skill_name',
          columnNames: ['name'],
        }),
      );
    }

    const indexTypeExists = table.indices.some(
      (idx) => idx.name === 'idx_skill_type',
    );
    if (!indexTypeExists) {
      await queryRunner.createIndex(
        'candidate_skill',
        new TableIndex({
          name: 'idx_skill_type',
          columnNames: ['skill_type'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('candidate_skill');
  }
}

