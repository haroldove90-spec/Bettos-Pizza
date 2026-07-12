/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, PizzaPrice, PizzaSize, Order } from "./types";

// Standard prices for specialty pizzas
const specialtyPrices: Record<PizzaSize, PizzaPrice> = {
  [PizzaSize.CH]: { standard: 245, orillaRellena: 280 },
  [PizzaSize.MED]: { standard: 290, orillaRellena: 340 },
  [PizzaSize.GDE]: { standard: 350, orillaRellena: 410 },
  [PizzaSize.FAM]: { standard: 375, orillaRellena: 440 },
  [PizzaSize.MEGA]: { standard: 600, orillaRellena: 670 }
};

export const INITIAL_PRODUCTS: Product[] = [
  // SPECIALTIES (21)
  {
    id: "esp_hawaiana_esp",
    name: "Hawaiana Especial",
    description: "Jamón, piña y cereza",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Jamón", "Piña", "Cereza"]
  },
  {
    id: "esp_carnivora",
    name: "Carnívora",
    description: "Carne molida, pimiento verde, pepperoni y tocino",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Carne molida", "Pimiento verde", "Pepperoni", "Tocino"]
  },
  {
    id: "esp_mexicana",
    name: "Mexicana",
    description: "Jamón, salami, chorizo, champiñones, jalapeños y lomo canadiense",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Jamón", "Salami", "Chorizo", "Champiñones", "Jalapeños", "Lomo canadiense"]
  },
  {
    id: "esp_al_pastor",
    name: "Al Pastor",
    description: "Carne al pastor, piña con cebolla",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Carne al pastor", "Piña", "Cebolla"]
  },
  {
    id: "esp_cubana",
    name: "Cubana",
    description: "Pepperoni, atún, tocino, jalapeños, jitomate y aguacate",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Pepperoni", "Atún", "Tocino", "Jalapeños", "Jitomate", "Aguacate"]
  },
  {
    id: "esp_azteca",
    name: "Azteca",
    description: "Chorizo, jalapeños, frijoles y tocino",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Chorizo", "Jalapeños", "Frijoles", "Tocino"]
  },
  {
    id: "esp_oaxaquena",
    name: "Oaxaqueña",
    description: "Mole, pollo, cecina y aguacate",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Mole", "Pollo", "Cecina", "Aguacate"]
  },
  {
    id: "esp_ranchera",
    name: "Ranchera",
    description: "Carne al pastor, chipotle, champiñón, aguacate, tocino, chorizo y frijol",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Carne al pastor", "Chipotle", "Champiñón", "Aguacate", "Tocino", "Chorizo", "Frijol"]
  },
  {
    id: "esp_carnes_frias",
    name: "Carnes Frías",
    description: "Pierna, salami, pepperoni y salchicha",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Pierna", "Salami", "Pepperoni", "Salchicha"]
  },
  {
    id: "esp_especial",
    name: "Especial",
    description: "Pierna, pollo, jalapeños y aguacate",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Pierna", "Pollo", "Jalapeños", "Aguacate"]
  },
  {
    id: "esp_veracruzana",
    name: "Veracruzana",
    description: "Champiñón, jalapeños, jitomate, cebolla, atún y aguacate",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Champiñón", "Jalapeños", "Jitomate", "Cebolla", "Atún", "Aguacate"]
  },
  {
    id: "esp_clasica",
    name: "Clásica",
    description: "Champiñón, pepperoni y jalapeño",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Champiñón", "Pepperoni", "Jalapeño"]
  },
  {
    id: "esp_combinada",
    name: "Combinada",
    description: "Jamón, salami, chorizo, cebolla, pimiento verde y champiñones",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Jamón", "Salami", "Chorizo", "Cebolla", "Pimiento verde", "Champiñones"]
  },
  {
    id: "esp_poblana",
    name: "Poblana",
    description: "Chile poblano, cebolla, pollo y crema",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Chile poblano", "Cebolla", "Pollo", "Crema"]
  },
  {
    id: "esp_hawaiana",
    name: "Hawaiana",
    description: "Jamón y piña",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Jamón", "Piña"]
  },
  {
    id: "esp_michoacana",
    name: "Michoacana",
    description: "Pollo, jitomate, jalapeños y aguacate",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Pollo", "Jitomate", "Jalapeños", "Aguacate"]
  },
  {
    id: "esp_vegetariana",
    name: "Vegetariana",
    description: "Pimiento verde, cebolla, champiñones, elote y aguacate",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Pimiento verde", "Cebolla", "Champiñones", "Elote", "Aguacate"]
  },
  {
    id: "esp_super_lujo",
    name: "Super Lujo",
    description: "Jamón, tocino, pepperoni y salchicha",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Jamón", "Tocino", "Pepperoni", "Salchicha"]
  },
  {
    id: "esp_bettos_casa",
    name: "Bettos de la Casa",
    description: "Atún, jalapeños, mayonesa y aguacate",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Atún", "Jalapeños", "Mayonesa", "Aguacate"]
  },
  {
    id: "esp_tropicana",
    name: "Tropicana",
    description: "Jamón, pierna, rajas poblanas, pollo y chorizo",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Jamón", "Pierna", "Rajas poblanas", "Pollo", "Chorizo"]
  },
  {
    id: "esp_veneciana",
    name: "Veneciana",
    description: "Jamón y salchicha",
    category: "Especialidad",
    prices: specialtyPrices,
    ingredients: ["Jamón", "Salchicha"]
  },

  // SINGLE INGREDIENTS & MARINE
  {
    id: "sing_carnes_frias",
    name: "Pizza Un Solo Ingrediente (Carnes Frías)",
    description: "Pizza clásica con tu ingrediente de carnes frías preferido",
    category: "Un Solo Ingrediente",
    prices: {
      [PizzaSize.CH]: { standard: 220, orillaRellena: 250 },
      [PizzaSize.MED]: { standard: 270, orillaRellena: 310 },
      [PizzaSize.GDE]: { standard: 325, orillaRellena: 375 },
      [PizzaSize.FAM]: { standard: 345, orillaRellena: 400 },
      [PizzaSize.MEGA]: { standard: 550, orillaRellena: 610 }
    }
  },
  {
    id: "sing_mariscos",
    name: "Pizza de Mariscos",
    description: "Con camarón, ostión o atún a elegir",
    category: "Un Solo Ingrediente",
    prices: {
      [PizzaSize.CH]: { standard: 255, orillaRellena: 285 },
      [PizzaSize.MED]: { standard: 300, orillaRellena: 345 },
      [PizzaSize.GDE]: { standard: 360, orillaRellena: 415 },
      [PizzaSize.FAM]: { standard: 390, orillaRellena: 450 },
      [PizzaSize.MEGA]: { standard: 575, orillaRellena: 645 }
    }
  },
  {
    id: "sing_marinera",
    name: "Betto's Marinera",
    description: "Camarones, ostión, atún, jalapeños, cebolla y aguacate",
    category: "Un Solo Ingrediente",
    prices: {
      [PizzaSize.CH]: { standard: 270, orillaRellena: 300 },
      [PizzaSize.MED]: { standard: 320, orillaRellena: 365 },
      [PizzaSize.GDE]: { standard: 400, orillaRellena: 455 },
      [PizzaSize.FAM]: { standard: 455, orillaRellena: 515 },
      [PizzaSize.MEGA]: { standard: 650, orillaRellena: 720 }
    }
  },

  // EMPANADAS
  {
    id: "emp_carnes_frias",
    name: "Empanadas de Carnes Frías (Orden de 3)",
    description: "Jamón, salami, pollo o champiñón",
    category: "Empanada",
    price: 180
  },
  {
    id: "emp_mariscos",
    name: "Empanadas de Mariscos (Orden de 3)",
    description: "Camarón, ostión o atún a elegir",
    category: "Empanada",
    price: 220
  },
  {
    id: "emp_papas",
    name: "Papas a la Francesa",
    description: "Papas fritas crujientes sazonadas",
    category: "Empanada",
    price: 58
  },
  {
    id: "emp_papas_queso",
    name: "Papas con Queso",
    description: "Papas fritas bañadas con delicioso queso fundido",
    category: "Empanada",
    price: 68
  },

  // HAMBURGUESAS & ANTOJITOS
  {
    id: "ham_sencilla",
    name: "Hamburguesa Sencilla",
    description: "Carne de res seleccionada, lechuga, jitomate, cebolla y aderezos",
    category: "Hamburguesa",
    price: 62
  },
  {
    id: "ham_con_papas",
    name: "Hamburguesa con Papas",
    description: "Hamburguesa clásica acompañada de papas a la francesa",
    category: "Hamburguesa",
    price: 83
  },
  {
    id: "ham_hawaiana",
    name: "Hamburguesa Hawaiana",
    description: "Hamburguesa de res con jamón, piña y queso fundido",
    category: "Hamburguesa",
    price: 78
  },
  {
    id: "ham_enchiladas",
    name: "Enchiladas Suizas",
    description: "Orden con salsa verde cremosa, pollo y queso gratinado",
    category: "Hamburguesa",
    price: 95
  },

  // SPAGHETTI
  {
    id: "spaghetti_normal",
    name: "Spaguetti Italiano",
    description: "Spaguetti italiano con salsa pomodoro clásica",
    category: "Spaghetti",
    price: 70
  },
  {
    id: "spaghetti_blanco",
    name: "Spaguetti Blanco con Jamón o Champiñón",
    description: "Crema blanca gourmet, jamón o champiñón y queso parmesano",
    category: "Spaghetti",
    price: 70
  },

  // BEVERAGES
  {
    id: "beb_600",
    name: "Refresco de 600 ml",
    description: "Refrescos variados de la familia Coca-Cola",
    category: "Bebida",
    price: 30
  },
  {
    id: "beb_2l",
    name: "Refresco de 2 Lts",
    description: "Refrescos familiares de la familia Coca-Cola",
    category: "Bebida",
    price: 40
  },

  // PROMO ESPECIAL
  {
    id: "promo_mega_pizza",
    name: "Mega Pizza Especial",
    description: "Nuestra Mega Pizza Especial + Refresco de 2 Lts. ¡Ya contamos con Hawaiana Especial!",
    category: "Especialidad",
    price: 370,
    isPromo: true
  },

  // SÚPER PAQUETES (14)
  {
    id: "paq_1",
    name: "PAQ. 1",
    description: "1- Pizza Grande, 1- Pizza Mediana, 1- Pizza Chica",
    category: "Paquete",
    price: 390
  },
  {
    id: "paq_2",
    name: "PAQ. 2",
    description: "1- Pizza Familiar, 1- Pizza Grande, 1- Pizza Chica",
    category: "Paquete",
    price: 405
  },
  {
    id: "paq_3",
    name: "PAQ. 3",
    description: "2- Pizzas Familiares + Refresco de 2 Lts. Gratis",
    category: "Paquete",
    price: 390
  },
  {
    id: "paq_4",
    name: "PAQ. 4",
    description: "3- Pizzas Familiares + Refresco de 2 Lts. Gratis",
    category: "Paquete",
    price: 480
  },
  {
    id: "paq_5",
    name: "PAQ. 5",
    description: "2- Pizzas Medianas + Refresco de 2 Lts. Gratis",
    category: "Paquete",
    price: 300
  },
  {
    id: "paq_6",
    name: "PAQ. 6",
    description: "3- Pizzas Grandes",
    category: "Paquete",
    price: 410
  },
  {
    id: "paq_7",
    name: "PAQ. 7",
    description: "2- Pizzas Familiares HAWAIANAS",
    category: "Paquete",
    price: 345
  },
  {
    id: "paq_8",
    name: "PAQ. 8",
    description: "1- Pizza Familiar, 1- Pizza Grande + Refresco de 2 Lts. Gratis",
    category: "Paquete",
    price: 370
  },
  {
    id: "paq_9",
    name: "PAQ. 9",
    description: "2- Pizzas Grandes + Refresco de 2 Lts. Gratis",
    category: "Paquete",
    price: 360
  },
  {
    id: "paq_10",
    name: "PAQ. 10",
    description: "1- Hamburguesa con papas, 1- Refresco de 600 ml",
    category: "Paquete",
    price: 135
  },
  {
    id: "paq_11",
    name: "PAQ. 11",
    description: "3- Pizzas Chicas",
    category: "Paquete",
    price: 300
  },
  {
    id: "paq_12",
    name: "PAQ. 12",
    description: "1- Pizza Grande, 1- Pizza Mediana + 1 Spaghetti",
    category: "Paquete",
    price: 325
  },
  {
    id: "paq_13",
    name: "PAQ. 13",
    description: "2- Pizzas Grandes HAWAIANAS",
    category: "Paquete",
    price: 320
  },
  {
    id: "paq_14",
    name: "PAQ. 14",
    description: "3- Pizzas Medianas",
    category: "Paquete",
    price: 375
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord_001",
    orderNumber: "0842",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    items: [
      {
        id: "item_001_1",
        productId: "esp_hawaiana_esp",
        name: "Hawaiana Especial",
        category: "Especialidad",
        quantity: 1,
        selectedSize: PizzaSize.GDE,
        orillaRellena: true,
        price: 410,
        notes: "Mucha piña por favor."
      },
      {
        id: "item_001_2",
        productId: "beb_2l",
        name: "Refresco de 2 Lts",
        category: "Bebida",
        quantity: 1,
        price: 40
      }
    ],
    total: 450,
    status: "En Cocina",
    type: "Domicilio",
    customerName: "Carlos Gómez",
    customerPhone: "5512345678",
    customerAddress: "Av. de los Maestros 123, Tlalnepantla",
    paymentMethod: "Efectivo"
  },
  {
    id: "ord_002",
    orderNumber: "0843",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    items: [
      {
        id: "item_002_1",
        productId: "paq_5",
        name: "PAQ. 5",
        category: "Paquete",
        quantity: 1,
        price: 300,
        notes: "Una Carnívora y una Mexicana para las medianas."
      }
    ],
    total: 300,
    status: "Pendiente",
    type: "Para Llevar",
    customerName: "Sonia Ruiz",
    customerPhone: "5587654321",
    paymentMethod: "Transferencia"
  },
  {
    id: "ord_003",
    orderNumber: "0841",
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // 50 mins ago
    items: [
      {
        id: "item_003_1",
        productId: "esp_carnivora",
        name: "Carnívora",
        category: "Especialidad",
        quantity: 1,
        selectedSize: PizzaSize.FAM,
        orillaRellena: false,
        price: 375
      },
      {
        id: "item_003_2",
        productId: "emp_papas_queso",
        name: "Papas con Queso",
        category: "Empanada",
        quantity: 2,
        price: 68
      }
    ],
    total: 511,
    status: "Listo",
    type: "POS Mesa",
    customerName: "Mesa 4 (POS)",
    paymentMethod: "Tarjeta"
  },
  {
    id: "ord_004",
    orderNumber: "0840",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 mins ago
    items: [
      {
        id: "item_004_1",
        productId: "promo_mega_pizza",
        name: "Mega Pizza Especial",
        category: "Especialidad",
        quantity: 1,
        price: 370
      }
    ],
    total: 370,
    status: "Entregado",
    type: "Domicilio",
    customerName: "Miguel Hernández",
    customerPhone: "5598765432",
    customerAddress: "Calle de la Amargura 45, Tlalnepantla",
    paymentMethod: "Transferencia"
  }
];
