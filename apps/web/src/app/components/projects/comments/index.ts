// ─── Comments feature — public data/type API ──────────────────────────────────
// UI components (CommentsContext, RichTextRenderer, etc.) are not re-exported here
// as they live outside the projects/comments/ directory.

export type {
  CommentData,
  CommentUser,
  CommentsContextValue,
  EntityRef,
  EntityType,
  NotifAction,
  NotifItem,
  Reply,
  Attachment,
} from "./types";

export {
  COMMENT_MODULES,
  COMMENT_USERS,
  COMMENTS_STORAGE_KEY,
  CURRENT_USER,
  NOTIFS_STORAGE_KEY,
  getUserById,
} from "./constants";

export type { CommentModule } from "./constants";

export {
  formatTimestamp,
  genId,
  htmlToPlainText,
  htmlToPlainTextSafe,
  sanitizeHtml,
  extractMentionIds,
  loadFromStorage,
  saveToStorage,
} from "./utils";
