import type { Gender } from '@/db/schema';

// Unsplash fotografije (besplatna licenca). Parametri daju 3:4 isečak,
// next/image dalje pravi manje verzije po potrebi.
export const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=1600&q=80`;

const CLOTHING = ['XS', 'S', 'M', 'L', 'XL'];
const CLOTHING_WIDE = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const ALL_CLOTHING_COLORS = [
  'crna', 'bela', 'siva', 'bež', 'braon', 'crvena', 'bordo', 'roze', 'narandžasta',
  'žuta', 'zelena', 'maslinasta', 'plava', 'tirkizna', 'ljubičasta', 'jeans',
];
const LEATHER_COLORS = [
  'crna', 'braon', 'bež', 'bela', 'siva', 'crvena', 'bordo', 'roze', 'narandžasta',
  'plava', 'maslinasta', 'zlatna', 'srebrna',
];

export const SUBCATEGORIES: {
  name: string;
  category: 'odeca' | 'aksesoari';
  sizes: string[];
  colors: string[];
}[] = [
  { name: 'Haljine', category: 'odeca', sizes: CLOTHING, colors: ALL_CLOTHING_COLORS },
  { name: 'Suknje', category: 'odeca', sizes: CLOTHING, colors: ALL_CLOTHING_COLORS },
  { name: 'Majice', category: 'odeca', sizes: CLOTHING_WIDE, colors: ALL_CLOTHING_COLORS },
  { name: 'Košulje', category: 'odeca', sizes: CLOTHING_WIDE, colors: ALL_CLOTHING_COLORS },
  { name: 'Dukserice', category: 'odeca', sizes: CLOTHING_WIDE, colors: ALL_CLOTHING_COLORS },
  { name: 'Džemperi', category: 'odeca', sizes: CLOTHING_WIDE, colors: ALL_CLOTHING_COLORS },
  { name: 'Pantalone', category: 'odeca', sizes: CLOTHING_WIDE, colors: ALL_CLOTHING_COLORS },
  { name: 'Farmerke', category: 'odeca', sizes: ['26', '27', '28', '29', '30', '31', '32', '34', '36'], colors: ['jeans', 'plava', 'crna', 'bela', 'siva'] },
  { name: 'Šortsevi', category: 'odeca', sizes: CLOTHING, colors: ALL_CLOTHING_COLORS },
  { name: 'Jakne i kaputi', category: 'odeca', sizes: CLOTHING_WIDE, colors: ALL_CLOTHING_COLORS },
  { name: 'Sakoi', category: 'odeca', sizes: CLOTHING_WIDE, colors: ALL_CLOTHING_COLORS },
  { name: 'Pončo', category: 'odeca', sizes: ['S/M', 'L/XL'], colors: ALL_CLOTHING_COLORS },
  { name: 'Kombinezoni', category: 'odeca', sizes: CLOTHING, colors: ALL_CLOTHING_COLORS },
  { name: 'Kupaći kostimi', category: 'odeca', sizes: CLOTHING, colors: ALL_CLOTHING_COLORS },
  { name: 'Pidžame', category: 'odeca', sizes: CLOTHING, colors: ALL_CLOTHING_COLORS },
  { name: 'Veš', category: 'odeca', sizes: ['S', 'M', 'L', 'XL'], colors: ALL_CLOTHING_COLORS },
  { name: 'Tašne', category: 'aksesoari', sizes: [], colors: LEATHER_COLORS },
  { name: 'Torbice', category: 'aksesoari', sizes: [], colors: LEATHER_COLORS },
  { name: 'Ranci', category: 'aksesoari', sizes: [], colors: LEATHER_COLORS },
  { name: 'Novčanici', category: 'aksesoari', sizes: [], colors: LEATHER_COLORS },
  { name: 'Card holderi', category: 'aksesoari', sizes: [], colors: LEATHER_COLORS },
];

type SeedProduct = {
  name: string;
  subcategory: string;
  gender: Gender;
  color: string;
  price: number;
  compareAtPrice?: number;
  sizes?: string[]; // podrazumevano: sve veličine vrste
  images: string[];
  description: string;
  details?: string;
  featured?: boolean;
};

export const PRODUCTS: SeedProduct[] = [
  // ── Haljine ──
  {
    name: 'Lanena haljina spuštenih ramena', subcategory: 'Haljine', gender: 'zene', color: 'bela',
    price: 5990, images: [img('1515372039744-b8f02a3ae446')], featured: true,
    description: 'Lagana haljina od lana sa volanom i spuštenim ramenima. Savršena za letnje dane i večeri uz more.',
    details: '100% lan\nPranje na 30 °C\nNe sušiti u mašini',
  },
  {
    name: 'Duga satenska haljina', subcategory: 'Haljine', gender: 'zene', color: 'crvena',
    price: 8990, compareAtPrice: 11990, images: [img('1595777457583-95e059d581b8')], featured: true,
    description: 'Upečatljiva duga haljina bez rukava koja se lepo pokreće pri svakom koraku. Za svečane prilike i venčanja.',
    details: '95% poliester, 5% elastin\nHemijsko čišćenje',
  },
  {
    name: 'Cvetna midi haljina', subcategory: 'Haljine', gender: 'zene', color: 'crvena',
    price: 6490, images: [img('1572804013309-59a88b7e92f1')],
    description: 'Midi haljina sa sitnim cvetnim printom, kratkim rukavima i kaišem u struku.',
    details: '100% viskoza\nPranje na 30 °C',
  },
  {
    name: 'Večernja haljina od krepa', subcategory: 'Haljine', gender: 'zene', color: 'ljubičasta',
    price: 9490, images: [img('1566174053879-31528523f8ae')],
    description: 'Elegantna haljina spuštenih ramena od mekog krepa, pripijenog kroja.',
    details: '92% poliester, 8% elastin\nHemijsko čišćenje',
  },
  {
    name: 'Teksas haljina na dugmad', subcategory: 'Haljine', gender: 'zene', color: 'jeans',
    price: 5490, images: [img('1591369822096-ffd140ec948f')],
    description: 'Opuštena košulja-haljina od mekog tankog teksasa sa dugmićima celom dužinom.',
    details: '100% pamuk\nPranje na 30 °C',
  },
  // ── Suknje ──
  {
    name: 'Plisirana midi suknja', subcategory: 'Suknje', gender: 'zene', color: 'roze',
    price: 4290, images: [img('1577900232427-18219b9166a0')], featured: true,
    description: 'Lepršava plisirana suknja pastelne boje sa elastičnim pojasom.',
    details: '100% poliester\nPeglati na niskoj temperaturi',
  },
  {
    name: 'Crna suknja zvono', subcategory: 'Suknje', gender: 'zene', color: 'crna',
    price: 3790, images: [img('1583496661160-fb5886a0aaaa')],
    description: 'Klasična kratka suknja zvonastog kroja — lako se kombinuje uz košulju ili džemper.',
    details: '65% poliester, 35% viskoza',
  },
  // ── Majice ──
  {
    name: 'Pamučna majica basic', subcategory: 'Majice', gender: 'unisex', color: 'bela',
    price: 1990, images: [img('1521572163474-6864f9cf17ab')],
    description: 'Osnovna majica od debljeg organskog pamuka koja zadržava oblik i posle pranja.',
    details: '100% organski pamuk, 180 g/m²\nPranje na 40 °C',
  },
  {
    name: 'Crna majica oversize', subcategory: 'Majice', gender: 'unisex', color: 'crna',
    price: 2290, images: [img('1583743814966-8936f5b7be1a')],
    description: 'Opušten kroj sa spuštenim ramenima i minimalističkim natpisom na grudima.',
    details: '100% pamuk\nPranje na 30 °C, naopačke',
  },
  {
    name: 'Svetloplava majica', subcategory: 'Majice', gender: 'unisex', color: 'plava',
    price: 1990, images: [img('1564584217132-2271feaeb3c5')],
    description: 'Mekana melanž majica okruglog izreza za svaki dan.',
    details: '60% pamuk, 40% poliester',
  },
  {
    name: 'Majica od modala', subcategory: 'Majice', gender: 'muskarci', color: 'maslinasta',
    price: 2490, images: [img('1523381210434-271e8be1f52b')],
    description: 'Glatka i prozračna majica od modala, prijatna na koži i u najtoplijim danima.',
    details: '50% modal, 50% pamuk',
  },
  // ── Košulje ──
  {
    name: 'Bela košulja slim fit', subcategory: 'Košulje', gender: 'muskarci', color: 'bela',
    price: 4490, images: [img('1598033129183-c4f50c736f10'), img('1603252109303-2751441dd157')], featured: true,
    description: 'Poslovna košulja od popelina sa klasičnom kragnom i slim krojem.',
    details: '100% pamuk, popelin\nLako peglanje',
  },
  {
    name: 'Svetloplava oxford košulja', subcategory: 'Košulje', gender: 'muskarci', color: 'plava',
    price: 4290, images: [img('1620012253295-c15cc3e65df4')],
    description: 'Oxford košulja koja jednako dobro stoji uz odelo i uz farmerke.',
    details: '100% pamuk, oxford tkanje',
  },
  {
    name: 'Teksas košulja na tačkice', subcategory: 'Košulje', gender: 'unisex', color: 'jeans',
    price: 3990, compareAtPrice: 4990, images: [img('1596755094514-f87e34085b2c')],
    description: 'Košulja od tankog teksasa sa sitnim printom — nosi se zakopčana ili preko majice.',
    details: '100% pamuk',
  },
  {
    name: 'Košulja od keper platna', subcategory: 'Košulje', gender: 'muskarci', color: 'siva',
    price: 3890, images: [img('1602810318383-e386cc2a3ccf')],
    description: 'Mekana košulja od keper platna, dostupna u više nijansi — uz sako ili samostalno.',
    details: '100% pamuk',
  },
  // ── Dukserice i džemperi ──
  {
    name: 'Narandžasti duks', subcategory: 'Dukserice', gender: 'zene', color: 'narandžasta',
    price: 3490, images: [img('1578587018452-892bacefd3f2')],
    description: 'Mekan duks od brušenog pamuka sa rebrastim manžetnama.',
    details: '80% pamuk, 20% poliester',
  },
  {
    name: 'Beli duks bez kapuljače', subcategory: 'Dukserice', gender: 'unisex', color: 'bela',
    price: 3290, images: [img('1620799140408-edc6dcb6d633')],
    description: 'Čist, klasičan duks bez natpisa — osnova svakog garderobera.',
    details: '80% pamuk, 20% poliester',
  },
  {
    name: 'Pleteni džemper', subcategory: 'Džemperi', gender: 'zene', color: 'siva',
    price: 4990, images: [img('1556905055-8f358a7a47b2')],
    description: 'Topao džemper krupnog pletiva, opuštenog kroja.',
    details: '50% vuna, 50% akril\nRučno pranje',
  },
  {
    name: 'Roze džemper od merina', subcategory: 'Džemperi', gender: 'muskarci', color: 'roze',
    price: 5990, images: [img('1516826957135-700dedea698c')],
    description: 'Lagan džemper od merino vune koji greje, a ne grebe.',
    details: '100% merino vuna\nRučno pranje na 30 °C',
  },
  // ── Pantalone i farmerke ──
  {
    name: 'Široke pantalone na pruge', subcategory: 'Pantalone', gender: 'zene', color: 'crna',
    price: 4590, images: [img('1509631179647-0177331693ae')],
    description: 'Pantalone visokog struka sa širokim nogavicama i vertikalnim prugama koje izdužuju figuru.',
    details: '70% viskoza, 30% poliester',
  },
  {
    name: 'Satenski džogeri', subcategory: 'Pantalone', gender: 'zene', color: 'roze',
    price: 3990, compareAtPrice: 4790, images: [img('1594633312681-425c7b97ccd1')],
    description: 'Udobni džogeri od satena sa elastičnim pojasom i manžetnama.',
    details: '100% poliester',
  },
  {
    name: 'Farmerke straight fit', subcategory: 'Farmerke', gender: 'unisex', color: 'jeans',
    price: 5290, images: [img('1624378439575-d8705ad7ae80')], featured: true,
    description: 'Klasične tamne farmerke ravnog kroja od čvrstog denima.',
    details: '99% pamuk, 1% elastin',
  },
  {
    name: 'Mom jeans sa zakrpama', subcategory: 'Farmerke', gender: 'zene', color: 'jeans',
    price: 5490, images: [img('1541099649105-f69ad21f3246')],
    description: 'Farmerke visokog struka sa pocepanim detaljima i zakrpama.',
    details: '100% pamuk',
  },
  {
    name: 'Slim farmerke svetle', subcategory: 'Farmerke', gender: 'muskarci', color: 'jeans',
    price: 4990, images: [img('1582552938357-32b906df40cb')],
    description: 'Muške slim farmerke svetlog pranja sa blago suženim nogavicama.',
    details: '98% pamuk, 2% elastin',
  },
  // ── Jakne, kaputi, sakoi ──
  {
    name: 'Kožna jakna', subcategory: 'Jakne i kaputi', gender: 'unisex', color: 'crna',
    price: 14990, images: [img('1551028719-00167b16eac5')], featured: true,
    description: 'Bajkerska jakna od meke kože sa asimetričnim rajsferšlusom.',
    details: 'Spolja: 100% prirodna koža\nPostava: 100% poliester\nSpecijalizovano čišćenje kože',
  },
  {
    name: 'Teksas jakna sa kragnom od somota', subcategory: 'Jakne i kaputi', gender: 'unisex', color: 'jeans',
    price: 6990, images: [img('1611312449408-fcece27cdbb7'), img('1543076447-215ad9ba6923')],
    description: 'Klasična teksas jakna sa kontrastnom kragnom od somota.',
    details: '100% pamuk',
  },
  {
    name: 'Bomber jakna', subcategory: 'Jakne i kaputi', gender: 'muskarci', color: 'braon',
    price: 7490, compareAtPrice: 8990, images: [img('1591047139829-d91aecb6caea')],
    description: 'Lagana bomber jakna sa rebrastim manžetnama, za prelazni period.',
    details: '100% poliester',
  },
  {
    name: 'Kaput sa kaišem', subcategory: 'Jakne i kaputi', gender: 'zene', color: 'bež',
    price: 12990, images: [img('1539533018447-63fcce2678e3')], featured: true,
    description: 'Vuneni kaput kamel boje sa kaišem u struku i širokim reverima.',
    details: '60% vuna, 40% poliester\nHemijsko čišćenje',
  },
  {
    name: 'Bordo vuneni kaput', subcategory: 'Jakne i kaputi', gender: 'zene', color: 'bordo',
    price: 13490, images: [img('1483985988355-763728e1935b')],
    description: 'Topao kaput ravnog kroja koji se nosi preko svega.',
    details: '70% vuna, 30% poliamid',
  },
  {
    name: 'Karirani sako', subcategory: 'Sakoi', gender: 'zene', color: 'siva',
    price: 7990, images: [img('1608234808654-2a8875faa7fd')],
    description: 'Oversize sako sa diskretnim karo dezenom i dva reda dugmadi.',
    details: '65% poliester, 35% viskoza',
  },
  {
    name: 'Teget sako slim fit', subcategory: 'Sakoi', gender: 'muskarci', color: 'plava',
    price: 11990, images: [img('1617137968427-85924c800a22')],
    description: 'Strukiran muški sako za posao i svečane prilike.',
    details: '55% vuna, 45% poliester',
  },
  {
    name: 'Karirani sako od tvida', subcategory: 'Sakoi', gender: 'muskarci', color: 'plava',
    price: 12490, images: [img('1594938298603-c8148c4dae35')],
    description: 'Sako od tvida u karo dezenu — ide uz odelo ili uz farmerke.',
    details: '80% vuna, 20% poliester',
  },
  {
    name: 'Pončo od pletiva', subcategory: 'Pončo', gender: 'zene', color: 'bež',
    price: 3990, images: [img('1434389677669-e08b4cac3105')],
    description: 'Lagan pleteni pončo sa resama, za hladnije letnje večeri.',
    details: '100% pamuk',
  },
  // ── Aksesoari ──
  {
    name: 'Kožni ranac', subcategory: 'Ranci', gender: 'unisex', color: 'braon',
    price: 8990, images: [img('1622560480605-d83c853bc5c3'), img('1622560480654-d96214fdc887')], featured: true,
    description: 'Ranac od prirodne kože sa pregradom za laptop do 14".',
    details: 'Dimenzije: 30 × 40 × 12 cm\n100% prirodna koža',
  },
  {
    name: 'Crni gradski ranac', subcategory: 'Ranci', gender: 'unisex', color: 'crna',
    price: 4490, images: [img('1581605405669-fcdf81165afa')],
    description: 'Minimalistički ranac od vodoodbojnog platna.',
    details: 'Dimenzije: 28 × 42 × 14 cm',
  },
  {
    name: 'Teget ranac', subcategory: 'Ranci', gender: 'unisex', color: 'plava',
    price: 3990, images: [img('1553062407-98eeb64c6a62')],
    description: 'Praktičan ranac sa prednjim džepom i podstavljenim naramenicama.',
    details: 'Dimenzije: 29 × 43 × 13 cm',
  },
  {
    name: 'Platneni ranac sa kožnim detaljima', subcategory: 'Ranci', gender: 'unisex', color: 'maslinasta',
    price: 5490, images: [img('1491637639811-60e2756cc1c7')],
    description: 'Ranac od čvrstog kanvasa sa kožnim kaiševima, za grad i planinu.',
    details: 'Kanvas i prirodna koža',
  },
  {
    name: 'Kožni novčanik', subcategory: 'Novčanici', gender: 'unisex', color: 'braon',
    price: 2990, images: [img('1606503825008-909a67e63c3d'), img('1627123424574-724758594e93')],
    description: 'Tanak preklopni novčanik od prirodne kože sa 6 mesta za kartice.',
    details: '100% prirodna koža',
  },
  {
    name: 'Siva tašna sa zakovicama', subcategory: 'Tašne', gender: 'zene', color: 'siva',
    price: 7990, images: [img('1559563458-527698bf5295')], featured: true,
    description: 'Strukturisana tašna sa dekorativnim zakovicama i lančićem.',
    details: 'Veštačka koža\nDimenzije: 24 × 18 × 9 cm',
  },
  {
    name: 'Crvena tašna', subcategory: 'Tašne', gender: 'zene', color: 'crvena',
    price: 8490, images: [img('1584917865442-de89df76afd3')],
    description: 'Tašna čvrste forme sa ručkom i metalnom kopčom.',
    details: 'Prirodna koža\nDimenzije: 25 × 20 × 11 cm',
  },
  {
    name: 'Pletena tašna', subcategory: 'Tašne', gender: 'zene', color: 'narandžasta',
    price: 6490, compareAtPrice: 7490, images: [img('1590874103328-eac38a683ce7')],
    description: 'Letnja tašna od pletenog ratana sa kožnim poklopcem.',
    details: 'Ratan i prirodna koža',
  },
  {
    name: 'Crna poslovna tašna', subcategory: 'Tašne', gender: 'zene', color: 'crna',
    price: 9490, images: [img('1614179689702-355944cd0918')],
    description: 'Prostrana tašna za laptop i dokumenta, sa dve ručke.',
    details: 'Prirodna koža\nDimenzije: 38 × 28 × 12 cm',
  },
  {
    name: 'Roze torbica na lanac', subcategory: 'Torbice', gender: 'zene', color: 'roze',
    price: 4990, images: [img('1566150905458-1bf1fc113f0d')],
    description: 'Mala torbica sa preklopom i tankim lančićem za nošenje preko ramena.',
    details: 'Veštačka koža\nDimenzije: 20 × 13 × 6 cm',
  },
  {
    name: 'Bordo torbica od kože', subcategory: 'Torbice', gender: 'zene', color: 'bordo',
    price: 5990, images: [img('1575032617751-6ddec2089882')],
    description: 'Torbica od kože sa kroko utiskom i metalnom kopčom.',
    details: 'Prirodna koža sa utiskom',
  },
];

export const USERS = [
  {
    name: 'Marija', lastName: 'Petrović', email: 'marija.petrovic@example.com', phone: '064 123 4567',
    street: 'Bulevar oslobođenja', streetNumber: '45', postalCode: '21000', city: 'Novi Sad',
  },
  {
    name: 'Jovan', lastName: 'Nikolić', email: 'jovan.nikolic@example.com', phone: '063 555 0101',
    street: 'Knez Mihailova', streetNumber: '12', postalCode: '11000', city: 'Beograd',
  },
  {
    name: 'Ana', lastName: 'Jovanović', email: 'ana.jovanovic@example.com', phone: '065 777 8899',
    street: 'Obrenovićeva', streetNumber: '3', postalCode: '18000', city: 'Niš',
  },
];

export const TEST_USER_PASSWORD = 'furlada123';
