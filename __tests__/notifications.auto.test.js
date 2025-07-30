const request = require("supertest");
const app = require("../../app");

describe("🧪 Tests auto-générés pour notifications", () => {
  it("GET /self → doit être testé", async () => {
    const res = await request(app)
      .get("/self")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /user/:userId → doit être testé", async () => {
    const res = await request(app)
      .get("/user/:userId")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("DELETE /delete/:notificationId → doit être testé", async () => {
    const res = await request(app)
      .delete("/delete/:notificationId")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
});