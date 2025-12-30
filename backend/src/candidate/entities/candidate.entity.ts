import {
  Entity,
  Column,
  Index,
  Unique,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { JobApplication } from '../../job-application/entities/job-application.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('candidate')
@Unique(['email'])
@Index(['email'])
@Index(['userId'])
export class Candidate extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  resumeUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  currentCompany?: string;

  @Column({ type: 'jsonb', nullable: true })
  currentSalary?: { amount: number; currency: string };

  @Column({ type: 'jsonb', nullable: true })
  expectedSalary?: { min: number; max: number; currency: string };

  @Column({ type: 'jsonb', default: '[]' })
  skills: string[] = [];

  @Column({ type: 'jsonb', default: '[]' })
  experience: Record<string, unknown>[] = [];

  @Column({ type: 'jsonb', default: '[]' })
  education: Record<string, unknown>[] = [];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @OneToMany(() => JobApplication, (application) => application.candidate)
  applications!: JobApplication[];
}

