import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Globe, DollarSign, Briefcase } from 'lucide-react';
import type { JobPreferences, JobPreferenceUpdatePayload } from '@/types/jobs';
import { cn } from '@/utils';
import { toast } from 'sonner';

interface JobPreferencesModalProps {
  preferences: JobPreferences;
  onClose: () => void;
  onSave: (payload: JobPreferenceUpdatePayload) => Promise<void>;
}

const EXPERIENCE_OPTIONS = [
  'Fresher',
  '0–1 years',
  '1–3 years',
  '3–5 years',
  '5+ years',
];

const WORK_MODE_OPTIONS = ['Remote', 'Hybrid', 'On-site'];
const EMPLOYMENT_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const CURRENCY_OPTIONS = ['INR', 'USD', 'AED', 'EUR', 'GBP'];

export function JobPreferencesModal({
  preferences,
  onClose,
  onSave,
}: JobPreferencesModalProps) {
  const [jobTitles, setJobTitles] = useState<string[]>(preferences.jobTitles || []);
  const [newTitle, setNewTitle] = useState('');

  const [salaryMin, setSalaryMin] = useState<number | ''>(preferences.salaryMin ?? 800000);
  const [salaryMax, setSalaryMax] = useState<number | ''>(preferences.salaryMax ?? 2500000);
  const [salaryCurrency, setSalaryCurrency] = useState(preferences.salaryCurrency || 'INR');

  const [experienceLevels, setExperienceLevels] = useState<string[]>(preferences.experienceLevels || ['1-3 years']);
  const [locations, setLocations] = useState<string[]>(preferences.locations || ['India', 'Remote']);
  const [newLocation, setNewLocation] = useState('');

  const [workModes, setWorkModes] = useState<string[]>(preferences.workModes || ['Remote', 'Hybrid']);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(preferences.employmentTypes || ['Full-time']);

  const [skills, setSkills] = useState<string[]>(preferences.skills || ['Python', 'LLM', 'FastAPI']);
  const [newSkill, setNewSkill] = useState('');

  const [dailySearchEnabled, setDailySearchEnabled] = useState(preferences.dailySearchEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTitle = () => {
    if (newTitle.trim() && !jobTitles.includes(newTitle.trim())) {
      setJobTitles([...jobTitles, newTitle.trim()]);
      setNewTitle('');
    }
  };

  const handleRemoveTitle = (title: string) => {
    setJobTitles(jobTitles.filter((t) => t !== title));
  };

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (loc: string) => {
    setLocations(locations.filter((l) => l !== loc));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const toggleSelection = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (jobTitles.length === 0) {
      toast.error('Please enter at least one target job title.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        jobTitles,
        salaryMin: salaryMin === '' ? null : Number(salaryMin),
        salaryMax: salaryMax === '' ? null : Number(salaryMax),
        salaryCurrency,
        experienceLevels,
        locations,
        workModes,
        employmentTypes,
        skills,
        dailySearchEnabled,
      });
      toast.success('Your daily job search preferences have been updated.');
      onClose();
    } catch (err: any) {
      console.error('Save preferences error:', err);
      toast.error('Unable to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Job Search Preferences
              </h2>
              <p className="text-xs text-zinc-500">
                Configures your daily 8:00 AM IST automated opportunities search.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs scrollbar-thin">
          {/* Daily Search Toggle */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
            <div>
              <p className="font-bold text-indigo-950 dark:text-indigo-200 text-xs">
                Automated Daily Search
              </p>
              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                Run search every morning at 8:00 AM IST and find new matches
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDailySearchEnabled(!dailySearchEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
                dailySearchEnabled ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  dailySearchEnabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Job Titles */}
          <div className="space-y-2">
            <label className="block font-bold text-zinc-800 dark:text-zinc-200">
              Target Job Titles / Designations *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTitle();
                  }
                }}
                placeholder="e.g. AI Engineer, LLM Developer, ML Engineer"
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTitle}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {jobTitles.map((title) => (
                <span
                  key={title}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 font-medium text-xs"
                >
                  {title}
                  <button
                    type="button"
                    onClick={() => handleRemoveTitle(title)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Expected Salary Range */}
          <div className="space-y-2">
            <label className="block font-bold text-zinc-800 dark:text-zinc-200">
              Expected Salary Range
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Currency</span>
                <select
                  value={salaryCurrency}
                  onChange={(e) => setSalaryCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Minimum</span>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 800000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Maximum</span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 2500000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Experience Levels */}
          <div className="space-y-2">
            <label className="block font-bold text-zinc-800 dark:text-zinc-200">
              Experience Level
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_OPTIONS.map((exp) => {
                const selected = experienceLevels.includes(exp);
                return (
                  <button
                    type="button"
                    key={exp}
                    onClick={() => toggleSelection(experienceLevels, setExperienceLevels, exp)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border',
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'
                    )}
                  >
                    {exp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Work Mode & Employment Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Work Mode */}
            <div className="space-y-2">
              <label className="block font-bold text-zinc-800 dark:text-zinc-200">
                Work Mode
              </label>
              <div className="flex flex-wrap gap-2">
                {WORK_MODE_OPTIONS.map((mode) => {
                  const selected = workModes.includes(mode);
                  return (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => toggleSelection(workModes, setWorkModes, mode)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border',
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                      )}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Employment Type */}
            <div className="space-y-2">
              <label className="block font-bold text-zinc-800 dark:text-zinc-200">
                Employment Type
              </label>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT_TYPE_OPTIONS.map((type) => {
                  const selected = employmentTypes.includes(type);
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => toggleSelection(employmentTypes, setEmploymentTypes, type)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border',
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                      )}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <label className="block font-bold text-zinc-800 dark:text-zinc-200">
              Locations (Countries, Cities, Remote)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLocation();
                  }
                }}
                placeholder="e.g. India, Bengaluru, Dubai, Remote"
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddLocation}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {locations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium text-xs"
                >
                  {loc}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="block font-bold text-zinc-800 dark:text-zinc-200">
              Skills & Tech Stack
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. Python, LangChain, PyTorch, RAG"
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium text-xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving Preferences...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
