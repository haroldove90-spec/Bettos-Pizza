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
  isActive?: boolean;
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
  createdAt?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  type: OrderType;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  shippingZone?: string;
  shippingCost?: number;
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

export interface Courier {
  id: string;
  name: string;
  phone: string;
  vehicle: "🛵 Motocicleta" | "🚲 Bicicleta" | "🚗 Automóvil";
  status: "Disponible" | "En Ruta" | "Inactivo";
  avatar: string;
}

export interface IngredientInventory {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  distance: string;
  cost: number;
  isActive: boolean;
}
