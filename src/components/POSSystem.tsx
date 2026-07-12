/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  CreditCard, 
  DollarSign, 
  RefreshCw, 
  Layers, 
  Tag, 
  Grid, 
  List, 
  Sparkles,
  Printer,
  ChevronDown,
  Home,
  LogOut,
  Upload
} from "lucide-react";
import { Product, PizzaSize, Category, OrderItem, OrderType, Order } from "../types";
import { getStoredProducts, getStoredOrders, saveOrders, generateOrderNumber } from "../utils/pizzaStore";

interface POSSystemProps {
  onOrderPlaced?: () => void;
  onBackToHome?: () => void;
}

export default function POSSystem({ onOrderPlaced, onBackToHome }: POSSystemProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem("bettos_pos_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [mobileTab, setMobileTab] = useState<"menu" | "cart">("menu");
  
  // Checkout detail states
  const [customerName, setCustomerName] = useState<string>("Mesa 1 / Mostrador");
  const [orderType, setOrderType] = useState<OrderType>("POS Mesa");
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Tarjeta" | "Transferencia">("Efectivo");
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Worker profile states
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [posWorkerName, setPosWorkerName] = useState<string>(() => {
    return localStorage.getItem("bettos_pos_worker_name") || "Roberto 'Betto' Martínez";
  });
  const [posWorkerPhone, setPosWorkerPhone] = useState<string>(() => {
    return localStorage.getItem("bettos_pos_worker_phone") || "55 4912-3812";
  });
  const [posWorkerAvatar, setPosWorkerAvatar] = useState<string>(() => {
    return localStorage.getItem("bettos_pos_worker_avatar") || "👨‍🍳";
  });

  // Persist POS cart
  useEffect(() => {
    localStorage.setItem("bettos_pos_cart", JSON.stringify(cart));
  }, [cart]);

  // Load products
  useEffect(() => {
    setProducts(getStoredProducts().filter(p => p.isActive !== false));
    const handleUpdate = () => {
      setProducts(getStoredProducts().filter(p => p.isActive !== false));
    };
    window.addEventListener("bettos_pizza_db_update", handleUpdate);
    return () => window.removeEventListener("bettos_pizza_db_update", handleUpdate);
  }, []);

  const playChime = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, context.currentTime); // A4
      osc.frequency.setValueAtTime(554.37, context.currentTime + 0.1); // C#5
      osc.frequency.setValueAtTime(659.25, context.currentTime + 0.2); // E5
      gain.gain.setValueAtTime(0.12, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      osc.start();
      osc.stop(context.currentTime + 0.5);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const handleAddToCart = (product: Product, size?: PizzaSize, orilla?: boolean) => {
    let finalPrice = product.price || 0;
    if (product.prices && size) {
      const priceObj = product.prices[size];
      finalPrice = orilla ? priceObj.orillaRellena : priceObj.standard;
    }

    const cartItemId = `pos_${product.id}_${size || "std"}_${orilla ? "orilla" : "std"}`;
    
    // Check if matching item already exists in cart
    const existingIndex = cart.findIndex(item => 
      item.productId === product.id && 
      item.selectedSize === size && 
      item.orillaRellena === orilla
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      const newItem: OrderItem = {
        id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        productId: product.id,
        name: product.name,
        category: product.category,
        quantity: 1,
        selectedSize: size,
        orillaRellena: orilla,
        price: finalPrice
      };
      setCart([...cart, newItem]);
    }
    playChime();
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const toggleOrillaRellena = (itemId: string) => {
    setCart(cart.map(item => {
      if (item.id === itemId && item.selectedSize) {
        const prod = products.find(p => p.id === item.productId);
        if (!prod || !prod.prices) return item;
        const newOrilla = !item.orillaRellena;
        const priceObj = prod.prices[item.selectedSize];
        const newPrice = newOrilla ? priceObj.orillaRellena : priceObj.standard;
        return { ...item, orillaRellena: newOrilla, price: newPrice };
      }
      return item;
    }));
  };

  const handleNotesChange = (itemId: string, val: string) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        return { ...item, notes: val };
      }
      return item;
    }));
  };

  const getCartTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const total = getCartTotal();
    const newOrder: Order = {
      id: "ord_" + Date.now(),
      orderNumber: generateOrderNumber(),
      timestamp: new Date().toISOString(),
      items: cart,
      total,
      status: "Pendiente",
      type: orderType,
      customerName,
      paymentMethod,
      sellerId: "vendedor_pos_1"
    };

    const currentOrders = getStoredOrders();
    saveOrders([newOrder, ...currentOrders]);

    setLastPlacedOrder(newOrder);
    setCart([]);
    setCustomerName("Mesa " + (Math.floor(Math.random() * 8) + 2) + " / Mostrador");
    playChime();

    if (onOrderPlaced) onOrderPlaced();
  };

  // Filtered lists
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.ingredients && p.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchCategory && matchQuery;
  });

  return (
    <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col overflow-hidden font-sans pb-16 md:pb-0 relative">
      
      {/* POS Header */}
      <div className="bg-[#1f0824] border-b border-purple-950/60 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-lg gap-2 overflow-hidden shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ffd400] text-red-600 rounded-lg flex items-center justify-center font-display font-black text-sm sm:text-lg border border-red-500 shadow-inner shrink-0">
            BP
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-xs sm:text-sm md:text-base text-[#ffd400] leading-none tracking-tight whitespace-nowrap truncate">Betto's Pizza - POS Terminal</h2>
            <p className="text-[9px] sm:text-[10px] text-purple-300 font-mono mt-0.5 whitespace-nowrap truncate">VENDEDOR / CAJA ACTIVA</p>
          </div>
        </div>

        {/* Quick info / Action */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center space-x-2 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/30 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-slate-100 hover:text-white text-[11px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Mi Perfil de Vendedor"
          >
            <span className="text-sm">{posWorkerAvatar}</span>
            <span className="hidden sm:inline truncate max-w-[100px]">{posWorkerName.split(" ")[0]}</span>
          </button>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/30 text-red-200 hover:text-white text-[11px] sm:text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer shrink-0"
              title="Cambiar de Rol / Salir"
            >
              <LogOut size={13} sm:size={14} className="shrink-0" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}

          <div className="text-right hidden md:block">
            <p className="text-xs text-purple-200">Terminal #01</p>
            <p className="text-[9px] text-green-400 font-mono flex items-center justify-end">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> CONECTADO
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Product Grid */}
        <div className={`flex-1 flex flex-col p-3.5 sm:p-4 overflow-hidden ${mobileTab === "menu" ? "flex" : "hidden md:flex"}`}>
          {/* Search bar */}
          <div className="relative mb-2.5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Buscar producto o ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-200 font-bold"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Local Categories Filter Chips inside Left Workspace */}
          <div className="flex space-x-1.5 overflow-x-auto pb-2.5 mb-1.5 no-scrollbar shrink-0">
            {["All", "Especialidad", "Un Solo Ingrediente", "Paquete", "Hamburguesa", "Empanada", "Spaghetti", "Bebida"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#ffd400] text-slate-900 shadow-sm font-black"
                    : "bg-slate-800/90 text-slate-300 hover:bg-slate-700/80 border border-slate-700/40"
                }`}
              >
                {cat === "All" ? "Todo" : cat}
              </button>
            ))}
          </div>

          {/* Grid Container */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/40 hover:border-purple-900/60 flex flex-col justify-between space-y-3.5 shadow-sm transition-all relative overflow-hidden group"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] uppercase tracking-wider text-purple-300 font-mono bg-[#3C0F4A] px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                      {product.isPromo && (
                        <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">PROMO</span>
                      )}
                    </div>
                    
                    <h3 className="font-display font-bold text-sm text-slate-100 mt-2 truncate group-hover:text-[#ffd400] transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Add action depending on type */}
                  {product.prices ? (
                    /* Customizable Pizza Sizes Grid for fast POS insertion */
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Añadir Tamaño:</p>
                      <div className="grid grid-cols-5 gap-1">
                        {(Object.keys(product.prices) as PizzaSize[]).map(size => {
                          const priceObj = product.prices![size];
                          return (
                            <button
                              key={size}
                              onClick={() => handleAddToCart(product, size, false)}
                              className="bg-slate-700/60 hover:bg-[#3C0F4A] hover:text-[#ffd400] text-slate-200 py-1.5 rounded-lg text-[9px] font-black transition-all flex flex-col items-center"
                              title={`$${priceObj.standard}`}
                            >
                              <span>{size}</span>
                              <span className="text-[8px] opacity-75 font-medium mt-0.5">${priceObj.standard}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Simple fixed price product click */
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-bold text-[#ffd400] font-mono">
                        ${product.price}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-slate-700 hover:bg-[#ffd400] hover:text-slate-900 text-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all"
                      >
                        <Plus size={12} />
                        <span>Añadir</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-slate-500 text-xs">
                No se encontraron productos que coincidan con los filtros.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: POS Checkout panel / Cart */}
        <div className={`w-full md:w-[380px] bg-[#1a0e1e] md:border-l border-purple-950/60 flex flex-col justify-between overflow-hidden ${mobileTab === "cart" ? "flex" : "hidden md:flex"} relative`}>
          
          {/* Cart Header */}
          <div className="p-4 border-b border-purple-950/40 bg-purple-950/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShoppingBag size={18} className="text-[#ffd400]" />
                <h3 className="font-display font-bold text-sm text-slate-100">Orden Activa</h3>
              </div>
              <button 
                onClick={() => setCart([])}
                className="text-xs text-purple-400 hover:text-red-400 transition-colors"
                disabled={cart.length === 0}
              >
                Vaciar
              </button>
            </div>

            {/* Quick config fields */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <label className="text-[9px] font-mono text-purple-300 block mb-1 uppercase">CLIENTE / MESA</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/60 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-purple-300 block mb-1 uppercase">TIPO</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as OrderType)}
                  className="w-full bg-slate-800/80 border border-slate-700/60 rounded-lg px-1.5 py-1 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="POS Mesa">Mesa (Local)</option>
                  <option value="Para Llevar">Para Llevar</option>
                  <option value="Domicilio">A Domicilio</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cart items list - padded heavily to prevent items from being hidden under the floating checkout card */}
          <div className="flex-1 overflow-y-auto p-4 pb-[245px] sm:pb-[255px] md:pb-[265px] space-y-3 scrollbar-thin">
            {cart.map(item => (
              <div 
                key={item.id} 
                className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30 space-y-2 relative"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-100 truncate">{item.name}</h4>
                    <p className="text-[10px] text-purple-300 mt-0.5">
                      {item.selectedSize ? `Tamaño: ${item.selectedSize}` : "Estándar"}
                    </p>
                  </div>
                  
                  <span className="text-xs font-bold font-mono text-red-400 shrink-0">
                    ${item.price * item.quantity}
                  </span>
                </div>

                {/* Inline customization toggle for Pizzas */}
                {item.selectedSize && (
                  <div className="flex items-center justify-between bg-slate-800/60 px-2 py-1.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => toggleOrillaRellena(item.id)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all ${
                        item.orillaRellena 
                          ? "bg-purple-600 text-[#ffd400]" 
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {item.orillaRellena ? "★ Orilla Rellena (Activo)" : "☆ Activar Orilla Rellena"}
                    </button>
                    <span className="text-[8px] text-slate-400">+$35 a +$70</span>
                  </div>
                )}

                {/* Custom Notes */}
                <input
                  type="text"
                  placeholder="Nota (ej. sin cebolla, dorada)..."
                  value={item.notes || ""}
                  onChange={(e) => handleNotesChange(item.id, e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/30 rounded-lg px-2 py-1 text-[10px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-600"
                />

                {/* Quantity and trash control */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/30">
                  <div className="flex items-center bg-slate-700/60 rounded-lg p-0.5">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 text-slate-300 hover:text-white"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-xs font-bold px-2 text-slate-100">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 text-slate-300 hover:text-white"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-400 p-1"
                    title="Eliminar artículo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="text-center py-24 text-slate-500 text-xs">
                No hay productos en el carrito.<br />
                Haz clic en los tamaños de las pizzas o en los botones de agregar para comenzar.
              </div>
            )}
          </div>

          {/* Floating/Sticky Cart Footer / Totals and checkout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#140a18]/95 backdrop-blur-md border-t border-purple-950/80 rounded-t-2xl space-y-4 shadow-[0_-12px_32px_rgba(0,0,0,0.85)] z-20">
            
            {/* Payment Method toggle */}
            <div>
              <label className="text-[9px] font-mono text-purple-300 block mb-1 uppercase">MÉTODO DE PAGO</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "Efectivo", icon: <DollarSign size={11} />, label: "Efectivo" },
                  { id: "Tarjeta", icon: <CreditCard size={11} />, label: "Tarjeta" },
                  { id: "Transferencia", icon: <RefreshCw size={11} />, label: "Transf." }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id as any)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 border transition-all ${
                      paymentMethod === p.id 
                        ? "bg-[#ffd400] text-slate-900 border-[#ffd400]" 
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {p.icon}
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Artículos:</span>
                <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-100 text-base pt-1 border-t border-slate-700/50">
                <span>Total a Cobrar:</span>
                <span className="text-[#ffd400] font-mono">${getCartTotal()}</span>
              </div>
            </div>

            {/* Big Green Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl font-display font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-all ${
                cart.length === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98]"
              }`}
            >
              <span>COBRAR ORDEN 🍕</span>
            </button>

            {/* Print mock invoice of last placed order */}
            {lastPlacedOrder && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 p-2 rounded-lg border border-slate-700/60 flex items-center justify-between text-[10px] text-slate-300"
              >
                <span>Último Ticket: #{lastPlacedOrder.orderNumber}</span>
                <button 
                  onClick={() => alert(`Imprimiendo Ticket de Compra para ${lastPlacedOrder.customerName} - Total: $${lastPlacedOrder.total}`)}
                  className="text-[#ffd400] flex items-center space-x-1 hover:underline"
                >
                  <Printer size={11} />
                  <span>Imprimir</span>
                </button>
              </motion.div>
            )}
          </div>

        </div>

      </div>

      {/* Navigation action bar for mobile/tablet only */}
      <div className="md:hidden bg-[#1f0824] border-t border-purple-950/60 py-2.5 px-4 flex justify-around items-center text-slate-400 z-30 shadow-md shrink-0 fixed bottom-0 left-0 right-0 h-16">
        <button 
          onClick={() => setMobileTab("menu")}
          className={`flex flex-col items-center space-y-0.5 transition-colors ${mobileTab === "menu" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <Layers size={16} />
          <span className="text-[9px] font-bold">Ver Menú</span>
        </button>
        
        <button 
          onClick={() => setMobileTab("cart")}
          className={`flex flex-col items-center space-y-0.5 relative transition-colors ${mobileTab === "cart" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <div className="relative">
            <ShoppingBag size={16} />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-slate-950">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold">Ver Orden</span>
        </button>
      </div>

      {/* Worker Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-purple-950 text-slate-100 rounded-2xl p-5 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-purple-950/80 mb-4">
                <div className="flex items-center space-x-2">
                  <User size={18} className="text-[#ffd400]" />
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#ffd400]">Mi Perfil (Vendedor)</h3>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Avatar selection */}
                <div className="flex items-center gap-4 bg-slate-950/40 p-3 rounded-xl border border-purple-950/60">
                  <div className="w-16 h-16 rounded-full bg-purple-950/60 border border-purple-500/50 flex items-center justify-center text-3xl shadow-inner">
                    {posWorkerAvatar}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-bold text-slate-200">Avatar del Colaborador</p>
                    <p className="text-[10px] text-slate-400">Selecciona tu emoji de cajero:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {["👨‍🍳", "👩‍🍳", "👨‍💼", "👩‍💼", "🍕", "🔥", "💼"].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setPosWorkerAvatar(emoji)}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs transition-all ${
                            posWorkerAvatar === emoji
                              ? "bg-purple-900/60 border-purple-400 scale-110 shadow-sm"
                              : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Nombre del Empleado</label>
                  <input
                    type="text"
                    value={posWorkerName}
                    onChange={(e) => setPosWorkerName(e.target.value)}
                    placeholder="Tu nombre y apellido"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-600 transition-all font-medium"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={posWorkerPhone}
                    onChange={(e) => setPosWorkerPhone(e.target.value)}
                    placeholder="Ej: 55 4912-3812"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-600 transition-all font-medium"
                  />
                </div>

                {/* Role Info */}
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-purple-950 text-[10px] text-slate-400 space-y-1">
                  <p>🔑 <strong>Rol asignado:</strong> Vendedor de Piso y Cajero Principal</p>
                  <p>📍 <strong>Sucursal:</strong> Betto's Pizza Sede Central</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("bettos_pos_worker_name", posWorkerName);
                    localStorage.setItem("bettos_pos_worker_phone", posWorkerPhone);
                    localStorage.setItem("bettos_pos_worker_avatar", posWorkerAvatar);
                    setShowProfileModal(false);
                    window.dispatchEvent(new Event("bettos_pizza_db_update"));
                  }}
                  className="w-full py-2.5 bg-[#ffd400] hover:bg-yellow-300 text-slate-950 font-display font-black text-xs uppercase rounded-xl shadow-md transition-all mt-2"
                >
                  Guardar Perfil de Trabajo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
