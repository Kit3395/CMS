function validatePasswordPolicy(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 12) return false;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return hasUpper && hasLower && hasDigit && hasSpecial;
}

function enforcePasswordPolicy(req, res, next) {
  const { password } = req.body;
  if (!validatePasswordPolicy(password)) {
    return res.status(400).json({
      error:
        'Password must be at least 12 chars and include upper, lower, number, and special char',
    });
  }
  return next();
}

module.exports = {
  validatePasswordPolicy,
  enforcePasswordPolicy,
};
