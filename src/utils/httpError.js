function errorResponse({ code, message, details = null }) {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
}

module.exports = { errorResponse };
