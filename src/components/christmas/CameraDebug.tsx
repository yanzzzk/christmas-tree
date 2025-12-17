import { useEffect, useRef, useState } from 'react';
import { X, Video, VideoOff } from 'lucide-react';

interface CameraDebugProps {
  enabled: boolean;
}

export function CameraDebug({ enabled }: CameraDebugProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [status, setStatus] = useState<'waiting' | 'active' | 'error'>('waiting');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!enabled) {
      setStatus('waiting');
      return;
    }

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setStatus('waiting');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 160, height: 120, facingMode: 'user' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStatus('active');
        }
      } catch (err: any) {
        console.error('[CameraDebug] Error:', err);
        setStatus('error');
        setErrorMsg(err.message || 'Camera error');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [enabled]);

  if (!isVisible || !enabled) return null;

  return (
    <div className="absolute bottom-20 left-4 z-50">
      <div className="glass-gold rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-2 py-1 bg-black/30">
          <div className="flex items-center gap-1">
            {status === 'active' ? (
              <Video className="w-3 h-3 text-christmas-green" />
            ) : (
              <VideoOff className="w-3 h-3 text-christmas-red" />
            )}
            <span className="text-xs text-white">
              {status === 'waiting' && '等待摄像头...'}
              {status === 'active' && '摄像头正常'}
              {status === 'error' && errorMsg}
            </span>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white/70 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <video
          ref={videoRef}
          className="w-24 h-18 sm:w-32 sm:h-24 md:w-40 md:h-30 bg-black"
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
        />
        {status === 'error' && (
          <div className="p-2 bg-christmas-red/20 text-xs text-white">
            请检查浏览器摄像头权限设置
          </div>
        )}
      </div>
    </div>
  );
}
