import { forwardRef, useRef, useState, type ReactNode } from 'react';
import MuiButtonGroup, {
  type ButtonGroupProps as MuiButtonGroupProps,
} from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export interface SplitButtonOption {
  /** Visible label of the menu item */
  label: ReactNode;
  /** Stable identifier passed to `onSelect` (falls back to the index) */
  value?: string;
  /** Optional leading icon */
  icon?: ReactNode;
  disabled?: boolean;
  /** Renders the item in the danger/error color (destructive actions) */
  danger?: boolean;
}

export interface SplitButtonProps
  extends Omit<MuiButtonGroupProps, 'onClick' | 'onSelect'> {
  /** Label of the primary (left) action */
  children: ReactNode;
  /** Called when the primary button is clicked */
  onClick?: () => void;
  /** Secondary actions shown in the dropdown menu */
  options: SplitButtonOption[];
  /** Called when a dropdown option is selected */
  onSelect?: (option: SplitButtonOption, index: number) => void;
  /** Disables only the primary button (the dropdown stays usable) */
  primaryDisabled?: boolean;
  /** Accessible label for the dropdown trigger */
  dropdownAriaLabel?: string;
}

/**
 * Constellation SplitButton — primary action on the left, a chevron on the
 * right opens a menu with secondary actions (MUI ButtonGroup + Menu pattern).
 * Pill-shaped, defaults to `variant="outlined"` in the brand accent, per the
 * "Generate Report" split button of the original app.
 */
export const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(
  function SplitButton(
    {
      children,
      onClick,
      options,
      onSelect,
      primaryDisabled = false,
      dropdownAriaLabel = 'More options',
      variant = 'outlined',
      color = 'primary',
      disabled = false,
      sx,
      ...props
    },
    ref,
  ) {
    const anchorRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const handleSelect = (option: SplitButtonOption, index: number) => {
      setOpen(false);
      onSelect?.(option, index);
    };

    return (
      <>
        <MuiButtonGroup
          ref={(node: HTMLDivElement | null) => {
            anchorRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          variant={variant}
          color={color}
          disabled={disabled}
          disableElevation
          // Pill group — inner buttons already get radius 999 from the theme;
          // mirror it on the group so focus/hover outlines clip correctly.
          sx={[{ borderRadius: 999 }, ...(Array.isArray(sx) ? sx : [sx])]}
          {...props}
        >
          <Button onClick={onClick} disabled={disabled || primaryDisabled}>
            {children}
          </Button>
          <Button
            aria-controls={open ? 'constellation-split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="menu"
            aria-label={dropdownAriaLabel}
            onClick={() => setOpen((prev) => !prev)}
            sx={{ px: 1 }}
          >
            <ArrowDropDownIcon
              sx={{
                transition: 'transform 150ms',
                transform: open ? 'rotate(180deg)' : 'none',
              }}
            />
          </Button>
        </MuiButtonGroup>
        <Menu
          id="constellation-split-button-menu"
          anchorEl={anchorRef.current}
          open={open}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: { sx: { mt: 0.75, minWidth: 160 } },
            list: { dense: true },
          }}
        >
          {options.map((option, index) => (
            <MenuItem
              key={option.value ?? index}
              disabled={option.disabled}
              onClick={() => handleSelect(option, index)}
              sx={
                option.danger
                  ? { color: 'error.main', '& .MuiListItemIcon-root': { color: 'error.main' } }
                  : undefined
              }
            >
              {option.icon ? <ListItemIcon>{option.icon}</ListItemIcon> : null}
              <ListItemText
                slotProps={{
                  primary: { sx: { fontSize: '0.8125rem', fontWeight: 500 } },
                }}
              >
                {option.label}
              </ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  },
);
