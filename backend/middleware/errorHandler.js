// 错误处理中间件
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 输出错误日志（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error.message = message.join(', ');
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Mongoose 重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} 已存在`;
    return res.status(400).json({
      success: false,
      message
    });
  }

  // Mongoose 错误的 ObjectId
  if (err.name === 'CastError') {
    const message = '资源不存在';
    return res.status(404).json({
      success: false,
      message
    });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token 无效';
    return res.status(401).json({
      success: false,
      message
    });
  }

  // JWT 过期错误
  if (err.name === 'TokenExpiredError') {
    const message = 'Token 已过期';
    return res.status(401).json({
      success: false,
      message
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || '服务器错误'
  });
};

// 404 处理
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `路由未找到 - ${req.originalUrl}`
  });
};

export default { errorHandler, notFound };

