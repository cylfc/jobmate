import {
  Entity,
  Column,
  ManyToOne,
  Unique,
  Index,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Job } from '../../job/entities/job.entity';
import { Candidate } from '../../candidate/entities/candidate.entity';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWED = 'INTERVIEWED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}

@Entity('job_application')
@Unique(['job', 'candidate'])
@Index(['job'])
@Index(['candidate'])
@Index(['status'])
@Index(['appliedAt'])
export class JobApplication extends BaseEntity {
  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status!: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  coverLetter?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  resumeUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  appliedAt!: Date;
}

