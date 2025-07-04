import "../styles/globals.css";
import { ReactNode } from "react";
import CopilotAssistant from "../components/CopilotKitUI"; // Add CopilotKit UI globally

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
        <CopilotAssistant />
      </body>
    </html>
  );
}
