"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export type AlertModalType = "success" | "error" | "info" | "warning";

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  buttonText?: string;
  type?: AlertModalType;
  onClose: () => void;
}

export default function AlertModal({
  isOpen,
  title,
  message,
  buttonText = "OK",
  type = "info",
  onClose
}: AlertModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertTriangle size={32} style={{ color: "#EF4444", marginBottom: "8px" }} />;
      case "warning":
        return <AlertTriangle size={32} style={{ color: "#F59E0B", marginBottom: "8px" }} />;
      case "success":
        return <CheckCircle2 size={32} style={{ color: "#10B981", marginBottom: "8px" }} />;
      case "info":
      default:
        return <Info size={32} style={{ color: "var(--primary)", marginBottom: "8px" }} />;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case "error":
        return { background: "#EF4444", color: "white", border: "none" };
      case "warning":
        return { background: "#F59E0B", color: "white", border: "none" };
      case "success":
        return { background: "#10B981", color: "white", border: "none" };
      case "info":
      default:
        return { background: "var(--primary)", color: "white", border: "none" };
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-4)"
    }}>
      <div className="card animate-fade-in" style={{ 
        width: "100%", 
        maxWidth: "400px", 
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "var(--space-2)"
      }}>
        {getIcon()}
        
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>{title}</h3>
        
        <p style={{ color: "var(--gray-600)", margin: "8px 0 16px 0", fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
          {message}
        </p>

        <button 
          onClick={onClose}
          className="btn"
          style={{ ...getButtonStyle(), width: "100%", justifyContent: "center" }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
