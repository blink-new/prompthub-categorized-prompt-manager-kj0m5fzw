import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ExportProgress as ExportProgressType } from '../../types/prompt';

interface ExportProgressProps {
  open: boolean;
  progress: ExportProgressType;
  onClose: () => void;
}

export function ExportProgress({ open, progress, onClose }: ExportProgressProps) {
  const percentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  const getIcon = () => {
    switch (progress.status) {
      case 'complete':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Loader2 className="h-6 w-6 text-primary animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-primary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporting Prompts</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div className="flex-1">
              <p className={`font-medium ${getStatusColor()}`}>
                {progress.message}
              </p>
              {progress.total > 0 && (
                <p className="text-sm text-muted-foreground">
                  {progress.current} of {progress.total} prompts
                </p>
              )}
            </div>
          </div>

          {progress.status !== 'error' && progress.total > 0 && (
            <div className="space-y-2">
              <Progress value={percentage} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(percentage)}% complete
              </p>
            </div>
          )}

          {progress.status === 'complete' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Your prompts have been exported successfully!
              </p>
            </div>
          )}

          {progress.status === 'error' && (
            <div className="text-center">
              <p className="text-sm text-red-600">
                An error occurred during export. Please try again.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}