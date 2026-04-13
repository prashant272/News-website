"use client";
import React, { FC, useState } from "react";
import ForgotPass from "./forgotPassword";
import dynamic from "next/dynamic";
import type { Mode, AuthChildProps } from "./types";

const NoSSRSignIn = dynamic<AuthChildProps>(
  () =>
    import("@/app/Dashboard/Components/Auth/login").then(
      (mod) => mod.SignIn
    ),
  { ssr: false }
);

const NoSSRSignUp = dynamic<AuthChildProps>(
  () =>
    import("@/app/Dashboard/Components/Auth/signup").then(
      (mod) => mod.SignUp
    ),
  { ssr: false }
);

export const MainAuth: FC = () => {
  const [mode, setMode] = useState<Mode>("signin");

  return (
    <div 
      data-theme="dark" 
      style={{ 
        minHeight: "100vh", 
        backgroundColor: "#0f172a", 
        width: "100%", 
        display: "flex", 
        flexDirection: "column",
        color: "#ffffff" 
      }}
      // background image
    >
      {mode === "signin" ? (
        <NoSSRSignIn setMode={setMode} />
      ) : mode === "signup" ? (
        <NoSSRSignUp setMode={setMode} />
      ) : (
        <ForgotPass setMode={setMode} />
      )}
    </div>
  );
};
