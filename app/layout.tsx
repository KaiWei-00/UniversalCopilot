import "../styles/globals.css";
import { ReactNode } from "react";
import CopilotAssistant from "../components/CopilotKitUI";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
        <CopilotAssistant />
      </body>
    </html>
  );
}
