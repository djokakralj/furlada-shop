// Zajedničke konstante — deljene između Header, AdminPage i SearchResults.
// Ovde su centralizovane da se ne dupliraju po fajlovima.

// Mapa srpski naziv boje -> hex (za prikaz tačkica/filtera)
export const colorTranslationMap = {
  crvena: '#f2111c',
  plava: '#13187d',
  zelena: '#7fc24b',
  žuta: '#f2ff00',
  narandžasta: '#ff8000',
  ljubičasta: '#800080',
  bela: '#ffffff',
  crna: '#000000',
  siva: '#aba9a9',
  roze: '#f76cf7',
  braon: '#914038',
  zlatna: '#ffd700',
  srebrna: '#c0c0c0',
  maslinasta: '#59704c',
  jeans: '#5d6d7e',
  tirkizna: '#48d1cc',
};

// Podkategorije odeće (meni + admin forma)
export const odecaKategorije = [
  'Dukserice', 'Haljine', 'Košulje', 'Majice', 'Pantalone', 'Pončo', 'Suknje', 'Šortsevi',
  'Jakne i kaputi', 'Kombinezoni', 'Kupaći kostimi', 'Džemperi', 'Pidžame', 'Sakoi', 'Farmerke', 'Veš',
];

// Podkategorije aksesoara (meni + admin forma)
export const aksesoariKategorije = [
  'Novčanik', 'Card holder', 'Torbica', 'Tašna', 'Ranac',
];

// Redosled veličina za sortiranje filtera
export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Veličine ponuđene u admin formi pri dodavanju proizvoda
export const FORM_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

// Statusi porudžbine — deljeno između AdminPage i OrderPage
export const ORDER_STATUS_LABEL = {
  primljena: 'Primljena',
  uobradi: 'U obradi',
  poslata: 'Poslata',
  ispunjena: 'Ispunjena / isporučena',
};

// Čitljivi nazivi za način dostave i plaćanja
export const DELIVERY_LABEL = {
  kurir: 'Kurirska služba',
  preuzimanje: 'Lično preuzimanje',
};

export const PAYMENT_LABEL = {
  pouzece: 'Pouzećem',
  kartica: 'Karticom online',
};

// Inline SVG placeholder za proizvode bez slike — bez zavisnosti od eksternog servisa
export const NO_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="100%" height="100%" fill="#F7F6F2"/><text x="50%" y="50%" fill="#AAAAAA" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle">Nema slike</text></svg>'
);
