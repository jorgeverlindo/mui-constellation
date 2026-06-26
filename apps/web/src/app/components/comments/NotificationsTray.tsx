// ─── NotificationsTray ────────────────────────────────────────────────────────
// Sliding right-side notifications panel.
// Ported from Tailwind/motion to MUI sx props + MUI Slide.
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { useCommentsRequired, getUserById } from './CommentsContext';
import { formatTimestamp } from './utils';
import type { NotifItem } from './types';

// ── Icons ─────────────────────────────────────────────────────────────────────

export function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

const ACTION_LABEL: Record<string, string> = {
  mentioned_you: "mentioned you",
  replied_to_you: "replied to you",
  commented: "commented",
  pinned: "pinned a comment",
  assigned_you: "assigned you",
};

// ── ActorAvatar ───────────────────────────────────────────────────────────────

function ActorAvatar({ actorId }: { actorId: string }) {
  const user = getUserById(actorId);
  if (!user) {
    return (
      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.625rem', fontWeight: 600, color: 'text.secondary' }}>?</Box>
    );
  }
  if (user.avatar) {
    return <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block' }} />;
  }
  return (
    <Box sx={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.625rem', fontWeight: 600, color: 'white', bgcolor: user.color }}>
      {user.initials}
    </Box>
  );
}

// ── NotifRow ──────────────────────────────────────────────────────────────────

function NotifRow({ notif, onRead, onOpenComments }: { notif: NotifItem; onRead: (id: string) => void; onOpenComments: () => void }) {
  const actor = getUserById(notif.actorId);
  const actorName = actor?.name.split(" ")[0] ?? "Someone";
  const actionLabel = ACTION_LABEL[notif.action] ?? notif.action;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => { if (!notif.isRead) onRead(notif.id); onOpenComments(); }}
      sx={{
        width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '10px',
        px: '12px', py: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        bgcolor: notif.isRead ? 'transparent' : 'rgba(71,59,171,0.05)',
        '&:hover': { bgcolor: notif.isRead ? 'rgba(0,0,0,0.04)' : 'rgba(71,59,171,0.09)' },
        transition: 'background 0.1s',
      }}
    >
      {/* Unread dot */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 8, flexShrink: 0, mt: '9px' }}>
        {!notif.isRead && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />}
      </Box>
      <ActorAvatar actorId={notif.actorId} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.4, color: 'text.primary' }}>
          <Box component="span" sx={{ fontWeight: 600 }}>{actorName}</Box>{' '}
          <Box component="span" sx={{ color: 'text.secondary' }}>{actionLabel}</Box>
        </Typography>
        {notif.preview && (
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.disabled', mt: '2px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {notif.preview}
          </Typography>
        )}
        <Typography sx={{ fontSize: '0.625rem', color: '#b8b6c0', mt: '4px' }}>{formatTimestamp(notif.timestamp)}</Typography>
      </Box>
    </Box>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', py: '48px', px: '24px', textAlign: 'center' }}>
      <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'rgba(71,59,171,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
        <BellIcon size={22} />
      </Box>
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>
        No notifications yet. Mention someone with @name to notify them.
      </Typography>
    </Box>
  );
}

// ── NotificationsTray ─────────────────────────────────────────────────────────

export function NotificationsTray() {
  const ctx = useCommentsRequired();
  const { notifications, unreadCount, markRead, markAllRead, isNotifOpen, closeNotif, openPanel } = ctx;

  const myNotifs = notifications.filter(n => n.recipientId === ctx.currentUser.id);

  const handleOpenComments = () => { closeNotif(); openPanel(); };

  return (
    <Slide direction="left" in={isNotifOpen} mountOnEnter unmountOnExit timeout={350}>
      <Box
        component="aside"
        aria-label="Notifications tray"
        sx={{
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          width: 400, height: '100%', overflow: 'hidden',
          bgcolor: 'white', borderRadius: 2,
          boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '16px', py: '12px', borderBottom: '1px solid #e8e7ef', flexShrink: 0, gap: '8px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0 }}><BellIcon size={16} /></Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.3, flexShrink: 0 }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, px: '4px', borderRadius: '100px', bgcolor: 'primary.main', fontSize: '0.625rem', fontWeight: 600, color: 'white', flexShrink: 0 }}>
                {unreadCount}
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {unreadCount > 0 && (
              <Box component="button" type="button" onClick={markAllRead} title="Mark all as read" aria-label="Mark all as read" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '6px', border: 'none', bgcolor: 'transparent', cursor: 'pointer', color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)', color: 'text.primary' }, transition: 'background 0.1s' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12l5 5 8-8"/><path d="M9 12l5 5 8-8"/>
                </svg>
              </Box>
            )}
            <Box component="button" type="button" onClick={closeNotif} aria-label="Close notifications" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '6px', border: 'none', bgcolor: 'transparent', cursor: 'pointer', color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)', color: 'text.primary' }, transition: 'background 0.1s' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </Box>
          </Box>
        </Box>

        {/* List (scrollable) */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: '8px', py: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {myNotifs.length === 0 ? (
            <EmptyState />
          ) : (
            myNotifs.map(notif => (
              <NotifRow key={notif.id} notif={notif} onRead={markRead} onOpenComments={handleOpenComments} />
            ))
          )}
        </Box>
      </Box>
    </Slide>
  );
}
