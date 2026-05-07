const { maskCardNumber, canCapturePayment } = require('../../src/services/paymentService');

describe('paymentService', () => {
  it('masks a card number leaving only last 4', () => {
    expect(maskCardNumber('4111111111111234')).toBe('****-****-****-1234');
  });

  it('allows capture for authorized USD payment with positive amount', () => {
    expect(canCapturePayment({ amount: 25, currency: 'USD', status: 'authorized' })).toBe(true);
  });
});
