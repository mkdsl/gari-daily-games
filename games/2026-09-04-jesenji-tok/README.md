# Jesenji Tok

**Žanr:** Seasonal Scheduling Puzzle
**Datum:** 2026-09-04
**Brand:** Guncati (primary), Kluboslavija (secondary)
**Play:** https://mkdsl.github.io/gari-daily-games/games/2026-09-04-jesenji-tok/

---

## O čemu se radi

Ti si Brana. Kasni avgust. Zima dolazi za 80 dana.

Imaš 6 parcela, 3 radne grupe nedeljno, i 12 nedelja pre prve mrazne noći. Svaki posao ima prozor — stane u njega ili propada. Ne možeš sve odjednom. Biraš šta ide kad, ko ide gde, šta žrtvuješ.

Nije clicker. Nije idle. Nije timing reflex. Ovo je planiranje: vidiš šta dolazi, raspoređuješ šta imaš, i posle 12 nedelja zimska bura pokaže je li ti plan bio dobar.

## Kako se igra

1. **Selektuj zadatak** — tapni karticu ispod grida (ili pritisni 1–6 na tastaturi)
2. **Dodeli nedelju** — tapni ćeliju u gridu (6 parcela × 12 nedelja)
3. **Prati ograničenja:** max 3 radne grupe nedeljno, svaki rad ima prozor
4. **Vreme menja računicu:** kiša blokira gradnju, mraz skraćuje Micelij i Rezidbu
5. **Zatvori sezonu** — zimska bura otkriva rezultat

## Zadaci

| Rad | Tip parcele | Prozor | Grupe | Prinos |
|-----|-------------|--------|-------|--------|
| Micelij inokulacija | Šuma/hlad | Aug 20 – Oct 10 | 2 | Berba bukovač novembar |
| Ozimo žito | Otvorena | Aug 20 – Sept 20 | 1 | Žitarice proleće |
| Jezero zimska priprema | Vodena | Oct 1 – Nov 1 | 1 | Ribe prezimljuju |
| Graditeljski (suvozid) | Bilo koja | Aug 20 – Sept 30 | 2 | Infrastruktura |
| Zimska rezidba | Voćnjak | Sept 15 – Oct 31 | 1 | Proleće prinos +20% |
| Kompost zimski | Kompost zona | Aug 20 – Oct 20 | 1 | Prolećno gnojivo |

**Ekosistem bonus:** Micelij + Jezero + Kompost sva tri u prozoru → ×1.5 na zbir tih tri zadataka.

## Scoring

| Rang | Poeni |
|------|-------|
| 🌟 Savršena sezona | 900–1200 |
| ✅ Solidna sezona | 600–899 |
| ⚠️ Preživećeš | 300–599 |
| ❌ Propala sezona | 0–299 |

## Prestige Loop

Na kraju svake sezone (300+ poena), uzmi trajni bonus za sledeći run:
- **+1 Radna grupa** — 4 grupe nedeljno umesto 3
- **Iskusna parcela** — Micelij košta 1 grupu umesto 2
- **Čitljivo nebo** — svih 12 nedelja prognoze vidljivo od starta

## Weather Presets

Svaki run nasumično bira jednu od 4 jesenjih sezona:
- ☀️ **Suva Jesen** — idealni uslovi, svi prozori otvoreni
- 🌧️ **Kišna Jesen** — 3 uzastopne kišne nedelje blokiraju gradnju
- 🌨️ **Rani Mraz** — mraz u N10 skraćuje Micelij i Rezidbu
- 🍂 **Vatreno Lišće** — tople N1–N3, Kompost u njima = -10%

## Brand Utility

**Guncati:** Edukuje o stvarnom ritmu imanja — igrač koji završi igru razume KADA se šta radi na otvorenom imanju. Savršen companion sadržaj za jesenji masterclass "Pripremi imanje za zimu".

**Kluboslavija:** Event companion — igrač dolazi na masterclass već uveden u Brana/Guncati narativ.

## Tehnički detalji

- 26 ES6 modula, 8376 JS + 1598 CSS linija
- DOM-based (ne Canvas), mobile-first
- Web Audio API (ambient jesen, glineni thud, solo harmonika)
- localStorage save/load, prestige persistence
- Touch + keyboard + mouse

## Beta Scores

- Iter 1: 6.5/10
- Iter 2: 8.5/10
- Post-fix: 9.0/10
