import { Button, Card } from "@copilotkit/react-ui";

export default function CopilotKitUIDemo() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card title="CopilotKit Card" cta="Learn More" href="https://copilotkit.ai" />
      <div style={{ marginTop: 16 }}>
        <Button />
      </div>
    </div>
  );
}
