"use client";

import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";

export function TipButton({
  tip,
  onClick,
  style,
  sx: sxOverride,
  children,
}: {
  tip: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: import('@mui/material').SxProps<import('@mui/material').Theme>;
  sx?: import('@mui/material').SxProps<import('@mui/material').Theme>;
  children?: React.ReactNode;
}) {
  return (
    <Tooltip title={tip} enterDelay={600} placement="top">
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: "#fff",
          color: "text.secondary",
          boxShadow: 1,
          "&:hover": { bgcolor: "#F3F4F6" },
          transition: "all 0.2s",
          ...(style as object),
          ...(sxOverride as object),
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

/** Tooltip wrapper — wraps any child with a delayed tooltip. */
export function TipWrapper({ tip, children }: { tip: string; children: React.ReactNode }) {
  return (
    <Tooltip title={tip} enterDelay={600} placement="top">
      <Box component="span" sx={{ display: "inline-flex" }}>
        {children}
      </Box>
    </Tooltip>
  );
}

interface SubsectionActionsProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onAddBackground?: () => void;
  /** If provided, shows a Reload button (only rendered when truthy) */
  onRestore?: () => void;
  deleteTip?: string;
  editTip?: string;
  restoreTip?: string;
}

export function SubsectionActions({
  onDelete,
  onEdit,
  onAddBackground,
  onRestore,
  deleteTip = "Delete all assets under this offer/template",
  editTip = "Edit all assets under this offer/template",
  restoreTip = "Use all templates",
}: SubsectionActionsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        ml: 1,
        opacity: 0,
        ".group-hover\\/row:hover &": { opacity: 1 },
        transition: "opacity 0.2s",
        flexShrink: 0,
      }}
    >
      <TipButton tip={deleteTip} onClick={onDelete}>
        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
      </TipButton>
      {onEdit && (
        <TipButton tip={editTip} onClick={onEdit}>
          <EditOutlinedIcon sx={{ fontSize: 14 }} />
        </TipButton>
      )}
      {onRestore && (
        <TipButton tip={restoreTip} onClick={onRestore}>
          <RotateLeftIcon sx={{ fontSize: 14 }} />
        </TipButton>
      )}
      {onAddBackground && (
        <TipButton tip="Add background for this offer/template" onClick={onAddBackground}>
          <AddIcon sx={{ fontSize: 14 }} />
        </TipButton>
      )}
    </Box>
  );
}
