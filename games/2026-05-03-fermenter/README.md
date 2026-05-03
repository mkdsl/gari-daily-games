# Fermenter — Varenički Bunt

**Žanr:** Idle/Incremental  
**Datum:** 2026-05-03  
**Play:** https://mkdsl.github.io/gari-daily-games/games/2026-05-03-fermenter/

## O igri

Podrum jedne stare pivare. Upravljaš živom kolonijom kvasca koja fermentira bure po bure alkohola. Svaki prestiže spušta te nazad na prazno bure — ali sa jednom trajnom genetskom mutacijom koja zauvek menja pravila igre.

Sakupi 3 mutacije i dostići savršenost kvasca.

## Kako se igra

1. **Klikni bure** da ubrzaš fermentaciju (Space ili Enter takođe rade)
2. **Kupuj upgrejde** desno/ispod — automatizuju fermentaciju
3. **Prati Mutacioni pritisak** — centralni progress bar ispod bureta
4. **Na 100% pritiska** — pojavljuje se dugme MUTACIJA →
5. **Izaberi jednu od 3 mutacije** — trajno menjaju pravila igre
6. **Prestiže 3 puta** → Savršeni Kvasac (win state)

## Mutacije (pool od 8)

| Badge | Naziv | Efekat |
|-------|-------|--------|
| ♨ | Termofilni Kvasac | clickPower se duplira svakih 30s aktivnog klika |
| ⚗ | Etanol-Rezistentan | +15% fermentRate kad je buffer pun |
| 🍀 | Sporo Sazrevanje | 20% šansa za +5 FJ instant po kliku |
| ∞ | Micelarna Mreža | Pasivna FJ/s teče prvih 5s novog runa |
| ↑↑ | Pritisak Kaskada | Posle 50% pressure, ostatak teče ×1.6 brže |
| ◈ | Osmofilna Adaptacija | Auto-Ferment upgejdi 30% jeftiniji |
| ⬡ | Endosporna Forma | Bure nikad ne degradira |
| ✦ | Bifidogena Sinerija | FJ/s × (1 + 0.1 × broj mutacija) |

## Tim

- **Sine Scenario** — koncept i narativ
- **Nega Negovanović** — premortem analiza
- **Mile Mehanika** — game design i ekonomija brojeva
- **Jova jQuery** — implementacija (Vanilla JS ES6)
- **Pera Piksel** — CSS estetika i animacije
- **Ceca Čujka** — Web Audio zvuk
- **Beta Trio** (Zora + Raša + Lela) — testiranje
