import { forwardRef } from 'react';
import MuiAvatar, { type AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';
// Palette module augmentation (brand/ink/rail/surface)
import type {} from '../../theme/createConstellationTheme';

export interface AvatarProps extends MuiAvatarProps {
  /**
   * Person's full name. Renders automatic initials (first + last word) when
   * no `src`/`children` are given, and feeds the derived color when
   * `colorFromName` is on. Also used as the image `alt`.
   */
  name?: string;
  /** Avatar size in px (width = height). @default 32 */
  size?: number;
  /**
   * Derive a stable background color from `name` (hash over the brand/rail
   * token palette) instead of the neutral default.
   * @default false
   */
  colorFromName?: boolean;
}

/** "Jorge Verlindo" → "JV"; single word falls back to its first two letters. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Constellation Avatar — MUI Avatar with automatic initials from `name`.
 *
 * Follows the Figma `<Avatar>` spec: 32px circular by default, neutral gray
 * bg (`surface.avatar`, #BCBBC2) + white text, font-size 50% of the avatar
 * size (40→20, 32→16, 24→12), tracking 0.14px; `rounded` variant uses a
 * fixed 4px radius.
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(
    { name, size = 32, colorFromName = false, variant = 'circular', children, sx, ...props },
    ref,
  ) {
    return (
      <MuiAvatar
        ref={ref}
        variant={variant}
        alt={name}
        sx={[
          (theme) => {
            // Token-based palette for name-derived colors
            const derived = [
              theme.palette.brand.accent,
              theme.palette.brand.mid,
              theme.palette.brand.light,
              theme.palette.rail.icon,
              theme.palette.ink.tertiary,
            ];
            const bgcolor =
              name && colorFromName
                ? derived[hashString(name) % derived.length]
                : theme.palette.surface.avatar;
            return {
              width: size,
              height: size,
              // Figma <Avatar> Content=Text: font is 50% of the avatar size
              fontSize: Math.round(size * 0.5),
              fontWeight: 400,
              letterSpacing: '0.14px',
              bgcolor,
              color: '#FFFFFF',
              // Figma Variant=Rounded: fixed 4px radius at every size
              ...(variant === 'rounded' && { borderRadius: '4px' }),
            };
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        {children ?? (name ? getInitials(name) : undefined)}
      </MuiAvatar>
    );
  },
);
