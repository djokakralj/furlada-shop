const admin = require("firebase-admin");

// Učitaj svoj Firebase service account key (JSON koji skineš sa Firebase Console-a)
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Zameni ovde UID korisnika kojem daješ admin prava
const uid = "vzcGvZjX5nT7PlwZE8vTUH4WSLI2";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Admin prava dodeljena korisniku: ${uid}`);
  })
  .catch(error => {
    console.error("Greška:", error);
  });
