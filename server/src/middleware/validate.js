export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.parse(req[source]);
    req[source] = result;
    next();
  };
}
