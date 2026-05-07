import { StatusIcon } from './StatusIcon';

export function PaymentConfirmation({ invoice, total, paymentId, onReturn }) {
  return (
    <section className="card">
      <header className="card-header">
        <p className="eyebrow">CASA MIRA</p>
        <h1>Payment Confirmed</h1>
      </header>

      <div className="status-row">
        <div className="status-pill complete">
          <StatusIcon type="complete" />
          <span>Payment Details</span>
        </div>
        <div className="status-pill complete">
          <StatusIcon type="complete" />
          <span>Confirmation</span>
        </div>
      </div>

      <p>
        Invoice <strong>{invoice.id}</strong> has been paid successfully.
      </p>
      <p>
        Total Paid: <strong>${total.toFixed(2)}</strong>
      </p>
      <p>
        Payment Reference: <strong>{paymentId}</strong>
      </p>

      <a
        className="btn btn-primary"
        href={`data:text/plain,Receipt%20for%20${invoice.id}%20payment%20${paymentId}%20total%20$${total.toFixed(2)}`}
        download={`receipt-${invoice.id}.txt`}
      >
        Download Receipt
      </a>

      <button type="button" className="btn btn-secondary" onClick={onReturn}>
        Return to Dashboard
      </button>
    </section>
  );
}
