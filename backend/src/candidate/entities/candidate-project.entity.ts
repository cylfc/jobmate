import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Candidate } from './candidate.entity';

@Entity('candidate_project')
@Index(['candidate'])
@Index(['startDate', 'endDate'])
export class CandidateProject extends BaseEntity {
  @ManyToOne(() => Candidate, (candidate) => candidate.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'boolean', default: false })
  isCurrent!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  position?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role?: string; // Developer, Lead, Architect, etc.

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: '[]' })
  achievements!: string[];

  @Column({ type: 'text', array: true, default: [] })
  technologiesUsed!: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  projectUrl?: string;

  @Column({ type: 'integer', default: 0 })
  orderIndex!: number;
}

