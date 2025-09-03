export const validate = (schema) => (req, res, next) => {
  const data = ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : req.query;
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ error: error.details.map(d => d.message) });
  req.validated = value;
  next();
};

