import React from "react";
// @ts-ignore
import logoUrl from "../assets/images/nova_isp_logo.png";

interface NovaIspLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function NovaIspLogo({ className = "", size = "md" }: NovaIspLogoProps) {
  const dimensions = {
    sm: "h-6 w-auto",
    md: "h-9 w-auto",
    lg: "h-16 w-auto",
  };

  return (
    <img
      src={logoUrl}
      alt="Nova ISP Logo"
      className={`${dimensions[size]} ${className} object-contain`}
      referrerPolicy="no-referrer"
    />
  );
}
