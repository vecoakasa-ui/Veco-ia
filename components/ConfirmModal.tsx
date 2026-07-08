"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react";

export type ConfirmModalType = "danger" | "warning" | "info";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmModalType;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "warning",
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle size={24} style={{ color: "#EF4444" }} />; // Red
      case "warning":
        return <AlertTriangle size={24} style={{ color: "#F59E0B" }} />; // Amber
      case "info":
      default:
        return <Info size={24} style={{ color: "var(--primary)" }} />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case "danger":
        return { background: "#EF4444", color: "white", border: "none" };
      case "warning":
        return { background: "#F59E0B", color: "white", border: "none" };
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
        gap: "var(--space-4)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            {getIcon()}
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>{title}</h3>
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)" }}>
            <X size={20} />
          </button>
        </div>
        
        <p style={{ color: "var(--gray-600)", margin: 0, fontSize: "var(--text-sm)", lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)", justifyContent: "flex-end" }}>
          <button 
            onClick={onCancel}
            className="btn btn-outline"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="btn"
            style={getConfirmButtonStyle()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
