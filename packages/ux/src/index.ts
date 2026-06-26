export {
  // Groups
  brand,
  rail,
  ink,
  status,
  chip,
  surface,
  // Typography
  fontFamily,
  typeScale,
  type TypeScaleKey,
  // Shape / layout
  shape,
  elevation,
  zIndex,
  spacing,
  // Consolidated + legacy
  constellationTokens,
  type ConstellationTokens,
  shapeTokens,
  typographyTokens,
} from './theme/tokens';

export {
  createConstellationTheme,
  constellationTheme,
} from './theme/createConstellationTheme';

export {
  ConstellationProvider,
  type ConstellationProviderProps,
} from './ConstellationProvider';

// Inputs
export { Button, type ButtonProps } from './components/Button/Button';
export { IconButton, type IconButtonProps } from './components/IconButton/IconButton';
export { TextField, type TextFieldProps } from './components/TextField/TextField';
export { SearchInput, type SearchInputProps } from './components/SearchInput/SearchInput';
export { Checkbox, type CheckboxProps } from './components/Checkbox/Checkbox';
export { Textarea, type TextareaProps } from './components/Textarea/Textarea';
export { SplitButton, type SplitButtonProps, type SplitButtonOption } from './components/SplitButton/SplitButton';
export { Select, type SelectProps, type SelectOption } from './components/Select/Select';
// DatePicker is exported from '@jorgeverlindo/constellation-ux/date-picker'
// (separate entry so hosts without @mui/x-date-pickers aren't affected)

// Display
export { Badge, type BadgeProps } from './components/Badge/Badge';
export { Chip, type ChipProps, type ChipVariant } from './components/Chip/Chip';
export { Avatar, type AvatarProps } from './components/Avatar/Avatar';
export { KeyValueRow, type KeyValueRowProps } from './components/KeyValueRow/KeyValueRow';
export {
  Card,
  CardHeader,
  CardContent,
  type CardProps,
  type CardHeaderProps,
  type CardContentProps,
} from './components/Card/Card';
export { Tooltip, type TooltipProps } from './components/Tooltip/Tooltip';

// Feedback
export { ProgressLinear, type ProgressLinearProps } from './components/ProgressLinear/ProgressLinear';
export { Loader, type LoaderProps } from './components/Loader/Loader';
export { Alert, type AlertProps } from './components/Alert/Alert';
export {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  type DialogProps,
  type DialogTitleProps,
  type DialogContentProps,
  type DialogActionsProps,
} from './components/Dialog/Dialog';
export { Drawer, type DrawerProps } from './components/Drawer/Drawer';

// Navigation
export { Accordion, type AccordionProps } from './components/Accordion/Accordion';
export { Breadcrumb, type BreadcrumbProps, type BreadcrumbItem } from './components/Breadcrumb/Breadcrumb';
export { AppSidebar, type AppSidebarProps, type AppSidebarItem, APP_SIDEBAR_WIDTH } from './components/AppSidebar/AppSidebar';
export { TopBar, type TopBarProps, TOP_BAR_HEIGHT } from './components/TopBar/TopBar';
