# Constellation Portal — Guia Completo de Migração para MUI

> **Propósito:** Este documento descreve completamente toda a codebase do Constellation Portal para que um desenvolvedor possa recriar ou integrar o produto em uma nova stack baseada em MUI (Material UI). Cobre componentes, interações, stores, hooks, tipos, utilitários e fluxos de dados.

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Arquivos](#3-estrutura-de-arquivos)
4. [Design Tokens](#4-design-tokens)
5. [Tipos Centrais](#5-tipos-centrais)
6. [State Management — Stores Zustand](#6-state-management--stores-zustand)
7. [Hooks](#7-hooks)
8. [Utilitários](#8-utilitários)
9. [Componentes de UI Primitivos](#9-componentes-de-ui-primitivos)
10. [Layout Global](#10-layout-global)
11. [Feature: Folder Tree](#11-feature-folder-tree)
12. [Feature: Asset Grid](#12-feature-asset-grid)
13. [Feature: Asset Card](#13-feature-asset-card)
14. [Feature: Filter Panel](#14-feature-filter-panel)
15. [Feature: LifestyleTagger Modal (AI Detection)](#15-feature-lifestyletagger-modal-ai-detection)
16. [Feature: Upload Activity Monitor](#16-feature-upload-activity-monitor)
17. [Feature: Download Activity Monitor](#17-feature-download-activity-monitor)
18. [Roteamento](#18-roteamento)
19. [API Endpoints](#19-api-endpoints)
20. [Fluxos de Dados Completos](#20-fluxos-de-dados-completos)
21. [Interações e Estados de UI](#21-interações-e-estados-de-ui)
22. [Notas de Migração para MUI](#22-notas-de-migração-para-mui)

---

## 1. Visão Geral do Produto

O **Constellation Portal** é um sistema de gerenciamento de ativos digitais (DAM) focado em marketing automotivo. Permite:

- Navegar por uma hierarquia de pastas com ativos (imagens de veículos)
- Visualizar, filtrar e selecionar múltiplos ativos em grid ou tabela
- Fazer upload de arquivos individuais ou pastas inteiras (via ZIP)
- Usar IA (visão computacional) para detectar make/model de veículos em imagens
- Revisar e aprovar metadados de veículos (YMMT: Year/Make/Model/Trim), lifestyle e tags
- Baixar seleções de ativos como ZIP
- Arquivar/desarquivar ativos e pastas

O produto é uma **SPA (Single Page Application)** sem backend real — todos os dados são mockados em memória, e chamadas de API são simuladas via proxy Vite.

---

## 2. Stack Tecnológica

| Tecnologia | Versão | Papel |
|---|---|---|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.6.3 | Tipagem estática |
| Vite | 5.4.11 | Build e dev server |
| **MUI (Material UI)** | **5.16.14** | Componentes base (já presente!) |
| Zustand | 5.0.14 | State management global |
| React Router DOM | 7.17.0 | Roteamento client-side |
| Emotion | latest | CSS-in-JS (peer dep do MUI) |
| Tailwind CSS | 3.4.19 | Classes utilitárias de estilo |
| Lucide React | 1.17.0 | Biblioteca de ícones |
| JSZip | 3.10.1 | Geração de arquivos ZIP |

> **Nota para migração:** MUI já está instalado e em uso. A nova stack provavelmente irá remover Tailwind e usar MUI de forma mais sistemática. A maior parte do custom styling usa `sx` props do MUI ou Emotion inline.

---

## 3. Estrutura de Arquivos

```
src/
├── main.tsx                        # Bootstrap: ReactDOM.createRoot + BrowserRouter
├── App.tsx                         # Rota raiz: theme, rotas, demo data, layout global
├── types/
│   └── asset.ts                    # Tipos centrais: Asset, VehicleSuggestion, AssetAIStatus
├── theme/
│   └── tokens.ts                   # Design tokens (cores, espaçamentos, radii)
├── store/
│   ├── useFolderStore.ts           # Pastas: CRUD, expand/collapse, arquivar
│   ├── useAssetViewStore.ts        # View mode, filtros, painel de filtros
│   ├── useUploadStore.ts           # Jobs de upload (individual + pasta)
│   ├── useDownloadStore.ts         # Jobs de download (ZIP)
│   └── useArchivedStore.ts         # Ativos arquivados
├── hooks/
│   └── useAssetUpdate.ts           # PATCH de metadados de ativo
├── utils/
│   ├── cn.ts                       # Merge de classNames (clsx + tailwind-merge)
│   ├── vehicleDatabase.ts          # Base estática de makes/models/trims
│   ├── extractZip.ts               # Extração de ZIP → File[]
│   ├── generateZip.ts              # Geração de ZIP mockada
│   └── urlToFile.ts                # URL de imagem → File object
└── components/
    └── ui/
        ├── index.ts                # Barrel exports dos primitivos
        ├── Input.tsx               # Input de texto com label + badge
        ├── Select.tsx              # Autocomplete com badge + ícone de check
        ├── ConfidenceBadge.tsx     # Badge de nível de confiança da IA
        ├── Spinner.tsx             # Loading spinner circular
        ├── Topbar.tsx              # Header global (logo, busca, avatar)
        ├── Sidebar.tsx             # Nav lateral esquerda (72px)
        ├── LeftPaneShell.tsx       # Wrapper para painéis esquerdos
        ├── AppSnackbar.tsx         # Toast notification
        ├── FolderTree.tsx          # Árvore de pastas hierárquica
        ├── RenameFolderDialog.tsx  # Dialog de renomear pasta
        ├── MoveFolderDialog.tsx    # Dialog de mover pasta
        ├── FolderUploadConfirmDialog.tsx # Confirmação de upload de pasta
        ├── ReviewMetadataModal.tsx # Revisão de metadados pós-upload
        ├── UploadActivityMonitor.tsx # Painel flutuante de uploads
        ├── DownloadActivityMonitor.tsx # Painel flutuante de downloads
        ├── ArchivedFoldersSection.tsx  # Seção de pastas arquivadas
        └── VerticalTabStrip.tsx    # Aba vertical para modal de IA
src/features/
    ├── asset-grid/
    │   ├── AssetGrid.tsx           # Grid/tabela de ativos
    │   └── SelectionActionBar.tsx  # Barra de ações quando há seleção
    ├── asset-card/
    │   ├── AssetCard.tsx           # Card individual de ativo
    │   └── AiStatusBadge.tsx       # Badge de status da IA no card
    ├── filter-panel/
    │   └── FilterPanel.tsx         # Painel de filtros laterais
    └── lifestyle-tagger/
        ├── LifestyleTaggerModal.tsx # Modal principal de AI detection
        ├── useVehicleAnalysis.ts   # Hook + função de análise de veículo
        ├── types.ts                # Tipos internos do lifestyle tagger
        └── index.ts                # Barrel exports
```

---

## 4. Design Tokens

**Arquivo:** `src/theme/tokens.ts`

Todos os valores de design do sistema estão centralizados aqui. Na migração para MUI, esses valores devem ser mapeados para o `createTheme()`.

```typescript
const tokens = {
  // Cores principais
  color: {
    primary: '#3730a3',          // Índigo (brand)
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Superfícies
    surface: {
      default: '#ffffff',
      muted: '#f8f9fa',
      canvas: '#f1f3f5',         // Background da página
      input: '#f4f4f5',
    },

    // Navegação lateral
    nav: {
      background: '#1e1a42',     // Sidebar background (roxo escuro)
      icon: '#acabff',           // Ícones inativos
      labelActive: '#ffffff',
      labelInactive: '#acabff',
      activePill: '#2f2673',     // Background do item ativo
    },

    // Texto
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      placeholder: '#9ca3af',
      dim: '#d1d5db',
    },

    // Bordas e overlays
    border: '#e5e7eb',
    overlay: 'rgba(0,0,0,0.4)',
  },

  // Border radius
  radius: {
    card: 12,
    dialog: 24,
    chip: 8,
    pill: 100,
    menu: 10,
  },

  // Dimensões de layout
  size: {
    panelWidth: 356,             // Largura do painel esquerdo (filtros, pastas)
    railWidth: 156,              // Largura do rail de tabs no modal
    stripHeight: 64,             // Altura da topbar
  },

  // Limiar de confiança da IA
  confidenceThreshold: 0.85,
}
```

### Mapeamento para MUI `createTheme`

```typescript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#3730a3' },
    success: { main: '#22c55e' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    info: { main: '#3b82f6' },
    background: {
      default: '#f1f3f5',  // canvas
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
  },
  shape: {
    borderRadius: 12,  // card radius (base)
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

---

## 5. Tipos Centrais

**Arquivo:** `src/types/asset.ts`

### `AssetAIStatus`

```typescript
type AssetAIStatus =
  | 'analyzing'    // IA processando a imagem
  | 'suggested'    // IA fez sugestões, aguarda revisão humana
  | 'auto-tagged'  // IA tagueou automaticamente (confiança alta)
  | 'approved'     // Humano aprovou os metadados
  | 'not-vehicle'; // IA identificou que não é veículo
```

### `VehicleSuggestion`

```typescript
interface VehicleSuggestion {
  year: number;
  make: string;
  model: string;
  trim: string;
  lifestyle: string;
  tags: string[];
  confidence: {
    year: number;    // 0.0 a 1.0
    make: number;
    model: number;
    trim: number;
    lifestyle: number;
  };
}
```

### `Asset`

```typescript
interface Asset {
  id: string;
  name: string;
  url: string;                    // URL da imagem (Unsplash CDN)
  mimeType: string;               // 'image/jpeg' | 'image/png' | etc.
  dimensions?: { width: number; height: number };

  // Metadados de veículo (YMMT)
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  lifestyle?: string;
  tags?: string[];

  // Estado da IA
  aiStatus?: AssetAIStatus;
  aiSuggestion?: VehicleSuggestion;
  needsReview?: boolean;          // true quando IA tem sugestão pendente

  // Arquivamento
  archived?: boolean;
  archivedAt?: string;            // ISO timestamp
}
```

### `ModalMode`

```typescript
type ModalMode = 'view' | 'review' | 'detect';

// Regra de resolução:
function resolveModalMode(asset: Asset): ModalMode {
  if (!asset.aiStatus || asset.aiStatus === 'not-vehicle') return 'detect';
  if (asset.needsReview || asset.aiStatus === 'suggested') return 'review';
  return 'view';
}
```

---

## 6. State Management — Stores Zustand

Todos os stores são criados com `zustand` e vivem apenas em memória (sessão). Nenhum usa `localStorage` ou persistência.

---

### 6.1 `useFolderStore`

**Arquivo:** `src/store/useFolderStore.ts`

Gerencia a árvore de pastas, expansão/colapso, movimentação, renomeação e arquivamento.

#### Tipos

```typescript
type FolderIconType =
  | 'folder'           // Pasta normal
  | 'folder-read-only' // Compartilhada comigo (somente leitura)
  | 'folder-shared'    // Compartilhada por mim
  | 'folder-account';  // Raiz de conta

interface Folder {
  id: string;
  name: string;
  parentId: string | null;  // null = raiz
  icon: FolderIconType;
  count: number;            // Número de ativos
}
```

#### Estrutura de Pastas (dados estáticos — 29 pastas)

```
constellation-motors (account) [root]
├── const-internal (folder)
│   ├── 2025-campaign (folder)
│   ├── heritage-models (folder)
│   └── ... (mais subpastas)
├── dealership-northeast (shared)
│   └── ...
└── ...

shared-with-me-root (read-only) [root]
└── partner-agency (read-only)
    └── ...
```

#### Estado

```typescript
interface FolderState {
  folders: Folder[];
  expandedIds: string[];    // default: ['constellation-motors', 'const-internal']
  archivedIds: string[];    // IDs de pastas arquivadas
}
```

#### Actions

```typescript
toggleExpand(id: string): void
moveFolder(id: string, newParentId: string): void   // valida para evitar loops circulares
renameFolder(id: string, newName: string): void
archiveFolder(id: string): void
unarchiveFolder(id: string): void
deleteFolder(id: string): void
addFolder(name: string, parentId: string, icon: FolderIconType): void
```

#### Funções Auxiliares (exportadas)

```typescript
getFolder(id: string): Folder | undefined
getFolderBreadcrumb(folderId: string): Folder[]         // path do root até a pasta
getFolderChildren(parentId: string | null): Folder[]    // filhos diretos
deriveFolderTree(
  folders: Folder[],
  expandedIds: string[],
  archivedIds: string[]
): Array<Folder & { level: number; hasChildren: boolean }>
getDescendantIds(folderId: string, folders: Folder[]): string[]  // para validar move
```

---

### 6.2 `useAssetViewStore`

**Arquivo:** `src/store/useAssetViewStore.ts`

Controla o modo de visualização do grid e os filtros ativos.

#### Tipos

```typescript
type ViewMode =
  | 'grid-large'      // Grid grande (padrão)
  | 'grid-horizontal' // Grid com cards horizontais
  | 'grid-small'      // Grid pequeno (mais itens por linha)
  | 'table-compact'   // Tabela compacta
  | 'table-spacious'; // Tabela espaçosa

interface FilterValues {
  // Ordenação
  sortField: 'name' | 'date' | 'size' | 'make' | 'model' | '' ;
  sortDirection: 'asc' | 'desc';

  // Veículo (YMMT)
  make: string;
  model: string;
  trim: string;
  year: string;

  // Metadados
  lifestyle: string;
  tags: string;         // busca de texto livre

  // Arquivo
  mimeType: string;     // 'image/jpeg' | 'image/png' | etc.
  shape: 'landscape' | 'portrait' | 'square' | '';

  // Dimensões
  minWidth: number | '';
  maxWidth: number | '';
  minHeight: number | '';
  maxHeight: number | '';

  // IA
  aiStatus: AssetAIStatus | '';
}

const DEFAULT_FILTERS: FilterValues = {
  sortField: '', sortDirection: 'asc',
  make: '', model: '', trim: '', year: '',
  lifestyle: '', tags: '',
  mimeType: '', shape: '',
  minWidth: '', maxWidth: '', minHeight: '', maxHeight: '',
  aiStatus: '',
}
```

#### Estado

```typescript
interface AssetViewState {
  viewMode: ViewMode;               // default: 'grid-large'
  isFilterPanelOpen: boolean;       // default: false
  filters: FilterValues;
}
```

#### Actions

```typescript
setViewMode(mode: ViewMode): void
cycleViewMode(): void      // cicla na ordem: grid-large → grid-horizontal → grid-small → table-compact → table-spacious → grid-large
toggleFilterPanel(): void
closeFilterPanel(): void
setFilter(key: keyof FilterValues, value: any): void
clearFilters(): void
```

---

### 6.3 `useUploadStore`

**Arquivo:** `src/store/useUploadStore.ts`

Rastreia jobs de upload de arquivos individuais e de pastas completas.

#### Tipos

```typescript
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

type UploadStatus = 'uploading' | 'done' | 'error';

interface UploadJob {
  id: string;
  name: string;
  previewUrl: string;     // Object URL para preview local
  status: UploadStatus;
  folderJobId?: string;   // se pertence a um folder upload
  asset?: Asset;          // preenchido quando done
}

type FolderUploadStatus = 'uploading' | 'done' | 'partial' | 'empty' | 'error';

interface FolderUploadJob {
  id: string;
  folderName: string;       // nome original da pasta/ZIP
  destFolderName: string;   // nome da pasta destino no portal
  createdFolderId?: string; // ID da pasta criada
  fileJobIds: string[];     // IDs dos UploadJobs filhos
  skippedFileNames: string[];
  status: FolderUploadStatus;
}
```

#### Estado

```typescript
interface UploadState {
  jobs: UploadJob[];
  folderJobs: FolderUploadJob[];
  isMinimized: boolean;
}
```

#### Actions

```typescript
addUploads(files: File[], destFolderId: string): void
// - Cria UploadJob para cada arquivo
// - POST /api/upload com FormData
// - Simula erro se nome contém '_fail_'

addFolderUpload(folderName: string, destFolder: {id, name}, files: File[]): void
// - Cria FolderUploadJob + UploadJobs filhos
// - Faz upload de cada arquivo individualmente

minimize(): void
expand(): void
clearCompleted(): void  // remove jobs com status 'done' ou 'error'
```

---

### 6.4 `useDownloadStore`

**Arquivo:** `src/store/useDownloadStore.ts`

Rastreia jobs de geração de ZIP para download.

#### Tipos

```typescript
type DownloadStatus = 'generating' | 'ready' | 'partial' | 'error' | 'empty';

interface DownloadJob {
  id: string;
  folderName: string;
  assetCount: number;
  skippedCount: number;
  status: DownloadStatus;
}
```

#### Estado

```typescript
interface DownloadState {
  jobs: DownloadJob[];
  isMinimized: boolean;
}
```

#### Actions

```typescript
startDownload(folderName: string, assets: Asset[]): void
// - Cria job com status 'generating'
// - Chama generateZip() (delay simulado: 1.2–4s)
// - Atualiza status para 'ready', 'partial', 'error' ou 'empty'

retry(jobId: string): void
clearCompleted(): void
minimize(): void
expand(): void
```

---

### 6.5 `useArchivedStore`

**Arquivo:** `src/store/useArchivedStore.ts`

Lista de ativos arquivados pelo usuário.

#### Estado

```typescript
interface ArchivedState {
  archivedAssets: Asset[];
}
```

#### Actions

```typescript
archiveAsset(asset: Asset): void
// - Adiciona asset com archivedAt: new Date().toISOString()

unarchiveAsset(assetId: string): void
```

---

## 7. Hooks

### 7.1 `useAssetUpdate`

**Arquivo:** `src/hooks/useAssetUpdate.ts`

Hook para salvar metadados de ativo via PATCH.

```typescript
interface AssetUpdatePayload {
  name?: string;
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  lifestyle?: string;
  tags?: string[];
  needsReview?: boolean;
}

interface UseAssetUpdateReturn {
  saving: boolean;
  saveError: string | null;
  save: (assetId: string, payload: AssetUpdatePayload) => Promise<boolean>;
}

function useAssetUpdate(): UseAssetUpdateReturn
```

**Comportamento:**
- `save()` faz `PATCH /api/assets/:id` com o payload
- Retorna `true` se sucesso, `false` se erro
- `saving` é `true` durante a requisição
- `saveError` contém a mensagem de erro se falhou

---

### 7.2 `useVehicleAnalysis`

**Arquivo:** `src/features/lifestyle-tagger/useVehicleAnalysis.ts`

Hook que expõe a função de análise de veículo por IA.

```typescript
interface VehicleField {
  value: string;
  confidence: number;  // 0.0 a 1.0
}

interface VehicleAnalysisResult {
  vehicle: {
    year: VehicleField;
    make: VehicleField;
    model: VehicleField;
    trim: VehicleField;
  };
  lifestyle: VehicleField;
  tags: string[];
  confidence: number;  // confiança geral (0.0 a 1.0)
}

interface UseVehicleAnalysisReturn {
  analyzing: boolean;
  analysisError: string | null;
  result: VehicleAnalysisResult | null;
  analyzeVehicle: (file: File) => Promise<VehicleAnalysisResult | null>;
}

function useVehicleAnalysis(): UseVehicleAnalysisReturn
```

**Comportamento de `analyzeVehicle(file)`:**
1. Faz `POST /api/detect-make` com a imagem (FormData)
2. Aplica defaults por make:
   - Land Rover → Lifestyle: "Luxury"
   - BMW, Porsche → Lifestyle: "Performance"
   - Ford → Lifestyle: "Adventure"
   - Tesla → Lifestyle: "Urban Commuter"
   - (demais) → Lifestyle: "Generic Lifestyle"
3. Adiciona tags padrão: `["Automotive"]`
4. Retorna resultado completo com campos de confiança

---

## 8. Utilitários

### 8.1 `cn` — className merger

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]): string
```

> Para migração: provavelmente não será necessário se Tailwind for removido. Substituir por `clsx` puro ou `classnames`.

---

### 8.2 `vehicleDatabase` — base estática de YMMT

```typescript
// src/utils/vehicleDatabase.ts

// VEHICLE_DB: { [make: string]: { [model: string]: string[] } }
// 47 makes, 150+ models

function getMakes(): string[]                          // todos os makes, A-Z
function getModels(make: string): string[]             // modelos para o make
function getTrims(make: string, model: string): string[] // trims para make+model
function getYears(): string[]                          // ano atual até 1990
```

---

### 8.3 `extractZip` — extração de ZIP para upload de pasta

```typescript
// src/utils/extractZip.ts

interface ExtractResult {
  folderName: string;  // nome base do ZIP (sem .zip)
  files: File[];       // arquivos extraídos com MIME type correto
}

async function extractZip(zipFile: File): Promise<ExtractResult>
```

**Comportamento:**
- Usa JSZip para extrair
- Ignora arquivos macOS: `__MACOSX/`, `._*`, `.DS_Store`, arquivos com `.` no início
- Detecta MIME pelo ext: `.jpg/.jpeg` → `image/jpeg`, `.png` → `image/png`, etc.
- Default para `application/octet-stream` se ext desconhecida

---

### 8.4 `generateZip` — geração de ZIP mockada

```typescript
// src/utils/generateZip.ts

async function generateZip(folderName: string, assetCount: number): Promise<Blob>
// delay = Math.min(1200 + assetCount * 60, 4000) ms
// lança erro se folderName contém '_fail_'
// cria ZIP com estrutura: folderName/ + _README.txt

function triggerDownload(blob: Blob, filename: string): void
// cria Object URL, simula click em <a>, revoga URL
```

---

### 8.5 `urlToFile` — URL de imagem para File object

```typescript
// src/utils/urlToFile.ts

async function urlToFile(url: string, filename: string): Promise<File>
// Fetch da URL → Blob → new File([blob], filename, { type: blob.type })
// Usado quando LifestyleTaggerModal é aberto em ativo existente (que tem URL, não File)
```

---

## 9. Componentes de UI Primitivos

### 9.1 `Input`

**Arquivo:** `src/components/ui/Input.tsx`

```typescript
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  endAdornment?: ReactNode;
  badge?: ReactNode;   // aparece ao lado do label (ex: ConfidenceBadge)
  id?: string;
}
```

**Implementação:** MUI `TextField` com `variant="outlined"`, foco com cor primária customizada, label + badge inline acima do campo.

---

### 9.2 `Select`

**Arquivo:** `src/components/ui/Select.tsx`

```typescript
interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  badge?: ReactNode;        // ao lado do label (ex: ConfidenceBadge)
  showCheckIcon?: boolean;  // mostra ícone verde quando selecionado
}
```

**Implementação:** MUI `Autocomplete` com input customizado. Quando `showCheckIcon=true` e há valor selecionado, exibe ícone de check verde no endAdornment.

---

### 9.3 `ConfidenceBadge`

**Arquivo:** `src/components/ui/ConfidenceBadge.tsx`

```typescript
type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  score?: number;          // 0.0 a 1.0 (exibido no tooltip)
  tooltipContent?: ReactNode;
}

function toConfidenceLevel(score: number): ConfidenceLevel
// >= 0.75 → 'high'
// >= 0.45 → 'medium'
// < 0.45  → 'low'
```

**Visual:**
- `high` → chip verde com "High"
- `medium` → chip amarelo com "Medium"
- `low` → chip vermelho com "Low"
- Hover mostra tooltip com score exato (ex: "87% confident")

---

### 9.4 `Spinner`

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';  // sm=16px, md=24px, lg=40px
  color?: 'primary' | 'inherit';
}
```

**Implementação:** MUI `CircularProgress`.

---

### 9.5 `AppSnackbar`

```typescript
interface AppSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  action?: ReactNode;         // botão de ação opcional
  autoHideDuration?: number;  // default: 4000ms
}
```

**Visual:** Background `#323232`, texto branco, botão de ação em cor primária.

---

## 10. Layout Global

**Arquivo:** `src/App.tsx`

### Estrutura do Layout

```
┌─────────────────────────────────────────────────────┐
│  Topbar (64px altura, full-width)                    │
├──────┬──────────────────────────────────────────────┤
│      │                                               │
│ Side │  [LeftPane: FolderTree OU FilterPanel]        │
│ bar  │  (356px, colapsável)                         │
│ 72px │                                               │
│      │  AssetGrid (flex-grow: 1)                     │
│      │                                               │
└──────┴──────────────────────────────────────────────┘
         UploadActivityMonitor (position: fixed, bottom-right)
         DownloadActivityMonitor (position: fixed, bottom-right, acima do upload)
```

### PortalPage Component (dentro de App.tsx)

```typescript
// Props via React Router useParams
const { folderId } = useParams<{ folderId: string }>();

// Estado local
const [folderTreeOpen, setFolderTreeOpen] = useState(true);
const [leftPaneContent, setLeftPaneContent] = useState<'folders' | 'filters'>('folders');

// Layout: Sidebar + (FolderTree | FilterPanel) + AssetGrid
```

### Rotas

```typescript
// React Router v7
<Routes>
  <Route path="/" element={<Navigate to="/portal/const-internal" />} />
  <Route path="/portal" element={<Navigate to="/portal/const-internal" />} />
  <Route path="/portal/:folderId" element={<PortalPage />} />
</Routes>
```

### Demo Data (hardcoded em App.tsx)

22 ativos com URLs Unsplash, todos veículos com diferentes `aiStatus`:
- ~8 com `'approved'`
- ~6 com `'suggested'` + `needsReview: true`
- ~4 com `'analyzing'`
- ~4 com `'auto-tagged'`

---

## 11. Feature: Folder Tree

**Arquivo:** `src/components/ui/FolderTree.tsx`

### Props

```typescript
interface FolderTreeProps {
  onClose: () => void;
  noShell?: boolean;      // true = sem cabeçalho/wrapper (renderizado dentro de LeftPaneShell)
  activeFolderId?: string;
}
```

### Estado Local

```typescript
const [query, setQuery] = useState('');
const [brandKitsOpen, setBrandKitsOpen] = useState(false);
const [archiveOpen, setArchiveOpen] = useState(false);
const [movingFolder, setMovingFolder] = useState<{ id: string; name: string } | null>(null);
const [renamingFolder, setRenamingFolder] = useState<{ id: string; name: string } | null>(null);
const [uploadFolderDest, setUploadFolderDest] = useState<{ id: string; name: string; icon: FolderIconType } | null>(null);
const [pendingFolderUpload, setPendingFolderUpload] = useState<{
  dest: { id: string; name: string };
  folderName: string;
  files: File[];
} | null>(null);
const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);
```

### Sub-componentes internos

**`ShortcutRow`** — links rápidos no topo da árvore:
- Favoritos (ícone estrela)
- Recentes (ícone clock)
- Lixeira (ícone trash, com badge de contagem)
- Arquivo (ícone archive, expansível)

**`FolderRow`** — cada item da árvore:
- Indentação visual por `level` (16px por nível)
- Ícone de chevron (expande/colapsa se tem filhos)
- Ícone da pasta (variant por `FolderIconType`)
- Label + contagem de ativos
- Context menu (botão de três pontos no hover) com ações:
  - Renomear
  - Mover (não disponível para `folder-account`)
  - Upload de Pasta (não disponível para `folder-read-only`)
  - Download
  - Arquivar
  - Excluir

### Fluxo de Upload de Pasta (ZIP)

1. Usuário clica em "Upload Folder" no context menu de uma pasta
2. Input file oculto é ativado (`accept=".zip"`)
3. `extractZip(zipFile)` extrai os arquivos
4. `FolderUploadConfirmDialog` mostra: nome da pasta extraída, número de arquivos, arquivos ignorados
5. Usuário confirma → `useUploadStore.addFolderUpload()` inicia o upload
6. `UploadActivityMonitor` mostra o progresso

### Seção "Shared with me"

Pastas com `icon === 'folder-read-only'` na raiz aparecem aqui. Sem permissão de upload.

### Seção "Brand Kits"

Hardcoded com 3 itens demo: "Constellation 2025", "SUV Line", "Heritage". Apenas visuais.

### Dialogs filhos

- `RenameFolderDialog` — input + confirmação
- `MoveFolderDialog` — lista de pastas destino (exclui a pasta atual e descendentes)
- `FolderUploadConfirmDialog` — lista de arquivos a serem enviados

---

## 12. Feature: Asset Grid

**Arquivo:** `src/features/asset-grid/AssetGrid.tsx`

### Props

```typescript
interface AssetGridProps {
  title: string;              // nome da pasta atual
  initialAssets: Asset[];     // demo data passado de App.tsx
  onToggleFolderTree: () => void;
  folderTreeOpen: boolean;
  showArchived?: boolean;     // true quando rota é /portal/archive
}
```

### Estado Local

```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
// viewMode, filters, isFilterPanelOpen vêm de useAssetViewStore
```

### Subcomponentes

**Barra de Ferramentas (no topo do grid):**
- Botão de toggle da pasta (ChevronLeft/Right)
- Título da pasta
- Contador de itens
- Campo de busca por nome
- Botão de filtros (com `FilterPanelBadge`)
- Botão de ciclo de view mode (ícone muda por modo)
- Botão de download (ZIP da pasta)

**`AssetTableRow`** (quando viewMode é `table-compact` ou `table-spacious`):
```typescript
// table-compact: linha densa com thumbnail 40x40, nome, make/model, status badge
// table-spacious: linha mais alta com thumbnail 56x56, mais metadados visíveis
```

**`SelectionActionBar`** — aparece no rodapé quando `selectedIds.size > 0`:
- Contador "N selected"
- Botões: Download, Archive, Delete, Cancel (deselect all)

### Lógica de Filtros (`applyFilters`)

```typescript
function applyFilters(assets: Asset[], filters: FilterValues): Asset[] {
  // 1. Filtra por make, model, trim, year (match exato)
  // 2. Filtra por aiStatus
  // 3. Filtra por mimeType
  // 4. Filtra por lifestyle (inclui texto)
  // 5. Filtra por tags (busca em array)
  // 6. Filtra por shape:
  //    - landscape: width > height
  //    - portrait: height > width
  //    - square: width === height
  // 7. Filtra por dimensões (min/max width/height)
  // 8. Ordena por sortField + sortDirection
}
```

### View Modes — Layout

| Mode | Colunas | Card | Thumbnail |
|---|---|---|---|
| `grid-large` | auto-fill ~280px | vertical | quadrado, 100% width |
| `grid-horizontal` | auto-fill ~400px | horizontal (imagem + info side-by-side) | 160px largura fixa |
| `grid-small` | auto-fill ~180px | vertical compacto | quadrado, 100% width |
| `table-compact` | 1 coluna (tabela) | linha densa | 40×40 |
| `table-spacious` | 1 coluna (tabela) | linha alta | 56×56 |

---

## 13. Feature: Asset Card

**Arquivo:** `src/features/asset-card/AssetCard.tsx`

### Props

```typescript
interface AssetCardProps {
  asset: Asset;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onCardClick?: (asset: Asset) => void;
}
```

### Anatomia Visual

```
┌─────────────────────────────┐
│  [thumbnail]                │  ← aspect-ratio: 1/1 (quadrado)
│   ☐  checkbox (no hover)   │
│   [AI status badge]         │  ← canto inferior direito do thumb
│   [Analyzing overlay]       │  ← se aiStatus === 'analyzing'
├─────────────────────────────┤
│  nome-do-arquivo.jpg        │  ← truncado com ellipsis
│  2024 Ford Bronco Sport     │  ← make/model/year (se disponível)
│  [tag] [tag] [tag] +2       │  ← chips de tags (máx 4 visíveis)
│                        [⋮]  │  ← context menu
└─────────────────────────────┘
```

### Estados

- **Normal:** sombra leve, sem border
- **Hover:** sombra mais pronunciada (`box-shadow: 0 4px 16px rgba(0,0,0,0.12)`)
- **Selected:** border azul (primária), fundo levemente azulado
- **Analyzing:** overlay semitransparente com Spinner e texto "Analyzing image…" com animação de scan line

### Context Menu (ícone ⋮)

- **View** — abre `LifestyleTaggerModal` em modo `view`
- **Review** — abre `LifestyleTaggerModal` em modo `review` (só se `needsReview === true`)
- **Archive** / **Unarchive** — chama `useArchivedStore`

### AI Status Badge (`AiStatusBadge`)

```typescript
// Cor e label por status:
// 'approved'    → verde,  "Approved"
// 'auto-tagged' → azul,   "Auto-tagged"
// 'suggested'   → amarelo, "Review needed"
// 'analyzing'   → cinza,   (badge não aparece, overlay aparece)
// 'not-vehicle' → cinza,   "Not a vehicle"
```

### Acessibilidade

- Suporte a Enter/Space para abrir card
- `role="checkbox"` no checkbox de seleção
- `aria-selected` no card

---

## 14. Feature: Filter Panel

**Arquivo:** `src/features/filter-panel/FilterPanel.tsx`

### Exports

```typescript
function FilterPanel(): JSX.Element
function FilterPanelBadge(): JSX.Element    // chip com contagem de filtros ativos
function FilterPanelClearAll(): JSX.Element // botão "Clear all"
```

### Seções do Painel

O painel é encapsulado em `LeftPaneShell` com título "Filters".

**1. Ordenação**
- `FilterSelect` → campo: `sortField` (Name, Date, Size, Make, Model)
- `FilterSelect` → direção: `sortDirection` (Ascending, Descending)

**2. Veículo**
- `FilterSelect` → Make (opções de `getMakes()`)
- `FilterSelect` → Model (opções de `getModels(make)`)
- `FilterSelect` → Trim (opções de `getTrims(make, model)`)
- `FilterSelect` → Year (opções de `getYears()`)

**3. Conteúdo**
- `FilterSelect` → Lifestyle (opções hardcoded: Luxury, Adventure, Urban Commuter, Performance, etc.)
- `FilterSearch` → Tags (busca texto livre)

**4. Arquivo**
- `FilterSelect` → File Type (JPEG, PNG, GIF, WebP)
- `FilterSelect` → Shape (Landscape, Portrait, Square)

**5. Dimensões**
- `DimInput` × 4 → Min Width, Max Width, Min Height, Max Height

**6. AI Status**
- `FilterSelect` → Status (Approved, Auto-tagged, Suggested, Not a vehicle)

### Sub-componentes internos

```typescript
// FilterSelect: MUI Select com placeholder e opção "Any X" (limpa o filtro)
interface FilterSelectProps {
  label: string;
  filterKey: keyof FilterValues;
  options: string[];
  disabled?: boolean;
}

// FilterSearch: MUI TextField com ícone de busca
interface FilterSearchProps {
  label: string;
  filterKey: keyof FilterValues;
}

// DimInput: MUI TextField type="number" com label inline
interface DimInputProps {
  label: string;
  filterKey: 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight';
}
```

---

## 15. Feature: LifestyleTagger Modal (AI Detection)

**Arquivo:** `src/features/lifestyle-tagger/LifestyleTaggerModal.tsx`

É o componente mais complexo da aplicação. Combina visualização de imagem, detecção por IA e edição de metadados.

### Props

```typescript
interface LifestyleTaggerModalProps {
  open: boolean;
  asset?: Asset;         // aberto para ativo existente (view/review)
  file?: File;           // aberto para arquivo novo (detect)
  onClose: () => void;
  onApprove?: (payload: AssetUpdatePayload) => void;
  onDismiss?: () => void;
}
```

### Estado Local

```typescript
const [viewTab, setViewTab] = useState<ViewTabId>('metadata');
const [vehicleData, setVehicleData] = useState<VehicleAnalysisResult | null>(null);
const [zoom, setZoom] = useState<number>(1);
const [analyzing, setAnalyzing] = useState(false);

// Campos do formulário
const [year, setYear] = useState('');
const [make, setMake] = useState('');
const [model, setModel] = useState('');
const [trim, setTrim] = useState('');
const [lifestyle, setLifestyle] = useState('');
const [tags, setTags] = useState<string[]>([]);
```

### Layout do Modal

```
┌──────────────────────────────────────────────────────────────────┐
│  Dialog (fullscreen mobile, 90vw×90vh desktop, radius: 24px)     │
│  ┌─────────────────────────────┬──────────────┬──────────────┐   │
│  │  Painel Esquerdo            │  Abas        │  Painel Dir  │   │
│  │  (imagem + controles zoom)  │  (vertical)  │  (formulário)│   │
│  │                             │              │              │   │
│  │  [IMAGE CANVAS]             │  Metadata    │  Year        │   │
│  │  [Zoom controls]            │  History     │  Make        │   │
│  │  [Scan animation]           │  Enhance     │  Model       │   │
│  │  [AI callout boxes]         │  Resize      │  Trim        │   │
│  │                             │  Approval    │  Lifestyle   │   │
│  │                             │  Download    │  Tags        │   │
│  └─────────────────────────────┴──────────────┴──────────────┘   │
│  [Cancel]                                    [Dismiss] [Approve]  │
└──────────────────────────────────────────────────────────────────┘
```

### Tabs (VerticalTabStrip)

```typescript
type ViewTabId = 'metadata' | 'history' | 'enhance' | 'resize' | 'approval' | 'download';

// metadata  → formulário YMMT + lifestyle + tags (FUNCIONAL)
// history   → timeline de versões (UI only, sem dados)
// enhance   → controles de upscaling (UI only)
// resize    → controles de aspect ratio / dimensões (UI only)
// approval  → status de aprovação (UI only)
// download  → link de download (UI only)
```

### Painel de Imagem (esquerdo)

**Controles de Zoom:**
```
[-]  75%  [+]   Fit   Reset
```
- Zoom range: 0.25× a 3×
- Mouse wheel = zoom in/out
- "Fit" = ajusta zoom ao container
- "Reset" = zoom 1×

**Animações quando `analyzing === true`:**
1. Scan line horizontal que percorre a imagem de cima a baixo (CSS animation)
2. Grid overlay com linhas finas aparecendo gradualmente
3. Callout boxes animados que aparecem nos "pontos detectados" (posições hardcoded para demo)

**Botão "Detect Vehicle":**
- Aparece quando há `file` e não há `vehicleData`
- Click → `analyzeVehicle(file)` → popula form com resultado

**"Re-detect" (após detecção):**
- Mostra lista de `REDETECT_SUGGESTIONS` (array hardcoded de sugestões alternativas)
- Click em sugestão → substitui form com novos valores

### Painel Direito — Formulário (tab Metadata)

**Campos em ordem:**

```
Year    [Select] [ConfidenceBadge]
Make    [Select] [ConfidenceBadge]
Model   [Select] [ConfidenceBadge]  ← depende de Make
Trim    [Select] [ConfidenceBadge]  ← depende de Model
─────────────────────────────────
Lifestyle [Select] [ConfidenceBadge]
Tags      [Input multi-value]
```

**Dependências cascata:**
- `model` options = `getModels(make)` → limpa se make mudar
- `trim` options = `getTrims(make, model)` → limpa se model mudar

**ConfidenceBadge:** aparece ao lado do label quando o campo tem dado da IA. Tooltip mostra score exato.

### Botões de Ação

```typescript
// Cancel → onClose()
// Dismiss → onDismiss?.()  (sinaliza "não é veículo" ou "ignorar sugestão")
// Approve → onApprove?.({ year, make, model, trim, lifestyle, tags, needsReview: false })
```

---

## 16. Feature: Upload Activity Monitor

**Arquivo:** `src/components/ui/UploadActivityMonitor.tsx`

### Posicionamento

```css
position: fixed;
bottom: 16px;
right: 16px;
z-index: 1300;  /* acima de outros modais */
width: 380px;
```

### Layout

```
┌────────────────────────────────────┐
│  Uploads  [minimize]  [close]      │
├────────────────────────────────────┤
│  FolderJobCard:                    │
│    📁 folder-name.zip              │
│    ├── file1.jpg ✓ done            │
│    ├── file2.jpg ⟳ uploading       │
│    └── file3.jpg ✗ error           │
│  ─────────────────────────────── │
│  JobRow (individual):              │
│    [thumb] filename.jpg  ✓ done    │
└────────────────────────────────────┘
```

### Sub-componentes

**`FolderJobCard`:**
- Header com nome da pasta + status icon (spinner/check/warning)
- Lista de `JobRow` para cada arquivo dentro da pasta
- Status summary ("3 of 5 done", "1 error")

**`JobRow`:**
- Thumbnail 40×40 (previewUrl do UploadJob)
- Nome do arquivo (truncado)
- Status icon: spinner (uploading), check verde (done), X vermelho (error)

### Comportamento

- Quando todos jobs completam, painel pode ser fechado
- `clearCompleted` remove jobs finalizados
- `isMinimized = true` → mostra apenas o header com contagem

---

## 17. Feature: Download Activity Monitor

**Arquivo:** `src/components/ui/DownloadActivityMonitor.tsx`

### Posicionamento

Idêntico ao Upload Monitor mas 8px acima dele (bottom: 16 + altura do upload monitor).

### Layout

```
┌────────────────────────────────────┐
│  Downloads  [minimize]  [close]    │
├────────────────────────────────────┤
│  JobRow:                           │
│    📁 2025-campaign.zip            │
│       [⟳] Generating... (spinner) │
│    ─                               │
│    📁 heritage-models.zip          │
│       [✓] Ready — 22 files        │
│    ─                               │
│    📁 dealership.zip               │
│       [⚠] Partial — 18/22 files   │
│       [Retry]                      │
│    ─                               │
│    📁 campaign-fail.zip            │
│       [✗] Error                    │
│       [Retry]                      │
└────────────────────────────────────┘
```

### Status Icons

| Status | Icon | Cor |
|---|---|---|
| `generating` | CircularProgress (spinner) | primária |
| `ready` | CheckCircle | verde |
| `partial` | Warning | amarelo |
| `error` | Error | vermelho |
| `empty` | Info | cinza |

---

## 18. Roteamento

**Stack:** React Router DOM v7

```typescript
// src/main.tsx: envolvido em <BrowserRouter>
// src/App.tsx: define as rotas

<Routes>
  <Route path="/" element={<Navigate to="/portal/const-internal" replace />} />
  <Route path="/portal" element={<Navigate to="/portal/const-internal" replace />} />
  <Route path="/portal/:folderId" element={<PortalPage />} />
</Routes>

// Pastas especiais:
// /portal/archive  → showArchived=true no AssetGrid
// /portal/:qualquer-id-valido → filtra assets pelo folderId (no estado atual, todos exibem os mesmos 22 demo assets)
```

---

## 19. API Endpoints

Todos os endpoints são proxiados pelo Vite em dev. Em produção, precisam de um backend real ou proxy de servidor.

### Configuração do proxy (vite.config.ts)

```typescript
server: {
  proxy: {
    '/api/assets': 'http://localhost:3000',
    '/api/detect-make': 'http://localhost:3000',
    '/api/upload': 'http://localhost:3000',
    '/api/anthropic': 'https://api.anthropic.com',
    '/api/img': 'https://images.unsplash.com',
  }
}
```

### Endpoints utilizados

| Endpoint | Método | Body | Resposta esperada | Usado por |
|---|---|---|---|---|
| `PATCH /api/assets/:id` | PATCH | `AssetUpdatePayload` (JSON) | `{ success: true }` | `useAssetUpdate.save()` |
| `POST /api/detect-make` | POST | `FormData { file: File }` | `VehicleSuggestion` (JSON) | `useVehicleAnalysis.analyzeVehicle()` |
| `POST /api/upload` | POST | `FormData { file: File }` | `{ asset: Asset }` | `useUploadStore.addUploads()` |

---

## 20. Fluxos de Dados Completos

### Fluxo: Carregar pasta e exibir ativos

```
URL /portal/:folderId
  → App.tsx useParams({ folderId })
  → Filtra DEMO_ASSETS por folderId (mock: exibe todos)
  → Passa initialAssets para <AssetGrid>
  → AssetGrid chama applyFilters(initialAssets, filters)
  → Renderiza cards ou linhas de tabela
```

### Fluxo: Abrir modal de detecção em ativo existente

```
AssetCard → context menu → "Review"
  → resolveModalMode(asset) = 'review'
  → <LifestyleTaggerModal open asset={asset} />
  → urlToFile(asset.url, asset.name) → File
  → Pré-preenche form com asset.year, .make, .model etc
  → ConfidenceBadge para cada campo que tem aiSuggestion
  → Usuário edita → "Approve"
    → onApprove({ ...formValues, needsReview: false })
    → useAssetUpdate.save(asset.id, payload) → PATCH /api/assets/:id
```

### Fluxo: Upload de arquivo novo

```
Usuário arrasta/seleciona arquivo na pasta
  → useUploadStore.addUploads([file], destFolderId)
  → POST /api/upload com FormData
  → Job status: uploading → done
  → Asset criado com aiStatus: 'analyzing'
  → UploadActivityMonitor mostra progresso
  → (Background) IA analisa → aiStatus muda para 'suggested'
  → AssetCard mostra badge "Review needed"
  → Usuário clica → LifestyleTaggerModal em modo 'review'
```

### Fluxo: Upload de pasta (ZIP)

```
FolderTree → context menu pasta → "Upload Folder"
  → Input file (accept=".zip") ativado
  → extractZip(zipFile) → { folderName, files[] }
  → FolderUploadConfirmDialog mostra resumo
  → Usuário confirma
  → useUploadStore.addFolderUpload(folderName, destFolder, files)
    → Cria FolderUploadJob + N UploadJobs
    → POST /api/upload para cada arquivo
  → UploadActivityMonitor mostra FolderJobCard com progresso individual
```

### Fluxo: Download de pasta como ZIP

```
AssetGrid → botão download (toolbar)
  → useDownloadStore.startDownload(folderName, assets)
  → Cria DownloadJob com status 'generating'
  → generateZip(folderName, assets.length)
    → delay simulado
    → retorna Blob
  → triggerDownload(blob, `${folderName}.zip`)
  → Job atualizado para 'ready' (ou 'partial', 'error', 'empty')
  → DownloadActivityMonitor mostra status
```

### Fluxo: Arquivar pasta

```
FolderTree → context menu → "Archive"
  → useFolderStore.archiveFolder(id)
  → Pasta some da árvore principal
  → Aparece em ShortcutRow "Archive" (expansível)
  → Rota /portal/archive → showArchived=true no AssetGrid
```

---

## 21. Interações e Estados de UI

### Seleção Múltipla no Grid

```
Click em checkbox → selectedIds.add(id) ou selectedIds.delete(id)
Click no card (sem checkbox) → selectedIds.clear(); abrir modal
Shift+Click → range selection (não implementado no demo)
SelectionActionBar aparece quando selectedIds.size > 0
```

### Context Menus

Todos os context menus usam padrão:
- Botão trigger com ícone ⋮ (MoreVert) visível no hover
- MUI `Menu` component
- `anchorEl` state para posicionamento
- Fecha ao clicar fora ou selecionar item

### Dialogs

Todos os dialogs seguem padrão MUI:
- `Dialog` com `open` prop
- `DialogTitle`, `DialogContent`, `DialogActions`
- Fechar via botão Cancel, X no header, ou backdrop click

### Animações Notáveis

1. **Scan Line (LifestyleTaggerModal):** keyframe CSS de `top: 0%` para `top: 100%` em 2s, loop infinito, enquanto `analyzing = true`
2. **Grid Overlay (LifestyleTaggerModal):** linhas finas aparecem com `opacity: 0 → 0.15`, transition 500ms
3. **Callout Boxes (LifestyleTaggerModal):** boxes de detecção fazem `scale(0) → scale(1)` + `opacity 0 → 1`, staggered por index
4. **FolderRow hover:** background aparece com transition 150ms
5. **AssetCard hover:** box-shadow aumenta com transition 200ms

### Scrollbar Customizado

```css
/* Aplicado em LeftPaneShell, FolderTree, FilterPanel */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
```

---

## 22. Notas de Migração para MUI

### O que já usa MUI (pode ser mantido/expandido)

- `TextField` → Input, FilterSearch, DimInput
- `Autocomplete` → Select, FilterSelect
- `CircularProgress` → Spinner
- `Menu`, `MenuItem` → todos os context menus
- `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` → todos os dialogs
- `Chip` → ConfidenceBadge, AI status badges, tags
- `Snackbar` → AppSnackbar
- `Tooltip` → sidebar items, confidence badges
- `IconButton` → todos os botões de ícone
- `Checkbox` → seleção de cards e tabela

### O que precisa ser migrado de Tailwind para MUI

Os componentes abaixo usam classes Tailwind que devem ser convertidas para `sx` props ou `styled()` do MUI:

| Componente | Classes Tailwind principais |
|---|---|
| `Topbar` | `flex items-center gap-4 px-4 h-16 bg-white` |
| `Sidebar` | `flex flex-col items-center py-4 bg-[#1e1a42]` |
| `AssetCard` | `rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow` |
| `AssetGrid` | `grid gap-4` com colunas responsivas |
| `FolderRow` | `flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-100` |
| `FilterPanel` | `flex flex-col gap-3 p-4` |

### Padrão recomendado de migração

```typescript
// Antes (Tailwind):
<div className="flex items-center gap-4 px-4 h-16 bg-white shadow-sm">

// Depois (MUI sx):
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, height: 64, bgcolor: 'background.paper', boxShadow: 1 }}>
```

### Componentes MUI recomendados para novos componentes

| Atual (custom) | MUI equivalente |
|---|---|
| `Sidebar` | `Drawer` (variant="permanent") + `List` |
| `Topbar` | `AppBar` + `Toolbar` |
| `LeftPaneShell` | `Drawer` (variant="persistent") |
| `FolderTree` items | `TreeView` / `TreeItem` (MUI X) |
| `SelectionActionBar` | `Toolbar` dentro de `Paper` com `position: fixed` |
| `UploadActivityMonitor` | `Paper` com `position: fixed` + `List` |
| `DownloadActivityMonitor` | `Paper` com `position: fixed` + `List` |
| `VerticalTabStrip` | `Tabs` com `orientation="vertical"` |
| `AssetGrid` view modes | `ImageList` (masonry/quilted) ou CSS Grid via `Box` |

### Ícones

O projeto usa **Lucide React** para ícones. Na migração para MUI, substituir por `@mui/icons-material`:

| Lucide | MUI Icons Material |
|---|---|
| `ChevronRight/Left` | `ChevronRight` / `ChevronLeft` |
| `MoreVertical` | `MoreVert` |
| `FolderIcon` | `Folder` |
| `Check` | `Check` |
| `X` / `Close` | `Close` |
| `Download` | `Download` |
| `Upload` | `Upload` |
| `Archive` | `Archive` |
| `Trash` | `Delete` |
| `Search` | `Search` |
| `Star` | `Star` |
| `Clock` | `Schedule` |
| `Settings` | `Settings` |
| `Bell` | `Notifications` |

---

*Documento gerado em 25/06/2026. Cobre 100% dos componentes, stores, hooks e fluxos identificados na codebase do Constellation Portal v1.0.*
