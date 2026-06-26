"use client";

import React, { useState, useRef, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// ─── Avatar photo imports ──────────────────────────────────────────────────────
const imgZakFlaten =
  "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071066/vw-funds/48ea8970f6d4b2ca434cf82051473b99fc39b3d9.png";
const imgRachelHui =
  "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071119/vw-funds/avatars/rachel-hui.png";

// ─── Channel icon imports ──────────────────────────────────────────────────────
const imgGoogle =
  "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071130/vw-funds/channels/google.png";
const imgMeta =
  "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071126/vw-funds/channels/Brand_Logo/Meta.svg";
const imgWebsite =
  "https://res.cloudinary.com/dvq75cqna/image/upload/v1780071128/vw-funds/channels/_website_.svg";

// ─── Shared data ───────────────────────────────────────────────────────────────

export const ACCOUNTS = [
  "Honda of Anywhere",
  "BMW Seattle",
  "Spiriva Pharma",
  "Multiple Brands Inc.",
  "Honda City",
];

export interface PlatformOption {
  id: string;
  label: string;
  icon: string;
}

export const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: "google-pmax",    label: "Google PMax",    icon: imgGoogle  },
  { id: "google-display", label: "Google Display", icon: imgGoogle  },
  { id: "meta",           label: "Meta",           icon: imgMeta    },
  { id: "facebook",       label: "Facebook",       icon: imgMeta    },
  { id: "website",        label: "Website",        icon: imgWebsite },
];

export const PROJECT_OWNERS = [
  { id: "jorge-verlindo",  name: "Jorge Verlindo",  email: "jorge.verlindo@helloconstellation.com",  initials: "JV", color: "#473bab", avatar: null },
  { id: "luke-theobald",   name: "Luke Theobald",   email: "luke.theobald@helloconstellation.com",   initials: "LT", color: "#2563eb", avatar: null },
  { id: "jenny-park",      name: "Jenny Park",      email: "jenny.park@helloconstellation.com",      initials: "JP", color: "#7c3aed", avatar: null },
  { id: "sonya-koh",       name: "Sonya Koh",       email: "sonya.koh@helloconstellation.com",       initials: "SK", color: "#db2777", avatar: null },
  { id: "zak-flaten",      name: "Zak Flaten",      email: "zak.flaten@helloconstellation.com",      initials: "ZF", color: "#059669", avatar: imgZakFlaten },
  { id: "rachel-hui",      name: "Rachel Hui",      email: "rachel.hui@helloconstellation.com",      initials: "RH", color: "#d97706", avatar: imgRachelHui },
  { id: "mike-henderson",  name: "Mike Henderson",  email: "mike.henderson@hondaofanywhere.com",     initials: "MH", color: "#dc2626", avatar: null },
  { id: "sarah-collins",   name: "Sarah Collins",   email: "sarah.collins@hondaofanywhere.com",      initials: "SC", color: "#0891b2", avatar: null },
  { id: "james-whitaker",  name: "James Whitaker",  email: "james.whitaker@hondaofanywhere.com",     initials: "JW", color: "#65a30d", avatar: null },
  { id: "ashley-morgan",   name: "Ashley Morgan",   email: "ashley.morgan@hondaofanywhere.com",      initials: "AM", color: "#ea580c", avatar: null },
  { id: "jenny-eckhart",   name: "Jenny Eckhart",   email: "jenny.eckhart@helloconstellation.com",   initials: "JE", color: "#0e7490", avatar: null },
  { id: "mallory-manning", name: "Mallory Manning", email: "mallory.manning@helloconstellation.com", initials: "MM", color: "#b45309", avatar: null },
  { id: "katelyn-gray",    name: "Katelyn Gray",    email: "katelyn.gray@helloconstellation.com",    initials: "KG", color: "#0369a1", avatar: null },
] as const;

export type ProjectOwner = typeof PROJECT_OWNERS[number];

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface NewProjectInput {
  name: string;
  account: string;
  brand: string;
  ownerId: string;
  startDate: Date;
  endDate: Date;
  platforms: string[];
  tags: string[];
  recommendations: {
    offers: boolean;
    templates: boolean;
    themeAndLogos: boolean;
  };
}

type FormErrors = Partial<Record<"name" | "startDate" | "endDate", string>>;

// ─── Shared style tokens ───────────────────────────────────────────────────────

const BRAND = "#473bab";

const fieldSx = {
  height: 40,
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 1,
  border: "1px solid #CAC9CF",
  borderRadius: "8px",
  px: 1.5,
  fontSize: "0.8125rem",
  bgcolor: "#F9FAFA",
  cursor: "pointer",
  userSelect: "none" as const,
  transition: "border-color 0.15s",
  "&:hover": { borderColor: "#B0B0B5" },
};

const labelSx = {
  display: "block",
  fontSize: "0.6875rem",
  fontWeight: 500,
  color: "rgba(0,0,0,0.6)",
  mb: 0.5,
  letterSpacing: "0.04em",
};

// ─── OwnerAvatar ──────────────────────────────────────────────────────────────

function OwnerAvatar({
  owner,
  size = 24,
}: {
  owner: typeof PROJECT_OWNERS[number];
  size?: number;
}) {
  if (owner.avatar) {
    return (
      <Box
        component="img"
        src={owner.avatar}
        alt={owner.name}
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          flexShrink: 0,
          objectFit: "cover",
        }}
      />
    );
  }
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        fontWeight: 600,
        bgcolor: owner.color,
        flexShrink: 0,
      }}
    >
      {owner.initials}
    </Avatar>
  );
}

// ─── RecommendationCard ───────────────────────────────────────────────────────

function RecommendationCard({
  checked,
  onChange,
  title,
  description,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Box
      onClick={() => onChange(!checked)}
      sx={{
        display: "flex",
        gap: 1.5,
        p: 1.75,
        borderRadius: 3,
        cursor: "pointer",
        userSelect: "none",
        transition: "background 0.15s",
        bgcolor: checked ? "rgba(71,59,171,0.05)" : "rgba(0,0,0,0.02)",
      }}
    >
      {/* Custom checkbox */}
      <Box
        sx={{
          mt: 0.25,
          width: 18,
          height: 18,
          borderRadius: "4px",
          border: "1px solid",
          borderColor: checked ? BRAND : "#B0B0B5",
          bgcolor: checked ? BRAND : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {checked && (
          <CheckIcon sx={{ fontSize: 11, color: "#fff", strokeWidth: 2.5 }} />
        )}
      </Box>

      {/* Text */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#1f1d25",
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "rgba(0,0,0,0.6)",
            mt: 0.375,
            lineHeight: 1.43,
          }}
        >
          {description}
        </Typography>
        {children && (
          <Box sx={{ mt: 1.25 }} onClick={(e) => e.stopPropagation()}>
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── PlatformMultiSelect ──────────────────────────────────────────────────────

function PlatformMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );

  const selectedPlatforms = selected
    .map((id) => PLATFORM_OPTIONS.find((p) => p.id === id))
    .filter(Boolean) as PlatformOption[];

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e: React.MouseEvent<HTMLElement>) =>
          setAnchorEl(e.currentTarget)
        }
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 0.375,
          minHeight: 40,
          border: "1px solid #CAC9CF",
          borderRadius: "8px",
          px: 1.25,
          py: 0.75,
          bgcolor: "#F9FAFA",
          cursor: "pointer",
          textAlign: "left",
          outline: "none",
          transition: "border-color 0.15s",
          "&:hover": { borderColor: "#B0B0B5" },
          ...(open && { borderColor: BRAND }),
        }}
      >
        {selectedPlatforms.length === 0 ? (
          <Typography
            component="span"
            sx={{
              fontSize: "0.8125rem",
              color: "rgba(0,0,0,0.38)",
              flex: 1,
            }}
          >
            Select platforms
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.375,
              flex: 1,
              minWidth: 0,
            }}
          >
            {selectedPlatforms.map((p) => (
              <Chip
                key={p.id}
                size="small"
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      component="img"
                      src={p.icon}
                      alt=""
                      sx={{ width: 12, height: 12, objectFit: "contain" }}
                    />
                    <span>{p.label}</span>
                  </Box>
                }
                onDelete={(e) => {
                  e.stopPropagation();
                  toggle(p.id);
                }}
                sx={{
                  height: 22,
                  fontSize: "0.6875rem",
                  bgcolor: "rgba(71,59,171,0.08)",
                  color: BRAND,
                  "& .MuiChip-deleteIcon": { fontSize: 14, color: BRAND },
                }}
              />
            ))}
          </Box>
        )}
        <KeyboardArrowDownIcon
          sx={{
            ml: "auto",
            fontSize: 16,
            color: "rgba(0,0,0,0.4)",
            flexShrink: 0,
          }}
        />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: anchorEl?.offsetWidth,
              borderRadius: 3,
              boxShadow:
                "0 8px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.1)",
              p: 0.5,
            },
          },
        }}
      >
        {PLATFORM_OPTIONS.map((p) => {
          const active = selected.includes(p.id);
          return (
            <Box
              key={p.id}
              onClick={() => toggle(p.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 2,
                fontSize: "0.8125rem",
                color: "#1f1d25",
                cursor: "pointer",
                userSelect: "none",
                "&:hover": { bgcolor: "#f5f4f8" },
              }}
            >
              {/* Mini checkbox */}
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "3px",
                  border: "1px solid",
                  borderColor: active ? BRAND : "rgba(0,0,0,0.2)",
                  bgcolor: active ? BRAND : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.1s",
                }}
              >
                {active && (
                  <CheckIcon sx={{ fontSize: 9, color: "#fff" }} />
                )}
              </Box>
              <Box
                component="img"
                src={p.icon}
                alt=""
                sx={{ width: 16, height: 16, objectFit: "contain", flexShrink: 0 }}
              />
              <Typography component="span" sx={{ fontSize: "0.8125rem" }}>
                {p.label}
              </Typography>
            </Box>
          );
        })}
      </Popover>
    </>
  );
}

// ─── TagInput ──────────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (t: string[]) => void;
}) {
  const [val, setVal] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const v = raw.trim().replace(/,$/, "").trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setVal("");
  };
  const remove = (i: number) => onChange(tags.filter((_, idx) => idx !== i));

  return (
    <Box
      onClick={() => ref.current?.focus()}
      sx={{
        minHeight: 40,
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 0.5,
        border: "1px solid #CAC9CF",
        borderRadius: "8px",
        px: 1.25,
        py: 0.75,
        bgcolor: "#F9FAFA",
        cursor: "text",
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:hover": { borderColor: "#B0B0B5" },
        "&:focus-within": {
          borderColor: BRAND,
          boxShadow: `0 0 0 1px ${BRAND}`,
        },
      }}
    >
      {tags.map((tag, i) => (
        <Box
          key={tag}
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.25,
            bgcolor: "#F3F4F6",
            color: "#686576",
            fontSize: "0.6875rem",
            px: 1,
            py: 0.25,
            borderRadius: "999px",
            userSelect: "none",
            border: "1px solid #E4E4E8",
          }}
        >
          {tag}
          <Box
            component="button"
            type="button"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              remove(i);
            }}
            sx={{
              color: "#9C99A9",
              lineHeight: 1,
              cursor: "pointer",
              ml: 0.25,
              border: "none",
              bgcolor: "transparent",
              p: 0,
              fontSize: "0.875rem",
              "&:hover": { color: "#686576" },
            }}
          >
            ×
          </Box>
        </Box>
      ))}
      <Box
        component="input"
        ref={ref}
        type="text"
        value={val}
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const v = e.target.value;
          if (v.endsWith(",")) {
            add(v);
            return;
          }
          setVal(v);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(val);
          }
          if (e.key === "Backspace" && !val && tags.length) remove(tags.length - 1);
        }}
        sx={{
          flex: 1,
          minWidth: 80,
          bgcolor: "transparent",
          fontSize: "0.8125rem",
          color: "#1f1d25",
          border: "none",
          outline: "none",
          lineHeight: 1.4,
          "&::placeholder": { color: "rgba(0,0,0,0.38)" },
        }}
      />
    </Box>
  );
}

// ─── OwnerDropdown — Popover-based ────────────────────────────────────────────

function OwnerDropdown({
  ownerId,
  onChange,
}: {
  ownerId: string;
  onChange: (id: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const selectedOwner = PROJECT_OWNERS.find((o) => o.id === ownerId);

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e: React.MouseEvent<HTMLElement>) =>
          setAnchorEl(e.currentTarget)
        }
        sx={{
          ...fieldSx,
          ...(open && { borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }),
        }}
      >
        {selectedOwner ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
            <OwnerAvatar owner={selectedOwner} size={22} />
            <Typography component="span" sx={{ fontSize: "0.8125rem", color: "#1f1d25", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedOwner.name}
            </Typography>
            <Typography component="span" sx={{ fontSize: "0.6875rem", color: "rgba(0,0,0,0.38)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ml: 0.5, display: { xs: "none", md: "block" } }}>
              {selectedOwner.email}
            </Typography>
          </Box>
        ) : (
          <Typography component="span" sx={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.38)", flex: 1 }}>
            Select owner
          </Typography>
        )}
        <KeyboardArrowDownIcon sx={{ ml: "auto", fontSize: 16, color: "rgba(0,0,0,0.4)", flexShrink: 0 }} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: anchorEl?.offsetWidth,
              maxHeight: 260,
              overflowY: "auto",
              borderRadius: 3,
              boxShadow: "0 8px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.1)",
              p: 0.5,
            },
          },
        }}
      >
        {PROJECT_OWNERS.map((owner) => (
          <Box
            key={owner.id}
            onClick={() => { onChange(owner.id); setAnchorEl(null); }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": { bgcolor: "#f5f4f8" },
            }}
          >
            <OwnerAvatar owner={owner} size={24} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.8125rem", color: "#1f1d25", lineHeight: 1.3 }}>
                {owner.name}
              </Typography>
              <Typography sx={{ fontSize: "0.6875rem", color: "rgba(0,0,0,0.38)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {owner.email}
              </Typography>
            </Box>
            {owner.id === ownerId && (
              <CheckIcon sx={{ fontSize: 13, color: BRAND, flexShrink: 0 }} />
            )}
          </Box>
        ))}
      </Popover>
    </>
  );
}

// ─── AccountDropdown ──────────────────────────────────────────────────────────

function AccountDropdown({
  account,
  onChange,
}: {
  account: string;
  onChange: (v: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e: React.MouseEvent<HTMLElement>) =>
          setAnchorEl(e.currentTarget)
        }
        sx={{
          ...fieldSx,
          ...(open && { borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` }),
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: "0.8125rem",
            color: account ? "#1f1d25" : "rgba(0,0,0,0.38)",
            flex: 1,
            textAlign: "left",
          }}
        >
          {account || "Select account"}
        </Typography>
        <KeyboardArrowDownIcon sx={{ ml: "auto", fontSize: 16, color: "rgba(0,0,0,0.4)", flexShrink: 0 }} />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: anchorEl?.offsetWidth,
              borderRadius: 3,
              boxShadow: "0 8px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.1)",
              p: 0.5,
            },
          },
        }}
      >
        {ACCOUNTS.map((a) => (
          <Box
            key={a}
            onClick={() => { onChange(a); setAnchorEl(null); }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              fontSize: "0.8125rem",
              color: "#1f1d25",
              cursor: "pointer",
              "&:hover": { bgcolor: "#f5f4f8" },
            }}
          >
            <Typography component="span" sx={{ flex: 1, fontSize: "0.8125rem" }}>
              {a}
            </Typography>
            {account === a && (
              <CheckIcon sx={{ fontSize: 13, color: BRAND }} />
            )}
          </Box>
        ))}
      </Popover>
    </>
  );
}

// ─── CreateProjectDialog ───────────────────────────────────────────────────────

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSave,
  brandOptions = [],
  existingNames,
  initialData,
  mode = "create",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: NewProjectInput) => void;
  brandOptions?: { id: string; name: string }[];
  existingNames?: string[];
  initialData?: Partial<NewProjectInput>;
  mode?: "create" | "edit";
}) {
  const [name, setName]           = useState("");
  const [account, setAccount]     = useState("");
  const [brand, setBrand]         = useState("");
  const [ownerId, setOwnerId]     = useState("jorge-verlindo");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate]     = useState<Date | undefined>(undefined);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [tags, setTags]           = useState<string[]>([]);
  const [recOffers, setRecOffers]       = useState(true);
  const [recTemplates, setRecTemplates] = useState(true);
  const [recTheme, setRecTheme]         = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  void brandOptions;

  useEffect(() => {
    if (open && initialData) {
      if (initialData.name      !== undefined) setName(initialData.name);
      if (initialData.account   !== undefined) setAccount(initialData.account);
      if (initialData.brand     !== undefined) setBrand(initialData.brand);
      if (initialData.ownerId   !== undefined) setOwnerId(initialData.ownerId);
      if (initialData.startDate !== undefined) setStartDate(initialData.startDate);
      if (initialData.endDate   !== undefined) setEndDate(initialData.endDate);
      if (initialData.platforms !== undefined) setPlatforms(initialData.platforms);
      if (initialData.tags      !== undefined) setTags(initialData.tags);
    }
  }, [open, initialData]);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "Project name is required";
    const norm = (s: string) => s.trim().toLowerCase();
    if (!e.name && existingNames?.some((n) => norm(n) === norm(name))) {
      e.name = "A project with this name already exists";
    }
    if (!startDate) e.startDate = "Start date is required";
    if (!endDate)   e.endDate   = "End date is required";
    if (startDate && endDate && endDate < startDate)
      e.endDate = "End date must be after start date";
    return e;
  };

  const resetForm = () => {
    setName(""); setAccount(""); setBrand(""); setOwnerId("jorge-verlindo");
    setStartDate(undefined); setEndDate(undefined);
    setPlatforms([]); setTags([]);
    setRecOffers(true); setRecTemplates(true); setRecTheme(true);
    setErrors({});
  };

  const handleSave = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      name, account, brand, ownerId,
      startDate: startDate!,
      endDate: endDate!,
      platforms, tags,
      recommendations: { offers: recOffers, templates: recTemplates, themeAndLogos: recTheme },
    });
    resetForm();
    onOpenChange(false);
  };

  const handleCancel = () => { resetForm(); onOpenChange(false); };

  // Date helpers — convert Date <-> yyyy-mm-dd string for native input
  const toInputValue = (d: Date | undefined) =>
    d ? d.toISOString().slice(0, 10) : "";
  const fromInputValue = (s: string) => (s ? new Date(s + "T00:00:00") : undefined);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 900,
          maxWidth: "calc(100vw - 32px)",
          borderRadius: 6,
          p: 0,
          gap: 0,
          overflow: "hidden",
          boxShadow:
            "0 11px 15px rgba(0,0,0,0.2), 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          pt: 2,
          pb: 1,
          bgcolor: "#fff",
        }}
      >
        <Typography
          sx={{ fontSize: "1.25rem", fontWeight: 500, color: "#1f1d25", lineHeight: 1.3 }}
        >
          {mode === "edit" ? "Edit Project" : "Create Project"}
        </Typography>
        <IconButton
          onClick={handleCancel}
          size="small"
          sx={{
            color: "rgba(0,0,0,0.54)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ── Body — two columns ─────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", minHeight: 0 }}>

        {/* Left: Basic Information */}
        <Box
          sx={{
            flex: 1,
            px: 2,
            py: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.75,
            overflowY: "auto",
            maxHeight: 480,
          }}
        >
          {/* Project Name */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography component="label" sx={labelSx}>
              Project Name
            </Typography>
            <Box
              component="input"
              type="text"
              autoFocus
              placeholder="e.g. Honda Summer Lease Event"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              sx={{
                height: 40,
                width: "100%",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: errors.name ? "#D2323F" : "#CAC9CF",
                boxShadow: errors.name ? "0 0 0 1px #D2323F" : "none",
                px: 1.5,
                fontSize: "0.8125rem",
                color: "#1f1d25",
                bgcolor: "#F9FAFA",
                outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
                "&::placeholder": { color: "rgba(0,0,0,0.38)" },
                "&:hover": { borderColor: errors.name ? "#D2323F" : "#B0B0B5" },
                "&:focus": {
                  borderColor: errors.name ? "#D2323F" : BRAND,
                  boxShadow: `0 0 0 1px ${errors.name ? "#D2323F" : BRAND}`,
                },
              }}
            />
            {errors.name && (
              <Typography sx={{ fontSize: "0.6875rem", color: "#D2323F" }}>
                {errors.name}
              </Typography>
            )}
          </Box>

          {/* Account */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography component="label" sx={labelSx}>
              Account
            </Typography>
            <AccountDropdown account={account} onChange={setAccount} />
          </Box>

          {/* Owner */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography component="label" sx={labelSx}>
              Owner
            </Typography>
            <OwnerDropdown ownerId={ownerId} onChange={setOwnerId} />
          </Box>

          {/* Dates */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {/* Start Date */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography component="label" sx={labelSx}>
                Start Date
              </Typography>
              <Box
                component="input"
                type="date"
                value={toInputValue(startDate)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setStartDate(fromInputValue(e.target.value));
                  if (errors.startDate)
                    setErrors((p) => ({ ...p, startDate: undefined }));
                }}
                sx={{
                  height: 40,
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: errors.startDate ? "#D2323F" : "#CAC9CF",
                  boxShadow: errors.startDate ? "0 0 0 1px #D2323F" : "none",
                  px: 1.5,
                  fontSize: "0.8125rem",
                  color: "#1f1d25",
                  bgcolor: "#F9FAFA",
                  outline: "none",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                  "&:hover": { borderColor: errors.startDate ? "#D2323F" : "#B0B0B5" },
                  "&:focus": {
                    borderColor: errors.startDate ? "#D2323F" : BRAND,
                    boxShadow: `0 0 0 1px ${errors.startDate ? "#D2323F" : BRAND}`,
                  },
                }}
              />
              {errors.startDate && (
                <Typography sx={{ fontSize: "0.6875rem", color: "#D2323F" }}>
                  {errors.startDate}
                </Typography>
              )}
            </Box>

            {/* Expiration Date */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography component="label" sx={labelSx}>
                Expiration Date
              </Typography>
              <Box
                component="input"
                type="date"
                value={toInputValue(endDate)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEndDate(fromInputValue(e.target.value));
                  if (errors.endDate)
                    setErrors((p) => ({ ...p, endDate: undefined }));
                }}
                sx={{
                  height: 40,
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: errors.endDate ? "#D2323F" : "#CAC9CF",
                  boxShadow: errors.endDate ? "0 0 0 1px #D2323F" : "none",
                  px: 1.5,
                  fontSize: "0.8125rem",
                  color: "#1f1d25",
                  bgcolor: "#F9FAFA",
                  outline: "none",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                  "&:hover": { borderColor: errors.endDate ? "#D2323F" : "#B0B0B5" },
                  "&:focus": {
                    borderColor: errors.endDate ? "#D2323F" : BRAND,
                    boxShadow: `0 0 0 1px ${errors.endDate ? "#D2323F" : BRAND}`,
                  },
                }}
              />
              {errors.endDate && (
                <Typography sx={{ fontSize: "0.6875rem", color: "#D2323F" }}>
                  {errors.endDate}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Platforms */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography component="label" sx={labelSx}>
              Platforms
            </Typography>
            <PlatformMultiSelect selected={platforms} onChange={setPlatforms} />
          </Box>

          {/* Tags */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography component="label" sx={labelSx}>
              Tags
            </Typography>
            <TagInput tags={tags} onChange={setTags} />
          </Box>
        </Box>

        {/* Right: Project Recommendations */}
        <Box
          sx={{
            width: 300,
            flexShrink: 0,
            px: 2,
            py: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            bgcolor: "#fff",
            overflowY: "auto",
            maxHeight: 480,
          }}
        >
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#1f1d25" }}>
            Project Recommendations
          </Typography>

          <RecommendationCard
            checked={recOffers}
            onChange={setRecOffers}
            title="Recommend offers"
            description="Our model calculates best offers bases on age, volume, PVI and Incentive type."
          />

          <RecommendationCard
            checked={recTemplates}
            onChange={setRecTemplates}
            title="Recommend templates"
            description="We will choose the templates that matches the selected dimensions and aligns best with the recommended offers."
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.6875rem", color: "rgba(0,0,0,0.6)" }}>
                * Dimensions
              </Typography>
              <Box
                component="button"
                disabled
                tabIndex={-1}
                sx={{
                  height: 36,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  border: "1px solid #CAC9CF",
                  borderRadius: "6px",
                  px: 1.5,
                  fontSize: "0.75rem",
                  bgcolor: "#F9FAFA",
                  textAlign: "left",
                  opacity: 0.5,
                  cursor: "not-allowed",
                }}
              >
                <Typography
                  component="span"
                  sx={{ flex: 1, fontSize: "0.75rem", color: "rgba(0,0,0,0.38)" }}
                >
                  Select dimensions
                </Typography>
                <KeyboardArrowDownIcon sx={{ fontSize: 14, color: "rgba(0,0,0,0.4)", flexShrink: 0 }} />
              </Box>
            </Box>
          </RecommendationCard>

          <RecommendationCard
            checked={recTheme}
            onChange={setRecTheme}
            title="Recommend theme and logos"
            description="We are selecting a basic background and logo to get you started."
          />
        </Box>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1,
          px: 2,
          py: 1.5,
          bgcolor: "#fff",
        }}
      >
        <Button
          onClick={handleCancel}
          sx={{
            px: 2,
            py: 0.75,
            borderRadius: "999px",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: BRAND,
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(71,59,171,0.06)" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!name.trim()}
          sx={{
            px: 2,
            py: 0.75,
            borderRadius: "999px",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#fff",
            bgcolor: BRAND,
            textTransform: "none",
            "&:hover": { bgcolor: "#3a2f9a" },
            "&.Mui-disabled": { opacity: 0.5, color: "#fff", bgcolor: BRAND },
          }}
        >
          {mode === "edit" ? "Save Changes" : "Create Project"}
        </Button>
      </Box>
    </Dialog>
  );
}
