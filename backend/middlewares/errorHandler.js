const { sendErrorResponse } = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  const error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  };
  
  sendErrorResponse(res, error);
};

module.exports = errorHandler;
