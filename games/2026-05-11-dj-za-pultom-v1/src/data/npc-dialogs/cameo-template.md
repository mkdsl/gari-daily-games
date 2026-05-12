# Cameo NPC Dialog Template (Sezona 2+)

**Autor:** Sine Scenario
**Datum:** 2026-05-11
**Status:** Template spec — koristi se za real-life cameo NPC u S2 expansion-u
**Referenca:** Mile GDD v2 (P-real-life-1, Iskra v8 preporuka) — Veda + Cana cameo
**Inputi:** Mile gdd-s2-substance (substance system + real-life integration), Iskra v7 (S2 paths)

---

## Šta je cameo NPC

Cameo NPC je realna persona iz Garijevog tima koja se pojavljuje u sezoni 2+ kao
spawn-event van glavnog DJ konteksta — bez puštanja seta, bez učenja mixing-a,
bez scene metrike. Cameo NPC menja kako igrač **misli o sebi izvan pulta**, što
posledično menja čuvanje stat-ova (Health / Odnosi / Normalnost) i otvara
S2-specifične path-ove (P11 Studio Producer, P13 Scene Mentor, P-real-life-1).

**Princip:** cameo NPC ne uči DJ-stvari. Cameo NPC uči **kako se opstaje između
seta i seta**. To je deo razloga zašto je odložen za S2 — S1 mora prvo da utvrdi
da je čuvanje primary mehanika, da bi cameo imao na šta da se naveže.

---

## Spec template — generic struktura

```javascript
{
  id: 'cameo_<persona>_s2_<context>',
  cameo_persona: {
    name: '<Ime iz Garijevog tima>',
    full_label: '<persona descriptor, ne real-name promo>',
    voice_signature: '<3-5 ključnih osobina glasa, ne biografija>',
    visual_hint: '<gde se pojavljuje, šta nosi, šta drži u rukama>',
    real_world_anchor: '<jedna konkretna stvar iz Garijevog života>'
  },
  trigger: {
    season: 2,
    week_min: ?,
    week_max: ?,
    requires: { /* origin, path predispozicija, čuvanje stat threshold */ },
    spawn_chance: 0.20-0.40,
    cooldown_weeks: 6
  },
  scene: {
    location: '<van klupskog konteksta — kuća, pijaca, vinograd, kafana, šuma>',
    visual_hint: '<sensorni detalj — miris, zvuk, svetlo>',
    audio_hint: '<ambient bez muzike — to je deo cameo poente>'
  },
  start: 'beat_1_arrival',
  nodes: {
    /* 4-5 izmena, ne 6-7 kao klubski mentor — cameo je krasi, ne dominira */
    beat_1_arrival: { /* persona se predstavlja kroz radnju, ne kroz tekst */ },
    beat_2_offering: { /* persona daje nešto konkretno — jelo, tehniku, ritual */ },
    beat_3_observation: { /* persona opaža igrača — telesno, ne psihološki */ },
    beat_4_choice: { /* 2-3 izbora, NE 4 kao M4 */ },
    beat_5_landing: { /* persona se ne pretvara u mentora; ostaje persona */ }
  },
  post_event: {
    set_flags: ['<cameo_persona>_s2_seen'],
    cuvanje_recovery: { /* primary stat impact — odnosi i normalnost, ne knowledge */ },
    apply_global_effects: [ /* ritual unlock, recipe unlock, prac-tice unlock */ ]
  }
}
```

---

## 3 ključne osobine koje cameo NPC mora da nosi

Posle dva ciklusa testiranja (sa S1 mentor-om), izveli smo tri non-negotiable
osobine koje razlikuju cameo NPC od običnog quest-givera.

### 1. Realan anchor — jedna stvar iz Garijevog života

Cameo nije bezimena persona — igrač možda nikad neće saznati da je cameo
iz real-life tima, ali persona mora da ima **jedan konkretan, neglamurozan
detalj iz Garijevog života** koji NPC nosi kao identitet, ne kao trivia.

**Veda primer:** ne kaže "ja sam holistički fitnes guru", već zna kako da
"otkrije gde si stao u disanju za poslednja tri dana". Anchor je: Garijevo
breathwork praktikovanje, prevedeno u observe-don't-teach modalitet.

**Cana primer:** ne predaje recept, već pita "koji si poslednji put umočila
hleb u tarator". Anchor je: tradicionalni recepti kao alat za vraćanje tela
u sezonski ritam, ne folklor.

**Zašto:** real-life anchor je razlog što P-real-life-1 path uopšte postoji.
Bez njega cameo je samo dekorativni NPC, što GDD eksplicitno odbacuje.

### 2. Obrnuti smer učenja — cameo uči izvan-DJ, ne DJ

Klubski mentor (Bata Lemur, S1 rad-klasa) uči igrača o pultu, sali, publici.
**Cameo NPC mora da uči izvan toga.** Ako cameo počne da govori o žurkama
ili scenu, persona je promašena.

**Veda treba da uči:** kako jutarnja rutina menja kako čuješ bas u uvce.
Telo kao instrument koji pamti, ne breakwork tutorial.

**Cana treba da uči:** kako sezonsko jelo menja u kojim danima nedelje ti
je telu lakše da puštaš set. Ritam kuhinje kao ritam karijere, ne recept.

**Zašto:** sezona 2 je o "DJ kao osoba koja preživljava DJ karijeru". Cameo
je glavni kanal kroz koji igra signalizuje da postoji život van klupa, što
direktno hrani čuvanje stat-ove (Health, Odnosi, Normalnost).

### 3. Persona ne raste — igrač raste

Klubski NPC se može vratiti više puta i imati arc. **Cameo NPC se NE menja
između susreta.** Veda je Veda u wk 4, wk 9, wk 11. Promene su u igraču —
kako reaguje na istu Vedu posle što je 6 nedelja čuvao Health > 40% vs.
kad je čuvao Health < 20%.

**Mehanički princip:** isti dialog tree, drugi prošeci kroz njega na osnovu
state-a igrača. Dialog node "beat_2_offering" je identičan, ali igrač sa
niskim Normalnost stat-om dobija različite choice option-ove od igrača
sa visokim.

**Zašto:** cameo treba da bude **ogledalo, ne katalizator**. Katalizatori su
NPC-evi iz scene (mentori, rezident DJ-evi, hostese). Ogledala su cameo.
Ako cameo počne da raste sa igračem, postaje paralelna karijera persone,
što GDD odbacuje kao narativni šum.

---

## Veda osobina — specifika (S2 placeholder)

- **Holistic wellness signature:** disanje + telesna posmatranja + sezonski ritam
- **Ne predaje:** joga poze, biohacking pravila, ishrana setting
- **Predaje (kroz observaciju):** "Tvoj glas mi je danas niži nego pre tri nedelje" / "Pleća ti drze noć od pre dva dana"
- **Anchor:** Garijevo breathwork; psihodelična svest kao kontekst, NE kao tema
- **Path push:** P-real-life-1, P11 Studio Producer (telo kao instrument signala)

## Cana osobina — specifika (S2 placeholder)

- **Tradicionalni recepti / fermentacija signature:** sezonski ritam + ručna proizvodnja + food safety kao etika
- **Ne predaje:** recepture, korake fermentacije, vremensku tehniku
- **Predaje (kroz nuđenje):** sok od zove u ruci, turšija kao "ima li kuće u tebi danas", ajvar koji nije završen jer si zaboravio na njega
- **Anchor:** Garijevo Guncati imanje + RPG zimnica; majke i bake kao deo brand misije "povratak na selo"
- **Path push:** P-real-life-1, P9 Resident Curator (ritam jednog mesta, ne turneja)

---

## Šta NIJE u template-u

- **Stat numerička kalibracija** — to radi Mile u GDD v3 sa S2 expansion-om
- **Konkretni dialog tekst** — Pera Period će pisati persona-specifične linije
- **Cameo casting** — koja persona iz tima radi koji cameo, odlučuje Iskra + šef u S2 brief-u
- **Save-game integracija** — Jova jQuery će rešiti kroz S2 save migration

---

## Sledeći koraci (kad S2 produkcija krene)

1. **Iskra:** definiše koje persone iz tima ulaze u S2 cameo roster (Veda + Cana potvrđene; ostali TBD)
2. **Sine:** popunjava ovaj template po personi — 5 dialog node-ova svako
3. **Pera Period:** piše dialog linije u persona-glasu
4. **Mile:** kalibrira stat impact + flag interaction sa S1 čuvanje sistemom
5. **Dule:** etička provera (cameo ne sme da bude crypto-tutorial za real-life Garijev produkt)
