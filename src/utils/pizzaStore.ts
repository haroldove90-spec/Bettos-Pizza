/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Order, OrderStatus, PizzaSize, OrderType, Courier, IngredientInventory, ShippingZone } from "../types";
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from "../initialData";

const PRODUCTS_KEY = "bettos_pizza_products_v1";
const ORDERS_KEY = "bettos_pizza_orders_v1";
const COURIERS_KEY = "bettos_pizza_couriers_v1";
const INGREDIENTS_KEY = "bettos_pizza_ingredients_v1";
const ZONES_KEY = "bettos_pizza_shipping_zones_v1";

const INITIAL_COURIERS: Courier[] = [
  { id: "carlos-gomez", name: "Carlos Gómez", phone: "55 9812-4321", vehicle: "🛵 Motocicleta", status: "Disponible", avatar: "🛵" },
  { id: "luis-martinez", name: "Luis Martínez", phone: "55 3421-5678", vehicle: "🛵 Motocicleta", status: "Disponible", avatar: "🛵" },
  { id: "alejandro-ruiz", name: "Alejandro Ruiz", phone: "55 7890-1234", vehicle: "🚲 Bicicleta", status: "Disponible", avatar: "🚲" },
  { id: "sofia-castro", name: "Sofía Castro", phone: "55 6543-2109", vehicle: "🚗 Automóvil", status: "En Ruta", avatar: "🚗" }
];

const INITIAL_INGREDIENTS: IngredientInventory[] = [
  { id: "ing-masa", name: "Masa de Pizza", stock: 150, unit: "piezas", minStock: 20 },
  { id: "ing-queso", name: "Queso Mozzarella", stock: 45, unit: "kg", minStock: 8 },
  { id: "ing-salsa", name: "Salsa de Tomate", stock: 60, unit: "litros", minStock: 10 },
  { id: "ing-pepperoni", name: "Pepperoni", stock: 25, unit: "kg", minStock: 5 },
  { id: "ing-jamon", name: "Jamón", stock: 30, unit: "kg", minStock: 5 },
  { id: "ing-pina", name: "Piña", stock: 40, unit: "latas", minStock: 6 },
  { id: "ing-chorizo", name: "Chorizo", stock: 15, unit: "kg", minStock: 3 },
  { id: "ing-champinon", name: "Champiñones", stock: 18, unit: "kg", minStock: 4 },
  { id: "ing-jalapeno", name: "Jalapeños", stock: 20, unit: "kg", minStock: 4 },
  { id: "ing-tocino", name: "Tocino", stock: 12, unit: "kg", minStock: 3 },
  { id: "ing-pollo", name: "Pollo", stock: 22, unit: "kg", minStock: 5 },
  { id: "ing-carne-molida", name: "Carne molida", stock: 18, unit: "kg", minStock: 4 },
  { id: "ing-carne-hamburguesa", name: "Carne de Hamburguesa", stock: 50, unit: "piezas", minStock: 10 }
];

const INITIAL_ZONES: ShippingZone[] = [
  { id: "zone-central", name: "Zona Central (Centro / Cercanías)", distance: "0 - 2 km", cost: 20, isActive: true },
  { id: "zone-media", name: "Zona Media (Colonias Aledañas)", distance: "2 - 5 km", cost: 45, isActive: true },
  { id: "zone-lejana", name: "Zona Lejana (Periferia)", distance: "5 - 10 km", cost: 70, isActive: true },
  { id: "zone-metropolitana", name: "Zona Metropolitana Extendida", distance: "10 - 15 km", cost: 110, isActive: true }
];

export function getStoredProducts(): Product[] {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading products from localStorage", e);
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event("bettos_pizza_db_update"));
}

export function getStoredOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading orders from localStorage", e);
  }
  localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  return INITIAL_ORDERS;
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("bettos_pizza_db_update"));
}

export function getStoredCouriers(): Courier[] {
  try {
    const data = localStorage.getItem(COURIERS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading couriers", e);
  }
  localStorage.setItem(COURIERS_KEY, JSON.stringify(INITIAL_COURIERS));
  return INITIAL_COURIERS;
}

export function saveCouriers(couriers: Courier[]): void {
  localStorage.setItem(COURIERS_KEY, JSON.stringify(couriers));
  window.dispatchEvent(new Event("bettos_pizza_db_update"));
}

export function getStoredIngredients(): IngredientInventory[] {
  try {
    const data = localStorage.getItem(INGREDIENTS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading ingredients", e);
  }
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(INITIAL_INGREDIENTS));
  return INITIAL_INGREDIENTS;
}

export function saveIngredients(ingredients: IngredientInventory[]): void {
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(ingredients));
  window.dispatchEvent(new Event("bettos_pizza_db_update"));
}

export function getStoredShippingZones(): ShippingZone[] {
  try {
    const data = localStorage.getItem(ZONES_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading shipping zones", e);
  }
  localStorage.setItem(ZONES_KEY, JSON.stringify(INITIAL_ZONES));
  return INITIAL_ZONES;
}

export function saveShippingZones(zones: ShippingZone[]): void {
  localStorage.setItem(ZONES_KEY, JSON.stringify(zones));
  window.dispatchEvent(new Event("bettos_pizza_db_update"));
}

export function resetToInitial(): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(COURIERS_KEY, JSON.stringify(INITIAL_COURIERS));
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(INITIAL_INGREDIENTS));
  localStorage.setItem(ZONES_KEY, JSON.stringify(INITIAL_ZONES));
  window.dispatchEvent(new Event("bettos_pizza_db_update"));
}

export function generateOrderNumber(): string {
  const orders = getStoredOrders();
  if (orders.length === 0) return "0800";
  const nums = orders.map(o => parseInt(o.orderNumber)).filter(n => !isNaN(n));
  const max = Math.max(...nums, 800);
  return String(max + 1).padStart(4, "0");
}

export function playNotificationChime(type: "new_order" | "status_ready" | "status_assigned") {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === "new_order") {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.25);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.4);
    } else if (type === "status_ready") {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      gain1.gain.setValueAtTime(0.1, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.08); // C6
      gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.3);
    } else if (type === "status_assigned") {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
      gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn("Audio Context blocked or failed to play chime:", e);
  }
}
