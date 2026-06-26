"use client";

import { ReactNode } from "react";
import Box from "@mui/material/Box";

interface CardViewVerticalProps {
  children: ReactNode;
}

/**
 * Standard vertical card grid — Constellation Design System.
 *
 * Cards resize fluidly between 240 px (minimum) and 1fr (maximum)
 * as the viewport changes, fitting as many columns as possible.
 * Uses auto-fill so partially-filled last rows keep their column widths.
 *
 * Usage:
 *   <CardViewVertical>
 *     {items.map(item => <AssetCard key={item.id} ... />)}
 *   </CardViewVertical>
 */
export function CardViewVertical({ children }: CardViewVerticalProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "20px",
      }}
    >
      {children}
    </Box>
  );
}
