const request = require("supertest");
const app = require("../../app");

describe("🧪 Tests auto-générés pour auth", () => {
  it("POST /login → doit être testé", async () => {
    const res = await request(app)
      .post("/login")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
});