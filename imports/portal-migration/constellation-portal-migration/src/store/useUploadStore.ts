import { create } from 'zustand';
import { Asset } from '../types/asset';

// ─── Supported file types ─────────────────────────────────────────────────────
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// ─── Individual file job ──────────────────────────────────────────────────────
export interface UploadJob {
  id: string;
  name: string;
  previewUrl: string;
  status: 'uploading' | 'done' | 'error';
  /** Set when job belongs to a folder upload — used to group in the monitor */
  folderJobId?: string;
  asset?: Asset;
}

// ─── Folder upload status ──────────────────────────────────────────────────────
export type FolderUploadStatus =
  | 'uploading'  // upload in progress
  | 'done'       // all supported files uploaded, no skipped
  | 'partial'    // some uploaded, some skipped (unsupported)
  | 'empty'      // no supported files in folder
  | 'error';     // folder creation failed

// ─── Folder upload job ────────────────────────────────────────────────────────
export interface FolderUploadJob {
  id: string;
  folderName: string;
  destFolderName: string;
  createdFolderId: string;
  /** IDs of UploadJob entries that belong to this folder upload */
  fileJobIds: string[];
  /** Names of files that were skipped (unsupported format) */
  skippedFileNames: string[];
  /** Computed from fileJobIds — updated as individual jobs complete */
  status: FolderUploadStatus;
}

// ─── Store interface ──────────────────────────────────────────────────────────
interface UploadStore {
  jobs:        UploadJob[];
  folderJobs:  FolderUploadJob[];
  isMinimized: boolean;

  /** Upload individual files (not part of a folder) */
  addUploads: (files: File[]) => void;

  /** Start a folder upload — creates file jobs linked to this folder job */
  addFolderUpload: (params: {
    folderName:       string;
    destFolderName:   string;
    createdFolderId:  string;
    supportedFiles:   File[];
    skippedFileNames: string[];
  }) => void;

  minimize:       () => void;
  expand:         () => void;
  clearCompleted: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const shouldFail = (name: string) => /_fail_/i.test(name);

function makeFolderStatus(fileJobIds: string[], jobs: UploadJob[], skippedCount: number): FolderUploadStatus {
  if (fileJobIds.length === 0) return 'empty';
  const fileJobs = fileJobIds.map(id => jobs.find(j => j.id === id));
  const allTerminal = fileJobs.every(j => j?.status === 'done' || j?.status === 'error');
  if (!allTerminal) return 'uploading';
  if (fileJobs.some(j => j?.status === 'error')) return 'error';
  return skippedCount > 0 ? 'partial' : 'done';
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useUploadStore = create<UploadStore>((set, get) => ({
  jobs:        [],
  folderJobs:  [],
  isMinimized: false,

  minimize: () => set({ isMinimized: true }),
  expand:   () => set({ isMinimized: false }),

  clearCompleted: () =>
    set(state => ({
      jobs:       state.jobs.filter(j => j.status === 'uploading'),
      folderJobs: state.folderJobs.filter(fj => fj.status === 'uploading'),
    })),

  // ── Individual file upload ────────────────────────────────────────────────
  addUploads: (files) => {
    const validFiles = files.filter(f => ACCEPTED_TYPES.includes(f.type));
    if (validFiles.length === 0) return;

    const newJobs: UploadJob[] = validFiles.map((file, i) => ({
      id:         `upload-${Date.now()}-${i}-${file.name}`,
      name:       file.name,
      previewUrl: URL.createObjectURL(file),
      status:     'uploading',
    }));

    set(state => ({ jobs: [...state.jobs, ...newJobs], isMinimized: false }));

    newJobs.forEach((job, i) => {
      const file = validFiles[i];
      if (shouldFail(file.name)) {
        setTimeout(() => {
          set(state => ({
            jobs: state.jobs.map(j => j.id === job.id ? { ...j, status: 'error' } : j),
          }));
        }, 300);
        return;
      }
      const form = new FormData();
      form.append('file', file);
      fetch('/api/upload', { method: 'POST', body: form })
        .then(res => { if (!res.ok) throw new Error(`Upload failed: ${res.status}`); })
        .then(() => {
          const asset: Asset = {
            id:       job.id,
            name:     file.name.replace(/\.[^.]+$/, ''),
            url:      job.previewUrl,
            mimeType: file.type,
            aiStatus: 'approved',
            tags:     [],
          };
          set(state => ({
            jobs: state.jobs.map(j => j.id === job.id ? { ...j, status: 'done', asset } : j),
          }));
        })
        .catch(() => {
          set(state => ({
            jobs: state.jobs.map(j => j.id === job.id ? { ...j, status: 'error' } : j),
          }));
        });
    });
  },

  // ── Folder upload ─────────────────────────────────────────────────────────
  addFolderUpload: ({ folderName, destFolderName, createdFolderId, supportedFiles, skippedFileNames }) => {
    const folderJobId = `folder-${Date.now()}`;
    const fileJobs: UploadJob[] = supportedFiles.map((file, i) => ({
      id:          `fupload-${Date.now()}-${i}-${file.name}`,
      name:        file.name,
      previewUrl:  URL.createObjectURL(file),
      status:      'uploading',
      folderJobId,
    }));

    const folderJob: FolderUploadJob = {
      id:               folderJobId,
      folderName,
      destFolderName,
      createdFolderId,
      fileJobIds:       fileJobs.map(j => j.id),
      skippedFileNames,
      status:           fileJobs.length === 0 ? 'empty' : 'uploading',
    };

    set(state => ({
      jobs:        [...state.jobs, ...fileJobs],
      folderJobs:  [...state.folderJobs, folderJob],
      isMinimized: false,
    }));

    const folderFails = shouldFail(folderName);

    // Stagger completions — each file finishes ~600ms after the previous
    fileJobs.forEach((job, i) => {
      const file = supportedFiles[i];
      const fails = folderFails || shouldFail(file.name);
      const complete = (success: boolean) => {
        set(state => {
          const updatedJobs = state.jobs.map(j => {
            if (j.id !== job.id) return j;
            if (!success) return { ...j, status: 'error' as const };
            const asset: Asset = {
              id:       job.id,
              name:     file.name.replace(/\.[^.]+$/, ''),
              url:      job.previewUrl,
              mimeType: file.type,
              aiStatus: 'approved',
              tags:     [],
            };
            return { ...j, status: 'done' as const, asset };
          });
          const updatedFolderJobs = state.folderJobs.map(fj => {
            if (fj.id !== folderJobId) return fj;
            return { ...fj, status: makeFolderStatus(fj.fileJobIds, updatedJobs, fj.skippedFileNames.length) };
          });
          return { jobs: updatedJobs, folderJobs: updatedFolderJobs };
        });
      };
      if (fails) { setTimeout(() => complete(false), 300); return; }
      const form = new FormData();
      form.append('file', file);
      fetch('/api/upload', { method: 'POST', body: form })
        .then(res => complete(res.ok))
        .catch(() => complete(false));
    });
  },
}));
