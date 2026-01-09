import { Candidate } from '@candidate/entities/candidate.entity';

export type CandidateResponse = Candidate;

export type CandidateListResponse = {
  items: Candidate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

