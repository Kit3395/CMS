function maskCardNumber(cardNumber) {
  const digits = String(cardNumber).replace(/\D/g, '');
  if (digits.length < 12) {
    throw new Error('invalid card number');
  }
  const last4 = digits.slice(-4);
  return `****-****-****-${last4}`;
}

function canCapturePayment({ amount, currency, status }) {
  return amount > 0 && currency === 'USD' && status === 'authorized';
}

module.exports = {
  maskCardNumber,
  canCapturePayment,
};
