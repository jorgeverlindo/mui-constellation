"use client";

import { useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import UploadIcon from "@mui/icons-material/Upload";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import { brandKits } from "../lib/mock-data";

interface LogoPickerProps {
  make: string;
  slotType: string;
  /** The currently selected logo's ID (for highlighting). Pass undefined to fall back to the kit default. */
  selectedLogoId?: string;
  onSelectLogo: (logoId: string) => void;
  onUpload: (dataUrl: string) => void;
  onRevert: () => void;
  onClose: () => void;
}

export function LogoPicker({
  make,
  slotType,
  selectedLogoId,
  onSelectLogo,
  onUpload,
  onRevert,
  onClose,
}: LogoPickerProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kit = brandKits.find((k) => k.oem === make);
  const logos = kit?.logos.filter((l) => l.id.startsWith(slotType + "-")) ?? [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) { onUpload(dataUrl); onClose(); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const slotLabel =
    slotType.split("-")[0].charAt(0).toUpperCase() +
    slotType.split("-")[0].slice(1) +
    " Logo";

  const defaultId = slotType + "-positive";
  const effectiveSelectedId = selectedLogoId ?? defaultId;

  return (
    <Box
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: "absolute",
        zIndex: 50,
        top: "100%",
        mt: "4px",
        left: 0,
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minWidth: 180,
      }}
    >
      <Typography
        sx={{
          fontSize: "10px",
          fontWeight: 600,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {slotLabel}
      </Typography>

      {logos.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
          {logos.map((logo) => {
            const isSelected = logo.id === effectiveSelectedId;
            return (
              <ButtonBase
                key={logo.id}
                onClick={() => { onSelectLogo(logo.id); onClose(); }}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: "#F9FAFB",
                  border: "2px solid",
                  borderColor: isSelected ? "#473bab" : "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: isSelected ? "#473bab" : "rgba(71,59,171,0.4)" },
                }}
              >
                <Box
                  component="img"
                  src={logo.image}
                  alt={logo.id}
                  sx={{ width: 36, height: 36, objectFit: "contain" }}
                />
              </ButtonBase>
            );
          })}
        </Box>
      )}

      <Divider />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <ButtonBase
        onClick={() => fileInputRef.current?.click()}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: "12px",
          color: "text.secondary",
          borderRadius: 1.5,
          px: 1,
          py: 0.75,
          width: "100%",
          justifyContent: "flex-start",
          transition: "all 0.2s",
          "&:hover": { color: "#473bab", bgcolor: "#F9FAFB" },
        }}
      >
        <UploadIcon sx={{ fontSize: 13, flexShrink: 0 }} />
        Upload
      </ButtonBase>

      <ButtonBase
        onClick={() => { onRevert(); onClose(); }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: "12px",
          color: "text.secondary",
          borderRadius: 1.5,
          px: 1,
          py: 0.75,
          width: "100%",
          justifyContent: "flex-start",
          transition: "all 0.2s",
          "&:hover": { color: "error.main", bgcolor: "#F9FAFB" },
        }}
      >
        <RotateLeftIcon sx={{ fontSize: 13, flexShrink: 0 }} />
        Revert All Overrides
      </ButtonBase>
    </Box>
  );
}
