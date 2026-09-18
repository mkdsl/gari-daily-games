/**
 * ui.js — HUD komponente: countdown, kasa, storage bar, forecast strip, toast.
 */

/**
 * Prikazuje toast obaveštenje.
 * @param {string} message
 * @param {'info'|'warn'|'success'|'error'} type
 * @param {number} [duration=3000] ms
 */
export function showToast(message, type = 'info', duration = 3000) {}

/**
 * Ažurira prikaz kase u HUD-u.
 * @param {number} kasa
 */
export function updateKasa(kasa) {}

/**
 * Ažurira storage bar (popunjenost polica).
 * @param {number} used - Broj tegli/kg
 * @param {number} capacity - Ukupan kapacitet
 */
export function updateStorageBar(used, capacity) {}

/**
 * Ažurira forecast strip sa vremenskim ikonama.
 * @param {string} today - 'sunny'|'cloudy'|'rainy'
 * @param {string} tomorrow - 'sunny'|'cloudy'|'rainy'
 * @param {boolean} tomorrowIsAccurate - Da li je prognoza tačna
 */
export function updateForecast(today, tomorrow, tomorrowIsAccurate) {}

/**
 * Ažurira countdown dani preostali.
 * @param {number} day - Trenutni dan
 * @param {number} totalDays - Ukupan broj dana
 */
export function updateCountdown(day, totalDays) {}

/**
 * Renderuje action slot dugmad za tekući dan.
 * @param {number} slotsRemaining
 * @param {number} totalSlots
 */
export function renderActionSlots(slotsRemaining, totalSlots) {}

/**
 * Prikazuje log poruke u side panelu.
 * @param {Array<{day: number, text: string, type: string}>} log
 */
export function renderLog(log) {}
