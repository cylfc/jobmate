/**
 * Dashboard Pipeline Response Type
 */
export type PipelineStageId = 'uploaded' | 'matched' | 'contacted' | 'interviewing' | 'offer';

export interface PipelineStage {
  id: PipelineStageId;
  count: number;
}

export interface DashboardPipelineResponse {
  stages: PipelineStage[];
}

