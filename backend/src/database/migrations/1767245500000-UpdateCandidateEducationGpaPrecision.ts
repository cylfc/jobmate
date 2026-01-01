import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Update Candidate Education GPA Precision
 * Increases precision from 3 to 4 for gpa and gpa_scale columns to support values up to 99.99
 */
export class UpdateCandidateEducationGpaPrecision1767245500000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tableExists = await queryRunner.hasTable('candidate_education');
    if (!tableExists) {
      return; // Table doesn't exist, skip migration
    }

    // Get table to check for columns
    const table = await queryRunner.getTable('candidate_education');
    if (!table) {
      return; // Table not found, skip migration
    }

    // Update gpa column precision from 3,2 to 4,2 (if column exists)
    const gpaColumn = table.findColumnByName('gpa');
    if (gpaColumn) {
      await queryRunner.query(`
        ALTER TABLE "candidate_education" 
        ALTER COLUMN "gpa" TYPE DECIMAL(4,2)
      `);
    }

    // Update gpa_scale column precision from 3,2 to 4,2 (if column exists)
    const gpaScaleColumn = table.findColumnByName('gpa_scale');
    if (gpaScaleColumn) {
      await queryRunner.query(`
        ALTER TABLE "candidate_education" 
        ALTER COLUMN "gpa_scale" TYPE DECIMAL(4,2)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tableExists = await queryRunner.hasTable('candidate_education');
    if (!tableExists) {
      return; // Table doesn't exist, skip migration
    }

    // Get table to check for columns
    const table = await queryRunner.getTable('candidate_education');
    if (!table) {
      return; // Table not found, skip migration
    }

    // Revert gpa column back to 3,2 (if column exists)
    const gpaColumn = table.findColumnByName('gpa');
    if (gpaColumn) {
      await queryRunner.query(`
        ALTER TABLE "candidate_education" 
        ALTER COLUMN "gpa" TYPE DECIMAL(3,2)
      `);
    }

    // Revert gpa_scale column back to 3,2 (if column exists)
    const gpaScaleColumn = table.findColumnByName('gpa_scale');
    if (gpaScaleColumn) {
      await queryRunner.query(`
        ALTER TABLE "candidate_education" 
        ALTER COLUMN "gpa_scale" TYPE DECIMAL(3,2)
      `);
    }
  }
}
