# Kluboslavija: Turneja 2026 — Game Design Document

**Verzija:** 1.0 | **Autor:** Mile Mehanika | **Status:** Finalno

---

## 1. Game State Shape

```json
{
  "tourney": {
    "budget": 15000,
    "reputation": 50,
    "crew_morale": 80,
    "fan_base": 0,
    "completed_events": [],
    "current_city": "",
    "unlocks": []
  },
  "event_state": {
    "blocks_done": 0,
    "fan_score": 0,
    "revenue": 0,
    "media_coverage": 0,
    "deck": [],
    "active_synergies": []
  }
}
```

---

## 2. Ekonomija Brojeva

| Resurs | Početna vrednost | Delta po akciji | Cap |
|--------|-----------------|-----------------|-----|
| Budget | 15.000 | Promo −3.000 / Odmor −2.000 / Backline −4.000 | − |
| Fan Base | 0 | Open ×1.0 / Peak ×1.5 / Close ×1.2 + grad modifier | 99.999 |
| Crew Morale | 80 | +15 uspešan event / −25 nemitigovan random event / −5 neiskorišćen blok | 100 |
| Reputation | 50 | +10 dobar PR / −15 loš PR / −20 bankrot signal | 100 |

**Booking ponude (3 tiera):**

| Tier | Cena |
|------|------|
| Budget DJ | 1.000 |
| Mid DJ | 2.500 |
| Star DJ | 5.000 |

---

## 3. Crew Sinergije Matrica (6×6)

Uloge: DJ, Host, Tonac, Video, Security, MC

### Pozitivne sinergije

| Par | Bonus | Efekat |
|-----|-------|--------|
| DJ + MC | +15% Hype | fan score bloka |
| DJ + Tonac | +10% Sound | media coverage |
| Host + Security | +5% Morale | crew morale posle eventa |
| Tonac + Video | +10% Media | media coverage |
| MC + Host | +20% Engagement | crowd, fan score |
| DJ + Video | +12% Social | fan base direktno |
| Security + MC | −50% neg. events | šansa random incidenta |
| Host + Video | +8% Promo recycle | fan pre-boost za naredni event |

### Kontrasinergije

| Par | Kazna | Objašnjenje |
|-----|-------|-------------|
| DJ + Security | −5% Hype | security vibe kills dance floor |
| Host + Tonac | −5% Sound | host drži mikrofon predugo |
| Video + MC | −8% Media | signal clash, loš stream |

---

## 4. Random Eventi

| Event | Grad | Šansa | Mitigacija (karta u ruci) | Bez mitigacije |
|-------|------|-------|---------------------------|----------------|
| Struja pala | sve | 15% | Tonac | −40% fan score bloka |
| Kišna iznenada | Avala, Guncati | 20% | Security | −20% crowd |
| Poznata lica | sve | 10% | MC | propušten ×2 media bonus |
| Susedske pritužbe | Niš, Sarajevo | 12% | Security | −10 reputation |
| Oprema se kvari | sve | 8% | Video | −25% revenue |
| Media incident | Sarajevo, Štrand | 10% | Host | −20 reputation |

**Fallback mehanizam:** 5 sekundi pre svakog bloka prikazuje se overlay s ikonom rizika — igrač vidi kategoriju pretnje, ali ne zna tačan event. Dovoljno za prilagođavanje ruke bez potpunog telegrafiranja.

---

## 5. Onboarding Flow

Tutorial = Avala mini (1 blok, fikirana ruka). Ne može se preskočiti.

1. **Blok 0:** Igrač dobija fiksiranu ruku — DJ, MC, Tonac, Video, Host, Security.
2. Tooltipovi su sekvencijalni (click-to-dismiss), jedan po jedan. Nema pop-up oluje.
3. Kada igrač postavi 2 karte u isti blok, sinergija se automatski highlight-uje u zeleno.
4. Random event se ne triggeruje — garantovana pozitivna runda.
5. Posle bloka: ekran "Ti si spreman. Avala čeka." → prelaz u pravi event.

---

## 6. Grad Modifieri

| Grad | Modifier | Efekat |
|------|----------|--------|
| Avala | Forest Acoustics | +10% bonus na Tonac sinergije |
| Niš | Resident Crew | +1 karta u ruci (7 umesto 6) |
| Štrand | Beach Crowd | +20% Peak blok scoring |
| Sarajevo | Balkanski Media | ×1.5 media coverage |
| Guncati | Finale Crowd | +35% sve scoring kategorije |

---

## 7. Pacing po Minutama

| Minuta | Šta se dešava |
|--------|---------------|
| 0–1 | Tutorial: Avala mini blok (fikirana ruka, nema game over) |
| 1–3 | Macro: HQ ekran — prvi booking izbor, 1 PR odgovor |
| 3–6 | Micro: Avala Event (3 bloka, ~45s po bloku) |
| 6–8 | Win/lose ekran, Avala bonus/CTA ako fan score ≥ 2.500 |
| 8–10 | Macro: Niš planning (budžet potrošnja) |
| 10–14 | Micro: Niš Event |
| 14–35 | Štrand → Sarajevo → Guncati — isti makro/mikro ritam |

---

## 8. Balance Tabele

### Booking (3 tiera)

| Tier | Cena | DJ Bonus | Morale | Equipment Risk |
|------|------|----------|--------|----------------|
| Budget DJ | 1.000 | +0% hype | +0 | 20% šansa fail |
| Mid DJ | 2.500 | +10% hype | +5 | 8% šansa fail |
| Star DJ | 5.000 | +25% hype | +10 | 2% šansa fail |

### Promo Investicija

| Opcija | Cena | Fan Pre-boost | Media Bonus |
|--------|------|---------------|-------------|
| Nema promo | 0 | +0 | +0% |
| Online promo | 1.500 | +200 fanova | +5% media |
| Full promo | 3.000 | +500 fanova + city modifier | +15% media |

---

## 9. Win / Game Over Uslovi

| Ishod | Uslov |
|-------|-------|
| **Win** | `fan_base >= 10.000` posle 5. eventa |
| **Partial win** | `fan_base 7.000–9.999` — "Turneja OK, ali Guncati razočaranje" |
| **Game Over A** | `budget <= 0` pre 3. eventa |
| **Game Over B** | `crew_morale <= 0` u bilo kom trenutku |
| **Avala Bonus** | `event_fan_score >= 2.500` → ×2 karte za naredna 2 eventa + CTA dugme |

---

## 10. Prestige Reset

Posle kompletne turneje (win ili loss):

- Sve tourney vrednosti resetuju se na početne (budget 15.000, morale 80, fan 0).
- **Unlock harder mode:** random event šanse +5% na sve, budget start −2.000 (početak na 13.000).
- **Persistent zapis:** `localStorage["turnejaRekord"]` — max fan baza ikad dostignut.

---

## Terminološki Glosar

| Termin | Definicija |
|--------|------------|
| **Ponuda** | Opcija u booking procesu (3 ponude po eventu) |
| **Karta** | Jednica u deck-builderu (DJ, Host, Tonac, Video, Security, MC) |
| **Blok** | Jedan od 3 dela eventa (Open 22:00 / Peak 01:00 / Close 04:00) |
| **Modifier** | Grad-specifičan bonus koji menja scoring formule |
