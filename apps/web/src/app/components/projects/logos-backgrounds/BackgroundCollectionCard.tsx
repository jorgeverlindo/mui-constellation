"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FolderIcon from "@mui/icons-material/Folder";
import { getSquareThumbnail } from "../lib/bg-thumbnail";
import { AssetCard } from "../ui/AssetCard";

export interface BackgroundDimension {
  width: number;
  height: number;
  url: string;
}

export interface BackgroundCollection {
  id: string;
  name: string;
  type: string;
  sizes: number;
  folder: string;
  color: string;
  thumbnail: string;
  images: Record<string, string>;        // templateId → url (for known template sizes)
  dimensions?: BackgroundDimension[];    // all available sizes with actual dimensions
  isLifestyle?: boolean;                 // already contains the product/car image
  vehicleTag?: string;                   // single-vehicle tag — e.g. "CRV-Trailsport"
  vehicleTags?: string[];               // multi-vehicle tags — all must match combo slots
}

interface BackgroundCollectionCardProps {
  collection: BackgroundCollection;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

/** Derives a "W × H" label from the first image key (used for non-collection assets) */
function getDimensionLabel(collection: BackgroundCollection): string {
  const firstKey = Object.keys(collection.images)[0] ?? "";
  const match = firstKey.match(/(\d+)x(\d+)/i);
  if (match) return `${match[1]} × ${match[2]}`;
  return `${collection.sizes} sizes`;
}

/** Derives display tags from the collection's metadata */
function getTags(collection: BackgroundCollection): string[] {
  const tags: string[] = [];
  if (collection.vehicleTag) {
    tags.push(collection.vehicleTag.split("-")[0]);
  }
  if (collection.isLifestyle) tags.push("lifestyle");
  tags.push(collection.type || "background");
  return tags;
}

export function BackgroundCollectionCard({
  collection,
  selected = false,
  onSelect,
}: BackgroundCollectionCardProps) {
  const tags = getTags(collection);
  const bgCount = collection.sizes ?? Object.keys(collection.images).length;
  const subtitle = collection.isLifestyle
    ? `PNG | ${getDimensionLabel(collection)}`
    : `${bgCount} background${bgCount !== 1 ? "s" : ""}`;

  return (
    <AssetCard
      selected={selected}
      onSelect={(checked) => onSelect?.(collection.id, checked)}
      onClick={() => onSelect?.(collection.id, !selected)}
      menuButton={null}
      preview={
        <Box
          component="img"
          src={getSquareThumbnail(collection)}
          alt={collection.name}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      }
      footer={
        <>
          {/* Title + ⋮ */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.5, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                color: "text.primary",
                lineHeight: "snug",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {collection.name}
            </Typography>
            <IconButton
              size="small"
              sx={{ flexShrink: 0, color: "text.secondary", mt: "2px", p: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>

          {/* Subtitle */}
          <Typography sx={{ fontSize: "11px", color: "text.secondary", mt: "2px" }}>
            {subtitle}
          </Typography>

          {/* Tags */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
            {tags.map((tag) => (
              <Box
                key={tag}
                component="span"
                sx={{
                  fontSize: "11px",
                  color: "text.secondary",
                  bgcolor: "#f0f2f4",
                  px: "8px",
                  py: "3px",
                  borderRadius: "4px",
                  lineHeight: 1,
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>

          {/* Folder path */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
            <FolderIcon sx={{ fontSize: 11, color: "rgba(71,59,171,0.6)", flexShrink: 0 }} />
            <Typography
              sx={{
                fontSize: "11px",
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {collection.folder}
            </Typography>
          </Box>
        </>
      }
    />
  );
}
