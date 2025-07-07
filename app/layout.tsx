import "@copilotkit/react-ui/styles.css";
import "../styles/globals.css";
import { ReactNode } from "react";
import CopilotAssistant from "../components/CopilotKitUI";
import CopilotKitProvider from "../components/CopilotKitProvider";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {/* Static test button for rendering check */}
        <CopilotKitProvider>
          <SessionProviderWrapper>
            {children}
          </SessionProviderWrapper>
          <CopilotAssistant />
        </CopilotKitProvider>
      </body>
    </html>
  );
}
