"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ImageIcon from "@mui/icons-material/Image";
import UploadIcon from "@mui/icons-material/Upload";
import ShareIcon from "@mui/icons-material/Share";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckIcon from "@mui/icons-material/Check";
import PublicIcon from "@mui/icons-material/Public";

import { SelectBackgroundDialog } from "./logos-backgrounds/SelectBackgroundDialog";
import { SubsectionActions, TipWrapper } from "./logos-backgrounds/SubsectionActions";
import { LogoPicker } from "./logos-backgrounds/LogoPicker";
import { OfferAccordion, StyleOverrideButtons } from "./logos-backgrounds/OfferAccordion";
import { DataRowAccordion } from "./logos-backgrounds/DataRowAccordion";
import {
  CombinationAccordion,
  SlotPicker,
  OfferSlotThumbnail,
  COMBINATION_ID,
  KeyMessageInlineInputs,
} from "./logos-backgrounds/CombinationAccordion";
import { BackgroundCollection } from "./logos-backgrounds/BackgroundCollectionCard";
import {
  brandKits,
  getProjectTemplates,
  getProjectOffers,
  getProjectById,
  offerLibrary,
  templateLibrary,
} from "./lib/mock-data";
import type { Offer, Template } from "./lib/mock-data";
import { matchesLifestyle, matchesMultiLifestyle } from "./lib/lifestyle-data";
import { LifestyleTaggingDialog } from "./logos-backgrounds/LifestyleTaggingDialog";
import { AdTemplate, PharmaAdTemplate } from "./templates/AdTemplate";
import { TemplateWireframe } from "./templates/TemplateWireframe";
import { TemplateZoneEditor } from "./templates/TemplateZoneEditor";
import { useProjectStore, resolveTemplateImage } from "./lib/project-store";
import type { DataRow } from "./lib/project-store";
import { thumbnailScale } from "./lib/thumbnail-scale";
import { getSquareThumbnail } from "./lib/bg-thumbnail";

// ─── Types ────────────────────────────────────────────────────────────────────

type GroupBy = "offer" | "template" | "background";

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "offer", label: "Group by Offer" },
  { value: "template", label: "Group by Template" },
  { value: "background", label: "Group by Background Collection" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function LogosBackgroundsPage({
  projectId,
  onNavigateTo,
}: {
  projectId: string;
  onNavigateTo: (page: string) => void;
}) {
  const id = projectId;
  const project = getProjectById(id);
  const baseTemplates = getProjectTemplates(id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogFolder, setDialogFolder] = useState<"recents" | "background-collections">("recents");
  const [combinationOpen, setCombinationOpen] = useState<Record<string, boolean>>({});
  const [contentVisible, setContentVisible] = useState(true);

  function handleFineTuneChange(v: boolean) {
    setContentVisible(false);
    setTimeout(() => {
      setFineTune(v);
      setContentVisible(true);
    }, 150);
  }

  const [lightbox, setLightbox] = useState<{
    bg: BackgroundCollection;
    templateId: string;
    slotOffers?: typeof offers;
  } | null>(null);
  const [viewMode, setViewMode] = useState<string>("backgrounds");
  const [groupByOpen, setGroupByOpen] = useState(false);
  const groupByRef = useRef<HTMLDivElement>(null);

  const GROUP_MODES: GroupBy[] = ["offer", "template", "background"];

  function changeGroupBy(next: GroupBy) {
    setGroupBy(next as GroupBy);
  }

  function cycleGroupBy(dir: 1 | -1) {
    const idx = GROUP_MODES.indexOf(groupBy as GroupBy);
    changeGroupBy(GROUP_MODES[(idx + dir + GROUP_MODES.length) % GROUP_MODES.length]);
  }

  function toggleOffer(oid: string) {
    setOfferOpen((prev) => ({ ...prev, [oid]: !prev[oid] }));
  }

  function toggleTemplate(tid: string) {
    setTemplateOpen((prev) => ({ ...prev, [tid]: !prev[tid] }));
  }

  function toggleBg(bid: string) {
    setBgOpen((prev) => ({ ...prev, [bid]: !prev[bid] }));
  }

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (groupByRef.current && !groupByRef.current.contains(e.target as Node)) {
        setGroupByOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const {
    fineTune,
    setFineTune,
    groupBy,
    setGroupBy,
    offerOpen,
    setOfferOpen,
    templateOpen,
    setTemplateOpen,
    bgOpen,
    setBgOpen,
    backgrounds,
    addBackgrounds,
    clearBackgrounds,
    excludeBackgroundFromTemplate,
    getBackgroundsForTemplate,
    getBackgroundsForOfferTemplate,
    excludeBackgroundFromOfferTemplate,
    includeBackgroundForOfferTemplate,
    clearExclusionsForBackground,
    combinations,
    addCombination,
    removeCombination,
    setCombinationOfferAtSlot,
    reEvaluateMultiLifestyleForCombo,
    deletedOfferIds,
    addedOfferIds,
    addedTemplateIds,
    dataRows,
    activeBrandKitIds,
    setActiveBrandKit,
    activeLogoIds,
    setActiveLogoId,
    activeColors,
    setActiveColor,
    customTemplateFields,
    setCustomTemplateField,
  } = useProjectStore();

  const extraTemplates = useMemo(
    () =>
      (addedTemplateIds[id] ?? [])
        .map((tid) => templateLibrary.find((t) => t.id === tid))
        .filter((t): t is Template => !!t),
    [addedTemplateIds, id]
  );
  const templates = useMemo(
    () => [...baseTemplates, ...extraTemplates],
    [baseTemplates, extraTemplates]
  );
  const singleTemplates = useMemo(() => templates.filter((t) => t.products === 1), [templates]);
  const multiTemplates = useMemo(() => templates.filter((t) => t.products > 1), [templates]);

  const baseOffers = getProjectOffers(id);
  const extraOffers = (addedOfferIds[id] ?? [])
    .map((aid) => offerLibrary.find((o) => o.id === aid))
    .filter((o): o is Offer => !!o);
  const offers = [...baseOffers, ...extraOffers].filter((o) => !deletedOfferIds.has(o.id));
  const selectedOffer = offers.find((o) => o.id === viewMode) ?? offers[0];

  const dataRowsList: DataRow[] = dataRows[id] ?? [];
  const usesDataRows = offers.length === 0 && dataRowsList.length > 0;
  const selectedDataRow = usesDataRows
    ? dataRowsList.find((r) => r.id === viewMode) ?? null
    : null;
  const entityIds = usesDataRows
    ? dataRowsList.map((r) => r.id)
    : [...offers.map((o) => o.id), ...combinations.map((c) => c.id)];

  const [pendingAddContext, setPendingAddContext] = useState<{
    offerId: string | null;
    templateId: string | null;
  } | null>(null);
  const [taggingFile, setTaggingFile] = useState<{ file: File; url: string } | null>(null);

  function buildComboVehicleFilters(
    combo: { id: string; offerIds: (string | undefined)[] },
    resolvedOffers: typeof offers,
    resolvedMultiTemplates: typeof multiTemplates
  ): string[] {
    const slotCount = resolvedMultiTemplates[0]?.products ?? 3;
    return Array.from({ length: slotCount }, (_, i) => {
      const slotId = combo.offerIds[i] ?? resolvedOffers[i]?.id;
      const offer = resolvedOffers.find((o) => o.id === slotId);
      return offer ? `${offer.model} ${offer.trim}` : null;
    }).filter(Boolean) as string[];
  }

  function handleDeleteSubsection(offerId: string, templateId: string) {
    getBackgroundsForOfferTemplate(offerId, templateId).forEach((bg) => {
      excludeBackgroundFromOfferTemplate(offerId, templateId, bg.id);
    });
  }

  function openDialogForOfferTemplate(offerId: string | null, templateId: string | null) {
    setPendingAddContext({ offerId, templateId });
    setDialogOpen(true);
  }

  function handleAdd(collections: BackgroundCollection[]) {
    const existingIds = new Set(backgrounds.map((b) => b.id));
    addBackgrounds(collections);
    if (pendingAddContext) {
      const { offerId, templateId } = pendingAddContext;
      collections.forEach((col) => {
        const isNew = !existingIds.has(col.id);
        entityIds.forEach((eid) => {
          templates.forEach((template) => {
            const matchEntity = offerId === null || eid === offerId;
            const matchTemplate = templateId === null || template.id === templateId;
            if (matchEntity && matchTemplate) {
              includeBackgroundForOfferTemplate(eid, template.id, col.id);
            } else if (isNew) {
              excludeBackgroundFromOfferTemplate(eid, template.id, col.id);
            }
          });
        });
      });
      setPendingAddContext(null);
    } else {
      clearExclusionsForBackground(collections.map((c) => c.id));
      if (!usesDataRows) {
        const singleLifestyleAdded = collections.filter(
          (c) => c.isLifestyle && c.vehicleTag && !c.vehicleTags?.length
        );
        singleLifestyleAdded.forEach((bg) => {
          offers.forEach((offer) => {
            if (!matchesLifestyle(bg, offer.model, offer.trim)) {
              templates.forEach((tpl) => {
                excludeBackgroundFromOfferTemplate(offer.id, tpl.id, bg.id);
              });
            }
          });
          combinations.forEach((combo) => {
            multiTemplates.forEach((tpl) => {
              excludeBackgroundFromOfferTemplate(combo.id, tpl.id, bg.id);
            });
          });
        });
        const multiLifestyleAdded = collections.filter(
          (c) => c.isLifestyle && c.vehicleTags?.length
        );
        multiLifestyleAdded.forEach((bg) => {
          offers.forEach((offer) => {
            singleTemplates.forEach((tpl) => {
              excludeBackgroundFromOfferTemplate(offer.id, tpl.id, bg.id);
            });
          });
          combinations.forEach((combo) => {
            const comboVehicleFilters = buildComboVehicleFilters(combo, offers, multiTemplates);
            if (!matchesMultiLifestyle(bg, comboVehicleFilters)) {
              multiTemplates.forEach((tpl) => {
                excludeBackgroundFromOfferTemplate(combo.id, tpl.id, bg.id);
              });
            }
          });
        });
      }
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 1.5,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Styles
        </Typography>
        {fineTune && (
          <Box sx={{ position: "relative", ml: 1 }}>
            <SearchIcon
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "text.disabled",
                fontSize: 14,
              }}
            />
            <InputBase
              placeholder="Find below"
              sx={{
                pl: "28px",
                pr: 1.5,
                py: 0.75,
                fontSize: "0.75rem",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 10,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Scrollable content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 3,
          py: 2.5,
          opacity: contentVisible ? 1 : 0,
          transition: "opacity 0.15s",
        }}
      >
        {fineTune ? (
          <Box
            sx={{
              maxWidth: 1200,
              mx: "auto",
              bgcolor: "grey.100",
              borderRadius: 4,
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {/* Controls row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => cycleGroupBy(-1)}
                  sx={{ width: 28, height: 28 }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 15 }} />
                </IconButton>
                <Box ref={groupByRef} sx={{ position: "relative" }}>
                  <Button
                    variant="outlined"
                    onClick={() => setGroupByOpen((o) => !o)}
                    endIcon={
                      <ExpandMoreIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                    }
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "text.primary",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      width: 315,
                      height: 30,
                      justifyContent: "flex-start",
                      textTransform: "none",
                      "&:hover": { bgcolor: "grey.50" },
                    }}
                  >
                    {GROUP_OPTIONS.find((o) => o.value === groupBy)?.label}
                  </Button>
                  {groupByOpen && (
                    <Paper
                      elevation={4}
                      sx={{
                        position: "absolute",
                        top: "100%",
                        mt: 0.5,
                        left: 0,
                        zIndex: 30,
                        borderRadius: 3,
                        py: 0.75,
                        minWidth: "100%",
                      }}
                    >
                      {GROUP_OPTIONS.map((opt) => (
                        <MenuItem
                          key={opt.value}
                          onClick={() => {
                            changeGroupBy(opt.value);
                            setGroupByOpen(false);
                          }}
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: groupBy === opt.value ? 600 : 500,
                            color:
                              groupBy === opt.value ? "primary.main" : "text.primary",
                            py: 1.25,
                            px: 2,
                          }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Paper>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => cycleGroupBy(1)}
                  sx={{ width: 28, height: 28 }}
                >
                  <ChevronRightIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  flexShrink: 0,
                  ml: "auto",
                }}
              >
                <FineTuneSwitch value={fineTune} onChange={handleFineTuneChange} />
                <AddBackgroundMenu
                  onOpenDialog={(folder) => {
                    setPendingAddContext(null);
                    setDialogFolder(folder);
                    setDialogOpen(true);
                  }}
                  onClearAll={clearBackgrounds}
                  onLifestyleUpload={(file, url) => setTaggingFile({ file, url })}
                />
                {backgrounds.length > 0 && (
                  <Button
                    startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                    onClick={clearBackgrounds}
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      color: "primary.main",
                      textTransform: "none",
                      minWidth: 0,
                      px: 0.75,
                      py: 0.5,
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </Box>
            </Box>

            {groupBy === "offer" && !usesDataRows && <Divider sx={{ mt: 2.5 }} />}

            {usesDataRows &&
              (() => {
                const make = project.oem ?? "";
                if (!make) return null;
                const available = brandKits;
                const activeKitId = (activeBrandKitIds[id] ?? {})[make];
                const activeKit =
                  available.find((k) => k.id === activeKitId) ??
                  available.find((k) => k.oem === make) ??
                  available[0];
                if (!activeKit) return null;
                const storedColors = (activeColors[id] ?? {})[make] as
                  | [string, string]
                  | undefined;
                const makeActiveColors: [string, string] = storedColors ?? [
                  activeKit.colors[0] ?? "#000000",
                  activeKit.colors[1] ?? "#000000",
                ];
                const ftSlotTypes = Array.from(
                  new Set(templates.flatMap((t) => t.logoSlots ?? []))
                );
                return (
                  <>
                    <Divider sx={{ mt: 2.5 }} />
                    <Box sx={{ px: 1, pt: 1, pb: 0.5 }}>
                      <BrandKitRow
                        make={make}
                        available={available}
                        activeKit={activeKit}
                        slotTypes={ftSlotTypes}
                        activeLogoIds={(activeLogoIds[id] ?? {})[make] ?? {}}
                        activeColors={makeActiveColors}
                        onSelectKit={(kitId) => setActiveBrandKit(id, make, kitId)}
                        onSetLogoId={(slotType, logoId) =>
                          setActiveLogoId(id, make, slotType, logoId)
                        }
                        onSetColor={(idx, color) => setActiveColor(id, make, idx, color)}
                        compact
                      />
                    </Box>
                  </>
                );
              })()}

            {groupBy === "offer" && usesDataRows ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                {dataRowsList.map((row, ri) => (
                  <DataRowAccordion
                    key={row.id}
                    row={row}
                    rowIndex={ri}
                    backgrounds={backgrounds}
                    templates={templates}
                    open={offerOpen[row.id] ?? false}
                    onToggle={() => toggleOffer(row.id)}
                    onAddBackground={(templateId) =>
                      openDialogForOfferTemplate(row.id, templateId)
                    }
                    onAddAll={() => openDialogForOfferTemplate(row.id, null)}
                    projectId={id}
                    make={project.oem ?? ""}
                  />
                ))}
                {dataRowsList.length === 0 && (
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "text.disabled",
                      textAlign: "center",
                      py: 4,
                    }}
                  >
                    Add rows in the Data task to see them here.
                  </Typography>
                )}
              </Box>
            ) : groupBy === "offer" &&
              (() => {
                const ftSlotTypes = Array.from(
                  new Set(templates.flatMap((t) => t.logoSlots ?? []))
                );
                const ftMakeKits = Array.from(new Set(offers.map((o) => o.make)))
                  .map((make) => {
                    const available = brandKits;
                    const activeKitId = (activeBrandKitIds[id] ?? {})[make];
                    const activeKit =
                      available.find((k) => k.id === activeKitId) ??
                      available.find((k) => k.oem === make) ??
                      available[0];
                    if (!activeKit) return null;
                    const storedColors = (activeColors[id] ?? {})[make] as
                      | [string, string]
                      | undefined;
                    const makeActiveColors: [string, string] = storedColors ?? [
                      activeKit.colors[0] ?? "#000000",
                      activeKit.colors[1] ?? "#000000",
                    ];
                    return { make, available, activeKit, makeActiveColors };
                  })
                  .filter((x): x is NonNullable<typeof x> => !!x);
                return (
                  <>
                    {ftMakeKits.map(({ make, available, activeKit, makeActiveColors }, i) => (
                      <React.Fragment key={make}>
                        {i > 0 && <Divider sx={{ mt: 2.5, mb: 2.5 }} />}
                        <Box sx={{ px: 1, pt: 1 }}>
                          <BrandKitRow
                            make={make}
                            available={available}
                            activeKit={activeKit}
                            slotTypes={ftSlotTypes}
                            activeLogoIds={(activeLogoIds[id] ?? {})[make] ?? {}}
                            activeColors={makeActiveColors}
                            onSelectKit={(kitId) => setActiveBrandKit(id, make, kitId)}
                            onSetLogoId={(slotType, logoId) =>
                              setActiveLogoId(id, make, slotType, logoId)
                            }
                            onSetColor={(idx, color) => setActiveColor(id, make, idx, color)}
                            compact
                          />
                        </Box>
                        {singleTemplates.length > 0 &&
                          offers
                            .filter((o) => o.make === make)
                            .map((offer) => (
                              <OfferAccordion
                                key={offer.id}
                                offer={offer}
                                backgrounds={backgrounds}
                                templates={singleTemplates}
                                open={offerOpen[offer.id] ?? false}
                                onToggle={() => toggleOffer(offer.id)}
                                onDelete={(templateId) =>
                                  handleDeleteSubsection(offer.id, templateId)
                                }
                                onAddBackground={(templateId) =>
                                  openDialogForOfferTemplate(offer.id, templateId)
                                }
                                onAddAll={() => openDialogForOfferTemplate(offer.id, null)}
                                projectId={id}
                              />
                            ))}
                      </React.Fragment>
                    ))}
                    {multiTemplates.length > 0 &&
                      combinations.map((combo) => (
                        <CombinationAccordion
                          key={combo.id}
                          combinationId={combo.id}
                          templates={multiTemplates}
                          allOffers={offers}
                          slotOfferIds={combo.offerIds}
                          onSetSlotOffer={(slot, offerId) => {
                            setCombinationOfferAtSlot(combo.id, slot, offerId);
                            reEvaluateMultiLifestyleForCombo(
                              combo.id,
                              slot,
                              offerId,
                              offers,
                              multiTemplates.map((t) => t.id),
                              multiTemplates[0]?.products ?? 3
                            );
                          }}
                          open={combinationOpen[combo.id] ?? false}
                          onToggle={() =>
                            setCombinationOpen((prev) => ({
                              ...prev,
                              [combo.id]: !prev[combo.id],
                            }))
                          }
                          onAddBackground={(templateId) =>
                            openDialogForOfferTemplate(combo.id, templateId)
                          }
                          onAddAll={() => openDialogForOfferTemplate(combo.id, null)}
                          onDelete={
                            combinations.length > 1
                              ? () => removeCombination(combo.id)
                              : undefined
                          }
                          projectId={id}
                        />
                      ))}
                    {multiTemplates.length > 0 && (
                      <Button
                        startIcon={
                          <AddIcon sx={{ fontSize: 13, color: "primary.main" }} />
                        }
                        onClick={addCombination}
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "primary.main",
                          textTransform: "none",
                          minWidth: 0,
                          p: 0,
                        }}
                      >
                        Add Combination
                      </Button>
                    )}
                  </>
                );
              })()}

            {groupBy === "template" && (
              <Box sx={{ mt: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
                {templates.map((template) => (
                  <TemplateGroupAccordion
                    key={template.id}
                    template={template}
                    offers={offers}
                    open={templateOpen[template.id] ?? false}
                    onToggle={() => toggleTemplate(template.id)}
                    onDelete={(offerId) => handleDeleteSubsection(offerId, template.id)}
                    onAddBackground={(offerId) =>
                      openDialogForOfferTemplate(offerId, template.id)
                    }
                    onAddAll={() => openDialogForOfferTemplate(null, template.id)}
                    dealerName={project.dealerName}
                    projectId={id}
                    dataRows={dataRowsList}
                    make={project.oem ?? ""}
                  />
                ))}
              </Box>
            )}

            {groupBy === "background" && (
              <Box sx={{ mt: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
                {backgrounds.map((bg) => (
                  <BackgroundGroupAccordion
                    key={bg.id}
                    bg={bg}
                    offers={offers}
                    templates={templates}
                    open={bgOpen[bg.id] ?? false}
                    onToggle={() => toggleBg(bg.id)}
                    dealerName={project.dealerName}
                    projectId={id}
                    dataRows={dataRowsList}
                    make={project.oem ?? ""}
                  />
                ))}
              </Box>
            )}
          </Box>
        ) : (
          /* Default view */
          <Box
            sx={{
              maxWidth: backgrounds.length > 0 ? 1200 : 672,
              mx: "auto",
              bgcolor: "grey.100",
              borderRadius: 4,
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <BrandKitSection
              offers={offers}
              projectId={id}
              templates={templates}
              activeBrandKitIds={activeBrandKitIds[id] ?? {}}
              onSetActiveBrandKit={setActiveBrandKit}
              activeLogoIds={activeLogoIds[id] ?? {}}
              onSetLogoId={setActiveLogoId}
              activeColors={activeColors[id] ?? {}}
              onSetColor={setActiveColor}
              fallbackMake={offers.length === 0 ? project.oem : undefined}
              projectName={project.name}
              dealerName={project.dealerName ?? ""}
            />
            <Divider />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                {backgrounds.length > 0 && (
                  <ViewModeSelector
                    viewMode={viewMode}
                    onChange={setViewMode}
                    offers={offers}
                    singleTemplates={singleTemplates}
                    multiTemplates={multiTemplates}
                    combinations={combinations}
                    dataRows={dataRowsList}
                  />
                )}
                {backgrounds.length === 0 && (
                  <Box sx={{ flexShrink: 0 }}>
                    <Typography
                      sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary", mb: 0.5 }}
                    >
                      Backgrounds
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "text.disabled" }}>
                      Add collections or individual backgrounds
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    flexShrink: 0,
                    ml: "auto",
                  }}
                >
                  {backgrounds.length > 0 && (
                    <FineTuneSwitch value={fineTune} onChange={handleFineTuneChange} />
                  )}
                  {backgrounds.length > 0 && (
                    <AddBackgroundMenu
                      onOpenDialog={(folder) => {
                        setPendingAddContext(null);
                        setDialogFolder(folder);
                        setDialogOpen(true);
                      }}
                      onClearAll={clearBackgrounds}
                      onLifestyleUpload={(file, url) => setTaggingFile({ file, url })}
                    />
                  )}
                  {backgrounds.length > 0 && (
                    <Button
                      startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                      onClick={clearBackgrounds}
                      sx={{
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        color: "primary.main",
                        textTransform: "none",
                        minWidth: 0,
                        px: 0.75,
                        py: 0.5,
                      }}
                    >
                      Clear all
                    </Button>
                  )}
                </Box>
              </Box>

              {backgrounds.length === 0 ? (
                <Box
                  sx={{
                    bgcolor: "background.paper",
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 6,
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ color: "grey.300" }}>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                    </svg>
                  </Box>
                  <Typography sx={{ fontSize: "0.875rem", color: "text.disabled" }}>
                    No backgrounds added yet
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    <EmptyAddMenu
                      label="Add Collection"
                      variant="solid"
                      onFromPortal={() => {
                        setPendingAddContext(null);
                        setDialogFolder("background-collections");
                        setDialogOpen(true);
                      }}
                      onUpload={(files) => {
                        if (!files.length) return;
                        const url = URL.createObjectURL(files[0]);
                        handleAdd([
                          {
                            id: `upload-col-${Date.now()}`,
                            name: files[0].name.replace(/\.[^.]+$/, ""),
                            type: "Background Collection",
                            sizes: files.length,
                            folder: "Uploads",
                            color: "#9CA3AF",
                            thumbnail: url,
                            images: {},
                          },
                        ]);
                      }}
                      multiple
                    />
                    <EmptyAddMenu
                      label="Add Lifestyle"
                      variant="outline"
                      onFromPortal={() => {
                        setPendingAddContext(null);
                        setDialogFolder("recents");
                        setDialogOpen(true);
                      }}
                      onUpload={(files) => {
                        if (!files.length) return;
                        const file = files[0];
                        setTaggingFile({ file, url: URL.createObjectURL(file) });
                      }}
                    />
                  </Box>
                </Box>
              ) : viewMode === "backgrounds" ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {templates.map((template) => (
                    <TemplateBackgroundCard
                      key={template.id}
                      template={template}
                      onOpenDialog={(folder) => {
                        setDialogFolder(folder ?? "recents");
                        openDialogForOfferTemplate(null, template.id);
                      }}
                    />
                  ))}
                </Box>
              ) : selectedDataRow ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                  {templates.map((template) => {
                    const assignedBgs = getBackgroundsForOfferTemplate(
                      selectedDataRow.id,
                      template.id
                    );
                    return (
                      <Box
                        key={template.id}
                        sx={{
                          borderBottom: "1px solid",
                          borderColor: "grey.100",
                          pb: 1.5,
                          "&:last-child": { borderBottom: "none", pb: 0 },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              color: "text.secondary",
                            }}
                          >
                            {template.name}
                          </Typography>
                          <Typography sx={{ fontSize: "0.625rem", color: "text.disabled" }}>
                            {template.width}×{template.height}
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon sx={{ fontSize: 11 }} />}
                            onClick={() =>
                              openDialogForOfferTemplate(selectedDataRow.id, template.id)
                            }
                            sx={{
                              ml: 0.5,
                              fontSize: "0.625rem",
                              fontWeight: 500,
                              color: "primary.main",
                              textTransform: "none",
                              minWidth: 0,
                              p: 0,
                            }}
                          >
                            Add background
                          </Button>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {assignedBgs.map((bg) => {
                            const scale = thumbnailScale(template.width, template.height);
                            return (
                              <Box
                                key={bg.id}
                                sx={{
                                  position: "relative",
                                  flexShrink: 0,
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  "&:hover .hover-overlay": { opacity: 1 },
                                }}
                              >
                                <PharmaAdTemplate
                                  templateId={template.id}
                                  background={bg}
                                  scale={scale}
                                  projectId={id}
                                  make={project.oem ?? ""}
                                  dataFields={selectedDataRow.data}
                                />
                                <Box
                                  className="hover-overlay"
                                  sx={{
                                    position: "absolute",
                                    inset: 0,
                                    bgcolor: "rgba(0,0,0,0.4)",
                                    opacity: 0,
                                    transition: "opacity 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 0.75,
                                    zIndex: 10,
                                    borderRadius: 1,
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      excludeBackgroundFromOfferTemplate(
                                        selectedDataRow.id,
                                        template.id,
                                        bg.id
                                      )
                                    }
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      bgcolor: "background.paper",
                                      boxShadow: 1,
                                      "&:hover": { bgcolor: "grey.100" },
                                    }}
                                  >
                                    <DeleteIcon
                                      sx={{ fontSize: 13, color: "text.primary" }}
                                    />
                                  </IconButton>
                                </Box>
                              </Box>
                            );
                          })}
                          {assignedBgs.length === 0 && (
                            <Box
                              component="button"
                              onClick={() =>
                                openDialogForOfferTemplate(selectedDataRow.id, template.id)
                              }
                              sx={{
                                width: 80,
                                height: 48,
                                borderRadius: 1,
                                border: "2px dashed",
                                borderColor: "divider",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "text.disabled",
                                cursor: "pointer",
                                bgcolor: "transparent",
                                "&:hover": {
                                  borderColor: "primary.light",
                                  color: "primary.light",
                                },
                              }}
                            >
                              <AddIcon sx={{ fontSize: 16 }} />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                (() => {
                  const selectedCombo = combinations.find((c) => c.id === viewMode);
                  const slotCount = multiTemplates[0]?.products ?? 3;
                  const comboSlotOffers = selectedCombo
                    ? (Array.from({ length: slotCount }, (_, i) =>
                        offers.find(
                          (o) =>
                            o.id === (selectedCombo.offerIds[i] ?? offers[i]?.id)
                        )
                      ).filter(Boolean) as typeof offers)
                    : [];
                  const activeTemplates = selectedCombo
                    ? multiTemplates
                    : singleTemplates.length > 0
                    ? singleTemplates
                    : templates;
                  const lookupId = selectedCombo
                    ? selectedCombo.id
                    : selectedOffer?.id ?? "";
                  return (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                      {activeTemplates.map((template) => (
                        <Box
                          key={template.id}
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "grey.100",
                            pb: 1.5,
                            "&:last-child": { borderBottom: "none", pb: 0 },
                          }}
                        >
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                color: "text.secondary",
                              }}
                            >
                              {template.name}
                            </Typography>
                            <IconButton
                              size="small"
                              sx={{
                                color: "grey.300",
                                "&:hover": { color: "grey.500" },
                              }}
                            >
                              <MoreHorizIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Box>
                          {selectedCombo && (
                            <KeyMessageInlineInputs templateId={template.id} />
                          )}
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {getBackgroundsForOfferTemplate(lookupId, template.id).map(
                              (bg) => (
                                <Box
                                  key={bg.id}
                                  sx={{
                                    position: "relative",
                                    flexShrink: 0,
                                    "&:hover .hover-overlay": { opacity: 1 },
                                  }}
                                >
                                  <Box
                                    sx={{ overflow: "hidden", isolation: "isolate" }}
                                  >
                                    <AdTemplate
                                      projectId={id}
                                      templateId={template.id}
                                      offer={
                                        selectedCombo
                                          ? comboSlotOffers[0]
                                          : selectedOffer
                                      }
                                      offers={
                                        selectedCombo ? comboSlotOffers : undefined
                                      }
                                      background={bg}
                                      scale={thumbnailScale(
                                        template.width,
                                        template.height
                                      )}
                                      customFields={customTemplateFields[template.id]}
                                    />
                                  </Box>
                                  <Box
                                    className="hover-overlay"
                                    sx={{
                                      position: "absolute",
                                      inset: 0,
                                      bgcolor: "rgba(0,0,0,0.4)",
                                      opacity: 0,
                                      transition: "opacity 0.2s",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 1,
                                      zIndex: 10,
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        setLightbox({
                                          bg,
                                          templateId: template.id,
                                          slotOffers: selectedCombo
                                            ? comboSlotOffers
                                            : undefined,
                                        })
                                      }
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: "background.paper",
                                        boxShadow: 1,
                                        "&:hover": { bgcolor: "grey.100" },
                                      }}
                                    >
                                      <VisibilityIcon
                                        sx={{ fontSize: 14, color: "text.primary" }}
                                      />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        excludeBackgroundFromOfferTemplate(
                                          lookupId,
                                          template.id,
                                          bg.id
                                        )
                                      }
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: "background.paper",
                                        boxShadow: 1,
                                        "&:hover": { bgcolor: "grey.100" },
                                      }}
                                    >
                                      <DeleteIcon
                                        sx={{ fontSize: 14, color: "text.primary" }}
                                      />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: "background.paper",
                                        boxShadow: 1,
                                        "&:hover": { bgcolor: "grey.100" },
                                      }}
                                    >
                                      <EditIcon
                                        sx={{ fontSize: 14, color: "text.primary" }}
                                      />
                                    </IconButton>
                                  </Box>
                                </Box>
                              )
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  );
                })()
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
          bgcolor: "background.paper",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ChevronLeftIcon sx={{ fontSize: 14 }} />}
          onClick={() => onNavigateTo("templates")}
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "primary.main",
            borderColor: "primary.light",
            borderRadius: 10,
            px: 2,
            py: 0.75,
            textTransform: "none",
          }}
        >
          Templates
        </Button>
        {(() => {
          const singleAssets = singleTemplates.reduce(
            (sum, t) =>
              sum +
              offers.reduce(
                (oSum, o) => oSum + getBackgroundsForOfferTemplate(o.id, t.id).length,
                0
              ),
            0
          );
          const multiAssets = multiTemplates.reduce(
            (sum, t) =>
              sum +
              combinations.reduce(
                (cSum, c) =>
                  cSum + getBackgroundsForOfferTemplate(c.id, t.id).length,
                0
              ),
            0
          );
          const totalAssets = singleAssets + multiAssets;
          return (
            <Button
              variant="outlined"
              endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
              onClick={() => onNavigateTo("preview")}
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "primary.main",
                borderColor: "primary.light",
                borderRadius: 10,
                px: 2,
                py: 0.75,
                textTransform: "none",
                gap: 0.5,
              }}
            >
              Preview
              {totalAssets > 0 && (
                <Chip
                  label={totalAssets}
                  size="small"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    height: 20,
                    minWidth: 20,
                    ml: 0.5,
                  }}
                />
              )}
            </Button>
          );
        })()}
      </Box>

      {/* Lightbox */}
      {lightbox &&
        (() => {
          const t = templates.find((t) => t.id === lightbox.templateId)!;
          const scale = Math.min(1200 / t.width, 720 / t.height);
          return (
            <Box
              sx={{
                position: "fixed",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.7)",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
              }}
              onClick={() => setLightbox(null)}
            >
              <Box onClick={(e) => e.stopPropagation()}>
                <AdTemplate
                  projectId={id}
                  templateId={t.id}
                  offer={lightbox.slotOffers?.[0] ?? selectedOffer}
                  offers={lightbox.slotOffers}
                  background={lightbox.bg}
                  scale={scale}
                  dealerName={project.dealerName}
                  customFields={customTemplateFields[t.id]}
                />
              </Box>
            </Box>
          );
        })()}

      <SelectBackgroundDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setPendingAddContext(null);
        }}
        onAdd={handleAdd}
        initialFolder={pendingAddContext ? null : dialogFolder}
        initialSizeFilter={pendingAddContext?.templateId ?? null}
        vehicleFilter={
          pendingAddContext?.offerId
            ? (() => {
                const o = offers.find((off) => off.id === pendingAddContext!.offerId);
                return o ? `${o.model} ${o.trim}` : undefined;
              })()
            : undefined
        }
        vehicleFilters={
          pendingAddContext?.offerId
            ? (() => {
                const combo = combinations.find(
                  (c) => c.id === pendingAddContext!.offerId
                );
                if (!combo) return undefined;
                return buildComboVehicleFilters(combo, offers, multiTemplates);
              })()
            : undefined
        }
      />

      {taggingFile && (
        <LifestyleTaggingDialog
          file={taggingFile.file}
          imageUrl={taggingFile.url}
          onConfirm={(bg) => {
            setPendingAddContext(null);
            handleAdd([bg]);
            setTaggingFile(null);
          }}
          onCancel={() => setTaggingFile(null)}
        />
      )}
    </Box>
  );
}

// ─── AddBackgroundMenu ────────────────────────────────────────────────────────

function AddBackgroundMenu({
  onOpenDialog,
  onClearAll,
  onLifestyleUpload,
}: {
  onOpenDialog: (folder: "recents" | "background-collections") => void;
  onClearAll: () => void;
  onLifestyleUpload: (file: File, url: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lifestyleInputRef = useRef<HTMLInputElement>(null);
  const { addBackgrounds } = useProjectStore();
  const open = Boolean(anchorEl);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const bg: BackgroundCollection = {
      id: `upload-${Date.now()}`,
      name: file.name.replace(/\.[^.]+$/, ""),
      type: "Background",
      sizes: 6,
      folder: "Uploads",
      color: "#888888",
      thumbnail: url,
      images: {
        "website-2000x500": url,
        "display-970x250": url,
        "display-300x250": url,
        "social-1080x1080": url,
        "website-600x450": url,
        "website-600x1067": url,
      },
    };
    addBackgrounds([bg]);
    setAnchorEl(null);
    e.target.value = "";
  }

  function handleLifestyleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onLifestyleUpload(file, URL.createObjectURL(file));
    setAnchorEl(null);
    e.target.value = "";
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon sx={{ fontSize: 15 }} />}
        endIcon={<ExpandMoreIcon sx={{ fontSize: 13 }} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          borderRadius: 10,
          textTransform: "none",
          px: 2,
          py: 0.75,
          color: "primary.main",
          bgcolor: "transparent",
          border: "1px solid",
          borderColor: "primary.main",
          boxShadow: "none",
          "&:hover": { bgcolor: "primary.50", boxShadow: "none" },
        }}
      >
        Add Background
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 4,
          sx: { borderRadius: 3, py: 0.75, minWidth: 220 },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onOpenDialog("background-collections");
          }}
          sx={{ fontSize: "0.8125rem", fontWeight: 500, py: 1.25, px: 2, gap: 1.5 }}
        >
          <ImageIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          Background from Portal
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onOpenDialog("recents");
          }}
          sx={{ fontSize: "0.8125rem", fontWeight: 500, py: 1.25, px: 2, gap: 1.5 }}
        >
          <ShareIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          Collection from Portal
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            fileInputRef.current?.click();
          }}
          sx={{ fontSize: "0.8125rem", fontWeight: 500, py: 1.25, px: 2, gap: 1.5 }}
        >
          <UploadIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          Upload
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            lifestyleInputRef.current?.click();
          }}
          sx={{
            fontSize: "0.8125rem",
            fontWeight: 500,
            py: 1.25,
            px: 2,
            gap: 1.5,
            color: "#7C3AED",
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 16, color: "#7C3AED" }} />
          Upload Lifestyle Image
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onClearAll();
          }}
          sx={{ fontSize: "0.8125rem", fontWeight: 500, py: 1.25, px: 2, gap: 1.5 }}
        >
          <CloseIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          Remove All
        </MenuItem>
      </Menu>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleUpload}
      />
      <input
        ref={lifestyleInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleLifestyleUpload}
      />
    </>
  );
}

// ─── EmptyAddMenu ─────────────────────────────────────────────────────────────

function EmptyAddMenu({
  label,
  variant,
  onFromPortal,
  onUpload,
  multiple,
}: {
  label: string;
  variant: "solid" | "outline";
  onFromPortal: () => void;
  onUpload: (files: File[]) => void;
  multiple?: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const open = Boolean(anchorEl);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onUpload(files);
    setAnchorEl(null);
    e.target.value = "";
  }

  return (
    <>
      <Button
        variant={variant === "solid" ? "contained" : "outlined"}
        startIcon={<AddIcon sx={{ fontSize: 15 }} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          borderRadius: 10,
          textTransform: "none",
          px: 2,
          py: 0.75,
        }}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 4,
          sx: { borderRadius: 3, py: 0.75, minWidth: 200 },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onFromPortal();
          }}
          sx={{ fontSize: "0.8125rem", fontWeight: 500, py: 1.25, px: 2, gap: 1.5 }}
        >
          <PortalIcon size={16} />
          From Portal
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            fileInputRef.current?.click();
          }}
          sx={{ fontSize: "0.8125rem", fontWeight: 500, py: 1.25, px: 2, gap: 1.5 }}
        >
          <UploadIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          Upload
        </MenuItem>
        <MenuItem
          sx={{
            fontSize: "0.8125rem",
            fontWeight: 500,
            py: 1.25,
            px: 2,
            gap: 1.5,
            color: "#7C3AED",
          }}
        >
          <AIToolsIcon size={16} />
          Create with AI
        </MenuItem>
      </Menu>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
}

// ─── kitMatchesProjectName ────────────────────────────────────────────────────

function kitMatchesProjectName(
  kitName: string,
  projectName: string,
  dealerName: string
): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[-_]/g, " ");
  const haystack = norm(`${projectName} ${dealerName}`);
  const needles = norm(kitName)
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return needles.length > 0 && needles.every((w) => haystack.includes(w));
}

// ─── BrandKitSection ──────────────────────────────────────────────────────────

function BrandKitSection({
  offers,
  projectId,
  projectName,
  dealerName,
  templates,
  activeBrandKitIds,
  onSetActiveBrandKit,
  activeLogoIds,
  onSetLogoId,
  activeColors,
  onSetColor,
  compact,
  fallbackMake,
}: {
  offers: Offer[];
  projectId: string;
  projectName: string;
  dealerName: string;
  templates: Template[];
  activeBrandKitIds: Record<string, string>;
  onSetActiveBrandKit: (projectId: string, make: string, kitId: string) => void;
  activeLogoIds: Record<string, Record<string, string>>;
  onSetLogoId: (projectId: string, make: string, slotType: string, logoId: string) => void;
  activeColors: Record<string, [string, string]>;
  onSetColor: (projectId: string, make: string, index: 0 | 1, color: string) => void;
  compact?: boolean;
  fallbackMake?: string;
}) {
  const makes = Array.from(
    new Set([...offers.map((o) => o.make), ...(fallbackMake ? [fallbackMake] : [])])
  ).filter(Boolean);

  const slotTypes = Array.from(new Set(templates.flatMap((t) => t.logoSlots ?? [])));

  const makeKits = makes
    .map((make) => {
      const available = brandKits;
      const activeKitId = activeBrandKitIds[make];
      const activeKit =
        available.find((k) => k.id === activeKitId) ??
        available.find((k) => k.oem === make) ??
        available.find((k) => kitMatchesProjectName(k.id, projectName, dealerName)) ??
        null;
      if (!activeKit) return null;
      const storedColors = activeColors[make] as [string, string] | undefined;
      const makeActiveColors: [string, string] = storedColors ?? [
        activeKit.colors[0] ?? "#000000",
        activeKit.colors[1] ?? "#000000",
      ];
      return { make, available, activeKit, makeActiveColors };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  if (compact) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        {makeKits.map(({ make, available, activeKit, makeActiveColors }, i) => (
          <React.Fragment key={make}>
            {i > 0 && (
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            )}
            <BrandKitRow
              make={make}
              available={available}
              activeKit={activeKit}
              slotTypes={slotTypes}
              activeLogoIds={(activeLogoIds[make]) ?? {}}
              activeColors={makeActiveColors}
              onSelectKit={(kitId) => onSetActiveBrandKit(projectId, make, kitId)}
              onSetLogoId={(slotType, logoId) =>
                onSetLogoId(projectId, make, slotType, logoId)
              }
              onSetColor={(idx, color) => onSetColor(projectId, make, idx, color)}
              compact
            />
          </React.Fragment>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary", mb: 1.5 }}
      >
        Logos
      </Typography>
      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 2 }}>
        Choose brand kits and logos for each make
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {makeKits.map(({ make, available, activeKit, makeActiveColors }) => (
          <BrandKitRow
            key={make}
            make={make}
            available={available}
            activeKit={activeKit}
            slotTypes={slotTypes}
            activeLogoIds={(activeLogoIds[make]) ?? {}}
            activeColors={makeActiveColors}
            onSelectKit={(kitId) => onSetActiveBrandKit(projectId, make, kitId)}
            onSetLogoId={(slotType, logoId) =>
              onSetLogoId(projectId, make, slotType, logoId)
            }
            onSetColor={(idx, color) => onSetColor(projectId, make, idx, color)}
          />
        ))}
        {makeKits.length === 0 && (
          <Typography sx={{ fontSize: "0.875rem", color: "text.disabled" }}>
            No brand kits found for this project.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── ColorSwatchButton ────────────────────────────────────────────────────────

function ColorSwatchButton({
  idx,
  size = 28,
  activeColors,
  openColorIdx,
  hexInput,
  onToggle,
  onNativeChange,
  onHexChange,
}: {
  idx: 0 | 1;
  size?: number;
  activeColors: [string, string];
  openColorIdx: number | null;
  hexInput: string;
  onToggle: (idx: 0 | 1) => void;
  onNativeChange: (idx: 0 | 1, value: string) => void;
  onHexChange: (idx: 0 | 1, value: string) => void;
}) {
  const color = activeColors[idx];
  const label = idx === 0 ? "Text Color" : "Button Color";
  const isOpen = openColorIdx === idx;

  return (
    <TipWrapper tip={label}>
      <Box sx={{ position: "relative" }}>
        <Box
          component="button"
          onClick={() => onToggle(idx)}
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            bgcolor: color,
            border: "2px solid",
            borderColor: "background.paper",
            boxShadow: 1,
            cursor: "pointer",
            display: "block",
            "&:hover": { transform: "scale(1.1)", transition: "transform 0.15s" },
          }}
        />
        {isOpen && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 30,
              borderRadius: 2,
              p: 1.5,
              minWidth: 160,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.625rem",
                fontWeight: 600,
                color: "text.secondary",
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {label}
            </Typography>
            <input
              type="color"
              value={color}
              onChange={(e) => onNativeChange(idx, e.target.value)}
              style={{ width: "100%", height: 80, border: "none", cursor: "pointer" }}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                px: 0.75,
                py: 0.5,
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", mr: 0.5 }}>
                #
              </Typography>
              <InputBase
                value={hexInput}
                onChange={(e) => onHexChange(idx, e.target.value)}
                sx={{ fontSize: "0.75rem", flex: 1 }}
              />
            </Box>
          </Paper>
        )}
      </Box>
    </TipWrapper>
  );
}

// ─── BrandKitRow ──────────────────────────────────────────────────────────────

type BrandKit = (typeof brandKits)[0];

function BrandKitRow({
  make,
  available,
  activeKit,
  slotTypes,
  activeLogoIds,
  activeColors,
  onSelectKit,
  onSetLogoId,
  onSetColor,
  compact,
}: {
  make: string;
  available: BrandKit[];
  activeKit: BrandKit;
  slotTypes: string[];
  activeLogoIds: Record<string, string>;
  activeColors: [string, string];
  onSelectKit: (kitId: string) => void;
  onSetLogoId: (slotType: string, logoId: string) => void;
  onSetColor: (idx: 0 | 1, color: string) => void;
  compact?: boolean;
}) {
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const [kitDropdownOpen, setKitDropdownOpen] = useState(false);
  const [openColorIdx, setOpenColorIdx] = useState<number | null>(null);
  const [hexInput, setHexInput] = useState(activeColors[0]);
  const kitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (kitRef.current && !kitRef.current.contains(e.target as Node)) {
        setKitDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleColorToggle(idx: 0 | 1) {
    setOpenColorIdx((prev) => (prev === idx ? null : idx));
    setHexInput(activeColors[idx].replace("#", ""));
  }

  function handleNativeChange(idx: 0 | 1, value: string) {
    onSetColor(idx, value);
    setHexInput(value.replace("#", ""));
  }

  function handleHexChange(idx: 0 | 1, value: string) {
    setHexInput(value);
    if (/^[0-9a-fA-F]{6}$/.test(value)) {
      onSetColor(idx, `#${value}`);
    }
  }

  const colorSwatchProps = (idx: 0 | 1) => ({
    idx,
    activeColors,
    openColorIdx,
    hexInput,
    onToggle: handleColorToggle,
    onNativeChange: handleNativeChange,
    onHexChange: handleHexChange,
  });

  // Kit icon: use first logo image if available
  const kitIconUrl = activeKit.logos[0]?.image;

  if (compact) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {/* Kit selector */}
        <Box ref={kitRef} sx={{ position: "relative" }}>
          <Button
            onClick={() => setKitDropdownOpen((o) => !o)}
            endIcon={<ExpandMoreIcon sx={{ fontSize: 13, color: "text.disabled" }} />}
            startIcon={
              <BrandLogoIcon logoUrl={kitIconUrl} name={activeKit.name} size={18} />
            }
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "text.primary",
              textTransform: "none",
              borderColor: "divider",
              border: "1px solid",
              borderRadius: 2,
              px: 1,
              py: 0.5,
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "grey.50" },
            }}
          >
            {activeKit.name}
          </Button>
          {kitDropdownOpen && (
            <Paper
              elevation={4}
              sx={{
                position: "absolute",
                top: "100%",
                mt: 0.5,
                left: 0,
                zIndex: 30,
                borderRadius: 3,
                py: 0.75,
                minWidth: 180,
              }}
            >
              {available.map((kit) => (
                <MenuItem
                  key={kit.id}
                  onClick={() => {
                    onSelectKit(kit.id);
                    setKitDropdownOpen(false);
                  }}
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: activeKit.id === kit.id ? 600 : 500,
                    py: 1,
                    px: 2,
                    gap: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <BrandLogoIcon logoUrl={kit.logos[0]?.image} name={kit.name} size={16} />
                  <Box sx={{ flex: 1 }}>{kit.name}</Box>
                  {activeKit.id === kit.id && (
                    <CheckIcon sx={{ fontSize: 14, color: "primary.main" }} />
                  )}
                </MenuItem>
              ))}
            </Paper>
          )}
        </Box>

        {/* Slot tiles */}
        {slotTypes.map((slotType) => {
          const logoId = activeLogoIds[slotType];
          const logo = activeKit.logos?.find((l) => l.id === logoId);
          return (
            <Box key={slotType} sx={{ position: "relative" }}>
              <TipWrapper tip={formatSlotType(slotType)}>
                <Box
                  component="button"
                  onClick={() =>
                    setOpenSlot((prev) => (prev === slotType ? null : slotType))
                  }
                  sx={{
                    width: 40,
                    height: 28,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <LogoTile logo={logo} bare />
                </Box>
              </TipWrapper>
              {openSlot === slotType && (
                <LogoPicker
                  make={make}
                  slotType={slotType}
                  selectedLogoId={logoId}
                  onSelectLogo={(id: string) => {
                    onSetLogoId(slotType, id);
                    setOpenSlot(null);
                  }}
                  onUpload={() => setOpenSlot(null)}
                  onRevert={() => setOpenSlot(null)}
                  onClose={() => setOpenSlot(null)}
                />
              )}
            </Box>
          );
        })}

        {/* Color swatches */}
        {([0, 1] as const).map((idx) => (
          <ColorSwatchButton key={idx} {...colorSwatchProps(idx)} />
        ))}
      </Box>
    );
  }

  // Non-compact
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
      {/* Left: make label + kit dropdown */}
      <Box sx={{ flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: "0.625rem",
            fontWeight: 600,
            color: "text.disabled",
            mb: 0.75,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {make}
        </Typography>
        <Box ref={kitRef} sx={{ position: "relative" }}>
          <Button
            onClick={() => setKitDropdownOpen((o) => !o)}
            endIcon={<ExpandMoreIcon sx={{ fontSize: 13, color: "text.disabled" }} />}
            startIcon={
              <BrandLogoIcon logoUrl={kitIconUrl} name={activeKit.name} size={20} />
            }
            sx={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "text.primary",
              textTransform: "none",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "grey.50" },
            }}
          >
            {activeKit.name}
          </Button>
          {kitDropdownOpen && (
            <Paper
              elevation={4}
              sx={{
                position: "absolute",
                top: "100%",
                mt: 0.5,
                left: 0,
                zIndex: 30,
                borderRadius: 3,
                py: 0.75,
                minWidth: 200,
              }}
            >
              {available.map((kit) => (
                <MenuItem
                  key={kit.id}
                  onClick={() => {
                    onSelectKit(kit.id);
                    setKitDropdownOpen(false);
                  }}
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: activeKit.id === kit.id ? 600 : 500,
                    py: 1.25,
                    px: 2,
                    gap: 1.5,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <BrandLogoIcon logoUrl={kit.logos[0]?.image} name={kit.name} size={20} />
                  <Box sx={{ flex: 1 }}>{kit.name}</Box>
                  {activeKit.id === kit.id && (
                    <CheckIcon sx={{ fontSize: 14, color: "primary.main" }} />
                  )}
                </MenuItem>
              ))}
            </Paper>
          )}
        </Box>
      </Box>

      {/* Right: colors + slot tiles */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "flex-start" }}>
        {/* Color swatches */}
        <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
          {([0, 1] as const).map((idx) => (
            <ColorSwatchButton key={idx} {...colorSwatchProps(idx)} />
          ))}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Slot tiles */}
        {slotTypes.map((slotType) => {
          const logoId = activeLogoIds[slotType];
          const logo = activeKit.logos?.find((l) => l.id === logoId);
          const [line1, line2] = splitSlotLabel(slotType);
          return (
            <Box
              key={slotType}
              sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}
            >
              <Box sx={{ position: "relative" }}>
                <Box
                  component="button"
                  onClick={() =>
                    setOpenSlot((prev) => (prev === slotType ? null : slotType))
                  }
                  sx={{
                    width: 56,
                    height: 40,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor:
                      openSlot === slotType ? "primary.main" : "divider",
                    bgcolor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <LogoTile logo={logo} bare />
                </Box>
                {openSlot === slotType && (
                  <LogoPicker
                    make={make}
                    slotType={slotType}
                    selectedLogoId={logoId}
                    onSelectLogo={(id: string) => {
                      onSetLogoId(slotType, id);
                      setOpenSlot(null);
                    }}
                    onUpload={() => setOpenSlot(null)}
                    onRevert={() => setOpenSlot(null)}
                    onClose={() => setOpenSlot(null)}
                  />
                )}
              </Box>
              <Typography
                sx={{ fontSize: "0.5625rem", color: "text.disabled", lineHeight: 1.2, textAlign: "center" }}
              >
                {line1}
                {line2 && <><br />{line2}</>}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── BrandLogoIcon ────────────────────────────────────────────────────────────

function BrandLogoIcon({
  logoUrl,
  name,
  size = 32,
}: {
  logoUrl?: string;
  name?: string;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  const displayName = name ?? "";
  const monogram = displayName.charAt(0).toUpperCase() || "?";
  const hue = (displayName.charCodeAt(0) * 37) % 360;

  if (errored || !logoUrl) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          bgcolor: `hsl(${hue}, 60%, 50%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: size * 0.45,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {monogram}
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={logoUrl}
      alt={displayName}
      onError={() => setErrored(true)}
      sx={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
    />
  );
}

// ─── LogoTile ─────────────────────────────────────────────────────────────────

function LogoTile({
  logo,
  bare,
}: {
  logo?: { image?: string; id?: string; label?: string };
  bare?: boolean;
}) {
  if (bare) {
    if (!logo?.image) {
      return (
        <Typography sx={{ fontSize: "0.5rem", color: "text.disabled" }}>
          None
        </Typography>
      );
    }
    return (
      <Box
        component="img"
        src={logo.image}
        alt=""
        sx={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: 56,
        height: 40,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {logo?.image ? (
        <Box
          component="img"
          src={logo.image}
          alt=""
          sx={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
        />
      ) : (
        <Typography sx={{ fontSize: "0.5625rem", color: "text.disabled" }}>
          No logo
        </Typography>
      )}
    </Box>
  );
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatSlotType(slotType: string): string {
  return slotType
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function splitSlotLabel(slotType: string): [string, string] {
  const parts = slotType.split("-");
  if (parts.length <= 2) return [formatSlotType(slotType), ""];
  const mid = Math.ceil(parts.length / 2);
  return [
    parts
      .slice(0, mid)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    parts
      .slice(mid)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  ];
}

// ─── TemplateGroupAccordion ───────────────────────────────────────────────────

function TemplateGroupAccordion({
  template,
  offers,
  open,
  onToggle,
  onDelete,
  onAddBackground,
  onAddAll,
  dealerName,
  projectId,
  dataRows,
  make,
}: {
  template: Template;
  offers: Offer[];
  open: boolean;
  onToggle: () => void;
  onDelete: (offerId: string) => void;
  onAddBackground: (offerId: string | null) => void;
  onAddAll: () => void;
  dealerName?: string;
  projectId: string;
  dataRows: DataRow[];
  make: string;
}) {
  const { getBackgroundsForOfferTemplate, excludeBackgroundFromOfferTemplate } =
    useProjectStore();
  const [lightbox, setLightbox] = useState<{
    bg: BackgroundCollection;
    offer: Offer;
  } | null>(null);
  const [editorBg, setEditorBg] = useState<BackgroundCollection | null>(null);

  const isMulti = template.products > 1;
  const totalBgs = offers.reduce(
    (sum, o) => sum + getBackgroundsForOfferTemplate(o.id, template.id).length,
    0
  );

  return (
    <>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          onClick={onToggle}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1.5,
            gap: 1,
            cursor: "pointer",
            "&:hover": { bgcolor: "grey.50" },
          }}
        >
          <ExpandMoreIcon
            sx={{
              fontSize: 16,
              color: "text.secondary",
              flexShrink: 0,
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s",
            }}
          />
          <Box sx={{ flexShrink: 0, mr: 0.5 }}>
            <TemplateWireframe templateId={template.id} scale={0.15} />
          </Box>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>
            {template.name}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", ml: 0.5 }}>
            {template.width}×{template.height}
          </Typography>
          <SubsectionActions onAddBackground={onAddAll} />
          <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", ml: "auto" }}>
            {totalBgs} bg{totalBgs !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Body */}
        {open && (
          <Box sx={{ px: 2, pb: 2 }}>
            {offers.map((offer) => {
              const bgs = getBackgroundsForOfferTemplate(offer.id, template.id);
              return (
                <Box
                  key={offer.id}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "grey.100",
                    pb: 1.5,
                    mb: 1.5,
                    "&:last-child": { borderBottom: "none", mb: 0, pb: 0 },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    {offer.image && (
                      <Box
                        component="img"
                        src={offer.image}
                        alt={offer.model}
                        sx={{
                          width: 40,
                          height: 28,
                          objectFit: "contain",
                          borderRadius: 0.5,
                          bgcolor: "grey.100",
                        }}
                      />
                    )}
                    <Typography
                      sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}
                    >
                      {offer.year} {offer.model} {offer.trim}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon sx={{ fontSize: 11 }} />}
                      onClick={() => onAddBackground(offer.id)}
                      sx={{
                        ml: 0.5,
                        fontSize: "0.625rem",
                        fontWeight: 500,
                        color: "primary.main",
                        textTransform: "none",
                        minWidth: 0,
                        p: 0,
                      }}
                    >
                      Add background
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(offer.id)}
                      sx={{ ml: "auto", color: "text.disabled", width: 20, height: 20 }}
                    >
                      <DeleteIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {bgs.map((bg) => {
                      const scale = thumbnailScale(template.width, template.height);
                      return (
                        <Box
                          key={bg.id}
                          sx={{
                            position: "relative",
                            flexShrink: 0,
                            "&:hover .hover-overlay": { opacity: 1 },
                          }}
                        >
                          <Box sx={{ overflow: "hidden", isolation: "isolate" }}>
                            <AdTemplate
                              projectId={projectId}
                              templateId={template.id}
                              offer={offer}
                              background={bg}
                              scale={scale}
                            />
                          </Box>
                          <Box
                            className="hover-overlay"
                            sx={{
                              position: "absolute",
                              inset: 0,
                              bgcolor: "rgba(0,0,0,0.4)",
                              opacity: 0,
                              transition: "opacity 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.75,
                              zIndex: 10,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => setLightbox({ bg, offer })}
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: "background.paper",
                                boxShadow: 1,
                                "&:hover": { bgcolor: "grey.100" },
                              }}
                            >
                              <VisibilityIcon
                                sx={{ fontSize: 13, color: "text.primary" }}
                              />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                excludeBackgroundFromOfferTemplate(
                                  offer.id,
                                  template.id,
                                  bg.id
                                )
                              }
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: "background.paper",
                                boxShadow: 1,
                                "&:hover": { bgcolor: "grey.100" },
                              }}
                            >
                              <DeleteIcon
                                sx={{ fontSize: 13, color: "text.primary" }}
                              />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => setEditorBg(bg)}
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: "background.paper",
                                boxShadow: 1,
                                "&:hover": { bgcolor: "grey.100" },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 13, color: "text.primary" }} />
                            </IconButton>
                          </Box>
                        </Box>
                      );
                    })}
                    {bgs.length === 0 && (
                      <Box
                        component="button"
                        onClick={() => onAddBackground(offer.id)}
                        sx={{
                          width: 80,
                          height: 48,
                          borderRadius: 1,
                          border: "2px dashed",
                          borderColor: "divider",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "text.disabled",
                          cursor: "pointer",
                          bgcolor: "transparent",
                          "&:hover": {
                            borderColor: "primary.light",
                            color: "primary.light",
                          },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 16 }} />
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Lightbox */}
      {lightbox && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.7)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
          }}
          onClick={() => setLightbox(null)}
        >
          <Box onClick={(e) => e.stopPropagation()}>
            <AdTemplate
              projectId={projectId}
              templateId={template.id}
              offer={lightbox.offer}
              background={lightbox.bg}
              scale={Math.min(1200 / template.width, 720 / template.height)}
            />
          </Box>
        </Box>
      )}

      {/* Zone editor */}
      {editorBg && (
        <TemplateZoneEditor
          templateId={template.id}
          templateName={template.name}
          onClose={() => setEditorBg(null)}
        />
      )}
    </>
  );
}

// ─── BackgroundGroupAccordion ─────────────────────────────────────────────────

function BackgroundGroupAccordion({
  bg,
  offers,
  templates,
  open,
  onToggle,
  dealerName,
  projectId,
  dataRows,
  make,
}: {
  bg: BackgroundCollection;
  offers: Offer[];
  templates: Template[];
  open: boolean;
  onToggle: () => void;
  dealerName?: string;
  projectId: string;
  dataRows: DataRow[];
  make: string;
}) {
  const { getBackgroundsForOfferTemplate, excludeBackgroundFromOfferTemplate } =
    useProjectStore();
  const [lightbox, setLightbox] = useState<{
    offer: Offer;
    template: Template;
  } | null>(null);

  const thumb = getSquareThumbnail(bg);
  const totalAssigned = templates.reduce(
    (sum, t) =>
      sum +
      offers.reduce(
        (oSum, o) =>
          oSum +
          (getBackgroundsForOfferTemplate(o.id, t.id).some((b) => b.id === bg.id)
            ? 1
            : 0),
        0
      ),
    0
  );

  return (
    <>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          onClick={onToggle}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1.5,
            gap: 1,
            cursor: "pointer",
            "&:hover": { bgcolor: "grey.50" },
          }}
        >
          <ExpandMoreIcon
            sx={{
              fontSize: 16,
              color: "text.secondary",
              flexShrink: 0,
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s",
            }}
          />
          {thumb && (
            <Box
              component="img"
              src={thumb}
              alt={bg.name}
              sx={{
                width: 48,
                height: 32,
                objectFit: "cover",
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {bg.name}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "text.disabled" }}>
              {bg.folder}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", ml: "auto" }}>
            {totalAssigned} assigned
          </Typography>
        </Box>

        {/* Body */}
        {open && (
          <Box sx={{ px: 2, pb: 2 }}>
            {dataRows.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {dataRows.map((row) => (
                  <Box key={row.id}>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "text.secondary",
                        mb: 0.75,
                      }}
                    >
                      Row {row.id}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {templates.map((template) => {
                        const assigned = getBackgroundsForOfferTemplate(
                          row.id,
                          template.id
                        ).some((b) => b.id === bg.id);
                        return (
                          <Box
                            key={template.id}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: 0.5,
                                bgcolor: assigned ? "primary.main" : "grey.200",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                excludeBackgroundFromOfferTemplate(
                                  row.id,
                                  template.id,
                                  bg.id
                                )
                              }
                            />
                            <Typography
                              sx={{
                                fontSize: "0.5rem",
                                color: "text.disabled",
                                textAlign: "center",
                              }}
                            >
                              {template.name}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {offers.map((offer) => (
                  <Box key={offer.id}>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "text.secondary",
                        mb: 0.75,
                      }}
                    >
                      {offer.year} {offer.model} {offer.trim}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {templates.map((template) => {
                        const isAssigned = getBackgroundsForOfferTemplate(
                          offer.id,
                          template.id
                        ).some((b) => b.id === bg.id);
                        if (!isAssigned) return null;
                        const scale = thumbnailScale(template.width, template.height);
                        return (
                          <Box
                            key={template.id}
                            sx={{
                              position: "relative",
                              flexShrink: 0,
                              "&:hover .hover-overlay": { opacity: 1 },
                            }}
                          >
                            <Box sx={{ overflow: "hidden", isolation: "isolate" }}>
                              <AdTemplate
                                projectId={projectId}
                                templateId={template.id}
                                offer={offer}
                                background={bg}
                                scale={scale}
                              />
                            </Box>
                            <Box
                              className="hover-overlay"
                              sx={{
                                position: "absolute",
                                inset: 0,
                                bgcolor: "rgba(0,0,0,0.4)",
                                opacity: 0,
                                transition: "opacity 0.2s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 0.75,
                                zIndex: 10,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => setLightbox({ offer, template })}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: "background.paper",
                                  boxShadow: 1,
                                  "&:hover": { bgcolor: "grey.100" },
                                }}
                              >
                                <VisibilityIcon
                                  sx={{ fontSize: 13, color: "text.primary" }}
                                />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  excludeBackgroundFromOfferTemplate(
                                    offer.id,
                                    template.id,
                                    bg.id
                                  )
                                }
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: "background.paper",
                                  boxShadow: 1,
                                  "&:hover": { bgcolor: "grey.100" },
                                }}
                              >
                                <DeleteIcon
                                  sx={{ fontSize: 13, color: "text.primary" }}
                                />
                              </IconButton>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Lightbox */}
      {lightbox && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.7)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
          }}
          onClick={() => setLightbox(null)}
        >
          <Box onClick={(e) => e.stopPropagation()}>
            <AdTemplate
              projectId={projectId}
              templateId={lightbox.template.id}
              offer={lightbox.offer}
              background={bg}
              scale={Math.min(
                1200 / lightbox.template.width,
                720 / lightbox.template.height
              )}
            />
          </Box>
        </Box>
      )}
    </>
  );
}

// ─── ViewModeSelector ─────────────────────────────────────────────────────────

function ViewModeSelector({
  viewMode,
  onChange,
  offers,
  singleTemplates,
  multiTemplates,
  combinations,
  dataRows,
}: {
  viewMode: string;
  onChange: (mode: string) => void;
  offers: Offer[];
  singleTemplates: Template[];
  multiTemplates: Template[];
  combinations: { id: string; offerIds: string[] }[];
  dataRows: DataRow[];
}) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const modes = [
    { id: "backgrounds", label: "Backgrounds", icon: <ImageIcon sx={{ fontSize: 16 }} /> },
    ...dataRows.map((r, i) => ({
      id: r.id,
      label: `Data Row ${i + 1}`,
      icon: (
        <Typography sx={{ fontSize: "0.625rem", fontWeight: 700, color: "text.secondary" }}>
          {i + 1}
        </Typography>
      ),
    })),
    ...offers.map((o) => ({
      id: o.id,
      label: `${o.year} ${o.model} ${o.trim}`,
      icon: o.image ? (
        <Box
          component="img"
          src={o.image}
          alt={o.model}
          sx={{ width: 28, height: 20, objectFit: "contain" }}
        />
      ) : (
        <ImageIcon sx={{ fontSize: 16 }} />
      ),
    })),
    ...combinations.map((c, i) => ({
      id: c.id,
      label: `Combination ${i + 1}`,
      icon: (
        <Box sx={{ display: "flex", gap: 0.25 }}>
          {c.offerIds.slice(0, 3).map((oid, j) => {
            const o = offers.find((x) => x.id === oid);
            return o?.image ? (
              <Box
                key={j}
                component="img"
                src={o.image}
                alt=""
                sx={{ width: 16, height: 12, objectFit: "contain" }}
              />
            ) : null;
          })}
        </Box>
      ),
    })),
  ];

  const currentIdx = modes.findIndex((m) => m.id === viewMode);
  const currentMode = modes[currentIdx] ?? modes[0];

  function cycle(dir: -1 | 1) {
    const next = (currentIdx + dir + modes.length) % modes.length;
    onChange(modes[next].id);
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <IconButton size="small" onClick={() => cycle(-1)} sx={{ width: 28, height: 28 }}>
        <ChevronLeftIcon sx={{ fontSize: 15 }} />
      </IconButton>
      <Button
        ref={btnRef}
        variant="outlined"
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          setOpen((o) => !o);
        }}
        endIcon={<ExpandMoreIcon sx={{ fontSize: 13, color: "text.disabled" }} />}
        startIcon={currentMode.icon}
        sx={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: "text.primary",
          borderColor: "divider",
          bgcolor: "background.paper",
          width: 315,
          height: 42,
          justifyContent: "flex-start",
          textTransform: "none",
          "&:hover": { bgcolor: "grey.50" },
        }}
      >
        {currentMode.label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          elevation: 4,
          sx: { borderRadius: 3, py: 0.75, minWidth: 315 },
        }}
      >
        {modes.map((m) => (
          <MenuItem
            key={m.id}
            onClick={() => {
              onChange(m.id);
              setOpen(false);
            }}
            sx={{
              fontSize: "0.75rem",
              fontWeight: viewMode === m.id ? 600 : 500,
              color: viewMode === m.id ? "primary.main" : "text.primary",
              py: 1.25,
              px: 2,
              gap: 1.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            {m.icon}
            <Box sx={{ flex: 1 }}>{m.label}</Box>
            {viewMode === m.id && (
              <CheckIcon sx={{ fontSize: 14, color: "primary.main" }} />
            )}
          </MenuItem>
        ))}
      </Menu>
      <IconButton size="small" onClick={() => cycle(1)} sx={{ width: 28, height: 28 }}>
        <ChevronRightIcon sx={{ fontSize: 15 }} />
      </IconButton>
    </Box>
  );
}

// ─── TemplateBackgroundCard ───────────────────────────────────────────────────

function TemplateBackgroundCard({
  template,
  onOpenDialog,
}: {
  template: Template;
  onOpenDialog: (folder?: "recents" | "background-collections") => void;
}) {
  const { getBackgroundsForTemplate, excludeBackgroundFromTemplate } =
    useProjectStore();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const bgs = getBackgroundsForTemplate(template.id);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        minWidth: 200,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          pt: 1.5,
          pb: 1,
          borderBottom: "1px solid",
          borderColor: "grey.100",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <TemplateWireframe templateId={template.id} scale={0.1} />
          <Box>
            <Typography
              sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.primary" }}
            >
              {template.name}
            </Typography>
            <Typography sx={{ fontSize: "0.625rem", color: "text.disabled" }}>
              {template.width}×{template.height} · {bgs.length} bg
              {bgs.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Thumbnails */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.75,
          p: 1,
          minHeight: 96,
        }}
      >
        {bgs.map((bg) => {
          const thumb = getSquareThumbnail(bg);
          return (
            <Box
              key={bg.id}
              sx={{
                position: "relative",
                width: 90,
                height: 90,
                borderRadius: 1,
                overflow: "hidden",
                flexShrink: 0,
                bgcolor: "grey.100",
                "&:hover .hover-overlay": { opacity: 1 },
              }}
            >
              {thumb && (
                <Box
                  component="img"
                  src={thumb}
                  alt={bg.name}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
              <Box
                className="hover-overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.4)",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  borderRadius: 1,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => excludeBackgroundFromTemplate(template.id, bg.id)}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "background.paper",
                    boxShadow: 1,
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 13, color: "text.primary" }} />
                </IconButton>
              </Box>
            </Box>
          );
        })}

        {/* Add slot */}
        <Box sx={{ position: "relative" }}>
          <Box
            component="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              setAnchorEl(e.currentTarget)
            }
            sx={{
              width: 90,
              height: 90,
              borderRadius: 1,
              border: "2px dashed",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.disabled",
              cursor: "pointer",
              bgcolor: "transparent",
              "&:hover": { borderColor: "primary.light", color: "primary.light" },
            }}
          >
            <AddIcon sx={{ fontSize: 20 }} />
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              elevation: 4,
              sx: { borderRadius: 3, py: 0.75, minWidth: 180 },
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onOpenDialog("background-collections");
              }}
              sx={{ fontSize: "0.8125rem", fontWeight: 500, py: 1.25, px: 2, gap: 1.5 }}
            >
              <ImageIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              From Portal
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onOpenDialog("recents");
              }}
              sx={{ fontSize: "0.8125rem", fontWeight: 500, py: 1.25, px: 2, gap: 1.5 }}
            >
              <UploadIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              Upload
            </MenuItem>
            <MenuItem
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                py: 1.25,
                px: 2,
                gap: 1.5,
                color: "#7C3AED",
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 16, color: "#7C3AED" }} />
              Create with AI
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}

// ─── FineTuneSwitch ───────────────────────────────────────────────────────────

function FineTuneSwitch({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  const [showTip, setShowTip] = useState(false);
  const tipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    tipTimeout.current = setTimeout(() => setShowTip(true), 300);
  }

  function handleMouseLeave() {
    if (tipTimeout.current) clearTimeout(tipTimeout.current);
    setShowTip(false);
  }

  return (
    <Tooltip
      title="Fine-tune backgrounds per offer and template"
      open={showTip}
      placement="top"
      arrow
    >
      <Box
        component="button"
        onClick={() => onChange(!value)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          border: "none",
          bgcolor: "transparent",
          cursor: "pointer",
          p: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: value ? "primary.main" : "text.secondary",
          }}
        >
          Fine Tune
        </Typography>
        {/* Track */}
        <Box
          sx={{
            width: 32,
            height: 18,
            borderRadius: 9,
            bgcolor: value ? "primary.main" : "grey.200",
            position: "relative",
            transition: "background-color 0.2s",
            flexShrink: 0,
          }}
        >
          {/* Thumb */}
          <Box
            sx={{
              position: "absolute",
              top: 2,
              left: value ? 14 : 2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              bgcolor: "white",
              boxShadow: 1,
              transition: "left 0.2s",
            }}
          />
        </Box>
      </Box>
    </Tooltip>
  );
}

// ─── AIToolsIcon ──────────────────────────────────────────────────────────────

function AIToolsIcon({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8 1L9.5 6H14.5L10.5 9L12 14L8 11L4 14L5.5 9L1.5 6H6.5L8 1Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── PortalIcon ───────────────────────────────────────────────────────────────

function PortalIcon({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="8" cy="8" rx="3" ry="6" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
