/**
 * module-catalog.js — Moduli za curriculum builder
 * Svaka masterclass tema ima module koji se mogu rasporediti
 */

export const MODULE_CATALOG = {
  suvozid: [
    { id: 'sv_uvod', name: 'Uvod u suvozid', duration: 1, type: 'teorija', required: true },
    { id: 'sv_geologija', name: 'Geologija kamena', duration: 1, type: 'teorija' },
    { id: 'sv_fundament', name: 'Priprema fundameta', duration: 1, type: 'prakticni_rad', required: true },
    { id: 'sv_tehnika', name: 'Tehnika slaganja', duration: 2, type: 'prakticni_rad', required: true },
    { id: 'sv_drenaza', name: 'Drenaža', duration: 1, type: 'demonstracija' },
    { id: 'sv_eval', name: 'Evaluacija radova', duration: 1, type: 'evaluacija', required: true }
  ],
  inokulacija: [
    { id: 'in_uvod', name: 'Uvod u micelijum', duration: 1, type: 'teorija', required: true },
    { id: 'in_supstrat', name: 'Priprema supstrata', duration: 1, type: 'demonstracija' },
    { id: 'in_sterilizacija', name: 'Sterilizacija', duration: 1, type: 'prakticni_rad', required: true },
    { id: 'in_inokulacija', name: 'Inokulacija tehnika', duration: 2, type: 'prakticni_rad', required: true },
    { id: 'in_pracenje', name: 'Praćenje rasta', duration: 1, type: 'teorija' },
    { id: 'in_eval', name: 'Degustacija i evaluacija', duration: 1, type: 'evaluacija', required: true }
  ],
  rammed_earth: [
    { id: 're_tlo', name: 'Testiranje tla', duration: 1, type: 'prakticni_rad', required: true },
    { id: 're_mesanje', name: 'Mešanje materijala', duration: 1, type: 'demonstracija' },
    { id: 're_nabijanje', name: 'Nabijanje tehnika', duration: 3, type: 'prakticni_rad', required: true },
    { id: 're_stabilizacija', name: 'Stabilizacija', duration: 1, type: 'teorija' },
    { id: 're_finis', name: 'Finiš sloj', duration: 2, type: 'prakticni_rad' },
    { id: 're_eval', name: 'Evaluacija', duration: 1, type: 'evaluacija', required: true }
  ],
  permakultura: [
    { id: 'pk_etika', name: 'Etika permakulture', duration: 1, type: 'teorija', required: true },
    { id: 'pk_posmatranje', name: 'Posmatranje terena', duration: 2, type: 'prakticni_rad', required: true },
    { id: 'pk_zone', name: 'Zone dizajn', duration: 1, type: 'teorija' },
    { id: 'pk_voda', name: 'Upravljanje vodom', duration: 1, type: 'demonstracija' },
    { id: 'pk_biljke', name: 'Godišnja cikličnost', duration: 1, type: 'teorija' },
    { id: 'pk_guild', name: 'Gild biljke', duration: 1, type: 'demonstracija' },
    { id: 'pk_eval', name: 'Dizajn prezentacija', duration: 1, type: 'evaluacija', required: true }
  ],
  akvakultura: [
    { id: 'ak_ekosistem', name: 'Jezero ekosistem', duration: 1, type: 'teorija', required: true },
    { id: 'ak_selekcija', name: 'Selekcija vrsta', duration: 1, type: 'teorija' },
    { id: 'ak_ishrana', name: 'Ishrana riba', duration: 1, type: 'demonstracija' },
    { id: 'ak_biofiltracija', name: 'Biofiltracija', duration: 2, type: 'prakticni_rad', required: true },
    { id: 'ak_berba', name: 'Berba i čuvanje', duration: 1, type: 'prakticni_rad' },
    { id: 'ak_legal', name: 'Legalni aspekti', duration: 1, type: 'teorija' },
    { id: 'ak_eval', name: 'Evaluacija ekosistema', duration: 1, type: 'evaluacija', required: true }
  ],
  kombinovani: [
    { id: 'ko_suvozid', name: 'Suvozid osnove', duration: 2, type: 'prakticni_rad', required: true },
    { id: 'ko_rammed', name: 'Rammed Earth intro', duration: 2, type: 'prakticni_rad', required: true },
    { id: 'ko_perma', name: 'Permakultura integracija', duration: 1, type: 'teorija' },
    { id: 'ko_site', name: 'Site visit analiza', duration: 1, type: 'demonstracija' },
    { id: 'ko_projekat', name: 'Projektni rad', duration: 2, type: 'prakticni_rad', required: true },
    { id: 'ko_eval', name: 'Grupna prezentacija', duration: 1, type: 'evaluacija', required: true }
  ]
};

export function getModulesForTema(temaId) {
  return MODULE_CATALOG[temaId] || [];
}

export function getRequiredModules(temaId) {
  return (MODULE_CATALOG[temaId] || []).filter(m => m.required);
}
