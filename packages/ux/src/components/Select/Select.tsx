import {
  forwardRef,
  useId,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from 'react';
import MuiSelect, {
  type SelectProps as MuiSelectProps,
} from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

export interface SelectOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps<Value = string>
  extends Omit<MuiSelectProps<Value>, 'variant'> {
  /** Floating label, rendered via InputLabel (MUI convention) */
  label?: string;
  /**
   * Convenience list of options rendered as MenuItems.
   * Use `children` instead for full control (groups, custom items).
   */
  options?: SelectOption[];
  /** Helper or error text below the field */
  helperText?: ReactNode;
  /** Placeholder shown while no value is selected (uses displayEmpty) */
  placeholder?: string;
}

/**
 * Constellation Select — wrapper of MUI Select (single choice, fixed option
 * list) with the DS input style: input background `palette.surface.inputBackground`,
 * theme radius, floating label and optional helper text.
 *
 * Decision: built on MuiSelect rather than Autocomplete because every dropdown
 * in the reference app (CustomSelect, FilterSelect, native selects) is a short
 * fixed list without typeahead or free text.
 */
const SelectInner = forwardRef(function Select<Value = string>(
  {
    label,
    options,
    helperText,
    placeholder,
    children,
    fullWidth,
    error,
    disabled,
    required,
    size,
    sx,
    id,
    labelId: labelIdProp,
    renderValue,
    displayEmpty,
    ...props
  }: SelectProps<Value>,
  ref: Ref<HTMLDivElement>,
) {
  const autoId = useId();
  const selectId = id ?? `${autoId}-select`;
  const labelId = labelIdProp ?? `${autoId}-label`;

  const hasPlaceholder = placeholder != null;
  const placeholderRenderValue = (value: Value): ReactNode => {
    if (value == null || value === '') {
      return (
        <Box component="span" sx={{ color: 'ink.tertiary' }}>
          {placeholder}
        </Box>
      );
    }
    const selected = options?.find((option) => option.value === value);
    return selected ? selected.label : String(value);
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      disabled={disabled}
      required={required}
      size={size}
    >
      {label ? <InputLabel id={labelId}>{label}</InputLabel> : null}
      <MuiSelect<Value>
        ref={ref}
        id={selectId}
        labelId={label ? labelId : undefined}
        label={label}
        displayEmpty={displayEmpty ?? hasPlaceholder}
        renderValue={
          renderValue ?? (hasPlaceholder ? placeholderRenderValue : undefined)
        }
        sx={[
          {
            bgcolor: 'surface.inputBackground',
            // Figma input radius/border (Autocomplete 2.0 "Input" frame)
            borderRadius: '4px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'surface.inputBorder',
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        {options?.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
        {children}
      </MuiSelect>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
});

/**
 * Generic-preserving export: `Select<Value>` keeps `value`/`onChange` typed
 * (forwardRef erases generics, so we re-assert the call signature).
 */
export const Select = SelectInner as <Value = string>(
  props: SelectProps<Value> & RefAttributes<HTMLDivElement>,
) => ReactElement;
