import { useState } from "react";
import ResidentDashboard from "./components/ResidentDashboard";
import InvoicePaymentPage from "./components/InvoicePaymentPage";
import PaymentConfirmation from "./components/PaymentConfirmation";
import "./styles.css";

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const handlePayNow = (invoice) => {
    setSelectedInvoice(invoice);
    setScreen("payment");
  };

  const handlePaymentSuccess = (result) => {
    setPaymentResult(result);
    setScreen("confirmation");
  };

  return (
    <div className="app-container">
      {screen === "dashboard" && (
        <ResidentDashboard onPayNow={handlePayNow} />
      )}

      {screen === "payment" && (
        <InvoicePaymentPage
          invoice={selectedInvoice}
          onSuccess={handlePaymentSuccess}
          onBack={() => setScreen("dashboard")}
        />
      )}

      {screen === "confirmation" && (
        <PaymentConfirmation
          result={paymentResult}
          onReturnHome={() => setScreen("dashboard")}
        />
      )}
    </div>
  );
}
