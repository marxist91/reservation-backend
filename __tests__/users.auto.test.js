import request from "supertest";
import app from "../../app";

describe("🧪 Tests auto-générés pour users", () => {
  it("GET /registry → doit être testé", async () => {
    const res = await request(app)
      .get("/registry")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("POST /register → doit être testé", async () => {
    const res = await request(app)
      .post("/register")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("PUT /update/:userId → doit être testé", async () => {
    const res = await request(app)
      .put("/update/:userId")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
});