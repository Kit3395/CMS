
---

# ⭐ Updated `App.jsx` (Sample Design System Page)

This file imports your design system and renders a demo page.

```jsx
import "./design-system.css";
import { Button, Card, Badge, Table, Modal, Alert, Icon } from "./components/DesignSystem";
import { useState } from "react";

export default function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 24 }}>CASA MIRA Design System</h1>

      <Card style={{ marginBottom: 24 }}>
        <h2>Buttons</h2>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <h2>Badges</h2>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <Badge>Default</Badge>
          <Badge color="teal">Teal</Badge>
          <Badge color="gold">Gold</Badge>
        </div>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <h2>Table</h2>
        <Table
          columns={["Name", "Role", "Status"]}
          rows={[
            ["Alice", "Resident", "Active"],
            ["Bob", "Admin", "Pending"],
          ]}
        />
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <h2>Alert</h2>
        <Alert type="info" message="This is an informational alert." />
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <h2>Modal</h2>
        <Button onClick={() => setShowModal(true)}>Open Modal</Button>

        <Modal open={showModal} onClose={() => setShowModal(false)}>
          <h3>Modal Title</h3>
          <p>This is a modal from the CASA MIRA design system.</p>
          <Button onClick={() => setShowModal(false)}>Close</Button>
        </Modal>
      </Card>

      <Card>
        <h2>Icons</h2>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <Icon name="home" size={28} />
          <Icon name="user" size={28} />
          <Icon name="settings" size={28} />
        </div>
      </Card>
    </div>
  );
}
