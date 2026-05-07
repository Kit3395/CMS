let residentIdCounter = 1;
let userIdCounter = 1;

export const db = {
  residents: [],
  users: [],
  invoices: [],
  payments: [],
  auditLogs: []
};

export function nextResidentId() {
  return String(residentIdCounter++);
}

export function nextUserId() {
  return String(userIdCounter++);
}

export function seedFinancialDataForResident(residentId) {
  db.invoices.push(
    { id: `${residentId}-INV-1`, residentId, amount: 1500, status: 'paid' },
    { id: `${residentId}-INV-2`, residentId, amount: 1500, status: 'unpaid' }
  );

  db.payments.push({
    id: `${residentId}-PAY-1`,
    residentId,
    invoiceId: `${residentId}-INV-1`,
    amount: 1500,
    paidAt: new Date().toISOString()
  });
}
