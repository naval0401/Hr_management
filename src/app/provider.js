'use client';

import { useEffect, useState } from "react";
import keycloak from "../lib/keycloak"; // 

export default function Providers({ children }) {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("loading");
  const [initDone, setInitDone] = useState(false); //

  useEffect(() => {
    keycloak.init({
      onLoad: "check-sso",
      checkLoginIframe: false,
    })
      .then((authenticated) => {

        if (!authenticated && window.location.pathname !== "/login") {
          window.location.href = "/login";
          return;
        }

        if (authenticated && window.location.pathname === "/login") {
          window.location.href = "/";
          return;
        }

        if (authenticated) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }


        setReady(true);
        setStatus("ready");
      })
      .catch(() => {
        setStatus("error");
      })
      .finally(() => {
        setInitDone(true);
      });

    // session end hone se 30 second pahle token refresh kar deta hai
    const interval = setInterval(() => {
      if (keycloak?.authenticated) {
        keycloak.updateToken(30).catch(() => {
          keycloak.logout();
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);


  if (!initDone) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-600 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
        <h1 className="text-lg font-semibold">Loading...</h1>
        <p className="text-sm opacity-80">Please wait...</p>
      </div>
    );
  }

  // ERROR UI SHOW wala code
  if (status === "error") {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50 text-red-600">
        Authentication failed. Redirecting...
      </div>
    );
  }

  // READY
  if (!ready) return null;

  return children;
}