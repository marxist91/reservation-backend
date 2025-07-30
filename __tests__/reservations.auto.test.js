const request = require("supertest");
const app = require("../../app");

describe("🧪 Tests auto-générés pour reservations", () => {
  it("GET /occupation → doit être testé", async () => {
    const res = await request(app)
      .get("/occupation")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /occupation/roles → doit être testé", async () => {
    const res = await request(app)
      .get("/occupation/roles")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /occupation/semaine → doit être testé", async () => {
    const res = await request(app)
      .get("/occupation/semaine")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /all → doit être testé", async () => {
    const res = await request(app)
      .get("/all")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("POST /create → doit être testé", async () => {
    const res = await request(app)
      .post("/create")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("PUT /assign/:id → doit être testé", async () => {
    const res = await request(app)
      .put("/assign/:id")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("PUT /update/:id → doit être testé", async () => {
    const res = await request(app)
      .put("/update/:id")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
});