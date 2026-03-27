"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    OneSignal: any;
  }
}

const OneSignalInit = () => {
  useEffect(() => {
    window.OneSignal = window.OneSignal || [];
    window.OneSignal.push(() => {
      window.OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        safari_web_id: "web.onesignal.auto.52047814-8742-4546-b873-677567756775", // Replace if needed for Safari
        notifyButton: {
          enable: true,
        },
        allowLocalhostAsSecureOrigin: true,
      });
    });
  }, []);

  return null;
};

export default OneSignalInit;
