import React from 'react';
import ResidentDashboard from './ResidentDashboard';

export default function App() {
  return (
    <ResidentDashboard
      residentName="Jordan"
      currentBalance="$1,420.00"
      nextDueDate="June 1, 2026"
    />
  );
}
