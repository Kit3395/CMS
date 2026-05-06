import React, { useState } from 'react';
import '../design-system.css';

export const Icon = ({ children, size = 18 }) => (
  <svg className="ds-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

export const Button = ({ variant = 'primary', children, ...props }) => (
  <button className={`ds-button ${variant}`} {...props}>{children}</button>
);

export const Card = ({ title, children, footer }) => (
  <section className="ds-card">
    {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
    {children}
    {footer && <div style={{ marginTop: 16 }}>{footer}</div>}
  </section>
);

export const Badge = ({ tone = 'info', icon, children }) => (
  <span className={`ds-badge ${tone}`}>{icon}{children}</span>
);

export const Alert = ({ tone = 'info', children }) => (
  <div className={`ds-alert ${tone}`}>{children}</div>
);

export const Table = ({ columns, rows }) => (
  <table className="ds-table">
    <thead>
      <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
      ))}
    </tbody>
  </table>
);

export const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="ds-modal-backdrop" onClick={onClose}>
      <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        {children}
        <div style={{ marginTop: 16 }}>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export const SampleDesignSystemPage = () => {
  const [open, setOpen] = useState(false);
  const checkIcon = <Icon><path d="M5 12l5 5L20 7" /></Icon>;
  const sparkIcon = <Icon><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" /></Icon>;

  return (
    <main className="ds-page">
      <div className="ds-panel ds-grid" style={{ gap: 24 }}>
        <header>
          <h1 style={{ marginBottom: 8 }}>React Design System Demo</h1>
          <p style={{ color: '#475569' }}>Teal primary tones, gold accents, soft gradients, and flat outline-only icons.</p>
        </header>

        <div className="ds-grid two">
          <Card
            title="Actions"
            footer={<Badge tone="success" icon={checkIcon}>Ready for production UI</Badge>}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost" onClick={() => setOpen(true)}>Open Modal</Button>
            </div>
          </Card>

          <Card title="System Alerts">
            <div className="ds-grid">
              <Alert tone="info">A new release is available for your workspace.</Alert>
              <Alert tone="warning">Usage is nearing monthly thresholds.</Alert>
            </div>
          </Card>
        </div>

        <Card title="Recent Projects">
          <Table
            columns={['Project', 'Owner', 'Status']}
            rows={[
              ['Aurora', 'Lena', <Badge tone="success" icon={checkIcon}>Healthy</Badge>],
              ['Nimbus', 'Theo', <Badge tone="warning" icon={sparkIcon}>Review</Badge>],
            ]}
          />
        </Card>
      </div>

      <Modal open={open} title="Outline Icon Rule" onClose={() => setOpen(false)}>
        <p style={{ marginTop: 0 }}>Icons in this system are stroke-only with no fills and a unified 1.8px stroke width.</p>
      </Modal>
    </main>
  );
};
