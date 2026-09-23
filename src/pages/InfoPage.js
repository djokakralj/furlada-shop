import React from 'react';
import { Link } from 'wouter';
import './InfoPage.css';

// Statičke informativne stranice (footer). Sadržaj na jednom mestu.
const PAGES = {
  dostava: {
    title: 'Dostava i povrat',
    blocks: [
      ['Dostava', 'Porudžbine šaljemo kurirskom službom na teritoriji cele Srbije. Cena dostave je 300 RSD, a rok isporuke je 2-4 radna dana. Lično preuzimanje je besplatno.'],
      ['Povrat', 'Proizvode možete vratiti u roku od 14 dana od prijema, pod uslovom da nisu nošeni i da su sa originalnom etiketom. Trošak povrata snosi kupac, osim u slučaju greške u porudžbini.'],
      ['Zamena', 'Za zamenu veličine ili artikla kontaktirajte nas na furladagr@gmail.com sa brojem porudžbine.'],
    ],
  },
  velicine: {
    title: 'Vodič za veličine',
    blocks: [
      ['Kako izmeriti', 'Merite preko donjeg veša, opušteno. Obim grudi merite preko najsireg dela, struk u najuzem delu, a bokove preko najsireg dela.'],
      ['Tabela (žene)', 'XS = 32-34 | S = 36 | M = 38 | L = 40 | XL = 42. Ako ste između dve veličine, preporučujemo veću.'],
      ['Napomena', 'Veličine se mogu blago razlikovati u zavisnosti od modela i materijala.'],
    ],
  },
  faq: {
    title: 'Česta pitanja',
    blocks: [
      ['Kako da poručim?', 'Dodajte artikle u korpu, idite na "Korpa" i pratite korake do potvrde porudžbine.'],
      ['Koje načine plaćanja podržavate?', 'Plaćanje pouzećem (gotovinom kuriru) ili karticom online.'],
      ['Da li mogu da pratim porudžbinu?', 'Da - broj porudžbine dobijate nakon kupovine, a status možete proveriti na stranici za praćenje.'],
      ['Imam problem sa nalogom.', 'Na stranici za prijavu koristite "Zaboravljena lozinka?" ili nas kontaktirajte.'],
    ],
  },
  uslovi: {
    title: 'Uslovi korišćenja',
    blocks: [
      ['Opšte', 'Korišćenjem sajta Furlada prihvatate ove uslove. Zadržavamo pravo izmene cena i dostupnosti artikala bez prethodne najave.'],
      ['Porudžbine', 'Porudžbina je obavezujuća nakon potvrde. Zadržavamo pravo da odbijemo porudžbinu u slučaju nedostupnosti artikla ili očigledne greške u ceni.'],
      ['Odgovornost', 'Trudimo se da svi podaci i slike budu tačni, ali ne garantujemo da su bez grešaka.'],
    ],
  },
  privatnost: {
    title: 'Politika privatnosti',
    blocks: [
      ['Podaci koje prikupljamo', 'Prilikom registracije i kupovine prikupljamo ime, kontakt i adresu radi obrade porudžbine.'],
      ['Korišćenje podataka', 'Vaše podatke koristimo isključivo za isporuku porudžbina i komunikaciju. Ne prodajemo ih trećim licima.'],
      ['Vaša prava', 'Možete zatražiti uvid, izmenu ili brisanje svojih podataka slanjem zahteva na furladagr@gmail.com.'],
    ],
  },
};

function InfoPage({ slug }) {
  const page = PAGES[slug];

  if (!page) {
    return (
      <div className="info-page">
        <h1>Stranica nije pronađena</h1>
        <Link href="/" className="info-back">← Početna</Link>
      </div>
    );
  }

  return (
    <div className="info-page">
      <h1>{page.title}</h1>
      {page.blocks.map(([heading, text]) => (
        <section key={heading} className="info-block">
          <h2>{heading}</h2>
          <p>{text}</p>
        </section>
      ))}
      <Link href="/" className="info-back">← Nazad na početnu</Link>
    </div>
  );
}

export default InfoPage;
