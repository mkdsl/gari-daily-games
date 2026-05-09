# Premortem — DJ za Pultom

## Verdikt: DRŽI UZ KOREKCIJE

---

## Showstopper rizici (ako se ne reše, igra ne funkcioniše)

1. **"6h smena" je mrtvo slovo na papiru.** Igrač nema osećaj vremena ako real-time sat nije vidljiv i aktivan. Compressed idle ne prenosi tenziju smene — prenosi tenziju brojeva. Bez vidljivog odbrojavanja (npr. sat na pultu koji kuca) igrač zaboravi zašto mu je crowd energy bitna. Fiksacija: sat mora biti HUD element prvog reda, ne detalj.

2. **Klik "Next Track" u 5-sekundnom intervalu je ili sve ili ništa.** Ako klik daje dovoljno da kompenzuje pasivni pad, igrač koji ne klika gubi brzo i odlazi. Ako ne daje dovoljno razlike, klik postaje dekoracija. Nije srednje rešenje — mora biti osetan, ali ne obavezan za preživljavanje. Trenutno concept to ne definiše. Rizik: frustracija ili irelevantnost.

3. **Offline progress paradoks nije razrešen.** Ako se igrač vrati i publika je "počela da odlazi" — šta radi? Ako nema akcije koja to zaustavlja retroaktivno, povratak = kazna = deinstall. Povratak mora biti mini-krizni momenat, ne pasivni izveštaj.

---

## Srednji rizici (degradiraju iskustvo, ali igra radi)

1. **Vanilla JS + vektor bez sprite-ova na Canvasu** može izgledati dobro, ali animacija mase kao "abstraktni pokretni blokovi" zahteva smooth canvas loop. Bez requestAnimationFrame discipline, 60fps pada na 20fps na mid-range mobilnom. Testirati rano.

2. **Mobile layout 375px:** pult iz ptičje perspektive + upgrade panel desno = gužva. Upgrade panel mora ići dole ili u drawer. Nije bloker, ali ako se ne reši u wireframe fazi, koštaće dana na kraju.

---

## Bezopasne brige (ignorišemo)

1. Kluboslavija/Avala hint u After Hours zoni — flavor detalj, ne utiče na mehaniku.
2. Audio mood specifikacija — to je brief za kompozitora, ne GDD problem.

---

## Preporuke za Mile Mehaniku (GDD korak)

- Definiši tačnu formulu: koliko crowd energy donosi 1 klik vs. pasivna sekunda. Broj mora biti u GDD-u pre implementacije.
- Offline progress cap: maksimalno 30 minuta offline efekta. Sprečava "rešena igra" i "kazna" scenarije.
- Sat na HUD-u — obavezan, vidljiv, kuca u realnom vremenu sesije.
- Wireframe mobile-first pre nego što se nacrta išta za desktop.
