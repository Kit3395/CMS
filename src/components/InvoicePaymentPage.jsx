import { StatusIcon } from './StatusIcon';

function StripeMockForm({ total, onPaymentSuccess }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const paymentToken = `PMT-${Date.now().toString().slice(-6)}`;
    onPaymentSuccess(paymentToken);
  };

  return (
    <form className="stripe-form" onSubmit={handleSubmit}>
      <label htmlFor="cardholder">Cardholder Name</label>
      <input id="cardholder" required placeholder="Avery Resident" />

      <label htmlFor="card-number">Card Number</label>
      <input id="card-number" required inputMode="numeric" placeholder="4242 4242 4242 4242" />

      <div className="grid-2">
        <div>
          <label htmlFor="exp">Expiry</label>
          <input id="exp" required placeholder="MM/YY" />
        </div>
        <div>
          <label htmlFor="cvc">CVC</label>
          <input id="cvc" required inputMode="numeric" placeholder="123" />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Pay ${total.toFixed(2)}
      </button>
    </form>
  );
}

export function InvoicePaymentPage({ invoice, total, onCancel, onPaymentSuccess }) {
  return (
    <section className="card card-wide">
      <header className="card-header">
        <p className="eyebrow">CASA MIRA</p>
        <h1>Invoice Payment</h1>
      </header>

      <div className="status-row">
        <div className="status-pill active">
          <StatusIcon type="in_progress" />
          <span>Payment Details</span>
        </div>
        <div className="status-pill">
          <StatusIcon type="pending" />
          <span>Confirmation</span>
        </div>
      </div>

      <article className="invoice-panel">
        <h2>{invoice.id}</h2>
        <p>{invoice.property}</p>
        <ul>
          {invoice.lineItems.map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              <span>${item.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="invoice-total">
          <span>Total Due</span>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </article>

      <StripeMockForm total={total} onPaymentSuccess={onPaymentSuccess} />

      <button type="button" className="btn btn-secondary" onClick={onCancel}>
        Back
      </button>
    </section>
  );
}
