# DJ Akademija — Trivia o Zvuku, DJ Kulturi i Kluboslavija Sceni

**Žanr:** Trivia / Quiz  
**Brand serves:** Kluboslavija (Štrand 13.jun hype)  
**Playtime:** 3-5 min  
**Kompleksnost:** 1/5 (čisti text + timer UI, nema canvas, nema audio assets)  
**Autor koncepta:** Iskra Ivanović, 2026-05-27

---

## Hook

Ti si kandidat za Kluboslavija ekipu. Pre nego što te prime, moraš da prođeš
"DJ Akademiju" — 10 pitanja o zvuku, DJ kulturi i Balkans noćnom životu.  
Svaki tačan odgovor = +1 zvezdica. 10/10 = "Head of Sound". 0/5 = "Obezbedi bio".  
Svako pogrešno pitanje donosi kratko objašnjenje zašto (micro-edukacija).

---

## Pitanja (10 × MC, 4 opcije, 15 sek timer)

1. Na kojoj frekvenciji se bas "oseća u grudima" a ne samo čuje?  
   ✅ A: 20–80 Hz  B: 200–500 Hz  C: 2–5 kHz  D: >10 kHz  
   *Fact: Sub-bas ispod 80 Hz aktivira taktilne receptore, ne samo slušne.*

2. Šta znači "peak hour" na žurki?  
   A: Kad je kapacitet kluba maksimalan  ✅ B: Deo noći (obično 01:00–03:00) kad je publika najspremnija za najjači set  C: Kad su sve šankere zauzete  D: Posle 5h ujutru

3. Štrand u Novom Sadu se nalazi na reci:  
   ✅ A: Dunav  B: Sava  C: Tisa  D: Begej  
   *Fact: Štrandsko jezero je u stvari deo Dunava odvojen od matice.*

4. Šta je "feedback loop" na soundcheck-u?  
   ✅ A: Mikrofon hvata zvuk koji zvučnik emituje i pojačava ga u loop  B: DJ greška pri uvlačenju tracka  C: Publika koja ne reaguje  D: Prazna baterija u monitoru

5. Koji BPM je standard za tech-house?  
   A: 90–105  ✅ B: 126–134  C: 145–160  D: 170–180  
   *Fact: Techno ≈ 135–150, house ≈ 120–128, tech-house između.*

6. "Warm-up DJ" dolazi:  
   ✅ A: Pre main akta, gradi energiju polako  B: Posle main akta, smiruje publiku  C: Tokom pauze za tehničke probleme  D: Kad main DJ kasni >30 min

7. Šta je "cue point"?  
   ✅ A: Tačka u pesmi gde DJ može brzo da počne reprodukciju  B: Vrsta zvučnika  C: Mešaonica  D: Signal za gašenje svetla

8. Na kojoj temperaturi se zvuk širi BRŽE?  
   ✅ A: Toplija temperatura  B: Hladnija temperatura  C: Temperatura nema uticaja  D: Zavisi od vlažnosti, ne temperature  
   *Fact: Brzina zvuka raste ~0.6 m/s po °C. Toplo leto na Štrandu = brži sound.*

9. Šta znači "rig" u kontekstu PA sistema?  
   ✅ A: Kompletna instalacija zvučne opreme (zvučnici, sub, pojačala)  B: DJ štand  C: Poseban bas efekat  D: Monitor iza DJ-a

10. Kluboslavija "Turneja 2026" — koji grad je bio prvi?  
    A: Beograd  B: Štrand NS  ✅ C: Sarajevo  D: Niš  
    *Fact: Sarajevo 5.april 2026 — kick-off tura.*

---

## Score → Title

| Rezultat | Titula |
|----------|--------|
| 10/10 | 🎛️ Head of Sound |
| 8–9/10 | 🎧 Sound Engineer |
| 6–7/10 | 🔊 Regular na Štrandu |
| 4–5/10 | 🎵 Slušalac u Razvoju |
| 0–3/10 | 🚪 Obezbedi bio |

---

## Share tekst (po tituli)

```
Položio/la DJ Akademiju — [TITULA]
Spreman/a za Štrand 13. jun? 🎛️
[LINK IGRE]
#kluboslavija #strand #djAkademija
```

---

## Tech spec

- Čisti text UI, nema canvas
- MC pitanja: 4 dugmeta (A/B/C/D)
- Timer bar: 15 sek per pitanje (CSS animacija, bez WebAudio)
- Post-odgovor: zeleno/crveno flash + 1 rečenica fact (0.8 sek)
- Final screen: titula + share dugme (Web Share API + fallback clipboard)
- LocalStorage: save best score (ne reset)
- Mobile-first: dugmad min 44px touch target
- Keyboard: A/B/C/D + Enter za nastavak
- Estimate: ~800 JS + 200 CSS

---

## Vizuelna estetika

Kluboslavija paleta:
- Background: tamno plava (#0a0a1a) sa tankim neon-ljubičastim outlineima
- Tekst: bela / svetlosiva (#e8e8f0)
- Akcent: zlatna (#f0b429) — za tačan odgovor, score counter, logo
- Wrong: topla crvena (#e53e3e)
- Correct: emerald zelena (#38a169)
- Timer bar: gradient ljubičasta→crvena kad vreme ističe
- Font: monospace za pitanja (techy vibe)

---

## Brand hooks

- Štrand logo ili tekst discreetly u footer-u
- Share URL: `https://mkdsl.github.io/gari-daily-games/games/2026-05-28-dj-akademija/`
- Tagline: "Spreman/a za Štrand 13. jun?"
- Krajnji screen: CTA dugme "Uzmi kartu" → link koji team dodaje kad bude aktivan
