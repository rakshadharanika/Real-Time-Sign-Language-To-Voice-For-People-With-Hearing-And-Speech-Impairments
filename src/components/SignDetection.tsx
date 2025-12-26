import { useState, useCallback, useRef, useEffect } from "react";
import { Camera, CameraOff, Hand, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SignDetectionProps {
  language: string;
  onDetection?: (text: string) => void;
}

type DetectionResult = {
  gesture: string;
  confidence: number;
};

// ===== ADDITION: Alphabet image map (A–Z) =====
const ALPHABET_IMAGE_MAP: Record<string, string> = {
  A: "/signs/alphabets/A.png",
  B: "/signs/alphabets/B.png",
  C: "/signs/alphabets/C.png",
  D: "/signs/alphabets/D.png",
  E: "/signs/alphabets/E.png",
  F: "/signs/alphabets/F.png",
  G: "/signs/alphabets/G.png",
  H: "/signs/alphabets/H.png",
  I: "/signs/alphabets/I.png",
  J: "/signs/alphabets/J.png",
  K: "/signs/alphabets/K.png",
  L: "/signs/alphabets/L.png",
  M: "/signs/alphabets/M.png",
  N: "/signs/alphabets/N.png",
  O: "/signs/alphabets/O.png",
  P: "/signs/alphabets/P.png",
  Q: "/signs/alphabets/Q.png",
  R: "/signs/alphabets/R.png",
  S: "/signs/alphabets/S.png",
  T: "/signs/alphabets/T.png",
  U: "/signs/alphabets/U.png",
  V: "/signs/alphabets/V.png",
  W: "/signs/alphabets/W.png",
  X: "/signs/alphabets/X.png",
  Y: "/signs/alphabets/Y.png",
  Z: "/signs/alphabets/Z.png",
};


const classifyGesture = (landmarks: number[][]): DetectionResult | null => {
  // Landmark shortcuts
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];

  // Finger states (right-hand assumption)
  const thumbExtended = thumbTip[0] > thumbIp[0];
  const indexExtended = indexTip[1] < indexPip[1];
  const middleExtended = middleTip[1] < middlePip[1];
  const ringExtended = ringTip[1] < ringPip[1];
  const pinkyExtended = pinkyTip[1] < pinkyPip[1];

  const extendedCount =
    Number(indexExtended) +
    Number(middleExtended) +
    Number(ringExtended) +
    Number(pinkyExtended);

  const thumbIndexTouch =
    Math.abs(thumbTip[0] - indexTip[0]) < 0.04 &&
    Math.abs(thumbTip[1] - indexTip[1]) < 0.04;

  /* ================= NUMBERS ================= */

  if (indexExtended && extendedCount === 1) {
    return { gesture: "1", confidence: 0.9 };
  }

  if (indexExtended && middleExtended && extendedCount === 2) {
    return { gesture: "2", confidence: 0.9 };
  }

  if (indexExtended && middleExtended && ringExtended && extendedCount === 3) {
    return { gesture: "3", confidence: 0.9 };
  }

  if (
    indexExtended &&
    middleExtended &&
    ringExtended &&
    pinkyExtended &&
    !thumbExtended
  ) {
    return { gesture: "4", confidence: 0.9 };
  }

  if (thumbExtended && pinkyExtended && extendedCount === 1)
    return { gesture: "6", confidence: 0.8 };

  if (thumbExtended && ringExtended && extendedCount === 1)
    return { gesture: "7", confidence: 0.8 };

  if (thumbExtended && middleExtended && extendedCount === 1)
    return { gesture: "8", confidence: 0.8 };

  if (thumbExtended && indexExtended && extendedCount === 1)
    return { gesture: "9", confidence: 0.8 };

  if (!thumbExtended && extendedCount === 0)
    return { gesture: "10", confidence: 0.75 };

  /* ================= COMMON WORD SIGNS ================= */

  // Hello / Stop (open palm)
  if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return { gesture: "Hello", confidence: 0.88 };
  }


  // Yes (thumbs up)
  if (thumbExtended && extendedCount === 0) {
    return { gesture: "YES", confidence: 0.9 };
  }

  // No (fist)
  if (!thumbExtended && extendedCount === 0) {
    return { gesture: "NO", confidence: 0.9 };
  }

  // OK
  if (thumbIndexTouch && extendedCount === 3) {
    return { gesture: "OK", confidence: 0.9 };
  }

  // I Love You
  if (
    thumbExtended &&
    indexExtended &&
    pinkyExtended &&
    !middleExtended &&
    !ringExtended
  ) {
    return { gesture: "I LOVE YOU", confidence: 0.95 };
  }

  /* ================= ALPHABETS (BASIC STATIC SET) ================= */

  /* ================= ALPHABETS A–Z ================= */

// A – fist, thumb on side
if (
  !indexExtended &&
  !middleExtended &&
  !ringExtended &&
  !pinkyExtended &&
  thumbExtended
) return { gesture: "A", confidence: 0.80 };

// B – four fingers up, thumb folded
if (
  indexExtended &&
  middleExtended &&
  ringExtended &&
  pinkyExtended &&
  !thumbExtended
) return { gesture: "B", confidence: 0.80 };

// C – curved hand (approx: all fingers + thumb up)
if (
  thumbExtended &&
  indexExtended &&
  middleExtended &&
  ringExtended &&
  pinkyExtended
) return { gesture: "C", confidence: 0.70 };

// D – index up, others closed
if (
  indexExtended &&
  !middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "D", confidence: 0.75 };

// E – fingers curled, thumb tucked
if (
  !indexExtended &&
  !middleExtended &&
  !ringExtended &&
  !pinkyExtended &&
  !thumbExtended
) return { gesture: "E", confidence: 0.70 };

// F – thumb & index touching, others up
if (
  thumbIndexTouch &&
  middleExtended &&
  ringExtended &&
  pinkyExtended
) return { gesture: "F", confidence: 0.80 };

// G – index & thumb horizontal (approx)
if (
  indexExtended &&
  thumbExtended &&
  !middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "G", confidence: 0.70 };

// H – index & middle extended
if (
  indexExtended &&
  middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "H", confidence: 0.75 };

// I – pinky only
if (
  pinkyExtended &&
  !indexExtended &&
  !middleExtended &&
  !ringExtended
) return { gesture: "I", confidence: 0.80 };

// J – static fallback (same as I)
if (
  pinkyExtended &&
  !indexExtended &&
  !middleExtended &&
  !ringExtended
) return { gesture: "J", confidence: 0.60 };

// K – index & middle + thumb
if (
  indexExtended &&
  middleExtended &&
  thumbExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "K", confidence: 0.75 };

// L – thumb + index
if (
  thumbExtended &&
  indexExtended &&
  !middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "L", confidence: 0.80 };

// M – three fingers folded over thumb (approx)
if (
  !indexExtended &&
  !middleExtended &&
  !ringExtended &&
  pinkyExtended
) return { gesture: "M", confidence: 0.65 };

// N – two fingers folded (approx)
if (
  !indexExtended &&
  !middleExtended &&
  ringExtended &&
  pinkyExtended
) return { gesture: "N", confidence: 0.65 };

// O – fingers curved (approx = all closed)
if (
  !indexExtended &&
  !middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "O", confidence: 0.65 };

// P – like K but downward (static approx)
if (
  indexExtended &&
  middleExtended &&
  thumbExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "P", confidence: 0.60 };

// Q – thumb & index down (approx)
if (
  thumbExtended &&
  indexExtended &&
  !middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "Q", confidence: 0.60 };

// R – crossed index & middle (approx)
if (
  indexExtended &&
  middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "R", confidence: 0.65 };

// S – fist
if (
  !indexExtended &&
  !middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "S", confidence: 0.75 };

// T – thumb between fingers (approx)
if (
  !indexExtended &&
  !middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "T", confidence: 0.60 };

// U – index & middle together
if (
  indexExtended &&
  middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "U", confidence: 0.75 };

// V – index & middle separated
if (
  indexExtended &&
  middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "V", confidence: 0.80 };

// W – index, middle, ring
if (
  indexExtended &&
  middleExtended &&
  ringExtended &&
  !pinkyExtended
) return { gesture: "W", confidence: 0.80 };

// X – index bent (approx)
if (
  !indexExtended &&
  middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "X", confidence: 0.65 };

// Y – thumb + pinky
if (
  thumbExtended &&
  pinkyExtended &&
  !indexExtended &&
  !middleExtended &&
  !ringExtended
) return { gesture: "Y", confidence: 0.80 };

// Z – static fallback
if (
  indexExtended &&
  !middleExtended &&
  !ringExtended &&
  !pinkyExtended
) return { gesture: "Z", confidence: 0.60 };

return null;
};


export function SignDetection({ language, onDetection }: SignDetectionProps) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string>("");
  const [currentGesture, setCurrentGesture] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastDetectionRef = useRef<number>(0);
  const handsRef = useRef<any>(null);
  const lastGestureRef = useRef<string>("");
  const gestureCountRef = useRef<number>(0);

  // Hand connections for drawing
  const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17]
  ];

  // Draw hand landmarks on canvas
  const drawHandLandmarks = useCallback((ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    
    for (const [start, end] of HAND_CONNECTIONS) {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      ctx.beginPath();
      ctx.moveTo(startPoint.x * width, startPoint.y * height);
      ctx.lineTo(endPoint.x * width, endPoint.y * height);
      ctx.stroke();
    }

    ctx.fillStyle = '#FF0000';
    for (const landmark of landmarks) {
      ctx.beginPath();
      ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [HAND_CONNECTIONS]);

  // Process detected gesture
  const processGesture = useCallback(async (gesture: string, conf: number) => {
    // Require same gesture detected 3 times in a row for stability
    if (gesture === lastGestureRef.current) {
      gestureCountRef.current++;
    } else {
      lastGestureRef.current = gesture;
      gestureCountRef.current = 1;
    }

    if (gestureCountRef.current < 3) return;

    setCurrentGesture(gesture);
    setConfidence(conf);

    // Translate if not English
    let displayText = gesture;
    if (language !== 'en') {
      try {
        const { data: translationData } = await supabase.functions.invoke('translate-text', {
          body: {
            text: gesture,
            sourceLanguage: 'en',
            targetLanguage: language
          }
        });
        
        if (translationData?.translatedText) {
          displayText = translationData.translatedText;
        }
      } catch (err) {
        console.error('Translation error:', err);
      }
    }

    // Only add if different from last added gesture
    setDetectedText(prev => {
      const words = prev.split(' ').filter(Boolean);
      const lastWord = words[words.length - 1];
      if (lastWord !== displayText) {
        const newText = prev ? `${prev} ${displayText}` : displayText;
        onDetection?.(newText);
        return newText;
      }
      return prev;
    });

    // Reset counter to prevent rapid repeats
    gestureCountRef.current = 0;
  }, [language, onDetection]);

  // Start camera and detection
  const startDetection = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Get camera stream first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Video elements not ready');
      }

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(resolve).catch(reject);
          };
          videoRef.current.onerror = () => reject(new Error('Video failed to load'));
        }
      });

      // Set canvas size
      const videoWidth = videoRef.current.videoWidth || 640;
      const videoHeight = videoRef.current.videoHeight || 480;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      setIsActive(true);
      setIsLoading(false);

      // Try to load MediaPipe
      try {
        // Load MediaPipe Hands from CDN
        await new Promise<void>((resolve, reject) => {
          if ((window as any).Hands) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.min.js';
          script.crossOrigin = 'anonymous';
          script.onload = () => {
            // Wait a bit for the script to fully initialize
            setTimeout(resolve, 500);
          };
          script.onerror = () => reject(new Error('Failed to load MediaPipe'));
          document.head.appendChild(script);
        });

        const HandsClass = (window as any).Hands;
        if (HandsClass) {
          const hands = new HandsClass({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
          });

          hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 0,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          hands.onResults((results: any) => {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (!canvas || !video) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Draw video frame (mirrored)
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              setHandDetected(true);
              const landmarks = results.multiHandLandmarks[0];
              
              // Mirror landmarks for display
              const mirroredLandmarks = landmarks.map((lm: any) => ({
                x: 1 - lm.x,
                y: lm.y,
                z: lm.z
              }));
              
              drawHandLandmarks(ctx, mirroredLandmarks, canvas.width, canvas.height);

              // Process gesture (throttled)
              const now = Date.now();
              if (now - lastDetectionRef.current > 800) {
                lastDetectionRef.current = now;
                setIsDetecting(true);
                
                const landmarkArray = landmarks.map((lm: any) => [lm.x, lm.y, lm.z || 0]);
                const result = classifyGesture(landmarkArray);
                
                if (result) {
                  processGesture(result.gesture, result.confidence);
                }
                
                setIsDetecting(false);
              }
            } else {
              setHandDetected(false);
            }
          });

          handsRef.current = hands;

          // Start detection loop
          const detectFrame = async () => {
            if (videoRef.current && handsRef.current && streamRef.current?.active) {
              try {
                await handsRef.current.send({ image: videoRef.current });
              } catch (e) {
                console.error('Detection frame error:', e);
              }
              animationRef.current = requestAnimationFrame(detectFrame);
            }
          };

          detectFrame();
        }
      } catch (mpError) {
        console.warn('MediaPipe not available, using camera only mode:', mpError);
        // Continue with just camera display
        const drawVideoFrame = () => {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (!canvas || !video || !streamRef.current?.active) return;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();
          }
          animationRef.current = requestAnimationFrame(drawVideoFrame);
        };
        drawVideoFrame();
      }

    } catch (err) {
      console.error("Camera error:", err);
      setIsLoading(false);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera access denied. Please allow camera access in your browser settings and refresh the page.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found. Please connect a camera and try again.");
        } else {
          setError(err.message || "Failed to start camera. Please try again.");
        }
      }
    }
  }, [drawHandLandmarks, processGesture]);

  // Stop camera and detection
  const stopDetection = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    handsRef.current = null;
    setIsActive(false);
    setCurrentGesture("");
    setConfidence(0);
    setHandDetected(false);
    lastGestureRef.current = "";
    gestureCountRef.current = 0;
  }, []);

  // Clear detected text
  const clearText = () => {
    setDetectedText("");
    onDetection?.("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <article className="feature-card" aria-labelledby="sign-detection-heading">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Hand className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 id="sign-detection-heading" className="text-xl font-semibold text-foreground">
              Live Sign Language Detection
            </h2>
            <p className="text-sm text-muted-foreground">
              Show signs to the camera to convert to text
            </p>
          </div>
        </div>
        <StatusIndicator
          status={isActive ? (handDetected ? "active" : "idle") : error ? "error" : "idle"}
          label={isActive ? (handDetected ? "Hand Detected" : "Waiting for hand...") : error ? "Error" : "Ready"}
        />
      </div>

      {/* Video/Canvas container */}
      <div
        className={cn(
          "relative aspect-video rounded-xl overflow-hidden bg-secondary/50 border-2 border-border",
          isActive && "border-primary/50",
          handDetected && "border-success/50"
        )}
      >
        {/* Hidden video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-3 right-3 w-40 h-28 rounded-lg border-2 border-white shadow-lg opacity-90"
          aria-hidden="true"
        />
        
        {/* Canvas for drawing */}
        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-full object-contain",
            !isActive && "hidden"
          )}
          aria-label="Live camera feed with hand tracking overlay"
        />
        
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <div className="p-4 rounded-full bg-muted">
              {isLoading ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" aria-hidden="true" />
              ) : (
                <CameraOff className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            {error ? (
              <p className="text-center text-destructive text-sm max-w-xs" role="alert">
                {error}
              </p>
            ) : isLoading ? (
              <p className="text-center text-muted-foreground text-sm">
                Starting camera...
              </p>
            ) : (
              <p className="text-center text-muted-foreground text-sm">
                Click "Start Detection" to begin recognizing sign language
              </p>
            )}
          </div>
        )}

        {/* Live indicator and gesture display */}
        {isActive && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive-foreground opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive-foreground" />
              </span>
              LIVE
            </div>
            
            {handDetected && (
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-success/90 text-success-foreground text-xs font-semibold">
                ✋ Hand Detected
              </div>
            )}
            
            {currentGesture && (
              <div className="absolute top-3 right-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-lg animate-scale-in">
                {currentGesture}
                <span className="ml-2 text-xs opacity-75">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
          </>
        )}
      </div>
      {/* ===== ADDITION: Alphabet image output ===== */}
        {currentGesture && ALPHABET_IMAGE_MAP[currentGesture] && (
          <div className="mt-4 flex justify-center">
            <img
              src={ALPHABET_IMAGE_MAP[currentGesture]}
              alt={`ASL sign for ${currentGesture}`}
              className="w-40 h-auto border rounded"
            />
          </div>
       )}

      {/* Detected text output */}
      {detectedText && (
        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1">Detected Signs:</p>
              <p className="text-lg font-medium text-foreground" aria-live="polite">
                {detectedText}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearText} aria-label="Clear detected text">
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mt-4 flex justify-center gap-3">
        <Button
          variant={isActive ? "destructive" : "default"}
          size="lg"
          onClick={isActive ? stopDetection : startDetection}
          disabled={isLoading}
          className="min-w-[200px]"
          aria-label={isActive ? "Stop detection" : "Start detection"}
          aria-pressed={isActive}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Starting...
            </>
          ) : isActive ? (
            <>
              <CameraOff className="h-5 w-5" />
              Stop Detection
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              Start Detection
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          <strong>Supported signs:</strong> Numbers (1-10), Hello (open palm), Yes (thumbs up), No (fist), I Love You, Thank You
        </p>
      </div>
    </article>
  );
}
