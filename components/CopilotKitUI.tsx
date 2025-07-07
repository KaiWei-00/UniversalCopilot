"use client";
import { CopilotChat } from "@copilotkit/react-ui";

// This component renders the CopilotKit Assistant UI globally.
export default function CopilotAssistant() {
  console.log("[CopilotAssistant] Rendered");
  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <CopilotChat />
    </div>
  );
}
