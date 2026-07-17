# Signoff Backlog — Konsolidovani Test Paket

**Generisano:** 2026-07-17, trigger (KORAK 0b — 2 igre čekaju šef test)

**Pipeline čeka šefov test.** Dvije igre u polish/in_progress — nema novih igara dok ovaj red ne padne ispod 2.

---

## 🎯 Prioritet 1: Niš Fuga (46 dana čeka sign-off)

| Polje | Vrednost |
|-------|----------|
| **Igra** | Niš Fuga |
| **Žanr** | Point-and-click Mini Avantura |
| **Brand** | Kluboslavija |
| **Play URL** | https://mkdsl.github.io/gari-daily-games/games/2026-06-01-nis-fuga/ |
| **Beta iter 1** | 8.2/10 (3 MEDIUM + 3 LOW, sve ispravljeno) |
| **Beta iter 2** | 9.7/10 ✅ (0 novih bugova) |
| **Post-fix score** | **9.0/10** |
| **Sign-off fajl** | `games/2026-06-01-nis-fuga/docs/sef_signoff.md` |

**Šta je igra:** Vodiš Jovanku, tour managera Kluboslavija ekipe, kroz Niš u jutro pred event. Pet autentičnih niških scena, dijaloški izbori, resursi koji se prenose (vreme/moral/strpljenje/reputacija) — 7 různih endinga, stigni na soundcheck na vreme. Kluboslavija branding na ending screenu sa bilet.rs linkom.

**Test checklist (5 min):**
1. Otvori play URL iznad
2. Prođi barem 2–3 scene (Bulevar → Kiosk → Kafana)
3. Provjeri da dijaloški izbori reaguju i da resursi se menjaju vidljivo u HUD-u
4. Dođi do jednog endinga
5. Provjeri Kluboslavija branding na ending screenu
6. Javi: "OK Niš Fuga" ili "vrati u fix: [šta]"

---

## 🎯 Prioritet 2: Imanje Tycoon (8 dana čeka sign-off)

| Polje | Vrednost |
|-------|----------|
| **Igra** | Imanje Tycoon |
| **Žanr** | Multi-layer Idle/Tycoon + Farm Simulation |
| **Brand** | Guncati + MKDSLend |
| **Play URL** | https://mkdsl.github.io/gari-daily-games/games/2026-07-09-imanje-tycoon/ |
| **Beta iter 1** | 6.4/10 (0 CRITICAL, 6 MEDIUM, 4 LOW) |
| **Beta iter 2** | 7.9/10 ✅ (sve ispravljeno, 1 regresija odmah fixovana) |
| **Post-fix score** | **8.9/10** |
| **Sign-off fajl** | `games/2026-07-09-imanje-tycoon/docs/sef_signoff.md` |

**Šta je igra:** Pokrećeš imanje od nule — pečurke, plastenik i ribnjak. Macro planiranje × Micro izvedba × permakulturna ekonomika s realnim guncatskim brojkama. Dostigni Fazu C kroz 4–6 sati gameplay-a. Offline progress, 25 achievementa, Web Audio folk ambient.

**Test checklist (5 min):**
1. Otvori play URL iznad
2. Pokreni prvu inokulaciju (Pečurke tab → "🌱 Inokulacija!" kad se pojavi timer)
3. Dočekaj prvu berbu (progress bar ~2 min)
4. Provjeri da kapital raste i sezonski timer odbroji
5. Provjeri macro panel — klik na `▾` ga sklopi/otvori
6. Provjeri locked tabove (Plastenik, Jezero su dimmed sa unlock uslovom)
7. Javi: "OK Imanje Tycoon" ili "vrati u fix: [šta]"

---

## ⚠️ Pasoš cross-game registry drift (KORAK 0c)

**Gap: 28** (31 released igara, samo 3 registrovana u Pasoš config-u)

`games/2026-05-10-cross-event-pasos/src/config.js` ima **3 registrovana slug-a** od **31 released igara**.
Gap je ≫ 5 prag (KORAK 0c trigger). Drift je netaknut od 10.05.

**Ovo ne radi Gari automatski** — dodavanje slugova/stamps je Jovin posao, brand/copy odluka po igri.
Samo flagujemo da gap postoji i raste. Vidi `tim/retrospektiva/2026-06-21.md` (ajajaj repo) za poreklo nalaza.

---

## 📊 Kompletna slika (2 aktivno unreleased)

| # | Igra | Stage | Status | Dana čeka | Napomena |
|---|------|-------|--------|-----------|----------|
| 1 | **Niš Fuga** (06-01) | polish | in_progress | 46 dana | Čeka sign-off — sef_signoff.md kreiran (07-14) |
| 2 | **Imanje Tycoon** (07-09) | polish | in_progress | 8 dana | Čeka sign-off — sef_signoff.md postoji (07-13) |

Legacy igre (Park Mapa 05-21: failed/superseded, i stariji bez stage polja) se ne broje aktivno.

---

## Istorija

- **2026-07-05:** Šef dao OK za sve 14 igara. Commit `53e302e Released: 14 igara — šef sign-off 2026-07-05`. Backlog od 19-55 dana u potpunosti rešen.
- **2026-07-07:** Niš Fuga impl dovršena (35 modula, 6932 JS + 1090 CSS). Beta iter 1 + fix log + beta iter 2 (9.7/10). Čeka šef sign-off.
- **2026-07-08:** KORAK 0b aktivan (6 unreleased). Nema nove igre. Refresh dokument.
- **2026-07-11:** KORAK 0c — Pasoš registry drift potvrđen: gap 28. Impl za Imanje Tycoon pokrenut.
- **2026-07-12:** Imanje Tycoon scope-up: 4043 → 8000+ JS linija.
- **2026-07-13:** Imanje Tycoon (34 modula, 8578 JS + 2171 CSS) ulazi u polish. Beta test + fix + beta iter 2 (7.9/10). sef_signoff.md kreiran. Niš Fuga čeka 42 dana.
- **2026-07-14:** KORAK 0b aktivan (2 unreleased: Niš Fuga + Imanje Tycoon). sef_signoff.md za Niš Fugu kreiran. post_fix_score 9.0 upisano u manifest. Čeka šef test oba naslova.
- **2026-07-15:** KORAK 0b aktivan (2 unreleased). Pasoš gap i dalje 28. Niš Fuga čeka 44 dana, Imanje Tycoon 6 dana. Pipeline ne pokreće novu igru dok šef ne odobri oba naslova.
- **2026-07-16:** KORAK 0b aktivan (2 unreleased). Niš Fuga čeka 45 dana, Imanje Tycoon 7 dana. KORAK 0d: Park Mapa (05-21) u concept ali status=failed (superseded — zatvorena 07-07). Pasoš gap i dalje 28. Pipeline stoji — čeka šef sign-off.
- **2026-07-17:** KORAK 0b aktivan (2 unreleased). Niš Fuga čeka 46 dana, Imanje Tycoon 8 dana. KORAK 0c: Pasoš drift 28 (31 released, 3 registrovana). Imanje Tycoon: patch_queue P2 stavke sinhronizovane sa fix_log (sve rešene u polish sesiji 07-13). Pipeline stoji — čeka šef sign-off.
