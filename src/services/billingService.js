function calculateInvoice(items, taxRate = 0) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items are required');
  }

  const subtotal = items.reduce((acc, item) => {
    if (item.quantity <= 0 || item.unitPrice < 0) {
      throw new Error('invalid item values');
    }
    return acc + item.quantity * item.unitPrice;
  }, 0);

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
  };
}

module.exports = {
  calculateInvoice,
};
