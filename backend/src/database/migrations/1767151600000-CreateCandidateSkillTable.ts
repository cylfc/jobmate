import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

/**
 * Migration: Create Candidate Skill Table
 * Creates table for storing detailed skill information with levels and years of experience
 */
export class CreateCandidateSkillTable1767151600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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

    // Create unique constraint (one skill per candidate)
    await queryRunner.createUniqueConstraint(
      'candidate_skill',
      new TableUnique({
        name: 'UQ_candidate_skill_candidate_name',
        columnNames: ['candidate_id', 'name'],
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'candidate_skill',
      new TableForeignKey({
        columnNames: ['candidate_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'candidate',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'candidate_skill',
      new TableIndex({
        name: 'idx_skill_candidate_id',
        columnNames: ['candidate_id'],
      }),
    );

    await queryRunner.createIndex(
      'candidate_skill',
      new TableIndex({
        name: 'idx_skill_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'candidate_skill',
      new TableIndex({
        name: 'idx_skill_type',
        columnNames: ['skill_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('candidate_skill');
  }
}

