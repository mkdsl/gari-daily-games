# Premortem: Ekipa Noći
**Datum:** 2026-05-31  
**Autor:** Nega Negovanović (devil's advocate)

---

## 1. Ocena

**Drži uz korekcije.**

Core loop je čvrst — 3-od-5 selekcija po roli je kognitivno laka i lako shareable. Problem je layering: micro + macro + meta u jednoj implementacionoj sesiji je pretežak teret, a brand sprega još nije dokazana.

---

## 2. Showstoppers

**S1: Synergy/conflict sistem bez validacije**  
Problem: 5 rola × 5+ karata × synergy tagovi = kombinatorička eksplozija. Nevalidovane kombinacije će proizvesti broken builds (svi Veterani → nulti conflict, nula tenzije; svi Wildcardi → haos bez smisla).  
Rešenje: Pre implementacije napraviti synergy matricu 5×5 (role parovi), definisati maksimalno 3 synergy para i 2 hard-conflict para. Sve ostalo je neutral.

**S2: Progresija budžeta bez ekonomskog modela**  
Problem: Event Score → Reputation XP → Budget → tier karata — nigde nije definisano koliko XP-a treba za tier unlock, ni koliko tier-2 karta košta. Bez tog modela implementacija makro sloja nije moguća.  
Rešenje: Fiksirati jednu linearnu formulu pre koda: `Budget(n+1) = BaseScore × 10 + EventScore`. Tier-2 karte koštaju 1.5× više. Sve ostalo balansirati posle beta testa.

**S3: Crew odlasci/ostanci bez trigger logike**  
Problem: "Crew members odlaze/ostaju" je meta mehanika bez definisanog trigera. Ko odlazi? Pod kojim uslovom? Ako nije specifikovano, implementacija će skip-ovati ovu mehaniku ili je hard-kodovati nasumično — oba ishoda kvare arc.  
Rešenje: Definisati jednu prosto pravilo: crew member odlazi ako je bio u roli sa conflict tagom u poslednja 2 eventa. Ostaje ako je imao synergy u poslednjem eventu. Nema slučajnosti.

---

## 3. Brand-Utility kritika

Kluboslavija branding je trenutno **dekoracija**. "Ekipa Noći" može biti postavljena u bilo koji noćni event kontekst — Beograd, Zagreb, Berlin. Jedini konkretan brand signal je geografski arc (Štrand → Avala → Niš → Sarajevo → Grand Finale), što je dobar stub, ali nije dovoljno.

Konkretno što nedostaje: karte treba da nose kulturne markere (npr. "Veteran" na Strandu ima backstory vezan za Novo Beogradske splavove, ne generičku "iskustvo" etiketu). Bez toga bilet.rs CTA izgleda kao naknadna misao, ne kao organski endpoint igre.

---

## 4. Scope rizik

**Da, 5 eventa × multi-layer je preskup za jednu sesiju.**

Minimum viable scope: implementirati **1 event** (Štrand) sa punim micro loop-om (5 rola, 3 karte per rola, synergy/conflict), bez macro i meta sloja. Macro se dodaje u sesiji 2 kada micro bude igriv. Meta (tour, odlasci) isključivo u sesiji 3.

Ako se insistira na svim 5 eventima u jednoj sesiji — smanjiti broj rola sa 5 na 3 (DJ, Host, Security) i karata sa 5+ na 3 per roli.

---

## 5. Drži uz korekcije — lista za Mile Mehaniku

1. **Napravi synergy matricu pre implementacije** — tabela, 5×5, popunjena pre nego što se napiše ijedan red koda vezan za karte.
2. **Lockuj ekonomsku formulu za Budget/Tier** — jedna jednadžba, bez "ćemo videti na playtesting", jer playtesting bez formule ne daje upotrebljive podatke.
3. **Redukuj scope na 1 event za beta** — Štrand full micro loop, sve ostalo je stretch goal koji se dodaje samo ako je sesija 1 završena i playable.
