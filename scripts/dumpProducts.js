// Ispis svih proizvoda iz Firestore-a (za pregled podataka pre backfill-a)
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function main() {
  const snap = await admin.firestore().collection('products').get();
  console.log(`Ukupno proizvoda: ${snap.size}\n`);
  snap.forEach(doc => {
    const p = doc.data();
    console.log(JSON.stringify({
      id: doc.id,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      gender: p.gender,
      color: p.color,
      sizes: p.sizes,
      price: p.price,
      hasImage: !!p.imageUrl,
    }));
  });
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
