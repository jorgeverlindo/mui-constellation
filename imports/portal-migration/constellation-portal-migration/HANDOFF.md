# Constellation Portal — Relatório de Transferência

## Tech Stack

| Tecnologia | Versão | Função |
|---|---|---|
| **React** | 18.3 | UI framework principal |
| **TypeScript** | 5.6 | Type safety em todo o projeto |
| **Vite** | 5.4 | Build tool e dev server |
| **React Router DOM** | 7.x | Client-side routing (`/portal/:folderId`) |
| **MUI (Material UI)** | 5.16 | Component library (Dialogs, Menus, Inputs, Snackbars) |
| **Emotion** | 11.x | CSS-in-JS (engine do MUI) |
| **Zustand** | 5.x | State management global (folders, uploads, assets, view) |
| **JSZip** | 3.10 | Extração de arquivos ZIP client-side |
| **Tailwind CSS** | 3.4 | Utilitários de estilo pontuais |
| **Lucide React** | 1.17 | Ícones suplementares (view modes) |

---

## Componentes

| Componente | Área | Status | Observação |
|---|---|---|---|
| `Sidebar` | Layout | ✅ UI completa | Ícones estáticos — sem routing funcional exceto Portal |
| `Topbar` | Layout | ✅ UI completa | Search bar é UI only, sem busca global |
| `FolderTree` | Folders | ✅ Funcional | Navegação, expand/collapse, context menu completo |
| `MoveFolderDialog` | Folders | ✅ Funcional | Browse, search, breadcrumb, loading, error, account folder warning |
| `RenameFolderDialog` | Folders | ✅ Funcional | Inline rename com validação |
| `ArchivedFoldersSection` | Folders | ✅ Funcional | Lista pastas arquivadas com unarchive |
| `FolderUploadConfirmDialog` | Upload | ✅ Funcional | Seleção de arquivos por checkbox, banners de warning, suporte a ZIP |
| `UploadActivityMonitor` | Upload | ✅ Funcional | Folder jobs + standalone jobs, collapse, Open Folder, View Metadata |
| `AssetGrid` | Assets | ✅ Funcional | Grid/table views, upload, drag-and-drop, search, filter, multi-select |
| `AssetCard` | Assets | ✅ Funcional | Thumbnail, checkbox, hover actions, archive via context menu |
| `SelectionActionBar` | Assets | ⚠️ Parcial | UI completa, ações (download, delete, tag) são stubs sem implementação |
| `FilterPanel` | Assets | ⚠️ Parcial | Filtros funcionam no state local, sem persistência ou backend |
| `LifestyleTaggerModal` | AI | ⚠️ Parcial | Tab strip e review funcionais; detecção usa mock rotativo (sem API real) |
| `ReviewMetadataModal` | Assets | ⚠️ Parcial | Tabela de assets e edição de campos renderizados; sem persistência |
| `AppSnackbar` | UI | ✅ Funcional | Toast dark style reutilizável com action e close |
| `ConfidenceBadge` | UI | ✅ Funcional | Badge de confiança AI com tooltip |
| `VerticalTabStrip` | UI | ✅ Funcional | Tabs verticais reutilizáveis (usadas no LifestyleTaggerModal) |

---

## Interações Funcionais

| Interação | Status |
|---|---|
| Navegar entre pastas (sidebar + URL) | ✅ |
| Expandir/colapsar pastas na árvore | ✅ |
| Renomear pasta | ✅ |
| Mover pasta (com browse, search, warnings) | ✅ |
| Arquivar / Desarquivar pasta e asset | ✅ |
| Deletar pasta | ✅ |
| Upload de pasta via ZIP (extração client-side) | ✅ |
| Confirmação de upload com seleção por arquivo | ✅ |
| Activity Monitor com status por job | ✅ |
| Upload de assets individuais (file picker + drag & drop) | ✅ |
| Troca de view mode (large grid, small grid, horizontal, table) | ✅ |
| Multi-seleção de assets | ✅ |
| Busca de assets (local, por nome e tag) | ✅ |
| Filtros de assets (AI status, MIME, dimensões) | ✅ local |
| "Upload Folder" desabilitado em Shared Folders com tooltip | ✅ |
| Snackbar com feedback de ações | ✅ |
| Breadcrumb reativo à rota | ✅ |
| Favorites / Recents / Trash / Brand Kits | ❌ UI only |
| Campaigns / Inventory / Insights (sidebar) | ❌ UI only |
| Detecção de veículo por AI | ⚠️ Mock (sem API) |
| Download / Delete em bulk selection | ⚠️ Stubs |
