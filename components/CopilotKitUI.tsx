"use client";
import { CopilotChat } from "@copilotkit/react-ui";

// This component renders the CopilotKit Assistant UI globally.
import React, { useState } from "react";


export default function CopilotAssistant() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Floating toggle button at top-right */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 100000,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 24,
          padding: "12px 24px",
          fontWeight: 600,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          cursor: "pointer"
        }}
        aria-label={open ? "Close Copilot Chat" : "Open Copilot Chat"}
      >
        {open ? "Close Copilot" : "Open Copilot"}
      </button>
      {/* Chat window, visible only when open */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 72,
            right: 24,
            zIndex: 99999,
            background: "white",
            border: "1px solidrgb(36, 36, 37)",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
            width: 600,
            maxWidth: "90vw",
            height: 750,
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <CopilotChat />
        </div>
      )}
    </>
  );
}
