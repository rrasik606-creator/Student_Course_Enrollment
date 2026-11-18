export const validateBody = (
  allowedFields,
  { partial = false, optionalFields = [] } = {}
) => {
  return (req, res, next) => {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        message: "Request body must be a JSON object"
      });
    }

    const keys = Object.keys(body);

    const unknownFields = keys.filter(
      (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length > 0) {
      return res.status(400).json({
        message: `Unknown fields: ${unknownFields.join(", ")}`
      });
    }

    if (partial && keys.length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update"
      });
    }

    if (!partial) {
      const missingFields = allowedFields.filter(
        (field) =>
          !optionalFields.includes(field) &&
          body[field] === undefined
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(", ")}`
        });
      }
    }

    next();
  };
};