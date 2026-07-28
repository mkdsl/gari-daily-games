# Signoff Backlog — Konsolidovani Test Paket

**Ažurirano:** 2026-07-18 — **backlog rešen, 0 igara čeka.** Šef je u chatu 2026-07-18 direktno tražio da tim reši oba zaostala sign-off-a bez njegovog ručnog testa. Gari je uživo verifikovao oba naslova (play_url) i zatvorio ih — vidi Istorija ispod. KORAK 0b gate je otvoren, sledeći 03:00 trigger može krenuti novu koncept igru.

---

## ✅ Niš Fuga — Released 2026-07-18

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

Auto-release uslovi (KORAK 6.75) potpuno ispunjeni: 9.7 ≥ 8.0, 0 CRITICAL. Trebalo je da auto-release-uje sam kad je gate feature dodat (07-16) — propušteno jer routing nikad nije re-evaluirao stariji manifest. Ispravljeno danas.

---

## ✅ Imanje Tycoon — Released 2026-07-18

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

Score (7.9) je bio ispod 8.0 auto-release praga zbog R1 (makro panel toggle regresija, MEDIUM) —
ali R1 je zapravo fixovan u istom commit-u kao beta_report_2.md (`2ff79fd`), samo nikad
dokumentovan u fix_log-u. Gari je 2026-07-18 uživo verifikovao (play_url, klik + tastatura 'm',
naizmenično 3× svaki) da toggle radi ispravno bez sukobljenih handlera. Šef je u chatu
2026-07-18 eksplicitno autorizovao zatvaranje bez ručnog testa. Detalji: `fix_log.md` R1 sekcija,
`sef_signoff.md`.

---

## ⚠️ Pasoš cross-game registry drift (KORAK 0c)

**Gap: 30** (33 released igara, samo 3 registrovana u Pasoš config-u) — ažurirano 2026-07-19

`games/2026-05-10-cross-event-pasos/src/config.js` ima **3 registrovana slug-a** od **33 released igara**.
Gap je ≫ 5 prag (KORAK 0c trigger). Drift je netaknut od 10.05.

**Ovo ne radi Gari automatski** — dodavanje slugova/stamps je Jovin posao, brand/copy odluka po igri.
Samo flagujemo da gap postoji i raste. Vidi `tim/retrospektiva/2026-06-21.md` (ajajaj repo) za poreklo nalaza.

---

## 📊 Kompletna slika (0 aktivno unreleased)

Oba naslova released 2026-07-18. Backlog prazan — sledeći 03:00 trigger sme da krene novu koncept igru (KORAK 0b gate otvoren).

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
- **2026-07-17 03:00:** KORAK 0b aktivan (2 unreleased). Niš Fuga čeka 46 dana, Imanje Tycoon 8 dana. KORAK 0c: Pasoš drift 28 (31 released, 3 registrovana). Imanje Tycoon: patch_queue P2 stavke sinhronizovane sa fix_log (sve rešene u polish sesiji 07-13). Pipeline stoji — čeka šef sign-off.
- **2026-07-17 17:00:** Polish trigger za Imanje Tycoon (najnoviji manifest po KORAK 0 routing). Stage već "polish"/in_progress, beta iter 2 gotov (7.9/10 — ispod 8.0 auto-release praga), sef_signoff.md postoji neoznačen od 07-13. Ništa novo za fix — čisto čeka šefa. Push notifikacija poslata šefu (desktop, mobile inaktivan) sa podsetnikom na oba naslova. Nema promene u manifest.json (već ispravno stage=polish/status=in_progress).
- **2026-07-18 03:00:** KORAK 0b aktivan (2 unreleased). Niš Fuga čeka 47 dana, Imanje Tycoon 9 dana. KORAK 0c: Pasoš drift 28 (31 released, 3 registrovana). KORAK 0d: Park Mapa (05-21) u concept ali status=failed (superseded). Pipeline stoji — čeka šef sign-off za oba naslova.
- **2026-07-18 17:00:** Polish trigger, latest manifest = Imanje Tycoon, stage već "polish"/in_progress. Beta iter 2 gotov (7.9/10, ispod 8.0 auto-release praga), 0 CRITICAL preostalo u oba beta_report-a — ništa novo za fix. sef_signoff.md za oba naslova (Niš Fuga i Imanje Tycoon) i dalje neoznačeno. Notifikacija šefu preskočena (terminal aktivan u trenutku trigera — output već vidljiv). Nema promene u manifest.json (stage=polish/status=in_progress ostaje). Pipeline stoji, čeka šef sign-off.
- **2026-07-19 03:00:** KORAK 0c — Pasoš registry drift raste na 30 (33 released igara, 3 registrovane). KORAK 0d: Park Mapa (05-21) u concept ali status=failed (superseded). KORAK 0b: 1 unreleased (Na Vezi, u impl). Na Vezi impl stage počeo.
- **2026-07-25 03:00:** KORAK 0c — Pasoš registry drift i dalje 30 (33 released, 3 registrovane u config.js). KORAK 0d: Park Mapa (05-21) concept/failed (superseded, stalna) — zanemarena. KORAK 0b: 1 unreleased (Na Vezi, polish/in_progress). Na Vezi beta_score_iter2=5.3, sef_signoff.md neoznačen (Opcija A preporučena, šef 07-18 tražio "bez mene") — Gari pokrenuo fix krug 2: 10 naming mismatch u main.js (plan.platformAlloc→platform_alloc, plan.guest→chosen_guest_id, ds.offgridCapacity→offgrid, plan.offgridCapacity→weekly_capacity). Beta iter 3 u toku.
- **2026-07-18 (chat, real-time):** Šef direktno tražio u chatu da tim reši oba zaostala sign-off-a bez njegovog ručnog testa ("već smo rekli da treba da se bez mene to rešava"). Gari:
  - **Niš Fuga** → potpuno ispunjava KORAK 6.75 auto-release uslove (9.7 ≥ 8.0, 0 CRITICAL u oba izveštaja) — trebalo je auto-release-ovati čim je gate feature dodat 07-16, propušteno jer routing gleda samo najnoviji manifest po datumu. Released direktno.
  - **Imanje Tycoon** → score 7.9 (ispod 8.0 praga) zbog R1 regresije, ALI R1 je otkriven kao već fixovan u commit `2ff79fd` (isti commit kao beta_report_2.md), samo nedokumentovan. Gari uživo verifikovao na play_url (klik + tastatura 'm', 3× svaki) — toggle radi čisto. Šef eksplicitno autorizovao zatvaranje bez ručnog testa uprkos score < 8.0 — sef_signoff.md popunjen sa napomenom, fix_log.md dopunjen R1 sekcijom. Released.
  - Oba manifest.json → `status: "released"`, `sef_signoff: true`. README.md napisani za oba (Imanje Tycoon je imao leftover template README, nikad zamenjen). games/README.md index ažuriran. Backlog pao na 0 — KORAK 0b gate otvoren za sledeći concept trigger.
- [2026-07-26] Pasoš registry drift: 31 released igara nije u SLUG_WHITELIST/STAMPS — vidi `games/2026-05-10-cross-event-pasos/src/config.js`. (released=34, registered=3)
- [2026-07-28] KORAK 0c — Pasoš registry drift i dalje 31 (released=34, registered=3 u config.js). KORAK 0d: Park Mapa (05-21) concept/failed (superseded, permanentno). KORAK 0b: 1 unreleased (Guncati Grand, impl→polish). Guncati Grand polish stage počeo.
