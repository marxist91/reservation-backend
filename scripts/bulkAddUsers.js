// Script d'ajout en masse d'utilisateurs avec rôle 'utilisateur' et mot de passe par défaut
// Usage : node scripts/bulkAddUsers.js

const { User } = require('../models');
const bcrypt = require('bcryptjs');

const users = [
  { full: 'HALADOKO Awèmèwètou', email: 'A.HALADOKO@togoport.tg' },
  { full: 'PÈRE Samiè', email: 's.pere@togoport.tg' },
  { full: 'NENE Kwame W', email: 'K.NENE@togoport.tg' },
  { full: 'TOSSIM Potokoinzi', email: 'P.TOSSIM@togoport.tg' },
  { full: 'DEAKISSIM Kodjo', email: 'K.DEAKISSIM@togoport.tg' },
  { full: 'AKOUETE Sodegadji', email: 'S.AKOUETE@togoport.tg' },
  { full: 'DIPLO  Paounam E', email: 'P.DIPLO@togoport.tg' },
  { full: 'KONANI Yao', email: 'Y.KONANI@togoport.tg' },
  { full: 'DERMAN Abdoul-Razak', email: 'R.DERMAN@togoport.tg' },
  { full: 'AHAWO Ourso E K.', email: 'O.AHAWO@togoport.tg' },
  { full: 'NYANSA Sounou', email: 'S.NYANSA@togoport.tg' },
  { full: "d'ALMEIDA-BILABINA Abiré", email: "A.d'ALMEIDA-BILABINA@togoport.tg" },
  { full: 'AFIADEGNIGBAN Ayao', email: 'A.AFIADEGNIGBAN@togoport.tg' },
  { full: 'AGNEKITOM Manabawayi', email: 'M.AGNEKITOM@togoport.tg' },
  { full: 'FADIMBA Emile Tahaga', email: 'T.FADIMBA@togoport.tg' },
  { full: 'AZIAMADIA Komi Edem', email: 'K.AZIAMADIA@togoport.tg' },
  { full: 'DANDJA Aïcha', email: 'A.DANDJA@togoport.tg' },
  { full: 'SOADJEDE Kodjovi', email: 'K.SOADJEDE@togoport.tg' },
  { full: 'AMEDRO Komla E.P.', email: 'p.amedro@togoport.tg' },
  { full: 'ANIKA Manavi', email: 'M.ANIKA@togoport.tg' },
  { full: 'SOTODJI Kokou', email: 'K.SOTODJI2@togoport.tg' },
  { full: 'WASUNGU Ahimane-Tsouriel', email: 'A.WASUNGU@togoport.tg' },
  { full: 'AHILSU Sophie Mireille Amivi', email: 's.ahilsu@togoport.tg' },
  { full: 'SINDIYE Amazounam', email: 'A.SINDIYE@togoport.tg' },
  { full: 'AMEGNIDO Komla', email: 'k.amegnido@togoport.tg' },
  { full: 'OLYMPIO Kodzosué Anani', email: 'k.olympio@togoport.tg' },
  { full: 'WOROU  Arimyaou', email: 'a.worou@togoport.tg' },
  { full: 'OUADJA Bissiba', email: 'b.ouadja@togoport.tg' },
  { full: 'AGBO-KOUTOU Kawolodjo', email: 'K.agbo-koutou@togoport.tg' },
  { full: 'LAMBONI  Damigou', email: 'd.lamboni@togoport.tg' },
  { full: 'GBONVI Essi Dovénin', email: 'e.gbonvi@togoport.tg' },
  { full: 'AZIABLE Kokou Mawuli', email: 'K.AZIABLE@togoport.tg' },
  { full: 'AWUVE  Kokovi', email: 'K.AWUVE@togoport.tg' },
  { full: 'DAO Donga', email: 'D.DAO@togoport.tg' },
  { full: "FELIBIGOU N'Faye", email: 'N.FELIBIGOU@togoport.tg' },
  { full: 'KPEGBA Abla', email: 'A.KPEGBA@togoport.tg' },
  { full: 'AGBESSEH Kodjo I', email: 'k.agbesseh@togoport.tg' },
  { full: 'SIMLIWA Pilawè', email: 'P.SIMLIWA@togoport.tg' },
];

const DEFAULT_PASSWORD = 'Admin123!';

async function run() {
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  for (const u of users) {
    // Séparation nom/prénom
    let nom = '', prenom = '';
    if (u.full) {
      const parts = u.full.trim().split(/\s+/);
      if (parts.length === 1) {
        nom = parts[0].toUpperCase();
        prenom = '';
      } else {
        nom = parts[0].toUpperCase();
        prenom = parts.slice(1).join(' ').toLowerCase();
      }
    }
    try {
      await User.create({
        nom,
        prenom,
        email: u.email,
        password: hash,
        role: 'user',
        actif: true,
      });
      console.log(`Ajouté: ${nom} ${prenom} <${u.email}>`);
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        console.log(`Déjà existant: ${u.email}`);
      } else {
        console.error(`Erreur pour ${u.email}:`, e);
      }
    }
  }
  process.exit(0);
}

run();
