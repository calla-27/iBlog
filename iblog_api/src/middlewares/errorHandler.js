export default function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ message: '服务器内部错误' });
}