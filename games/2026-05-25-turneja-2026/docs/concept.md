# Kluboslavija: Turneja 2026

**Žanr:** Strategy Sim / Tour Manager + Deck-builder  
**Podžanr:** Multi-layer manager (Game Dev Tycoon / Two Point Hospital tier)  
**Datum koncepta:** 2026-05-25  
**brand_serves:** `["kluboslavija", "mkdslend"]`

---

## Premisa

Ti si novi menadžer Kluboslavija turneje. Pet gradova, jedan bus, nula greške. Provedeš turneju kroz Avalu (20. jun), Niš, Štrand, Sarajevo i Guncati grand finale — bez bankrota, bez burnout crew-a, bez praznog plesnjaka. Iza svakog dobrog eventa stoji sto loših odluka koje nisi napravio.

---

## Core Gameplay Loop

### Macro Layer — Turneja HQ (između eventova)

Planiranje iz "busa u pokretu":

- **Raspored:** biraš redosled i datum narednog stopa iz kanonskog kalanda 2026
- **Resurs alokacija:** troši budžet na promo, crew odmor ili backline upgrade (svaki trošak ima tradeoff)
- **Booking:** ugovaranje DJeva i vendora kroz mini "karte iz šanka" (3 ponude, biraš 1)
- **PR menadžment:** odgovaranje na komentare publike — ignorisanje košta reputaciju, loš odgovor košta više
- **Carry-over:** reputacija, budžet i crew morale prenose se 1:1 iz prethodnog eventa u sledeći — nema reset

### Micro Layer — Noć Eventa (sam event)

Deck-builder u 3 bloka:

- **Ruke:** 6 karata po bloku iz "crew šanka" (DJ, host, tonac, video, security, MC)
- **Blokovi:** Open (22:00), Peak (01:00), Close (04:00) — svaki blok ima drugačiji scoring multiplikator
- **Sinergije:** DJ + MC = +15% hype, tonac + video = +10% media coverage, security + host = crew morale stable
- **Random eventi:** "struja pala" (zahteva tonac kartu odmah), "kišna iznenada" (smanjuje crowd za 20% bez backup plana), "poznata lica u publici" (media coverage ×2 ako imaš MC u ruci)
- **Finish screen:** fan metar / revenue / crew morale / media coverage — sve se vraća u macro

### Meta Progresija

- Fan baza = kumulativni counter kroz svih 5 gradova (target: 10.000 za win)
- **Unlockovi po gradu:** Niš otključava resident DJ kartice, Štrand otvara beach-stage bonus blok, Sarajevo dodaje balkanski booking opcije, Guncati finale aktivira "grand prestige" mod
- **Avala bonus:** uspešan Avala event (fan score > 2.500 u jednom eventu) daje 2× bonus karata za ostatak turneje
- **Prestige reset:** posle kompletne turneje — new game+ sa strožijim budžetom i agresivnijim random eventima

---

## Hook — Zašto 15+ Minuta

1. **Priča prati pravu turneju** — igrač "igra" ono što se stvarno dešava; Avala 20. jun nije igra fikacija, to je datum
2. **Deck variabilnost** — iste 6 karata daju drugačiji rezultat zavisno od redosleda i bloka; replayability bez grinding
3. **Avala kao peak moment** — igrač oseća "ovo je boss level" → organski impuls ka kupovini karte za pravi event
4. **Daily highscore:** ko napravi najbrojniji crowd za Avalu (leaderboard po fan score za taj jedan event)

---

## Vizuelna Estetika

- **Stil:** Pixel art, festival night vibes — 16px grid, siluete publike, stage lighting efekti
- **Macro view:** mapa Srbije/regiona sa pinovima za 5 gradova, "turneja bus" animacija duž rute između eventova
- **Micro view:** klub interijer, trijumfalne svetlosne trake u warm amber/gold, crowd reaguje vizuelno na score
- **Paleta:** tamno plava (#0d1b2a) + warm amber (#f4a22d) + stage white za higlight
- **Branding:** Kluboslavija logo u donjem desnom corneru, opacity 60% — prisutan ali ne ometa

---

## Audio Mood

- **Macro:** ambient elektronika, chill office vibe — generisano kroz Web Audio API oscillatori
- **Micro:** bass beat koji raste sa crowd energijom (BPM se podiže sa fan metrom), "ding" za sinergiju karte, "buzz" za propušteni random event
- **Nema .mp3/.wav fajlova** — sve Web Audio API proceduralno

---

## Win / Game Over

| Uslov | Rezultat |
|---|---|
| 5 eventova + fan baza > 10.000 | Win — Guncati grand finale cutscene |
| Budžet = 0 pre kraja turneje | Game over: bankrot |
| Crew morale = 0 | Game over: ekipa dala otkaz |
| Avala score > 2.500 | Bonus: 2× karte za ostatak + CTA dugme "Kupi kartu za Avalu" |

---

## Brand Value

Direktna CTA: posle Avala eventa u igri pojavljuje se dugme **"Kupi kartu za pravi Avala — 20. jun"** (link ka prodaji karata). Nije reklama — igrač je upravo "preživeo" Avalu u igri i razume zašto je to napor. Edukativni efekat: igrač shvata da postoji pravi crew, pravi budžet, pravi napor iza svake Kluboslavija noći.

---

## Target Sesija

| Mod | Trajanje |
|---|---|
| Tutorial (Avala mini, 1 blok) + 1 pun event | 5–7 min |
| Kompletna turneja (svi eventovi) | 25–35 min |
| Daily visit: fan baza check + 1 booking odluka | ~2 min |

---

## Tehničke Napomene za Mile / Jovu

**Reciklira se (ne pisati iznova):**
- Deck-builder UI → iz *Kartaški Front*
- Scoring sistem → iz *Zvučna Proba*
- Progression + unlock logika → iz *DJ za Pultom*

**Novo (potreban dev):**
- Crew sinergije matrica (6×6 tabela interakcija)
- Turneja map renderer (SVG pinovi + bus animacija između koordinata)
- Random event sistem (weighted pool po gradu, ne ponavlja se u istom eventu)

**Platforma:** Mobile-first, touch-first. Sve tap akcije, nema hover stanja. Macro screen staje na 375px širine bez scrolla.
