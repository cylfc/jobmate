/**
 * Shared Transformers
 * Data transformation utilities for converting backend entities to frontend types
 */

export { BaseTransformer } from "./base-transformer";
export {
  JobTransformer,
  jobTransformer,
  type BackendJob,
} from "./job-transformer";
export {
  CandidateTransformer,
  candidateTransformer,
  type BackendCandidate,
} from "./candidate-transformer";
