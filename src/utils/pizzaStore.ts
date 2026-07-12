/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Order, OrderStatus, PizzaSize, OrderType } from "../types";
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from "../initialData";

const PRODUCTS_KEY = "bettos_pizza_products_v1";
const ORDERS_KEY = "bettos_pizza_orders_v1";

export function getStoredProducts(): Product[] {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading products from localStorage", e);
  }
  // Fallback to initial
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  // Dispatch custom event to notify other components in same window
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
  // Fallback to initial
  localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  return INITIAL_ORDERS;
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  // Dispatch custom event to notify other components in same window
  window.dispatchEvent(new Event("bettos_pizza_db_update"));
}

export function resetToInitial(): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
  window.dispatchEvent(new Event("bettos_pizza_db_update"));
}

// Generate unique 4 digit order number like "0844"
export function generateOrderNumber(): string {
  const orders = getStoredOrders();
  if (orders.length === 0) return "0800";
  const nums = orders.map(o => parseInt(o.orderNumber)).filter(n => !isNaN(n));
  const max = Math.max(...nums, 800);
  return String(max + 1).padStart(4, "0");
}
