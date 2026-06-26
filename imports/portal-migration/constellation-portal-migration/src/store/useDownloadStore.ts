import { create } from 'zustand';
import { generateZip, triggerDownload } from '../utils/generateZip';

export type DownloadStatus = 'generating' | 'ready' | 'partial' | 'error' | 'empty';

export interface DownloadJob {
  id: string;
  folderName: string;
  assetCount: number;
  skippedCount: number;
  status: DownloadStatus;
}

interface DownloadStore {
  jobs:        DownloadJob[];
  isMinimized: boolean;
  startDownload: (params: { folderName: string; assetCount: number }) => void;
  retry:         (jobId: string) => void;
  clearCompleted: () => void;
  minimize: () => void;
  expand:   () => void;
}

const shouldFail    = (name: string) => /_fail_/i.test(name);
const shouldPartial = (name: string) => /_partial_/i.test(name);
const shouldEmpty   = (name: string) => /_empty_/i.test(name);

export const useDownloadStore = create<DownloadStore>((set, get) => {
  function runDownload(id: string, folderName: string, assetCount: number, skippedCount: number) {
    generateZip(folderName, assetCount)
      .then(blob => {
        triggerDownload(blob, folderName);
        set(state => ({
          jobs: state.jobs.map(j =>
            j.id === id ? { ...j, status: skippedCount > 0 ? 'partial' as const : 'ready' as const } : j
          ),
        }));
      })
      .catch(() => {
        set(state => ({
          jobs: state.jobs.map(j => j.id === id ? { ...j, status: 'error' as const } : j),
        }));
      });
  }

  return {
    jobs:        [],
    isMinimized: false,

    minimize: () => set({ isMinimized: true }),
    expand:   () => set({ isMinimized: false }),

    clearCompleted: () =>
      set(state => ({
        jobs: state.jobs.filter(j => j.status === 'generating'),
      })),

    startDownload: ({ folderName, assetCount }) => {
      const id = `dl-${Date.now()}`;

      if (assetCount === 0 || shouldEmpty(folderName)) {
        set(state => ({
          jobs: [...state.jobs, { id, folderName, assetCount: 0, skippedCount: 0, status: 'empty' }],
          isMinimized: false,
        }));
        return;
      }

      // Simulate skipped unsupported assets (~20% when _partial_ trigger)
      const skippedCount = shouldPartial(folderName) ? Math.max(1, Math.floor(assetCount * 0.2)) : 0;
      const supportedCount = assetCount - skippedCount;

      set(state => ({
        jobs: [...state.jobs, { id, folderName, assetCount: supportedCount, skippedCount, status: 'generating' }],
        isMinimized: false,
      }));

      runDownload(id, folderName, supportedCount, skippedCount);
    },

    retry: (jobId) => {
      const job = get().jobs.find(j => j.id === jobId);
      if (!job) return;
      set(state => ({
        jobs: state.jobs.map(j => j.id === jobId ? { ...j, status: 'generating' } : j),
      }));
      runDownload(jobId, job.folderName, job.assetCount, job.skippedCount);
    },
  };
});
