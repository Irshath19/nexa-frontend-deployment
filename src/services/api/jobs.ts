import api from './client';
import type {
  JobPosting,
  JobPreferences,
  JobPreferenceUpdatePayload,
  ImmediateJobSearchRequest,
  JobSearchResponse,
  JobStatus,
} from '@/types/jobs';
import type { ApiResponse } from '@/types';

export const jobsApi = {
  /** Get user's daily search preferences */
  getPreferences: () =>
    api.get<ApiResponse<JobPreferences>>('/jobs/preferences').then((r) => r.data),

  /** Update user's daily search preferences */
  updatePreferences: (payload: JobPreferenceUpdatePayload) =>
    api.put<ApiResponse<JobPreferences>>('/jobs/preferences', payload).then((r) => r.data),

  /** Get today's automatically discovered job opportunities (Daily 8:00 AM IST) */
  getDailyOpportunities: () =>
    api.get<ApiResponse<JobSearchResponse>>('/jobs/daily').then((r) => r.data),

  /** Trigger an immediate run of the Daily Job Search Agent */
  runDailySearch: () =>
    api.post<ApiResponse<JobSearchResponse>>('/jobs/daily/run').then((r) => r.data),

  /** Immediate on-demand job search */
  searchImmediate: (payload: ImmediateJobSearchRequest) =>
    api.post<ApiResponse<JobSearchResponse>>('/jobs/search', payload).then((r) => r.data),

  /** Get all saved & tracked jobs */
  getSavedJobs: () =>
    api.get<ApiResponse<JobPosting[]>>('/jobs/saved').then((r) => r.data),

  /** Save a job opportunity */
  saveJob: (jobId: string, jobData?: JobPosting) =>
    api
      .post<ApiResponse<{ message: string; jobId: string; isSaved: boolean }>>(
        `/jobs/${jobId}/save`,
        jobData
      )
      .then((r) => r.data),

  /** Remove job from saved */
  removeSavedJob: (jobId: string) =>
    api
      .delete<ApiResponse<{ message: string; jobId: string; isSaved: boolean }>>(
        `/jobs/${jobId}/save`
      )
      .then((r) => r.data),

  /** Update job application status */
  updateJobStatus: (jobId: string, status: JobStatus, jobData?: JobPosting) =>
    api
      .post<ApiResponse<{ message: string; jobId: string; status: JobStatus }>>(
        `/jobs/${jobId}/status`,
        { status, jobData }
      )
      .then((r) => r.data),

  /** Get detailed single job by ID */
  getJobDetails: (jobId: string) =>
    api.get<ApiResponse<JobPosting>>(`/jobs/${jobId}`).then((r) => r.data),
};
