export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type JobStatus = 'none' | 'saved' | 'interested' | 'applied' | 'interview' | 'rejected' | 'closed';

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  location: string;
  remote: boolean;
  workMode: WorkMode;
  employmentType: EmploymentType;
  experienceMin?: number | null;
  experienceMax?: number | null;
  experienceLabel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency: string;
  salaryFormatted?: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  benefits: string[];
  postedAt?: string | null; // ISO 8601 UTC timestamp; null if source does not provide it
  postedAgo?: string | null;
  source: string;
  sourceUrl: string;
  candidateCount?: number | null;
  applicationCount?: number | null;
  deadline?: string | null;
  nexaMatchScore?: number | null; // 0 to 100% (informative only)
  matchReasons: string[];
  isSaved?: boolean;
  status: JobStatus;
}

export interface JobPreferences {
  id: string;
  userId: string;
  jobTitles: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency: string;
  experienceLevels: string[];
  locations: string[];
  workModes: string[];
  employmentTypes: string[];
  skills: string[];
  companies: string[];
  sources: string[];
  dailySearchEnabled: boolean;
  nextSearch: string;
  lastSearchAt?: string | null;
  lastSearchStatus: string;
  lastSearchCount: number;
  updatedAt: string;
}

export interface JobPreferenceUpdatePayload {
  jobTitles: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency: string;
  experienceLevels: string[];
  locations: string[];
  workModes: string[];
  employmentTypes: string[];
  skills: string[];
  companies?: string[];
  sources?: string[];
  dailySearchEnabled?: boolean;
}

export interface ImmediateJobSearchRequest {
  jobTitle?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experience?: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  skills?: string[];
  postedWithin?: string;
  sortBy?: 'newest' | 'oldest' | 'best_match' | 'relevance' | 'salary_high' | 'salary_low';
}

export interface JobSearchResponse {
  total: number;
  querySummary: string;
  jobs: JobPosting[];
  sourcesSearched: string[];
}
