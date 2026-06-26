import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import TuneIcon from "@mui/icons-material/Tune";
import { generateImage } from "./agent/replicateClient";

// ─── Constellation arc animation ──────────────────────────────────────────────
interface ArcState { outer: boolean; middle: boolean; inner: boolean; }

function ConstellationArcMark({ arcs, size = 20 }: { arcs: ArcState; size?: number }) {
  return (
    <svg width={size * 0.56} height={size} viewBox="0 0 18 33" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M2.22422 16.0471C2.22422 7.57204 8.61025 0.631495 16.6988 0.0413128C16.332 0.0118036 15.9594 0 15.5867 0C6.97648 0 0 7.18252 0 16.0471C0 24.9116 6.97648 32.0941 15.5867 32.0941C15.9594 32.0941 16.332 32.0823 16.6988 32.0528C8.61025 31.4626 2.22422 24.5221 2.22422 16.0471Z"
        fill="#473bab" style={{ opacity: arcs.outer ? 0.92 : 0.22, transition: 'opacity 120ms ease' }} />
      <path d="M6.12227 16.047C6.12227 9.69073 10.9089 4.48533 16.9796 4.04269C16.7045 4.02498 16.4236 4.01318 16.1427 4.01318C9.6879 4.01318 4.4541 9.40154 4.4541 16.047C4.4541 22.6924 9.6879 28.0808 16.1427 28.0808C16.4236 28.0808 16.7045 28.069 16.9796 28.0513C10.9146 27.6086 6.12227 22.4032 6.12227 16.047Z"
        fill="#6356e1" style={{ opacity: arcs.middle ? 0.82 : 0.18, transition: 'opacity 120ms ease' }} />
      <path d="M17.2605 8.04407C17.0771 8.03227 16.8937 8.02637 16.7045 8.02637C12.3994 8.02637 8.9082 11.6206 8.9082 16.0529C8.9082 20.4851 12.3994 24.0793 16.7045 24.0793C16.8937 24.0793 17.0771 24.0734 17.2605 24.0557C13.2134 23.7606 10.0261 20.2904 10.0261 16.0529C10.0261 11.8154 13.2191 8.34507 17.2605 8.04998V8.04407Z"
        fill="#8c86fc" style={{ opacity: arcs.inner ? 0.72 : 0.12, transition: 'opacity 120ms ease' }} />
    </svg>
  );
}

function useConstellationAnim(running: boolean): ArcState {
  const [arcs, setArcs] = useState<ArcState>({ outer: false, middle: false, inner: false });
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => { timerRefs.current.forEach(clearTimeout); timerRefs.current = []; };
  const all = (lit: boolean) => setArcs({ outer: lit, middle: lit, inner: lit });
  const setO = (lit: boolean) => setArcs(s => ({ ...s, outer: lit }));
  const setM = (lit: boolean) => setArcs(s => ({ ...s, middle: lit }));
  const setI = (lit: boolean) => setArcs(s => ({ ...s, inner: lit }));

  useEffect(() => {
    if (!running) { clearAll(); all(false); return; }
    let cancelled = false;
    function loop() {
      if (cancelled) return;
      const timers: ReturnType<typeof setTimeout>[] = [];
      let t = 80;
      const q = (delay: number, fn: () => void) => {
        t += delay;
        const id = setTimeout(() => { if (!cancelled) fn(); }, t);
        timers.push(id);
      };
      all(false);
      q(80,  () => setO(true));
      q(240, () => setM(true));
      q(240, () => setI(true));
      q(600, () => {});
      q(180, () => all(false));
      q(380, () => {});
      q(140, () => all(true));
      q(280, () => all(false));
      q(200, () => all(true));
      q(280, () => all(false));
      q(320, () => {});
      q(80,  () => { all(false); setO(true); });
      q(220, () => { setO(false); setM(true); });
      q(220, () => { setM(false); setI(true); });
      q(220, () => { setI(false); });
      q(140, () => all(true));
      q(420, () => all(false));
      q(380, () => loop());
      timerRefs.current = timers;
    }
    loop();
    return () => { cancelled = true; clearAll(); setArcs({ outer: false, middle: false, inner: false }); };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  return arcs;
}

// ─── Stage labels ─────────────────────────────────────────────────────────────
type BgStage = 'idle' | 's1' | 's2' | 's3' | 's4';

const STAGE_DURATIONS = [1600, 1900, 1900, 1600];

const STAGE_LABELS: Record<BgStage, string> = {
  idle: '',
  s1:   'Analyzing reference…',
  s2:   'Generating scene…',
  s3:   'Compositing details…',
  s4:   'Enhancing output…',
};

const STAGE_SUBTASKS: Record<string, [string, string, string]> = {
  s1: ['Loading background reference', 'Reading scene metadata',   'Parsing prompt context'],
  s2: ['Framing scene composition',    'Matching lighting angle',  'Drafting scene layout'],
  s3: ['Blending background layers',   'Compositing shadows',      'Merging background plates'],
  s4: ['Sharpening edge detail',       'Color grading output',     'Final render pass'],
};

function BgGenerateOverlay({ isRunning }: { isRunning: boolean }) {
  const [stage,   setStage]   = useState<BgStage>('idle');
  const [subStep, setSubStep] = useState(0);
  const arcs = useConstellationAnim(isRunning && stage !== 'idle');

  useEffect(() => {
    if (!isRunning) { setStage('idle'); setSubStep(0); return; }
    let cancelled = false;
    const stageKeys: BgStage[] = ['s1', 's2', 's3', 's4'];
    let elapsed = 0;

    stageKeys.forEach((key, si) => {
      const dur = STAGE_DURATIONS[si];
      const start = elapsed;
      elapsed += dur;
      setTimeout(() => {
        if (cancelled) return;
        setStage(key);
        setSubStep(0);
        setTimeout(() => { if (!cancelled) setSubStep(1); }, dur * 0.35);
        setTimeout(() => { if (!cancelled) setSubStep(2); }, dur * 0.7);
      }, start);
    });

    return () => { cancelled = true; };
  }, [isRunning]);

  if (!isRunning || stage === 'idle') return null;

  const stageLabel = STAGE_LABELS[stage];
  const tasks = STAGE_SUBTASKS[stage] ?? STAGE_SUBTASKS['s1'];

  const getTaskState = (i: number): 'done' | 'active' | 'pending' => {
    if (i < subStep) return 'done';
    if (i === subStep) return 'active';
    return 'pending';
  };

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f4f5f6",
        zIndex: 20,
        borderRadius: "12px",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "10px", width: 240 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", minHeight: 36 }}>
          <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36 }}>
            <ConstellationArcMark arcs={arcs} size={36} />
          </Box>
          <Typography
            sx={{
              flex: 1,
              minWidth: 0,
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: 1.5,
              letterSpacing: "0.15px",
              color: "#1f1d25",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {stageLabel}
          </Typography>
        </Box>
        {/* Sub-tasks */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "3px", pl: "21px", width: 166 }}>
          {tasks.map((task, i) => {
            const state = getTaskState(i);
            return (
              <Box key={task} sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {state === 'done' ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="7" stroke="#686576" strokeWidth="1.2" fill="none" />
                    <path d="M4.5 8l2.5 2.5 4-4.5" stroke="#686576" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : state === 'active' ? (
                  <Box sx={{ flexShrink: 0, width: 8, height: 8, borderRadius: "50%", bgcolor: "#6356e1", ml: "4px", mr: "4px" }} />
                ) : (
                  <Box sx={{ flexShrink: 0, width: 16, height: 16 }} />
                )}
                <Typography
                  sx={{
                    fontWeight: 400,
                    fontSize: "10px",
                    lineHeight: "10px",
                    color: "#686576",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface BackgroundLike {
  id: string;
  name: string;
  thumbnail: string;
  images: Record<string, string>;
}

interface Props {
  background: BackgroundLike;
  accountName?: string;
  onSave: (newBg: { id: string; name: string; thumbnail: string; images: Record<string, string> }) => void;
  onClose: () => void;
}

export function EditBackgroundModal({ background, accountName = "Honda of Anywhere", onSave, onClose }: Props) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const previewUrl = generatedUrl ?? background.thumbnail;
  const canSave = generatedUrl !== null;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [prompt]);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 80);
  }, []);

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || generating) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setGenerating(true);
    setError(null);

    try {
      const url = await generateImage({
        prompt: trimmed,
        modelId: "flux-kontext-pro",
        inputImage: background.thumbnail,
        signal: ctrl.signal,
      });
      if (!ctrl.signal.aborted) {
        setGeneratedUrl(url);
        setPrompt("");
      }
    } catch (e: unknown) {
      if (!ctrl.signal.aborted) {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
    } finally {
      if (!ctrl.signal.aborted) setGenerating(false);
    }
  }, [prompt, generating, background.thumbnail]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const toPersistentUrl = (url: string) => {
    if (!url.startsWith('https://replicate.delivery') && !url.includes('replicate.com')) return url;
    return `https://res.cloudinary.com/dvq75cqna/image/fetch/f_auto,q_auto/${encodeURIComponent(url)}`;
  };

  const handleSave = () => {
    if (!canSave || !generatedUrl) return;
    const persistentUrl = toPersistentUrl(generatedUrl);
    const newImages: Record<string, string> = {};
    for (const key of Object.keys(background.images)) {
      newImages[key] = persistentUrl;
    }
    onSave({
      id: `${background.id}-custom-${Date.now()}`,
      name: background.name,
      thumbnail: persistentUrl,
      images: newImages,
    });
  };

  const handleClose = () => {
    abortRef.current?.abort();
    onClose();
  };

  const modal = (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          overflow: "hidden",
          width: "min(1000px, calc(100vw - 48px))",
          maxHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 2,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--ink, #1f1d25)",
              letterSpacing: "0.15px",
            }}
          >
            Edit Background
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              "&:hover": { bgcolor: "#F3F2F7" },
            }}
          >
            <CloseIcon sx={{ fontSize: 18, strokeWidth: 1.8, color: "rgba(31,29,37,0.56)" }} />
          </IconButton>
        </Box>

        {/* Body */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            px: 2.5,
            pb: 2.5,
            overflow: "auto",
            flex: 1,
          }}
        >
          {/* Preview + overlay */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              borderRadius: "12px",
              overflow: "hidden",
              bgcolor: "#f4f5f6",
              aspectRatio: "16/9",
            }}
          >
            {!generating && (
              <Box
                component="img"
                src={previewUrl}
                alt={background.name}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
            <BgGenerateOverlay isRunning={generating} />
          </Box>

          {/* Error */}
          {error && (
            <Typography sx={{ fontSize: "12px", color: "error.main", px: 0.5 }}>
              {error}
            </Typography>
          )}

          {/* AI Agent Input */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.12)",
              px: 1.5,
              pt: 1.5,
              pb: 1.5,
              bgcolor: "#f0f2f4",
              boxShadow: "0px 2px 1px rgba(0,0,0,0.08)",
            }}
          >
            {/* Textarea */}
            <Box
              component="textarea"
              ref={textareaRef}
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe how to customize this background…"
              rows={1}
              disabled={generating}
              sx={{
                width: "100%",
                bgcolor: "transparent",
                fontSize: "12px",
                color: "var(--ink, #1f1d25)",
                "&::placeholder": { color: "rgba(31,29,37,0.6)" },
                resize: "none",
                outline: "none",
                lineHeight: 1.43,
                letterSpacing: "0.17px",
                opacity: generating ? 0.5 : 1,
                pb: 0.5,
                border: "none",
                minHeight: 40,
                maxHeight: 120,
                overflowY: "auto",
                fontFamily: "inherit",
              }}
            />

            {/* Bottom row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {/* Paperclip */}
                <IconButton
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "1px solid rgba(0,0,0,0.12)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
                  }}
                >
                  <AttachFileIcon sx={{ fontSize: 16, color: "rgba(31,29,37,0.56)" }} />
                </IconButton>

                {/* Dealer chip */}
                <Box
                  component="button"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    height: 28,
                    px: "10px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(0,0,0,0.12)",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.46px",
                    color: "rgba(17,16,20,0.56)",
                    cursor: "pointer",
                    bgcolor: "transparent",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
                    transition: "background 0.15s",
                  }}
                >
                  <TuneIcon sx={{ fontSize: 14 }} />
                  {accountName}
                </Box>
              </Box>

              {/* Send button */}
              <Box
                component="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor: (!prompt.trim() || generating) ? "not-allowed" : "pointer",
                  bgcolor: prompt.trim() && !generating ? "#473bab" : "rgba(0,0,0,0.26)",
                  transition: "background 0.15s",
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: 16, color: "#fff", strokeWidth: 2.5 }} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            px: 2.5,
            py: 1.5,
            flexShrink: 0,
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              height: 36,
              px: 2,
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.4px",
              color: "#473bab",
              "&:hover": { bgcolor: "rgba(71,59,171,0.08)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            variant="contained"
            sx={{
              height: 36,
              px: 2,
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.4px",
              bgcolor: canSave ? "#473bab" : "rgba(0,0,0,0.26)",
              color: "#fff",
              cursor: canSave ? "pointer" : "not-allowed",
              "&:hover": { bgcolor: canSave ? 'primary.dark' : "rgba(0,0,0,0.26)" },
              "&:disabled": { bgcolor: "rgba(0,0,0,0.26)", color: "#fff" },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return createPortal(modal, document.body);
}
