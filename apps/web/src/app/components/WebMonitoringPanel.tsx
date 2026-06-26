// WebMonitoringPanel — routing shell that dispatches to view or create mode.
import { WCMItem } from './WebMonitoringContent';
import { WebMonitoringViewPanel } from './WebMonitoringViewPanel';
import { WebMonitoringCreateForm } from './WebMonitoringCreateForm';
import type { WCMComment } from '../../data/types/compliance';

export interface PanelCaseSolution {
  screenshotDataUrl: string;
  comment: string;
  submittedBy: string;
  submittedAtISO: string;
  solved?: boolean;
  solvedAtISO?: string;
}

interface WebMonitoringPanelProps {
  item?: WCMItem;
  onClose: () => void;
  onOpenModal?: () => void;
  mode?: 'view' | 'create';
  onSave?: (infraction: WCMItem) => void;
  userType?: 'dealer' | 'dealer-singular' | 'dealer-emich' | 'oem';
  solution?: PanelCaseSolution;
  onSubmitSolution?: (draft: { screenshotDataUrl: string; comment: string }) => void;
  onMarkSolved?: () => void;
  onAcceptReport?: () => void;
  currentDealerName?: string;
  currentReporterName?: string;
  wcmComments?: WCMComment[];
  onAddComment?: (text: string) => void;
  currentUserName?: string;
}

export function WebMonitoringPanel({
  item, onClose, onOpenModal, mode = 'view', onSave, userType = 'oem',
  solution, onSubmitSolution, onMarkSolved, onAcceptReport,
  currentDealerName, currentReporterName,
  wcmComments, onAddComment, currentUserName,
}: WebMonitoringPanelProps) {
  if (mode === 'create') {
    return (
      <WebMonitoringCreateForm
        onClose={onClose}
        onSave={onSave}
        userType={userType}
        currentDealerName={currentDealerName}
        currentReporterName={currentReporterName}
      />
    );
  }

  if (!item) return null;

  return (
    <WebMonitoringViewPanel
      item={item}
      onClose={onClose}
      onOpenModal={onOpenModal}
      userType={userType}
      solution={solution}
      onSubmitSolution={onSubmitSolution}
      onMarkSolved={onMarkSolved}
      onAcceptReport={onAcceptReport}
      currentDealerName={currentDealerName}
      wcmComments={wcmComments}
      onAddComment={onAddComment}
      currentUserName={currentUserName}
    />
  );
}
