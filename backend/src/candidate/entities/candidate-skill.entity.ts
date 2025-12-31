import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Candidate } from './candidate.entity';

@Entity('candidate_skill')
@Unique(['candidate', 'name'])
@Index(['candidate'])
@Index(['name'])
@Index(['skillType'])
export class CandidateSkill extends BaseEntity {
  @ManyToOne(() => Candidate, (candidate) => candidate.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 50, default: 'technical' })
  skillType!: string; // technical, language, soft, certification

  @Column({ type: 'varchar', length: 50, nullable: true })
  level?: string; // beginner, intermediate, advanced, expert, native (for languages)

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  yearsOfExperience?: number; // For technical skills

  @Column({ type: 'integer', nullable: true })
  proficiencyPercentage?: number; // 0-100

  @Column({ type: 'date', nullable: true })
  lastUsedDate?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 0 })
  orderIndex!: number;
}

