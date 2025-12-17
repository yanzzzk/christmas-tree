import { GestureType } from '@/types/christmas';
import { Hand, Grab, Circle, MousePointer, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GestureIndicatorProps {
  gesture: GestureType;
  isTracking: boolean;
  usingMouse: boolean;
  cameraPermission: 'pending' | 'granted' | 'denied' | 'prompt';
  isInitializing: boolean;
  onRequestCamera: () => void;
}

const gestureIcons: Record<GestureType, React.ReactNode> = {
  none: <Circle className="w-5 h-5" />,
  fist: <Grab className="w-5 h-5" />,
  open: <Hand className="w-5 h-5" />,
  pinch: <MousePointer className="w-5 h-5" />,
  pointing: <MousePointer className="w-5 h-5" />,
};

const gestureLabels: Record<GestureType, string> = {
  none: 'Detecting...',
  fist: 'Fist - Tree Mode',
  open: 'Open Palm - Galaxy',
  pinch: 'Pinch - Select',
  pointing: 'Pointing',
};

export function GestureIndicator({ 
  gesture, 
  isTracking, 
  usingMouse,
  cameraPermission,
  isInitializing,
  onRequestCamera
}: GestureIndicatorProps) {
  // Show camera enable button if permission not granted yet
  if (cameraPermission === 'prompt' || cameraPermission === 'pending') {
    return (
      <div className="absolute top-4 left-4 z-10">
        <div className="glass-gold rounded-xl px-4 py-3 flex items-center gap-3 text-foreground">
          <Button
            onClick={onRequestCamera}
            disabled={isInitializing}
            className="bg-christmas-green hover:bg-christmas-green/80 text-christmas-snow flex items-center gap-2"
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                启动中...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                启用手势控制
              </>
            )}
          </Button>
          <span className="text-xs text-muted-foreground">
            或使用鼠标控制
          </span>
        </div>
      </div>
    );
  }

  // Camera denied - show mouse fallback info
  if (cameraPermission === 'denied') {
    return (
      <div className="absolute top-4 left-4 z-10">
        <div className="glass-gold rounded-xl px-4 py-3 flex items-center gap-3 text-foreground">
          <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground">
            <MousePointer className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              鼠标控制模式
            </span>
            <span className="text-sm font-medium">
              双击切换模式
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Camera granted - show gesture status
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="glass-gold rounded-xl px-4 py-3 flex items-center gap-3 text-foreground">
        <div className={`
          p-2 rounded-lg 
          ${isTracking 
            ? 'bg-christmas-green/30 text-christmas-snow' 
            : 'bg-muted/50 text-muted-foreground'
          }
          transition-colors duration-300
        `}>
          {usingMouse ? <MousePointer className="w-5 h-5" /> : gestureIcons[gesture]}
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {usingMouse ? '鼠标控制' : isTracking ? '手势检测中' : '未检测到手'}
          </span>
          <span className="text-sm font-medium">
            {usingMouse ? '双击切换模式' : gestureLabels[gesture]}
          </span>
        </div>
        
        {isTracking && (
          <div className="w-2 h-2 rounded-full bg-christmas-green animate-pulse ml-2" />
        )}
      </div>
    </div>
  );
}
