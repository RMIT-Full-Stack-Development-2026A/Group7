class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const sendErrorResponse = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    ok: false,
    error: message,
    statusCode,
  });
};

module.exports = {
  ErrorResponse,
  sendErrorResponse,
};
