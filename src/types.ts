/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  ADMIN = "ADMIN",
  COCINA = "COCINA",
  VENDEDOR = "VENDEDOR",
  CLIENTE = "CLIENTE",
  MENSAJERO = "MENSAJERO"
}

export enum PizzaSize {
  CH = "CH",
  MED = "MED",
  GDE = "GDE",
  FAM = "FAM",
  MEGA = "MEGA"
}

export type Category = 
  | "Especialidad" 
  | "Un Solo Ingrediente" 
  | "Paquete" 
  | "Hamburguesa" 
  | "Empanada" 
  | "Bebida" 
  | "Spaghetti";

export interface PizzaPrice {
  standard: number;
  orillaRellena: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  prices?: Record<PizzaSize, PizzaPrice>; // For customizable pizzas
  price?: number; // For non-pizza products or fixed-size products
  ingredients?: string[];
  imageUrl?: string;
  isPromo?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  category: Category;
  quantity: number;
  selectedSize?: PizzaSize;
  orillaRellena?: boolean;
  notes?: string;
  price: number;
}

export type OrderStatus = "Pendiente" | "En Cocina" | "Listo" | "En Camino" | "Entregado" | "Cancelado";
export type OrderType = "Para Llevar" | "Domicilio" | "POS Mesa";

export interface Order {
  id: string;
  orderNumber: string;
  timestamp: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  type: OrderType;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod: "Efectivo" | "Tarjeta" | "Transferencia";
  sellerId?: string; // If placed by POS
  deliveryManId?: string; // If delivered by Mensajero
  deliveryManName?: string; // Delivery courier's name
  commissionEarned?: number; // Delivery commission earned
  deliveredAt?: string; // ISO string when delivery completed
}

export interface StoreStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
}
