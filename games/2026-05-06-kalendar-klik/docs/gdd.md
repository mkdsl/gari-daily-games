# GDD — Park Ranger: Daily Quest RPG

**Verzija:** 1.0  
**Autor:** Mile Mehanika, Gari Daily Games  
**Datum:** 2026-05-06  
**Status:** V1 — Pre-production lock

---

## Pregled mehanika

Park Ranger je Daily Quest RPG / Habit Gamification igra u kojoj korisnik jednom dnevno otvori igru, dobije novi quest (mikro-izazov iz realnog života), izvrsi ga van igre, vrati se i pritisne [DONE]. Za svaki completed quest dobija XP i streak +1. Lik (Radnik Parka) vizuelno napreduje kroz 7 sprite varijanti vezanih za level pragove — ali **NIKAD ne degraduje**, ni pri streak resetu.

### Kljucne mehanicke stavke

| Stavka | Vrednost |
|---|---|
| Sesija trajanje | Max 2 minuta |
| Platforma | PWA, mobile-first, DOM-based HTML5 |
| Persisntencija | localStorage (bez backend-a u V1) |
| XP po questu | +10 XP |
| Streak rast | +1 dan po completed questu |
| Streak reset | Streak counter pada na 0, level ostaje |
| Level reset | **Nikad** — level je trajan |
| Quest pool | 120 questova u eksternom quests.json |
| Kategorije | Telo / Fokus / Veze / Priroda (30 per kategorija) |

## Sistem napredovanja

| Level | Naziv | Streak prag |
|---|---|---|
| 0 | Novi Radnik | 0–2 dana |
| 1 | Radnik Parka | 3–6 dana |
| 2 | Cuvar Staze | 7–13 dana |
| 3 | Ranger Parka | 14–29 dana |
| 5 | Senior Ranger | 30–59 dana |
| 7 | Park Legend | 60+ dana |

Level NIKAD ne pada. Vizuelna degradacija lika iz concept.md se ODBACUJE.

XP: +10 po questu, +25 na milestone streak (7, 14, 30, 60 dana).

## Streak protection (Park Propusnica)

1 free skip per kalendarki mesec. Aktivira se kad korisnik otvori igru dan posle propustenog. localStorage key: parkPropusnicaUsedMonth (YYYY-MM format).

## Reward screen flow

[DONE] -> XP animacija -> streak +1 -> Cuvarov message -> Refleksivno pitanje (zadovoljno/neutralno/lazirao) -> [ZATVORI]

Cuvarove poruke po odgovoru:
- Zadovoljno: 'Odlicno, Radnice. Jos jedan dan u Parku. Park raste kad ti raste.'
- Neutralno: 'Uradjeno je uradjeno. I mali koraci broje se. Sutra novi nalog.'
- Lazirao: 'Znam. Park zna. Sutra mozes biti iskreniji/a - prema sebi, pre svega.'

## localStorage schema (13 kljuceva)

currentStreak, recordStreak, lastQuestDate, completedToday, playerLevel, totalXP, questHistory[], parkPropusnicaUsedMonth, currentQuestId, installPromptShown, appInstalled, pushPermission, isLegend

## Push notifikacije

Service Worker, permission posle prvog completed questa. Daily 09:00 lokalno. Text: 'Cuvar Parka je spreman. Tvoj nalog ceka.' Samo ako completedToday == false.

## PWA Install Guide

Prva poseta, iOS i Android instrukcije. CTA: 'Dodaj Cuvara Parka na telefon'.

## Social sharing

Level-up moment, navigator.share + clipboard fallback.

## Scope V1: Quest engine (120 quests u quests.json), streak, propusnica, 7 sprite varijanti, level-up, push notifikacije, PWA install guide, refleksivno pitanje, social sharing.

*GDD v1.0 - Mile Mehanika - 2026-05-06*
