# Signoff Backlog — Konsolidovani Test Paket

**Generisano:** 2026-07-08, trigger (KORAK 0b) — 6 igara nije released (≥ 2 prag)

**KORAK 0b je aktivan:** Trigger danas NIJE pokrenuo novu igru. Pipeline čeka šefov test.

---

## 🎯 Prioritet: Niš Fuga čeka sign-off (37 dana u polishu)

**Jedina aktivna igra koja treba tvoj test:**

| Igra | Dana čeka | Beta iter2 | Brand | Play |
|------|-----------|------------|-------|------|
| **Niš Fuga** | 37 dana (od 2026-06-01) | **9.7/10** ✅ | kluboslavija | [Play](https://mkdsl.github.io/gari-daily-games/games/2026-06-01-nis-fuga/) |

**Šta je igra:** Point-and-click mini avantura — vodiš Jovanku, tour managera Kluboslavija ekipe, kroz Niš u jutro pred event. Pet autentičnih niških scena, dijaloški izbori, resursi koji se prenose — stigni na soundcheck na vreme.

**Beta status:**
- Beta iter 1: **8.2/10** (3 MEDIUM + 3 LOW bugova nađena)
- Fix log: sve MEDIUM ispravljeno, LOW logovano
- Beta iter 2: **9.7/10** ✅ — svi fix-ovi verifikovani, 0 novih bugova
- Šef sign-off: **čeka** (blokira release)

**Test checklist (5 min):**
1. Otvori play URL iznad
2. Prođi barem 2 scene (Bulevar → Kiosk → Kafana)
3. Provjeri da dijaloški izbori reaguju i da resursi (vreme/moral/strpljenje) se menjaju
4. Provjeri game over / dobar ending
5. Javi: "OK Niš Fuga" ili "vrati u fix: [šta]"

**Ako daš OK:** sledeći trigger radi KORAK 7 (manifest finalize + README + release commit + push).

---

## 📊 Kompletna slika (6 unreleased)

| # | Igra | Stage | Status | Napomena |
|---|------|-------|--------|----------|
| 1 | **Niš Fuga** (06-01) | polish | in_progress | Čeka sign-off — vidi gore |
| 2 | Park Mapa (05-21) | concept | failed | Orphan/legacy — zamenjena retry-em 06-13 koji je released |
| 3 | DJ za Pultom v1 (05-11) | — | V2 BUILD | Legacy — ne prati standardni manifest format |
| 4 | Park Ranger (05-06) | — | in_progress | Legacy — bez stage polja |
| 5 | Kartaški Front (04-24) | — | done | Legacy — bez stage polja |
| 6 | Kanal (04-22) | — | in_progress | Legacy stub — nikad dovršen |

Stavke 2-6 su legacy/pre-KORAK-0a format — ne blokiraju pipeline direktno, ali se broje u KORAK 0b ukupnom broju. Šef može odlučiti da li ih arhivira ručno.

---

## ⚠️ Pasoš cross-game registry drift (KORAK 0c)

**Gap: 28** (31 released igara, samo 3 registrovana u Pasoš config-u)

`games/2026-05-10-cross-event-pasos/src/config.js` ima **3 registrovana slug-a** od **31 released igara**.
Gap je ≫ 5 prag (KORAK 0c trigger). Drift je netaknut od 10.05.

**Ovo ne radi Gari automatski** — dodavanje slugova/stamps je Jovin posao, brand/copy odluka po igri.
Samo flagujemo da gap postoji i raste. Vidi `tim/retrospektiva/2026-06-21.md` (ajajaj repo) za poreklo nalaza.

---

## ⚠️ Orphan igre (KORAK 0d)

| Igra | Stage | Status | Napomena |
|------|-------|--------|----------|
| Park Mapa (05-21) | concept | failed | Superseded od 06-13 Park Mapa (released). Legacy. |

KORAK 0d: jedini orphan je failed/legacy — nema aktivnih orphan igara u concept/impl stage-u koje treba da se napreduju.

---

## Istorija

- **2026-07-05:** Šef dao OK za sve 14 igara. Commit `53e302e Released: 14 igara — šef sign-off 2026-07-05`. Backlog od 19-55 dana u potpunosti rešen.
- **2026-07-07:** Niš Fuga impl dovršena (35 modula, 6932 JS + 1090 CSS). Beta iter 1 + fix log + beta iter 2 (9.7/10). Čeka šef sign-off.
- **2026-07-08:** KORAK 0b aktivan (6 unreleased). Nema nove igre. Ovaj refresh dokument.
