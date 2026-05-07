import React from 'react';
import './styles.css';

const actions = [
  {
    label: 'Pay Now',
    description: 'Make a secure rent payment',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="outline-icon">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
        <circle cx="17" cy="14" r="2" />
      </svg>
    ),
  },
  {
    label: 'View Statements',
    description: 'See your monthly ledger',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="outline-icon">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: 'Download Receipts',
    description: 'Export payment confirmations',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="outline-icon">
        <path d="M12 3v12" />
        <path d="M8 11l4 4 4-4" />
        <rect x="4" y="17" width="16" height="4" rx="1" />
      </svg>
    ),
  },
];

export default function ResidentDashboard({
  residentName = 'Alex',
  currentBalance = '$1,420.00',
  nextDueDate = 'June 1, 2026',
}) {
  return (
    <main className="dashboard-shell">
      <section className="hero-card card-surface" aria-label="Resident account summary">
        <p className="brand-tag">CASA MIRA RESIDENT PORTAL</p>
        <h1>Welcome, {residentName}</h1>
        <div className="hero-metrics">
          <div>
            <p className="metric-label">Current Balance</p>
            <p className="metric-value">{currentBalance}</p>
          </div>
          <div>
            <p className="metric-label">Next Due Date</p>
            <p className="metric-value">{nextDueDate}</p>
          </div>
        </div>
      </section>

      <section className="announcement-strip card-surface" aria-label="Announcements">
        <strong>Announcements:</strong>
        <span>Placeholder area for community notices and urgent updates.</span>
      </section>

      <section aria-label="Quick actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {actions.map((action) => (
            <button key={action.label} className="action-card card-surface" type="button">
              <span className="icon-wrap">{action.icon}</span>
              <span className="action-text">
                <strong>{action.label}</strong>
                <small>{action.description}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
