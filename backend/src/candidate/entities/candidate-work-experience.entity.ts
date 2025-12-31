import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Candidate } from './candidate.entity';

@Entity('candidate_work_experience')
@Index(['candidate'])
@Index(['startDate', 'endDate'])
@Index(['companyName'])
export class CandidateWorkExperience extends BaseEntity {
  @ManyToOne(() => Candidate, (candidate) => candidate.workExperiences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({ type: 'varchar', length: 255 })
  companyName!: string;

  @Column({ type: 'varchar', length: 255 })
  position!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role?: string; // Senior Developer, Team Lead, Architect, etc.

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'boolean', default: false })
  isCurrent!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employmentType?: string; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: '[]' })
  achievements!: string[];

  @Column({ type: 'text', array: true, default: [] })
  technologiesUsed!: string[];

  @Column({ type: 'integer', default: 0 })
  orderIndex!: number;
}

