const { calculateInvoice } = require('../../src/services/billingService');

describe('billingService', () => {
  it('calculates subtotal, tax and total', () => {
    const result = calculateInvoice(
      [
        { quantity: 2, unitPrice: 10 },
        { quantity: 1, unitPrice: 5 },
      ],
      0.1
    );

    expect(result).toEqual({ subtotal: 25, tax: 2.5, total: 27.5 });
  });

  it('throws with invalid item data', () => {
    expect(() => calculateInvoice([{ quantity: 0, unitPrice: 10 }], 0.2)).toThrow(
      'invalid item values'
    );
  });
});
