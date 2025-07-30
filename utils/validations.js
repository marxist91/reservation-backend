exports.horairesValides = function (heure_debut, heure_fin) {
  return heure_debut && heure_fin && heure_fin > heure_debut;
};

exports.dureeMinimale = function (heure_debut, heure_fin, minMinutes = 30) {
  const [h1, m1] = heure_debut.split(":").map(Number);
  const [h2, m2] = heure_fin.split(":").map(Number);

  const debutMinutes = h1 * 60 + m1;
  const finMinutes = h2 * 60 + m2;

  return (finMinutes - debutMinutes) >= minMinutes;
};
