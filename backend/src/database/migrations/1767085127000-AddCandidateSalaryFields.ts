import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration: Add Salary and Company Fields to Candidate Table
 * Adds currentCompany, currentSalary, and expectedSalary columns to the candidate table
 */
export class AddCandidateSalaryFields1767085127000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('candidate');
    if (!table) {
      throw new Error('Candidate table does not exist');
    }

    // Add currentCompany column (if not exists)
    const currentCompanyColumn = table.findColumnByName('currentCompany');
    if (!currentCompanyColumn) {
      await queryRunner.addColumn(
        'candidate',
        new TableColumn({
          name: 'currentCompany',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // Add currentSalary column (JSONB) (if not exists)
    const currentSalaryColumn = table.findColumnByName('currentSalary');
    if (!currentSalaryColumn) {
      await queryRunner.addColumn(
        'candidate',
        new TableColumn({
          name: 'currentSalary',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }

    // Add expectedSalary column (JSONB) (if not exists)
    const expectedSalaryColumn = table.findColumnByName('expectedSalary');
    if (!expectedSalaryColumn) {
      await queryRunner.addColumn(
        'candidate',
        new TableColumn({
          name: 'expectedSalary',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns in reverse order
    await queryRunner.dropColumn('candidate', 'expectedSalary');
    await queryRunner.dropColumn('candidate', 'currentSalary');
    await queryRunner.dropColumn('candidate', 'currentCompany');
  }
}

