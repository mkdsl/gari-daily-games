import { UPGRADES, ZONES } from '../config.js';
import { getState, setState, getCurrentZone } from '../state.js';

/**
 * Helper: pronađi upgrade po ID-u.
 */
export function getUpgradeById(id) {
  return UPGRADES.find(u => u.id === id) ?? null;
}

/**
 * Indeks zone po zone ID-u — koristi se za poređenje dostupnosti.
 */
function zoneIndex(zoneId) {
  return ZONES.findIndex(z => z.id === zoneId);
}

/**
 * Da li je upgrade dostupan u trenutnoj zoni.
 * Upgrade zone <= current zone (po redosledu u ZONES nizu).
 */
function isZoneUnlocked(upgrade) {
  const currentZone = getCurrentZone();
  const currentIdx = zoneIndex(currentZone.id);
  const upgradeIdx = zoneIndex(upgrade.zone);
  return upgradeIdx <= currentIdx;
}

/**
 * Da li igrač može da kupi upgrade:
 *   1. Upgrade postoji
 *   2. Nije već kupljen
 *   3. Zona je dostupna (current zone >= upgrade zone)
 *   4. Ima dovoljno music_coins
 */
export function canBuyUpgrade(upgradeId) {
  const upgrade = getUpgradeById(upgradeId);
  if (!upgrade) return false;

  const { music_coins, purchased } = getState();

  if (purchased.includes(upgradeId)) return false;
  if (!isZoneUnlocked(upgrade)) return false;
  if (music_coins < upgrade.cost) return false;

  return true;
}

/**
 * Kupi upgrade: oduzmi coins, dodaj u purchased[].
 * Vraća true ako je kupovina uspela, false inače.
 */
export function buyUpgrade(upgradeId) {
  if (!canBuyUpgrade(upgradeId)) return false;

  const upgrade = getUpgradeById(upgradeId);
  const { music_coins, purchased } = getState();

  setState({
    music_coins: music_coins - upgrade.cost,
    purchased: [...purchased, upgradeId],
  });

  return true;
}

/**
 * Lista svih upgrades koje trenutna zona dozvoljava (zone ID <= current zone ID).
 * Svaki element dobija dodatno polje `purchased: true/false`.
 */
export function getAvailableUpgrades() {
  const currentZone = getCurrentZone();
  const currentIdx = zoneIndex(currentZone.id);
  const { purchased } = getState();

  return UPGRADES
    .filter(u => zoneIndex(u.zone) <= currentIdx)
    .map(u => ({ ...u, purchased: purchased.includes(u.id) }));
}

/**
 * Lista upgrade objekata koje je igrač već kupio.
 */
export function getPurchasedUpgrades() {
  const { purchased } = getState();
  return UPGRADES.filter(u => purchased.includes(u.id));
}
