"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function PwaInstaller() {
  const searchParams = useSearchParams();
  const shouldInstall = searchParams.get('install') === 'true';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered', reg.scope))
        .catch(err => console.error('SW failed', err));
    }

    // 2. Listen for beforeinstallprompt
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // If we came from the marketplace download button, trigger immediately
      if (shouldInstall) {
        // slight delay to ensure UI is ready
        setTimeout(() => {
          e.prompt();
          e.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
            } else {
              console.log('User dismissed the install prompt');
            }
          });
        }, 500);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [shouldInstall]);

  return null; // This is a logic-only component
}
