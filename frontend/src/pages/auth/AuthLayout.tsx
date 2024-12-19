"use client";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-[100vw] h-[100vh] grid place-items-center">
      {children}
    </div>
  );
}
