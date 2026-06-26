import React, { useState, useRef } from 'react';
import { Box, Fade } from '@mui/material';
import { ProjectsRevisionWrapper } from './ProjectsRevisionWrapper';

// Stubs for pre-approval components not ported to projects scope
export interface AnnotationItem { id: string; number: number; category: string; title: string; description: string; x: number; y: number; direction: string; }
function BeforeAfter(_props: { [k: string]: unknown }) { return null; }
function ScrollerAnnotations(_props: { annotations: AnnotationItem[]; activeId: string | null; onSelect: (id: string | null) => void }) { return null; }
function PreviewControlsZoom(_props: { [k: string]: unknown }) { return null; }
function OnboardingBubble(_props: { [k: string]: unknown }) { return null; }

// Mock Annotation Items for the sidebar
const MOCK_ANNOTATIONS: AnnotationItem[] = [
  { id: '1', number: 1, category: '3A CATA', title: 'Background Colors', description: 'Must adhere to Primary & Secondary brand color palettes.', x: 20, y: 30, direction: 'top-left' },
  { id: '2', number: 2, category: '1D CATA', title: 'Font Types', description: 'Volkswagen approved fonts must be used.', x: 60, y: 40, direction: 'top-right' },
  { id: '3', number: 3, category: '3A CATA', title: 'Legal Disclaimer', description: 'Add appropriate legal disclaimer as defined by policy.', x: 30, y: 70, direction: 'bottom-left' },
  { id: '4', number: 4, category: '2D CATA', title: 'No Graphics', description: 'Assets may not contain graphics.', x: 80, y: 80, direction: 'bottom-right' },
  { id: '5', number: 5, category: '2D CATA', title: 'Logo Placement', description: 'Logos must respect the protected area defined in the brand guidelines.', x: 10, y: 10, direction: 'top-left' },
];

export function ProjectsPreviewArea({ assets }: { assets: string[] }) {
  const [mode, setMode] = useState<'grid' | 'review'>('grid');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Zoom/Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag state for pan
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const handleAutocorrect = (index?: number) => {
    if (typeof index === 'number') setReviewIndex(index);
    setMode('review');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleAccept = () => {
    if (reviewIndex < assets.length - 1) {
      setReviewIndex((prev) => prev + 1);
    } else {
      setMode('grid');
      setIsSuccess(true);
      setActiveAnnotationId(null);
    }
  };

  const handleCancel = () => {
    setMode('grid');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleNext = () => {
    if (reviewIndex < assets.length - 1) setReviewIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (reviewIndex > 0) setReviewIndex((prev) => prev - 1);
  };

  // Zoom Controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Pan handlers (replacing framer-motion drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    setPan({
      x: dragStartRef.current.panX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.panY + (e.clientY - dragStartRef.current.y),
    });
  };
  const handlePointerUp = () => { dragStartRef.current = null; };

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%', bgcolor: 'surface.canvas', overflow: 'hidden', p: 2, gap: 2 }}>
      {/* Left Sidebar: ScrollerAnnotations (Hidden in review mode) */}
      {mode === 'grid' && (
        <Box sx={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 20 }}>
          <ScrollerAnnotations
            annotations={isSuccess ? [] : MOCK_ANNOTATIONS}
            activeId={activeAnnotationId}
            onSelect={setActiveAnnotationId}
          />
          {isSuccess && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', p: 2, bgcolor: 'surface.canvas', zIndex: 30 }}>
              <Box
                sx={{
                  bgcolor: '#e8f5e9',
                  color: 'success.main',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 99,
                  fontSize: '11px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  width: '100%',
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#1b5e20' }} />
                No visual issues
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Canvas */}
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative', bgcolor: 'surface.canvas' }}>
          {/* Grid mode */}
          <Fade in={mode === 'grid'} unmountOnExit>
            <Box sx={{ width: '100%', height: '100%' }}>
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <Box
                  ref={containerRef}
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: dragStartRef.current ? 'none' : 'transform 0.1s',
                  }}
                >
                  {/* The Revision Wrapper (The Page) */}
                  <Box
                    sx={{ pointerEvents: 'auto' }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <ProjectsRevisionWrapper
                      assets={assets}
                      onAutocorrect={handleAutocorrect}
                      annotations={isSuccess ? [] : MOCK_ANNOTATIONS}
                      activeId={activeAnnotationId}
                      onPinClick={setActiveAnnotationId}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Fade>

          {/* Review mode placeholder */}
          <Fade in={mode === 'review'} unmountOnExit>
            <Box sx={{ width: '100%', height: '100%' }} />
          </Fade>

          {/* Onboarding Bubble (Overlay) - Show in Grid mode */}
          {mode === 'grid' && showOnboarding && (
            <OnboardingBubble
              isVisible={true}
              onSkip={() => setShowOnboarding(false)}
              onAutocorrect={() => handleAutocorrect(0)}
              style={{ position: 'absolute', left: 0, top: 64, zIndex: 1005 }}
            />
          )}

          {/* BeforeAfter Overlay (Fixed Position, No Scroll) */}
          <Fade in={mode === 'review'} unmountOnExit>
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 50 }}>
              <BeforeAfter
                isVisible={true}
                image={assets[reviewIndex]}
                onAccept={handleAccept}
                onCancel={handleCancel}
                style={{ position: 'relative', inset: 'auto', width: '100%', height: '100%' }}
                // Navigation Props
                onNext={handleNext}
                onPrev={handlePrev}
                hasPrevious={reviewIndex > 0}
                hasNext={reviewIndex < assets.length - 1}
                currentIndex={reviewIndex}
                totalCount={assets.length}
                // Pass mock annotations adapted for single view if needed
                annotations={[
                  ...MOCK_ANNOTATIONS.slice(0, 2).map((a) => ({ ...a, x: 20, y: 30 })),
                  ...MOCK_ANNOTATIONS.slice(2, 3).map((a) => ({ ...a, x: 60, y: 40 })),
                ]}
              />
            </Box>
          </Fade>
        </Box>

        {/* Bottom Controls - Shared for both modes */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 40,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 600, pointerEvents: 'auto' }}>
            <PreviewControlsZoom
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleReset}
              onAutocorrect={() => handleAutocorrect(reviewIndex)}
              onRotate={() => {}}
              onDelete={() => {}}
              onEditSource={() => {}}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
