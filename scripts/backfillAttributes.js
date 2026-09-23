// Jednokratni backfill:
// 1. Kreira 'attributes' kolekciju — podrazumevane veličine/boje po vrsti proizvoda
//    (preskače vrste koje već imaju zapis, da ne pregazi izmene iz admin panela)
// 2. Popunjava postojeće proizvode: subcategory, gender, normalizovana boja (mala slova)
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Iste liste kao u src/data/constants.js
const ALL_COLORS = [
  'crvena', 'plava', 'zelena', 'žuta', 'narandžasta', 'ljubičasta', 'bela', 'crna',
  'siva', 'roze', 'braon', 'zlatna', 'srebrna', 'maslinasta', 'jeans', 'tirkizna',
];
// Tipična paleta za kožnu galanteriju
const ACCESSORY_COLORS = ['crna', 'braon', 'bela', 'siva', 'roze', 'zlatna', 'srebrna'];

const ODECA_SIZES_DEFAULT = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ODECA = [
  'Dukserice', 'Haljine', 'Košulje', 'Majice', 'Pantalone', 'Pončo', 'Suknje', 'Šortsevi',
  'Jakne i kaputi', 'Kombinezoni', 'Kupaći kostimi', 'Džemperi', 'Pidžame', 'Sakoi', 'Farmerke', 'Veš',
];
const AKSESOARI = ['Novčanik', 'Card holder', 'Torbica', 'Tašna', 'Ranac'];

// Vrste sa specifičnim veličinama
const SIZE_OVERRIDES = {
  'Farmerke': ['26', '27', '28', '29', '30', '31', '32', '34', '36'],
  'Veš': ['S', 'M', 'L', 'XL'],
  'Kupaći kostimi': ['XS', 'S', 'M', 'L', 'XL'],
};

async function seedAttributes() {
  console.log('── Atributi ──');
  const existing = await db.collection('attributes').get();
  const existingIds = new Set(existing.docs.map(d => d.id));

  const entries = [
    ...ODECA.map(sub => ({
      subcategory: sub,
      category: 'odeca',
      sizes: SIZE_OVERRIDES[sub] || ODECA_SIZES_DEFAULT,
      colors: ALL_COLORS,
    })),
    ...AKSESOARI.map(sub => ({
      subcategory: sub,
      category: 'aksesoari',
      sizes: [],
      colors: ACCESSORY_COLORS,
    })),
  ];

  for (const entry of entries) {
    if (existingIds.has(entry.subcategory)) {
      console.log(`  = ${entry.subcategory} (već postoji, preskačem)`);
      continue;
    }
    await db.collection('attributes').doc(entry.subcategory).set(entry);
    console.log(`  + ${entry.subcategory} (${entry.sizes.length} veličina, ${entry.colors.length} boja)`);
  }
}

// Mapiranje naziva proizvoda -> vrsta + pol
function inferProduct(p) {
  const name = (p.name || '').toLowerCase();
  if (name.includes('majica')) return { subcategory: 'Majice', gender: 'unisex' };
  if (name.includes('bluza')) return { subcategory: 'Majice', gender: 'zene' };
  if (name.includes('pantalone')) return { subcategory: 'Pantalone', gender: 'unisex' };
  if (name.includes('novcanik') || name.includes('novčanik')) return { subcategory: 'Novčanik', gender: 'unisex' };
  if (name.includes('haljina')) return { subcategory: 'Haljine', gender: 'zene' };
  if (name.includes('košulja') || name.includes('kosulja')) return { subcategory: 'Košulje', gender: 'unisex' };
  return null;
}

async function backfillProducts() {
  console.log('── Proizvodi ──');
  const snap = await db.collection('products').get();

  for (const docSnap of snap.docs) {
    const p = docSnap.data();
    const updates = {};

    if (!p.subcategory || !p.gender) {
      const inferred = inferProduct(p);
      if (inferred) {
        if (!p.subcategory) updates.subcategory = inferred.subcategory;
        if (!p.gender) updates.gender = inferred.gender;
      } else {
        console.log(`  ! ${p.name} (${docSnap.id}) — ne umem da odredim vrstu, preskačem`);
      }
    }

    // Normalizuj boju na mala slova (poklapanje sa colorTranslationMap i filterima)
    if (p.color && p.color !== p.color.toLowerCase()) {
      updates.color = p.color.toLowerCase();
    }

    // id polje u dokumentu (admin forma ga upisuje za nove proizvode)
    if (!p.id) updates.id = docSnap.id;

    if (Object.keys(updates).length > 0) {
      await docSnap.ref.update(updates);
      console.log(`  ~ ${p.name} (${docSnap.id}):`, JSON.stringify(updates));
    } else {
      console.log(`  = ${p.name} (${docSnap.id}) — ništa za dopunu`);
    }
  }
}

async function main() {
  await seedAttributes();
  await backfillProducts();
  console.log('\nGotovo.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
