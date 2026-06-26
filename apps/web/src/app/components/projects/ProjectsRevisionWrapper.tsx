import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Stubs for components not ported to projects scope
function ImageWithFallback({ src, alt, style }: { src: string; alt?: string; style?: React.CSSProperties }) {
  return <img src={src} alt={alt ?? ''} style={style} />;
}
function InteractiveAnnotation(_props: { [k: string]: unknown }) { return null; }
export interface AnnotationItem { id: string; number: number; category: string; title: string; description: string; x: number; y: number; direction: string; }

interface ProjectsRevisionWrapperProps {
  assets: string[];
  onAutocorrect: (index: number) => void;
  annotations: AnnotationItem[];
  activeId: string | null;
  onPinClick: (id: string | null) => void;
}

export function ProjectsRevisionWrapper({
  assets,
  onAutocorrect,
  annotations,
  activeId,
  onPinClick,
}: ProjectsRevisionWrapperProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(assets.length / itemsPerPage);

  const startIndex = currentPage * itemsPerPage;
  const currentAssets = assets.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'surface.canvas', position: 'relative' }}>
      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          sx={{
            bgcolor: 'white',
            p: 4,
            minHeight: 600,
            width: '100%',
            maxWidth: 800,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s',
            transformOrigin: 'center',
          }}
        >
          {/* Header Text */}
          <Box sx={{ mb: 3, flexShrink: 0 }}>
            <Box
              component="p"
              sx={{
                fontSize: '9px',
                fontWeight: 500,
                color: 'black',
                textTransform: 'uppercase',
                letterSpacing: '0.14px',
                m: 0,
              }}
            >
              Display – 2025 – VW Batch 1 Still Ads
            </Box>
          </Box>

          {/* Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 4,
              flex: 1,
              alignContent: 'start',
            }}
          >
            {currentAssets.map((asset, localIdx) => {
              const globalIdx = startIndex + localIdx;
              const showAnnotations = globalIdx === 0;

              return (
                <Box
                  key={globalIdx}
                  sx={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.100',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover .hover-actions': { opacity: 1 },
                  }}
                >
                  <ImageWithFallback
                    src={asset}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    alt={`Ad ${globalIdx}`}
                  />

                  {/* Contextual Annotation Pins */}
                  {showAnnotations && (
                    <Box sx={{ position: 'absolute', inset: 0, zIndex: 10, overflow: 'visible' }}>
                      {annotations.map((pin) => (
                        <Box key={pin.id} sx={{ display: 'contents' }}>
                          <InteractiveAnnotation
                            {...pin}
                            isOpen={activeId === pin.id}
                            onToggle={() => onPinClick(activeId === pin.id ? null : pin.id)}
                            delay={0}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Pagination Arrows (Floating outside the white page) */}
      {totalPages > 1 && (
        <>
          <IconButton
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              p: 1.5,
              bgcolor: 'white',
              borderRadius: '50%',
              boxShadow: 3,
              zIndex: 20,
              '&:hover': { bgcolor: 'grey.50' },
              '&.Mui-disabled': { opacity: 0.3 },
            }}
          >
            <ChevronLeftIcon sx={{ width: 24, height: 24, color: '#111014' }} />
          </IconButton>
          <IconButton
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              p: 1.5,
              bgcolor: 'white',
              borderRadius: '50%',
              boxShadow: 3,
              zIndex: 20,
              '&:hover': { bgcolor: 'grey.50' },
              '&.Mui-disabled': { opacity: 0.3 },
            }}
          >
            <ChevronRightIcon sx={{ width: 24, height: 24, color: '#111014' }} />
          </IconButton>
        </>
      )}
    </Box>
  );
}
