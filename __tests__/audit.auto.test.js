const request = require("supertest");
const app = require("../../app");

describe("🧪 Tests auto-générés pour audit", () => {
  it("GET / → doit être testé", async () => {
    const res = await request(app)
      .get("/")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /filter → doit être testé", async () => {
    const res = await request(app)
      .get("/filter")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /stats/summary → doit être testé", async () => {
    const res = await request(app)
      .get("/stats/summary")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /entity/:type/:id → doit être testé", async () => {
    const res = await request(app)
      .get("/entity/:type/:id")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /user-actions/:id → doit être testé", async () => {
    const res = await request(app)
      .get("/user-actions/:id")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /advanced-search → doit être testé", async () => {
    const res = await request(app)
      .get("/advanced-search")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /:id → doit être testé", async () => {
    const res = await request(app)
      .get("/:id")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
});