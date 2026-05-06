import { useMemo, useState } from 'react';
import { ResidentDashboard } from './components/ResidentDashboard';
import { InvoicePaymentPage } from './components/InvoicePaymentPage';
import { PaymentConfirmation } from './components/PaymentConfirmation';
import './styles.css';

const demoInvoice = {
  id: 'INV-2026-1048',
  dueDate: '2026-05-18',
  property: 'Casa Mira Residences',
  lineItems: [
    { label: 'May Rent', amount: 1800 },
    { label: 'Utilities', amount: 145.62 },
    { label: 'Maintenance Fee', amount: 40 },
  ],
};

function getTotal(lineItems) {
  return lineItems.reduce((total, item) => total + item.amount, 0);
}

export default function App() {
  const [step, setStep] = useState('dashboard');
  const [paymentId, setPaymentId] = useState('');
  const total = useMemo(() => getTotal(demoInvoice.lineItems), []);

  const handlePayNow = () => setStep('payment');

  const handlePaymentSuccess = (id) => {
    setPaymentId(id);
    setStep('confirmation');
  };

  const handleBackToDashboard = () => setStep('dashboard');

  return (
    <main className="app-shell">
      {step === 'dashboard' && (
        <ResidentDashboard invoice={demoInvoice} total={total} onPayNow={handlePayNow} />
      )}

      {step === 'payment' && (
        <InvoicePaymentPage
          invoice={demoInvoice}
          total={total}
          onCancel={handleBackToDashboard}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {step === 'confirmation' && (
        <PaymentConfirmation
          invoice={demoInvoice}
          total={total}
          paymentId={paymentId}
          onReturn={handleBackToDashboard}
        />
      )}
    </main>
  );
}
