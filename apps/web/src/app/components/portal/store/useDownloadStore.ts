import { create } from 'zustand';

export type DownloadStatus = 'generating' | 'ready' | 'partial' | 'error' | 'empty';

export interface DownloadJob {
  id: string;
  folderName: string;
  assetCount: number;
  skippedCount: number;
  status: DownloadStatus;
}

interface DownloadState {
  jobs: DownloadJob[];
  isMinimized: boolean;
  startDownload: (params: { folderName: string; assetCount: number }) => void;
  retry: (jobId: string) => void;
  clearCompleted: () => void;
  minimize: () => void;
  expand: () => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  jobs: [],
  isMinimized: false,

  startDownload: ({ folderName, assetCount }) => {
    const job: DownloadJob = {
      id: `dl-${Date.now()}`,
      folderName,
      assetCount,
      skippedCount: 0,
      status: 'generating',
    };

    set(state => ({ jobs: [...state.jobs, job] }));

    setTimeout(() => {
      const r = Math.random();
      const status: DownloadStatus = r < 0.7 ? 'ready' : r < 0.85 ? 'partial' : 'error';
      set(state => ({
        jobs: state.jobs.map(j => j.id === job.id ? { ...j, status } : j),
      }));
    }, 2000 + Math.random() * 2000);
  },

  retry: (jobId) => {
    set(state => ({
      jobs: state.jobs.map(j => j.id === jobId ? { ...j, status: 'generating' } : j),
    }));
    setTimeout(() => {
      set(state => ({
        jobs: state.jobs.map(j => j.id === jobId ? { ...j, status: 'ready' } : j),
      }));
    }, 1500);
  },

  clearCompleted: () => set(state => ({
    jobs: state.jobs.filter(j => j.status === 'generating'),
  })),

  minimize: () => set({ isMinimized: true }),
  expand: () => set({ isMinimized: false }),
}));
