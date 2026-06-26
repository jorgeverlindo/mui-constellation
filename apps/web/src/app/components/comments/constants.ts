// ─── Comments — constants ─────────────────────────────────────────────────────
// NOTE: The vw-funds-2 source imports PROJECT_OWNERS from "@projects/CreateProjectDialog"
// which is a path alias unavailable in this workspace. A standalone user list is
// provided here as a direct substitute.

import type { CommentUser } from "./types";

/**
 * All users that can author comments, be @mentioned, or receive notifications.
 * Replace with a real data source (API / context) when available.
 */
export const COMMENT_USERS: CommentUser[] = [
  {
    id:       "user-jorge",
    name:     "Jorge Verlindo",
    email:    "jorge.verlindo@helloconstellation.com",
    initials: "JV",
    color:    "#473BAB",
    avatar:   null,
  },
  {
    id:       "user-mallory",
    name:     "Mallory Manning",
    email:    "mallory.manning@helloconstellation.com",
    initials: "MM",
    color:    "#E17613",
    avatar:   null,
  },
  {
    id:       "user-alex",
    name:     "Alex Chen",
    email:    "alex.chen@helloconstellation.com",
    initials: "AC",
    color:    "#2196F3",
    avatar:   null,
  },
];

/** Look up a user by ID. Returns undefined if not found. */
export function getUserById(id: string): CommentUser | undefined {
  return COMMENT_USERS.find(u => u.id === id);
}

/** The "logged-in" user for this prototype session. */
export const CURRENT_USER: CommentUser = COMMENT_USERS[0]; // Jorge Verlindo

/** localStorage key prefix for persisting comments per project. */
export const COMMENTS_STORAGE_KEY = (projectId: string) =>
  `constellation_comments_${projectId}`;

/** localStorage key for persisting notifications (global). */
export const NOTIFS_STORAGE_KEY = "constellation_notifications";

/** Modules that can be used to filter/group comments. */
export const COMMENT_MODULES = [
  "Offers",
  "Templates",
  "Backgrounds",
  "Preview",
] as const;

export type CommentModule = typeof COMMENT_MODULES[number];
