import { create } from 'zustand';
import { Asset } from '../types/asset';

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export type UploadStatus = 'uploading' | 'done' | 'error';
export type FolderUploadStatus = 'uploading' | 'done' | 'error' | 'partial' | 'empty';

export interface UploadJob {
  id: string;
  name: string;
  previewUrl?: string;
  status: UploadStatus;
  folderJobId?: string;
  asset?: Asset;
}

export interface FolderUploadJob {
  id: string;
  folderName: string;
  destFolderName: string;
  createdFolderId: string;
  fileJobIds: string[];
  skippedFileNames: string[];
  status: FolderUploadStatus;
}

interface UploadState {
  jobs: UploadJob[];
  folderJobs: FolderUploadJob[];
  isMinimized: boolean;
  addUploads: (files: File[]) => void;
  addFolderUpload: (params: {
    folderName: string;
    destFolderName: string;
    createdFolderId: string;
    supportedFiles: File[];
    skippedFileNames: string[];
  }) => void;
  minimize: () => void;
  expand: () => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  jobs: [],
  folderJobs: [],
  isMinimized: false,

  addUploads: (files) => {
    const newJobs: UploadJob[] = files.map(f => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      name: f.name,
      previewUrl: URL.createObjectURL(f),
      status: 'uploading' as const,
    }));

    set(state => ({ jobs: [...state.jobs, ...newJobs] }));

    newJobs.forEach(job => {
      setTimeout(() => {
        set(state => ({
          jobs: state.jobs.map(j =>
            j.id === job.id ? { ...j, status: Math.random() > 0.1 ? ('done' as const) : ('error' as const) } : j
          ),
        }));
      }, 1500 + Math.random() * 2000);
    });
  },

  addFolderUpload: ({ folderName, destFolderName, createdFolderId, supportedFiles, skippedFileNames }) => {
    const fileJobs: UploadJob[] = supportedFiles.map(f => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      name: f.name,
      previewUrl: URL.createObjectURL(f),
      status: 'uploading' as const,
    }));

    const folderJob: FolderUploadJob = {
      id: `folder-${Date.now()}`,
      folderName,
      destFolderName,
      createdFolderId,
      fileJobIds: fileJobs.map(j => j.id),
      skippedFileNames,
      status: 'uploading',
    };

    set(state => ({
      jobs: [...state.jobs, ...fileJobs],
      folderJobs: [...state.folderJobs, folderJob],
    }));

    setTimeout(() => {
      set(state => ({
        jobs: state.jobs.map(j =>
          fileJobs.some(fj => fj.id === j.id) ? { ...j, status: 'done' as const } : j
        ),
        folderJobs: state.folderJobs.map(fj =>
          fj.id === folderJob.id ? { ...fj, status: 'done' as const } : fj
        ),
      }));
    }, 2000 + Math.random() * 2000);
  },

  minimize: () => set({ isMinimized: true }),
  expand: () => set({ isMinimized: false }),

  clearCompleted: () => set(state => {
    const completedJobIds = new Set(
      state.jobs.filter(j => j.status === 'done' || j.status === 'error').map(j => j.id)
    );
    const completedFolderIds = new Set(
      state.folderJobs.filter(fj => fj.status === 'done' || fj.status === 'error').map(fj => fj.id)
    );
    return {
      jobs: state.jobs.filter(j => !completedJobIds.has(j.id)),
      folderJobs: state.folderJobs.filter(fj => !completedFolderIds.has(fj.id)),
    };
  }),
}));
