import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration: Add Salary and Company Fields to Candidate Table
 * Adds currentCompany, currentSalary, and expectedSalary columns to the candidate table
 */
export class AddCandidateSalaryFields1767085127000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add currentCompany column
    await queryRunner.addColumn(
      'candidate',
      new TableColumn({
        name: 'currentCompany',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Add currentSalary column (JSONB)
    await queryRunner.addColumn(
      'candidate',
      new TableColumn({
        name: 'currentSalary',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // Add expectedSalary column (JSONB)
    await queryRunner.addColumn(
      'candidate',
      new TableColumn({
        name: 'expectedSalary',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns in reverse order
    await queryRunner.dropColumn('candidate', 'expectedSalary');
    await queryRunner.dropColumn('candidate', 'currentSalary');
    await queryRunner.dropColumn('candidate', 'currentCompany');
  }
}

