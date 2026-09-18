/**
 * hud.js — HUD renderer: countdown, kasa, storage bar, forecast strip.
 */

import { GAME_DAYS, WEATHER_ICONS } from '../config.js';
import { capacityPercent, usedCapacity } from '../systems/capacity.js';

/**
 * Renderuje kompletan HUD u zadani container.
 * @param {HTMLElement} container
 * @param {object} state
 */
export function renderHUD(container, state) {}

/**
 * Renderuje countdown traku.
 * @param {HTMLElement} container
 * @param {number} day
 */
export function renderCountdown(container, day) {}

/**
 * Renderuje prikaz kase.
 * @param {HTMLElement} container
 * @param {number} kasa
 */
export function renderKasa(container, kasa) {}

/**
 * Renderuje weather forecast strip.
 * @param {HTMLElement} container
 * @param {string} today
 * @param {string} tomorrow
 */
export function renderForecast(container, today, tomorrow) {}

/**
 * Renderuje action slot indikatoare.
 * @param {HTMLElement} container
 * @param {number} slotsLeft
 * @param {number} totalSlots
 */
export function renderSlots(container, slotsLeft, totalSlots) {}

/**
 * Renderuje bačva status widget.
 * @param {HTMLElement} container
 * @param {string} bacvaStatus
 * @param {number} daysLeft
 */
export function renderBacvaWidget(container, bacvaStatus, daysLeft) {}
