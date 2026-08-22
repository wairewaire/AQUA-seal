import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
// Vite-friendly way to get a URL for the scanner's decode worker so it's
// bundled/copied as an asset instead of needing to live in public/ by hand.
import QrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min.js?url';
import { Camera, X, Zap, ZapOff, RefreshCw, AlertTriangle, Keyboard } from 'lucide-react';

QrScanner.WORKER_PATH = QrScannerWorkerPath;

interface Props {
  title?: string;
  subtitle?: string;
  onClose: () => void;
  /** Called with the raw decoded QR text. Parent decides how to interpret it
   *  (e.g. extract a batchId from a verification URL, or use it as-is). */
  onScan: (rawValue: string) => void;
}

type ScannerStatus = 'INITIALIZING' | 'SCANNING' | 'DENIED' | 'NO_CAMERA' | 'INSECURE' | 'ERROR';

export const QRScannerModal: React.FC<Props> = ({
  title = 'Scan Fish Tag QR Code',
  subtitle = 'Point the camera at the QR code on the gill tag or crate label.',
  onClose,
  onScan,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [status, setStatus] = useState<ScannerStatus>('INITIALIZING');
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraList, setCameraList] = useState<QrScanner.Camera[]>([]);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    // Camera access requires a secure context (https or localhost).
    if (!window.isSecureContext) {
      setStatus('INSECURE');
      return;
    }

    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        const value = typeof result === 'string' ? result : result.data;
        if (!value) return;
        // Give a small tactile/visual confirmation before handing off.
        if (navigator.vibrate) navigator.vibrate(80);
        scanner.stop();
        onScan(value);
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
      }
    );
    scannerRef.current = scanner;

    scanner
      .start()
      .then(async () => {
        if (cancelled) return;
        setStatus('SCANNING');
        try {
          const flash = await scanner.hasFlash();
          if (!cancelled) setHasFlash(flash);
        } catch {
          // Flash detection isn't supported everywhere; fail silently.
        }
        try {
          const cameras = await QrScanner.listCameras(true);
          if (!cancelled) setCameraList(cameras);
        } catch {
          // Camera enumeration can fail on some browsers; not fatal.
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setErrorMessage(message);
        if (/NotAllowedError|Permission/i.test(message)) {
          setStatus('DENIED');
        } else if (/NotFoundError|no camera/i.test(message)) {
          setStatus('NO_CAMERA');
        } else {
          setStatus('ERROR');
        }
      });

    return () => {
      cancelled = true;
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [onScan]);

  const toggleFlash = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (flashOn) {
        await scanner.turnFlashOff();
        setFlashOn(false);
      } else {
        await scanner.turnFlashOn();
        setFlashOn(true);
      }
    } catch {
      // Ignore — some devices report hasFlash incorrectly.
    }
  };

  const switchCamera = async () => {
    const scanner = scannerRef.current;
    if (!scanner || cameraList.length < 2) return;
    const nextIndex = (cameraIndex + 1) % cameraList.length;
    try {
      await scanner.setCamera(cameraList[nextIndex].id);
      setCameraIndex(nextIndex);
    } catch {
      // Non-fatal; some browsers only expose one usable camera.
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualValue.trim()) return;
    onScan(manualValue.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#004D40] text-white p-5 flex items-center justify-between border-b border-teal-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-black/20 rounded-lg">
              <Camera className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{title}</h3>
              <p className="text-[11px] text-teal-200">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-teal-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {!manualMode && status !== 'DENIED' && status !== 'NO_CAMERA' && status !== 'INSECURE' && (
            <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-square">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              {status === 'INITIALIZING' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-slate-900/80 text-white">
                  <div className="w-8 h-8 border-4 border-teal-300 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold">Starting camera...</p>
                </div>
              )}
              {status === 'ERROR' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-slate-900/90 text-white p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-rose-400" />
                  <p className="text-xs font-semibold">Couldn't start the camera.</p>
                  {errorMessage && <p className="text-[10px] text-slate-300">{errorMessage}</p>}
                </div>
              )}
            </div>
          )}

          {status === 'DENIED' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-2">
              <div className="flex items-center space-x-2 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Camera access denied</span>
              </div>
              <p>
                Allow camera permission for this site in your browser settings, then reopen the scanner. You can
                also enter the batch code manually below.
              </p>
            </div>
          )}

          {status === 'NO_CAMERA' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-2">
              <div className="flex items-center space-x-2 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>No camera found</span>
              </div>
              <p>This device doesn't have a usable camera. Enter the batch code manually below.</p>
            </div>
          )}

          {status === 'INSECURE' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-2">
              <div className="flex items-center space-x-2 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Secure connection required</span>
              </div>
              <p>
                Camera scanning only works over HTTPS (or localhost). Open this page over a secure connection, or
                enter the batch code manually below.
              </p>
            </div>
          )}

          {/* Manual entry fallback */}
          {(manualMode || status === 'DENIED' || status === 'NO_CAMERA' || status === 'INSECURE' || status === 'ERROR') && (
            <form onSubmit={handleManualSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder="Enter batch code manually (e.g. LV-DG-20260821-042)"
                autoFocus
                className="flex-1 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#004D40]"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold uppercase text-white bg-[#006064] hover:bg-[#004D40] rounded-lg transition-colors"
              >
                Use
              </button>
            </form>
          )}

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setManualMode((m) => !m)}
              className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{manualMode ? 'Back to camera' : 'Type code instead'}</span>
            </button>

            {status === 'SCANNING' && (
              <div className="flex items-center space-x-2">
                {cameraList.length > 1 && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    title="Switch camera"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                {hasFlash && (
                  <button
                    type="button"
                    onClick={toggleFlash}
                    title="Toggle flashlight"
                    className={`p-2 rounded-lg transition-colors ${
                      flashOn ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {flashOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
