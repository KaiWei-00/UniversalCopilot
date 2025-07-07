import { CopilotKit } from "@copilotkit/react-core";
import { ReactNode } from "react";

export default function CopilotKitProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_COPILOTKIT_API_KEY;
  console.log("[CopilotKitProvider] CopilotKit API Key:", apiKey);
  return <CopilotKit publicApiKey={apiKey}>{children}</CopilotKit>;
}
