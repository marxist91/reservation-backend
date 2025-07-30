const sendNotification = require("./utils/sendNotification");

sendNotification({
  to: "test@exemple.com",
  subject: "Test notification",
  message: "Ceci est un test de log",
  meta: { debug: true, env: "local" }
});

sendNotification({
  to: "awa@exemple.com",
  subject: "Test Debug",
  message: "Hello Awa, ceci est un test de notification.",
  meta: {
    reservation_id: 123,
    statut: "validée",
    modifié_par: "admin@site.com"
  }
});
