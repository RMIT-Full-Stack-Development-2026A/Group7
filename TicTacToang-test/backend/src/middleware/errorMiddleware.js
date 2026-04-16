const errorMiddleware = (err, req, res, next) => {
  console.error(`[${req.method}] ${req.path} —`, err.message)
  res.status(err.statusCode || 500).json({
    message:     err.statusCode ? err.message : 'Internal server error.',
    locked:      err.locked      || undefined,
    secondsLeft: err.secondsLeft || undefined,
  })
}

export default errorMiddleware