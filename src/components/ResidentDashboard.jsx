export function ResidentDashboard({ invoice, total, onPayNow }) {
  return (
    <section className="card">
      <header className="card-header">
        <p className="eyebrow">CASA MIRA</p>
        <h1>Resident Dashboard</h1>
      </header>

      <div className="invoice-summary">
        <p>
          Current Invoice <strong>{invoice.id}</strong>
        </p>
        <p>
          Amount Due <strong>${total.toFixed(2)}</strong>
        </p>
        <p>Due {invoice.dueDate}</p>
      </div>

      <button type="button" className="btn btn-primary" onClick={onPayNow}>
        Pay Now
      </button>
    </section>
  );
}
