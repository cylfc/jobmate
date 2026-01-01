import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Candidate } from './candidate.entity';

@Entity('candidate_education')
@Index(['candidate'])
@Index(['startDate', 'endDate'])
export class CandidateEducation extends BaseEntity {
  @ManyToOne(() => Candidate, (candidate) => candidate.educations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({ type: 'varchar', length: 255 })
  institution!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  major?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  degreeType?: string; // Bachelor, Master, PhD, Diploma, Certificate, etc.

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  gpa?: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 4.0 })
  gpaScale!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 0 })
  orderIndex!: number;
}

