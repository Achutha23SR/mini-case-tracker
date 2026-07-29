export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Mini Case Tracker API",
    version: "1.0.0"
  },
  servers: [{ url: "http://localhost:5000" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/auth/login": {
      post: {
        security: [],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: { email: { type: "string" }, password: { type: "string" } }
              }
            }
          }
        },
        responses: { 200: { description: "JWT and user profile" } }
      }
    },
    "/api/cases": {
      get: { summary: "List cases with search, filters, and pagination", responses: { 200: { description: "Case page" } } },
      post: { summary: "Create case as manager", responses: { 201: { description: "Created case" } } }
    },
    "/api/cases/stats": {
      get: { summary: "Dashboard stats", responses: { 200: { description: "Status counts" } } }
    },
    "/api/cases/{id}": {
      get: { summary: "Case detail", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Case" } } }
    },
    "/api/cases/{id}/status": {
      patch: { summary: "Move a case through allowed status transitions", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated case" } } }
    },
    "/api/cases/{id}/assign": {
      patch: { summary: "Assign or reassign a case as manager", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated case" } } }
    },
    "/api/cases/{id}/comments": {
      post: { summary: "Add a comment", parameters: [{ name: "id", in: "path", required: true }], responses: { 201: { description: "Updated case" } } }
    },
    "/api/cases/{id}/documents": {
      post: { summary: "Upload supporting document/photo", parameters: [{ name: "id", in: "path", required: true }], responses: { 201: { description: "Updated case" } } }
    }
  }
};
