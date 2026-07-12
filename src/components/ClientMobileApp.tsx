/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Phone, 
  MapPin, 
  Clock, 
  Plus, 
  Minus, 
  X, 
  ChevronRight, 
  Check, 
  ArrowLeft, 
  Sparkles,
  Info,
  Bike
} from "lucide-react";
import { Product, PizzaSize, Category, OrderItem, OrderType, Order } from "../types";
import { getStoredProducts, getStoredOrders, saveOrders, generateOrderNumber } from "../utils/pizzaStore";

interface ClientMobileAppProps {
  onOrderPlaced?: () => void;
}

export default function ClientMobileApp({ onOrderPlaced }: ClientMobileAppProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Especialidad");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Customization state
  const [selectedSize, setSelectedSize] = useState<PizzaSize>(PizzaSize.GDE);
  const [orillaRellena, setOrillaRellena] = useState<boolean>(false);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");

  // Navigation state
  const [viewState, setViewState] = useState<"menu" | "cart" | "status">("menu");
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);

  // Checkout form state
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [orderType, setOrderType] = useState<OrderType>("Para Llevar");
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Tarjeta" | "Transferencia">("Efectivo");
  
  // Audio sound simulation
  const playPing = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, context.currentTime); // D5 note
      gain.gain.setValueAtTime(0.1, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
      osc.start();
      osc.stop(context.currentTime + 0.4);
    } catch (e) {
      console.log("Audio not supported or interaction blocked");
    }
  };

  useEffect(() => {
    setProducts(getStoredProducts());
    
    // Load existing orders of this client (simulated by finding ones placed in local session)
    const stored = getStoredOrders();
    const clientSaved = localStorage.getItem("bettos_client_orders");
    if (clientSaved) {
      const ids = JSON.parse(clientSaved) as string[];
      setPlacedOrders(stored.filter(o => ids.includes(o.id)));
    }

    const handleUpdate = () => {
      setProducts(getStoredProducts());
      const updatedOrders = getStoredOrders();
      if (clientSaved) {
        const ids = JSON.parse(clientSaved) as string[];
        setPlacedOrders(updatedOrders.filter(o => ids.includes(o.id)));
      }
    };

    window.addEventListener("bettos_pizza_db_update", handleUpdate);
    return () => window.removeEventListener("bettos_pizza_db_update", handleUpdate);
  }, []);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(PizzaSize.GDE);
    setOrillaRellena(false);
    setItemQuantity(1);
    setNotes("");
  };

  const getPizzaPrice = (product: Product, size: PizzaSize, orilla: boolean) => {
    if (!product.prices) return product.price || 0;
    const priceObj = product.prices[size];
    return orilla ? priceObj.orillaRellena : priceObj.standard;
  };

  const addToCart = () => {
    if (!selectedProduct) return;

    let finalPrice = selectedProduct.price || 0;
    if (selectedProduct.prices) {
      finalPrice = getPizzaPrice(selectedProduct, selectedSize, orillaRellena);
    }

    const newItem: OrderItem = {
      id: "item_" + Date.now(),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      category: selectedProduct.category,
      quantity: itemQuantity,
      selectedSize: selectedProduct.prices ? selectedSize : undefined,
      orillaRellena: selectedProduct.prices ? orillaRellena : undefined,
      notes: notes.trim() !== "" ? notes : undefined,
      price: finalPrice
    };

    setCart([...cart, newItem]);
    setSelectedProduct(null);
    playPing();
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const getCartTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName || !customerPhone) {
      alert("Por favor completa tu nombre y teléfono.");
      return;
    }
    if (orderType === "Domicilio" && !customerAddress) {
      alert("Por favor ingresa tu dirección para el envío.");
      return;
    }

    const total = getCartTotal();
    if (orderType === "Domicilio" && total < 200) {
      alert("El consumo mínimo para servicio a domicilio es de $200 pesos.");
      return;
    }

    const newOrder: Order = {
      id: "ord_" + Date.now(),
      orderNumber: generateOrderNumber(),
      timestamp: new Date().toISOString(),
      items: cart,
      total,
      status: "Pendiente",
      type: orderType,
      customerName,
      customerPhone,
      customerAddress: orderType === "Domicilio" ? customerAddress : undefined,
      paymentMethod
    };

    const currentOrders = getStoredOrders();
    const updatedOrders = [newOrder, ...currentOrders];
    saveOrders(updatedOrders);

    // Save this order's ID in local storage to track client order history
    const clientSaved = localStorage.getItem("bettos_client_orders");
    const clientIds = clientSaved ? JSON.parse(clientSaved) as string[] : [];
    clientIds.push(newOrder.id);
    localStorage.setItem("bettos_client_orders", JSON.stringify(clientIds));

    // Update state
    setPlacedOrders([newOrder, ...placedOrders]);
    setCart([]);
    setViewState("status");
    playPing();

    if (onOrderPlaced) onOrderPlaced();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente": return "bg-amber-100 text-amber-800 border-amber-200";
      case "En Cocina": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Listo": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Entregado": return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Filter products by active tab
  const filteredProducts = products.filter(p => p.category === activeTab && !p.isPromo);
  const promoProduct = products.find(p => p.isPromo);

  return (
    <div className="relative mx-auto max-w-[390px] w-full bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 aspect-[9/19.5] flex flex-col overflow-hidden">
      {/* Notch / Speaker bar of mobile */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
        <div className="w-16 h-1 bg-slate-800 rounded-full mb-1"></div>
        <div className="absolute right-4 w-2 h-2 rounded-full bg-slate-900 border border-slate-800/80 mb-1"></div>
      </div>

      {/* Screen area */}
      <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden flex flex-col text-slate-800 relative select-none">
        
        {/* Status Bar */}
        <div className="h-9 pt-2.5 px-6 flex justify-between items-center bg-[#2C0C30] text-slate-200 text-xs font-medium z-30">
          <span>12:00 PM</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] px-1 bg-[#ffd400] text-slate-900 font-bold rounded">5G</span>
            <div className="w-5 h-2.5 border border-slate-300 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-4 bg-[#ffd400] rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Pizzeria branding header */}
        <div className="bg-[#2C0C30] text-white px-4 py-3 shadow-md relative z-20 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-yellow-400 rounded-full border-2 border-red-500 flex items-center justify-center shadow-md font-bold text-red-600 text-xs tracking-tighter">
                BETTO
              </div>
              <div>
                <h1 className="font-display font-bold text-base text-[#ffd400] tracking-tight leading-none">Betto's Pizza</h1>
                <p className="text-[9px] text-yellow-300/80 flex items-center mt-0.5 font-medium">
                  <Clock size={8} className="mr-0.5" /> 12:00 PM A 10:30 PM
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setViewState("status")}
                className="relative p-1.5 bg-[#4a1d5c] hover:bg-[#5e2974] rounded-full transition-colors text-white"
                title="Mis Pedidos"
              >
                <Bike size={16} />
                {placedOrders.some(o => o.status !== "Entregado") && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
                )}
              </button>

              <button 
                onClick={() => setViewState("cart")}
                className="relative p-1.5 bg-[#ffd400] text-slate-950 font-bold rounded-full hover:bg-yellow-300 transition-colors"
              >
                <ShoppingBag size={16} />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-display text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-purple-950 text-[10px] text-slate-300">
            <span className="flex items-center text-yellow-200">
              <MapPin size={9} className="mr-1 text-red-500" /> Tlane, Edo. de México
            </span>
            <span className="flex items-center font-bold text-white">
              <Phone size={9} className="mr-1 text-green-400" /> 55 1326-5826
            </span>
          </div>
        </div>

        {/* Client View Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <AnimatePresence mode="wait">
            
            {/* 1. MENU VIEW */}
            {viewState === "menu" && (
              <motion.div
                key="menu-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pb-20"
              >
                {/* Promo Card: Mega Pizza */}
                {promoProduct && (
                  <div className="p-3">
                    <div 
                      onClick={() => handleOpenProduct(promoProduct)}
                      className="bg-gradient-to-r from-red-600 to-amber-500 rounded-2xl p-3.5 text-white shadow-md relative overflow-hidden cursor-pointer group"
                    >
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                      <span className="bg-yellow-400 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        ¡Súper Promo!
                      </span>
                      <h3 className="font-display font-black text-lg leading-tight mt-1">¡MEGA PIZZA!</h3>
                      <p className="text-white/90 text-xs mt-0.5 font-medium">Incluye Refresco de 2 Litros Gratis</p>
                      
                      <div className="flex items-end justify-between mt-3">
                        <div className="bg-slate-950/30 px-2 py-1 rounded-lg backdrop-blur-xs">
                          <p className="text-[10px] text-yellow-200 leading-none">Hawaiana Especial, Carnívora...</p>
                          <p className="text-[9px] text-white/70">Cualquier especialidad</p>
                        </div>
                        <span className="font-display font-extrabold text-2xl text-yellow-300">
                          $370
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories Tab Bar */}
                <div className="sticky top-0 bg-slate-50 z-10 flex overflow-x-auto px-3 py-2 border-b border-slate-200/60 no-scrollbar space-x-1.5">
                  {[
                    { id: "Especialidad", label: "🍕 Especialidades" },
                    { id: "Un Solo Ingrediente", label: "🍕 1 Ingrediente" },
                    { id: "Paquete", label: "📦 Paquetes Familiares" },
                    { id: "Hamburguesa", label: "🍔 Burgers & Más" },
                    { id: "Empanada", label: "🥟 Empanadas/Papas" },
                    { id: "Spaghetti", label: "🍝 Spaguetti" },
                    { id: "Bebida", label: "🥤 Bebidas" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-[#3B0D4B] text-white shadow-sm"
                          : "bg-slate-200/70 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Title Header for selected Category */}
                <div className="px-4 pt-3 flex items-center justify-between">
                  <h2 className="font-display font-bold text-sm uppercase tracking-wide text-[#3B0D4B]">
                    {activeTab === "Especialidad" ? "Especialidades al 2x1" : activeTab}
                  </h2>
                  {activeTab === "Especialidad" && (
                    <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full border border-red-200">
                      2X1 TODOS LOS DÍAS
                    </span>
                  )}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-3 px-3 mt-2.5">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => handleOpenProduct(product)}
                      className="bg-white rounded-xl p-3 border border-slate-200/60 hover:border-purple-300 hover:shadow-sm transition-all duration-200 cursor-pointer flex justify-between items-start gap-2.5 group"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-xs text-slate-900 group-hover:text-purple-900 transition-colors truncate">
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {product.prices ? (
                            <span className="text-xs font-bold text-red-600">
                              Desde ${product.prices[PizzaSize.CH].standard}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-red-600">
                              ${product.price}
                            </span>
                          )}
                          {product.prices && (
                            <span className="text-[8px] text-slate-400">CH, MED, GDE, FAM, MEGA</span>
                          )}
                        </div>
                      </div>

                      {/* Add button indicator */}
                      <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#ffd400] text-slate-600 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                        <Plus size={14} />
                      </div>
                    </div>
                  ))}

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No hay productos registrados en esta categoría.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 2. CART VIEW */}
            {viewState === "cart" && (
              <motion.div
                key="cart-screen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 pb-24"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <button 
                    onClick={() => setViewState("menu")}
                    className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h2 className="font-display font-bold text-base text-slate-900">Mi Carrito</h2>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <ShoppingBag size={48} className="mx-auto text-slate-300 mb-2.5" />
                    <p className="text-xs font-medium">Tu carrito está vacío</p>
                    <button 
                      onClick={() => setViewState("menu")}
                      className="mt-3.5 px-4 py-2 bg-[#3B0D4B] text-white text-xs font-semibold rounded-full shadow-sm hover:bg-purple-950 transition-all"
                    >
                      Ver la Carta
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Item list */}
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {cart.map(item => (
                        <div key={item.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-bold text-slate-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-[9px] text-slate-500 leading-none mt-0.5">
                              {item.selectedSize ? `Tamaño: ${item.selectedSize}` : "Estándar"}
                              {item.orillaRellena ? " (+ Orilla Rellena)" : ""}
                            </p>
                            {item.notes && (
                              <p className="text-[9px] text-amber-600 truncate mt-0.5">
                                "{item.notes}"
                              </p>
                            )}
                            <p className="text-xs font-bold text-red-600 mt-1">
                              ${item.price * item.quantity}
                            </p>
                          </div>

                          {/* Quantity control */}
                          <div className="flex items-center bg-slate-100 rounded-full p-0.5">
                            <button 
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="p-1 text-slate-600 hover:text-slate-900"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-[10px] font-bold px-1.5">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="p-1 text-slate-600 hover:text-slate-900"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Delete button */}
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Order Details Form */}
                    <form onSubmit={handlePlaceOrder} className="mt-4 border-t border-slate-200/80 pt-4 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nombre para Entrega</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ej. Juan Pérez"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Celular / Teléfono</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="Ej. 5512345678"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Forma de Pago</label>
                          <select 
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-purple-600"
                          >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta Bancaria</option>
                            <option value="Transferencia">Transferencia</option>
                          </select>
                        </div>
                      </div>

                      {/* Delivery Toggle */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tipo de Entrega</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setOrderType("Para Llevar")}
                            className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              orderType === "Para Llevar" 
                                ? "bg-[#3B0D4B] border-[#3B0D4B] text-white" 
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            Recoger en Sucursal
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderType("Domicilio")}
                            className={`py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center space-x-1 ${
                              orderType === "Domicilio" 
                                ? "bg-[#3B0D4B] border-[#3B0D4B] text-white" 
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            <Bike size={12} />
                            <span>A Domicilio</span>
                          </button>
                        </div>
                      </div>

                      {orderType === "Domicilio" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="overflow-hidden"
                        >
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Dirección de Entrega</label>
                          <textarea 
                            required
                            rows={2}
                            placeholder="Calle, Número, Colonia y Referencias..."
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-purple-600"
                          />
                        </motion.div>
                      )}

                      {/* Validation Warn / Fee note */}
                      {orderType === "Domicilio" && getCartTotal() < 200 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start space-x-2 text-amber-800">
                          <Info size={14} className="mt-0.5 shrink-0" />
                          <div className="text-[9px] leading-tight">
                            <p className="font-bold">Mínimo para Domicilio: $200</p>
                            <p className="text-amber-700 mt-0.5">Te faltan <span className="font-bold">${200 - getCartTotal()}</span> para completar el monto.</p>
                          </div>
                        </div>
                      )}

                      {/* Summary calculations */}
                      <div className="bg-slate-100 rounded-xl p-3 text-slate-600 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${getCartTotal()}</span>
                        </div>
                        {orderType === "Domicilio" && (
                          <div className="flex justify-between text-slate-500">
                            <span>Costo de envío:</span>
                            <span className="text-green-600 font-medium">¡GRATIS!</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 mt-1 text-sm">
                          <span>Total:</span>
                          <span className="text-red-600">${getCartTotal()}</span>
                        </div>
                      </div>

                      {/* Submit Order Button */}
                      <button
                        type="submit"
                        disabled={orderType === "Domicilio" && getCartTotal() < 200}
                        className={`w-full py-2.5 rounded-xl font-display font-bold text-sm text-center shadow-md transition-all ${
                          orderType === "Domicilio" && getCartTotal() < 200
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                            : "bg-[#ffd400] text-slate-950 hover:bg-yellow-300"
                        }`}
                      >
                        {orderType === "Domicilio" && getCartTotal() < 200
                          ? "Monto mínimo no alcanzado"
                          : "Confirmar Pedido 🍕"}
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. STATUS VIEW */}
            {viewState === "status" && (
              <motion.div
                key="status-screen"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 pb-20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setViewState("menu")}
                      className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <h2 className="font-display font-bold text-base text-slate-900">Mis Pedidos</h2>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setProducts(getStoredProducts());
                      const updated = getStoredOrders();
                      const clientSaved = localStorage.getItem("bettos_client_orders");
                      if (clientSaved) {
                        const ids = JSON.parse(clientSaved) as string[];
                        setPlacedOrders(updated.filter(o => ids.includes(o.id)));
                      }
                    }}
                    className="text-[10px] font-bold text-purple-700 hover:underline"
                  >
                    Actualizar
                  </button>
                </div>

                {placedOrders.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 text-xs">
                    <Bike size={44} className="mx-auto text-slate-200 mb-2.5" />
                    <p>No has realizado ningún pedido aún.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {placedOrders.map(order => (
                      <div key={order.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-2">
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono">Pedido #{order.orderNumber}</span>
                            <h4 className="text-[11px] font-bold text-slate-900 leading-tight">
                              {order.items.length} {order.items.length === 1 ? "artículo" : "artículos"}
                            </h4>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Order Timeline Stepper */}
                        <div className="grid grid-cols-4 gap-1.5 text-center mt-3 relative mb-3">
                          {/* horizontal line bar */}
                          <div className="absolute top-[7px] left-[12%] right-[12%] h-[2px] bg-slate-200 -z-1">
                            <div 
                              className="h-full bg-green-500 transition-all duration-300"
                              style={{
                                width: order.status === "Pendiente" ? "0%" :
                                       order.status === "En Cocina" ? "33%" :
                                       order.status === "Listo" ? "66%" : "100%"
                              }}
                            ></div>
                          </div>

                          {[
                            { name: "Recibido", active: true },
                            { name: "Cocina", active: order.status !== "Pendiente" },
                            { name: "¡Listo!", active: order.status === "Listo" || order.status === "Entregado" },
                            { name: "Entregado", active: order.status === "Entregado" }
                          ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] border transition-colors ${
                                step.active 
                                  ? "bg-green-500 border-green-500 text-white" 
                                  : "bg-white border-slate-300 text-slate-400"
                              }`}>
                                {step.active ? "✓" : idx + 1}
                              </div>
                              <span className={`text-[8px] font-semibold mt-1 transition-colors ${
                                step.active ? "text-green-600 font-bold" : "text-slate-400"
                              }`}>
                                {step.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 border-t border-slate-100 pt-2">
                          <span>Total pagado:</span>
                          <span className="font-bold text-red-600 text-xs">${order.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* 4. PRODUCT CUSTOMIZATION MODAL (INSIDE MOBILE SCREEN) */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-40 flex flex-end flex-col"
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="bg-white rounded-t-[32px] max-h-[85%] overflow-y-auto p-4 flex flex-col space-y-3.5 pb-8"
              >
                {/* Drag handle */}
                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-1"></div>

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-purple-700 font-bold">
                      {selectedProduct.category}
                    </span>
                    <h3 className="font-display font-bold text-sm text-slate-900 leading-tight">
                      {selectedProduct.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-[10px] text-slate-500">
                  {selectedProduct.description}
                </p>

                {/* Pizza Size Configuration */}
                {selectedProduct.prices && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase">Selecciona el Tamaño</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(Object.keys(selectedProduct.prices) as PizzaSize[]).map(size => {
                        const isSelected = selectedSize === size;
                        const pricesObj = selectedProduct.prices![size];
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#3B0D4B] border-[#3B0D4B] text-white"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <span className="text-xs font-black leading-none">{size}</span>
                            <span className={`text-[8px] mt-1 font-medium ${isSelected ? "text-yellow-300" : "text-slate-500"}`}>
                              ${pricesObj.standard}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pizza Crust Configuration */}
                {selectedProduct.prices && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase">Especialidad de la Orilla</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrillaRellena(false)}
                        className={`p-2.5 rounded-xl border flex flex-col text-left transition-all ${
                          !orillaRellena
                            ? "bg-purple-50/75 border-[#3B0D4B] text-slate-900 ring-1 ring-[#3B0D4B]"
                            : "bg-white border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="text-xs font-bold">Orilla Normal</span>
                        <span className="text-[8px] text-slate-400 mt-0.5">La receta tradicional crujiente.</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setOrillaRellena(true)}
                        className={`p-2.5 rounded-xl border flex flex-col text-left transition-all ${
                          orillaRellena
                            ? "bg-purple-50/75 border-[#3B0D4B] text-slate-900 ring-1 ring-[#3B0D4B]"
                            : "bg-white border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="text-xs font-bold text-purple-900 flex items-center">
                          Orilla Rellena 🌟
                        </span>
                        <span className="text-[8px] text-purple-700/80 font-medium mt-0.5">
                          Queso fundido + Ajonjolí (+${selectedProduct.prices[selectedSize].orillaRellena - selectedProduct.prices[selectedSize].standard})
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Notas especiales</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Sin cebolla, bien doradita, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>

                {/* Bottom section with quantity & total */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                  <div className="flex items-center bg-slate-100 rounded-full p-1">
                    <button 
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      className="w-7 h-7 bg-white hover:bg-slate-50 rounded-full shadow-xs flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold px-3 text-slate-800">{itemQuantity}</span>
                    <button 
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                      className="w-7 h-7 bg-white hover:bg-slate-50 rounded-full shadow-xs flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block leading-none">Total</span>
                    <span className="font-display font-extrabold text-lg text-red-600">
                      ${(selectedProduct.prices 
                        ? getPizzaPrice(selectedProduct, selectedSize, orillaRellena)
                        : (selectedProduct.price || 0)
                      ) * itemQuantity}
                    </span>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={addToCart}
                  className="w-full py-2.5 bg-[#ffd400] text-slate-950 font-display font-extrabold text-xs rounded-xl shadow-md hover:bg-yellow-300 transition-all flex items-center justify-center space-x-1.5"
                >
                  <ShoppingBag size={14} />
                  <span>Añadir al Pedido</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation bar */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-white border-t border-slate-200 px-6 flex justify-around items-center text-slate-400 z-30 rounded-b-[38px]">
          <button 
            onClick={() => setViewState("menu")}
            className={`flex flex-col items-center space-y-0.5 ${viewState === "menu" ? "text-purple-900" : "hover:text-slate-600"}`}
          >
            <span className="text-[14px]">🍕</span>
            <span className="text-[9px] font-bold">Carta</span>
          </button>
          
          <button 
            onClick={() => setViewState("cart")}
            className={`flex flex-col items-center space-y-0.5 relative ${viewState === "cart" ? "text-purple-900" : "hover:text-slate-600"}`}
          >
            <ShoppingBag size={16} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 bg-red-600 rounded-full border border-white animate-pulse"></span>
            )}
            <span className="text-[9px] font-bold">Carrito</span>
          </button>

          <button 
            onClick={() => setViewState("status")}
            className={`flex flex-col items-center space-y-0.5 relative ${viewState === "status" ? "text-purple-900" : "hover:text-slate-600"}`}
          >
            <Bike size={16} />
            {placedOrders.some(o => o.status !== "Entregado") && (
              <span className="absolute top-0 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></span>
            )}
            <span className="text-[9px] font-bold">Rastreo</span>
          </button>
        </div>

      </div>
    </div>
  );
}
