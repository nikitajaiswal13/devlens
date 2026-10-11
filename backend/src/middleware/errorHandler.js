function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.status || err.statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  res.status(statusCode).json({
    success: false,
    message:
      isClientError && err.message ? err.message : "Internal server error",
  });
}

module.exports = errorHandler;
