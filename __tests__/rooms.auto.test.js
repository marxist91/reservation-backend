import request from "supertest";
import app from "../../app";

describe("🧪 Tests auto-générés pour rooms", () => {
  it("GET /ping → doit être testé", async () => {
    const res = await request(app)
      .get("/ping")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("POST /admin-only → doit être testé", async () => {
    const res = await request(app)
      .post("/admin-only")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /responsables → doit être testé", async () => {
    const res = await request(app)
      .get("/responsables")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /overview → doit être testé", async () => {
    const res = await request(app)
      .get("/overview")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /:id/planning → doit être testé", async () => {
    const res = await request(app)
      .get("/:id/planning")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /disponibles → doit être testé", async () => {
    const res = await request(app)
      .get("/disponibles")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /dashboard → doit être testé", async () => {
    const res = await request(app)
      .get("/dashboard")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /stats/by-hour → doit être testé", async () => {
    const res = await request(app)
      .get("/stats/by-hour")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /stats/roles → doit être testé", async () => {
    const res = await request(app)
      .get("/stats/roles")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("GET /stats/semaine → doit être testé", async () => {
    const res = await request(app)
      .get("/stats/semaine")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
  it("DELETE /delete/:roomId → doit être testé", async () => {
    const res = await request(app)
      .delete("/delete/:roomId")
      .set("Authorization", "Bearer TOKEN_VALIDÉ");
    expect(res.statusCode).toBe(200);
  });
});