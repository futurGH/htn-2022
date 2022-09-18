import { useEffect, useRef } from "react";

export function VideoPlayer({ blob }: { blob: Blob | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
   // if (blob) videoRef.current!.src = URL.createObjectURL(blob);
  }, [])
  return (
    <video controls ref={videoRef}>
    </video>
  )
}
