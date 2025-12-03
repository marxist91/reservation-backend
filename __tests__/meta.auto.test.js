import request from "supertest";
import app from "../../app";

describe("🧪 Tests auto-générés pour meta", () => {
  it("GET /meta → doit être testé", async () => {
    const res = await request(app)
      .get("/meta")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /version → doit être testé", async () => {
    const res = await request(app)
      .get("/version")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /info → doit être testé", async () => {
    const res = await request(app)
      .get("/info")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
});