import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateController } from './controllers/candidate.controller';
import { CandidateExperienceController } from './controllers/candidate-experience.controller';
import { CandidateService } from './services/candidate.service';
import { Candidate } from './entities/candidate.entity';
import { CandidateEducation } from './entities/candidate-education.entity';
import { CandidateSkill } from './entities/candidate-skill.entity';
import { CandidateWorkExperience } from './entities/candidate-work-experience.entity';
import { CandidateProject } from './entities/candidate-project.entity';
import { CandidateEducationService } from './services/candidate-education.service';
import { CandidateSkillService } from './services/candidate-skill.service';
import { CandidateWorkExperienceService } from './services/candidate-work-experience.service';
import { CandidateProjectService } from './services/candidate-project.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Candidate,
      CandidateEducation,
      CandidateSkill,
      CandidateWorkExperience,
      CandidateProject,
    ]),
  ],
  controllers: [CandidateController, CandidateExperienceController],
  providers: [
    CandidateService,
    CandidateEducationService,
    CandidateSkillService,
    CandidateWorkExperienceService,
    CandidateProjectService,
  ],
  exports: [
    CandidateService,
    CandidateEducationService,
    CandidateSkillService,
    CandidateWorkExperienceService,
    CandidateProjectService,
  ],
})
export class CandidateModule {}

