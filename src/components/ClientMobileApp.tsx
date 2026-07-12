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
  Bike,
  Home,
  LogOut
} from "lucide-react";
import { Product, PizzaSize, Category, OrderItem, OrderType, Order } from "../types";
import { getStoredProducts, getStoredOrders, saveOrders, generateOrderNumber } from "../utils/pizzaStore";

interface ClientMobileAppProps {
  onOrderPlaced?: () => void;
  onBackToHome?: () => void;
}

export default function ClientMobileApp({ onOrderPlaced, onBackToHome }: ClientMobileAppProps) {
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
    <div className="w-full flex-1 bg-slate-50 text-slate-800 flex flex-col relative select-none">
      
      {/* Pizzeria branding header */}
      <div className="bg-[#2C0C30] text-white px-3 sm:px-4 md:px-6 py-3.5 shadow-md relative z-20 flex flex-col shrink-0">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full border-2 border-red-500 flex items-center justify-center shadow-md font-bold text-red-600 text-xs sm:text-sm tracking-tighter shrink-0">
              BETTO
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className="font-display font-extrabold text-sm sm:text-base md:text-xl text-[#ffd400] tracking-tight leading-none truncate">Betto's Pizza</h1>
                <span className="text-[8px] sm:text-[9px] bg-red-600 text-white font-black px-1 sm:px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">Cliente</span>
              </div>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-yellow-300/80 flex items-center mt-1 font-medium truncate">
                <Clock size={10} className="mr-1 text-yellow-400 shrink-0" /> Horario: 12:00 PM A 10:30 PM
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {onBackToHome && (
              <button 
                onClick={onBackToHome}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-900/30 text-red-200 hover:text-white text-[11px] sm:text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer shrink-0"
                title="Cambiar de Rol / Salir"
              >
                <LogOut size={13} sm:size={14} className="shrink-0" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}

            <button 
              onClick={() => setViewState("status")}
              className={`relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs font-bold shadow-xs ${
                viewState === "status"
                  ? "bg-yellow-400 text-slate-950"
                  : "bg-[#4a1d5c] hover:bg-[#5e2974] text-white"
              }`}
              title="Mis Pedidos"
            >
              <Bike size={13} sm:size={14} className="shrink-0" />
              <span className="hidden sm:inline">Mis Pedidos</span>
              {placedOrders.some(o => o.status !== "Entregado") && (
                <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
              )}
            </button>

            <button 
              onClick={() => setViewState("cart")}
              className={`relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs font-bold shadow-xs ${
                viewState === "cart"
                  ? "bg-yellow-400 text-slate-950"
                  : "bg-[#4a1d5c] hover:bg-[#5e2974] text-white"
              }`}
            >
              <ShoppingBag size={13} sm:size={14} className="shrink-0" />
              <span className="hidden sm:inline">Carrito</span>
              {cart.length > 0 && (
                <span className="bg-red-600 text-white font-display text-[9px] w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center border border-white shrink-0 font-bold ml-0.5">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 pt-2 border-t border-purple-950/40 text-[10px] md:text-xs text-slate-300 gap-1.5">
          <span className="flex items-center text-yellow-200">
            <MapPin size={11} className="mr-1.5 text-red-500" /> Av. Sta Cecilia Mz. 6Lt. 26, Edo. de México
          </span>
          <span className="flex items-center font-bold text-white">
            <Phone size={11} className="mr-1.5 text-green-400" /> Pedidos: 55 1326-5826
          </span>
        </div>
      </div>

      {/* Client View Body */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            
            {/* 1. MENU VIEW */}
            {viewState === "menu" && (
              <motion.div
                key="menu-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pb-12"
              >
                {/* Promo Card: Mega Pizza */}
                {promoProduct && (
                  <div className="mb-6">
                    <div 
                      onClick={() => handleOpenProduct(promoProduct)}
                      className="bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 rounded-2xl p-5 md:p-6 text-white shadow-md relative overflow-hidden cursor-pointer group"
                    >
                      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200 via-red-300 to-slate-900 hidden md:block"></div>
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1.5">
                          <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            ¡Súper Promo Recomendada!
                          </span>
                          <h3 className="font-display font-black text-xl md:text-2xl tracking-tight leading-none mt-1">¡MEGA PIZZA DE LA CASA!</h3>
                          <p className="text-white/90 text-xs md:text-sm font-medium">Incluye Refresco de 2 Litros de tu elección totalmente Gratis</p>
                          <p className="text-yellow-200 text-[11px] font-semibold">🍕 Válido en cualquier especialidad de tu antojo • ¡Ideal para compartir!</p>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t border-white/10 md:border-t-0 pt-3 md:pt-0">
                          <div className="bg-slate-950/40 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                            <p className="text-[10px] text-yellow-300 font-bold leading-none">Hawaiana, Carnívora...</p>
                            <p className="text-[9px] text-white/80 mt-0.5">Elige en el personalizador</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-white/70 block uppercase font-bold">Llévalo por</span>
                            <span className="font-display font-black text-2xl md:text-3xl text-yellow-300 tracking-tight">
                              $370
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categories Tab Bar */}
                <div className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 flex overflow-x-auto py-3 border-b border-slate-200 no-scrollbar space-x-2 mb-6 justify-start md:justify-center">
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
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-[#3B0D4B] text-white shadow-md"
                          : "bg-slate-200/70 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Title Header for selected Category */}
                <div className="flex items-center justify-between mb-4 pb-1 border-b border-slate-200/60">
                  <h2 className="font-display font-bold text-base uppercase tracking-wide text-[#3B0D4B]">
                    {activeTab === "Especialidad" ? "Especialidades al 2x1" : activeTab}
                  </h2>
                  {activeTab === "Especialidad" && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                      2X1 TODOS LOS DÍAS
                    </span>
                  )}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => handleOpenProduct(product)}
                      className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/70 hover:border-purple-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden shadow-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md uppercase">
                            {product.category}
                          </span>
                          {product.category === "Especialidad" && (
                            <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md uppercase">
                              2x1
                            </span>
                          )}
                        </div>
                        <h4 className="font-display font-bold text-sm md:text-base text-slate-900 group-hover:text-purple-900 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Precio</span>
                          {product.prices ? (
                            <span className="text-sm md:text-base font-extrabold text-red-600">
                              Desde ${product.prices[PizzaSize.CH].standard}
                            </span>
                          ) : (
                            <span className="text-sm md:text-base font-extrabold text-red-600">
                              ${product.price}
                            </span>
                          )}
                        </div>

                        <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#ffd400] text-slate-700 group-hover:text-slate-950 flex items-center space-x-1 text-xs font-bold transition-all shadow-xs">
                          <Plus size={14} />
                          <span>Agregar</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
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
                className="py-4"
              >
                <div className="flex items-center space-x-2 mb-6">
                  <button 
                    onClick={() => setViewState("menu")}
                    className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h2 className="font-display font-black text-lg md:text-xl text-slate-900">Mi Carrito de Compras</h2>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-lg mx-auto p-6">
                    <ShoppingBag size={52} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-bold text-slate-800">Tu carrito está vacío</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Explora nuestro delicioso menú para agregar pizzas, bebidas o paquetes familiares.</p>
                    <button 
                      onClick={() => setViewState("menu")}
                      className="mt-5 px-5 py-2.5 bg-[#3B0D4B] hover:bg-purple-950 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all uppercase tracking-wider"
                    >
                      Ver la Carta de Pizzas 🍕
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Cart Items List */}
                    <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                      <h3 className="font-display font-bold text-xs md:text-sm text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <span>Productos Seleccionados</span>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? "artículo" : "artículos"}
                        </span>
                      </h3>

                      <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-2">
                        {cart.map(item => (
                          <div key={item.id} className="p-3 bg-slate-50/55 rounded-xl border border-slate-200/60 flex justify-between items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 leading-none mt-1 flex items-center gap-1.5">
                                <span className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[9px] font-semibold text-slate-700">
                                  {item.selectedSize ? `Tamaño ${item.selectedSize}` : "Estándar"}
                                </span>
                                {item.orillaRellena && (
                                  <span className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded text-[9px]">
                                    Orilla Rellena 🌟
                                  </span>
                                )}
                              </p>
                              {item.notes && (
                                <p className="text-[10px] text-amber-700 bg-amber-50/50 border border-amber-100 px-2 py-0.5 rounded-md mt-1.5 italic max-w-max">
                                  "{item.notes}"
                                </p>
                              )}
                              <p className="text-xs font-extrabold text-red-600 mt-2">
                                Precio unitario: ${item.price} • Total: ${item.price * item.quantity}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Quantity control */}
                              <div className="flex items-center bg-white rounded-xl p-0.5 border border-slate-200 shadow-xs">
                                <button 
                                  onClick={() => updateCartQuantity(item.id, -1)}
                                  className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <Minus size={11} />
                                </button>
                                <span className="text-xs font-bold px-2.5 text-slate-800">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartQuantity(item.id, 1)}
                                  className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>

                              {/* Delete button */}
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Eliminar del carrito"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button 
                          type="button"
                          onClick={() => setViewState("menu")}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center"
                        >
                          <ArrowLeft size={13} className="mr-1" /> Seguir agregando productos
                        </button>
                      </div>
                    </div>

                    {/* Checkout Form */}
                    <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                      <h3 className="font-display font-bold text-xs md:text-sm text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                        Detalles de Entrega & Pago
                      </h3>

                      <form onSubmit={handlePlaceOrder} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Nombre para Entrega</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Ej. Juan Pérez"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Celular / Teléfono</label>
                            <input 
                              type="tel" 
                              required
                              placeholder="Ej. 55 1326-5826"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Forma de Pago</label>
                            <select 
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value as any)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
                            >
                              <option value="Efectivo">Efectivo</option>
                              <option value="Tarjeta">Tarjeta Bancaria</option>
                              <option value="Transferencia">Transferencia</option>
                            </select>
                          </div>
                        </div>

                        {/* Delivery Type Toggle */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de Entrega</label>
                          <div className="grid grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => setOrderType("Para Llevar")}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                orderType === "Para Llevar" 
                                  ? "bg-[#3B0D4B] border-[#3B0D4B] text-white shadow-xs" 
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              Recoger en Sucursal
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrderType("Domicilio")}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1 ${
                                orderType === "Domicilio" 
                                  ? "bg-[#3B0D4B] border-[#3B0D4B] text-white shadow-xs" 
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              <Bike size={13} />
                              <span>A Domicilio</span>
                            </button>
                          </div>
                        </div>

                        {orderType === "Domicilio" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="overflow-hidden space-y-1"
                          >
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Dirección de Entrega</label>
                            <textarea 
                              required
                              rows={2.5}
                              placeholder="Calle, Número, Colonia, Entre calles y Referencias para el repartidor..."
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
                            />
                          </motion.div>
                        )}

                        {/* Minimum Delivery Check */}
                        {orderType === "Domicilio" && getCartTotal() < 200 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2.5 text-amber-800">
                            <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
                            <div className="text-[11px] leading-tight">
                              <p className="font-bold">Monto Mínimo de Domicilio: $200</p>
                              <p className="text-amber-700 mt-0.5">Te faltan <span className="font-bold">${200 - getCartTotal()}</span> para poder solicitar envío a domicilio.</p>
                            </div>
                          </div>
                        )}

                        {/* Calculations summary card */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 font-medium text-slate-600">
                          <div className="flex justify-between">
                            <span>Subtotal del pedido:</span>
                            <span className="text-slate-800 font-semibold">${getCartTotal()}</span>
                          </div>
                          {orderType === "Domicilio" && (
                            <div className="flex justify-between text-slate-500">
                              <span>Envío a domicilio:</span>
                              <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-[10px]">¡SIN COSTO!</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200/80 pt-2 mt-1.5 text-sm">
                            <span>Total a pagar:</span>
                            <span className="text-red-600 text-base font-black">${getCartTotal()}</span>
                          </div>
                        </div>

                        {/* Submit Order Button */}
                        <button
                          type="submit"
                          disabled={orderType === "Domicilio" && getCartTotal() < 200}
                          className={`w-full py-3 rounded-xl font-display font-extrabold text-sm text-center shadow-md transition-all ${
                            orderType === "Domicilio" && getCartTotal() < 200
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                              : "bg-[#ffd400] text-slate-950 hover:bg-yellow-300"
                          }`}
                        >
                          {orderType === "Domicilio" && getCartTotal() < 200
                            ? "Monto mínimo no alcanzado ($200)"
                            : "Confirmar y Enviar Pedido 🍕"}
                        </button>
                      </form>
                    </div>

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
                className="max-w-2xl mx-auto py-4"
              >
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setViewState("menu")}
                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <h2 className="font-display font-bold text-base md:text-lg text-slate-900">Rastreo de Mis Pedidos</h2>
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
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl hover:bg-purple-50 transition-all"
                    >
                      Actualizar Estado 🔄
                    </button>
                  </div>

                  {placedOrders.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <Bike size={48} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-sm font-semibold">No has realizado ningún pedido aún.</p>
                      <p className="text-xs mt-1 text-slate-400 font-medium">Tus pedidos en curso se listarán aquí para rastrearlos en tiempo real.</p>
                      <button 
                        onClick={() => setViewState("menu")}
                        className="mt-4 px-4 py-2 bg-[#3B0D4B] text-white text-xs font-bold rounded-xl"
                      >
                        Hacer mi primer pedido
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {placedOrders.map(order => (
                        <div key={order.id} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/50 pb-3 mb-3">
                            <div>
                              <span className="text-xs text-slate-400 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">Pedido #{order.orderNumber}</span>
                              <h4 className="text-xs font-black text-slate-900 mt-1">
                                {order.items.length} {order.items.length === 1 ? "artículo" : "artículos"} • Total: ${order.total}
                              </h4>
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>

                          {/* Order Timeline Stepper */}
                          <div className="grid grid-cols-4 gap-2 text-center mt-4 relative mb-4">
                            {/* horizontal line bar */}
                            <div className="absolute top-[9px] left-[12%] right-[12%] h-[3px] bg-slate-200 -z-1">
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
                              { name: "En Cocina", active: order.status !== "Pendiente" },
                              { name: "¡Listo!", active: order.status === "Listo" || order.status === "Entregado" },
                              { name: "Entregado", active: order.status === "Entregado" }
                            ].map((step, idx) => (
                              <div key={idx} className="flex flex-col items-center">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] border transition-colors ${
                                  step.active 
                                    ? "bg-green-500 border-green-500 text-white font-bold" 
                                    : "bg-white border-slate-300 text-slate-400"
                                }`}>
                                  {step.active ? "✓" : idx + 1}
                                </div>
                                <span className={`text-[9px] font-bold mt-1.5 transition-colors ${
                                  step.active ? "text-green-600 font-black" : "text-slate-400"
                                }`}>
                                  {step.name}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Detail of items */}
                          <div className="bg-white/80 p-3 rounded-xl border border-slate-200/50 mt-3 text-xs text-slate-600 space-y-1">
                            <p className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-1">Resumen del pedido:</p>
                            {order.items.map(it => (
                              <div key={it.id} className="flex justify-between text-[11px]">
                                <span>{it.quantity}x {it.name} {it.selectedSize ? `(${it.selectedSize})` : ""}</span>
                                <span className="font-semibold text-slate-800">${it.price * it.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] text-slate-500 mt-3 pt-2.5 border-t border-slate-200/60 gap-1.5">
                            <span>Tipo: <strong className="text-slate-700">{order.type}</strong> • Pago: <strong className="text-slate-700">{order.paymentMethod}</strong></span>
                            <span>Fecha: <strong className="text-slate-700">{new Date(order.timestamp).toLocaleString("es-MX", { hour: "numeric", minute: "2-digit" })}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* 4. PRODUCT CUSTOMIZATION MODAL (RESPONSIVE CENTER POPUP) */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-5 md:p-6 flex flex-col space-y-3.5 sm:space-y-4 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-black">
                    {selectedProduct.category}
                  </span>
                  <h3 className="font-display font-bold text-base md:text-lg text-slate-900 leading-tight mt-1">
                    {selectedProduct.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Pizza Size Configuration */}
              {selectedProduct.prices && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">Selecciona el Tamaño de la Pizza</label>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {(Object.keys(selectedProduct.prices) as PizzaSize[]).map(size => {
                      const isSelected = selectedSize === size;
                      const pricesObj = selectedProduct.prices![size];
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[#3B0D4B] border-[#3B0D4B] text-white shadow-md ring-2 ring-purple-300"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-xs font-black leading-none">{size}</span>
                          <span className={`text-[9px] mt-1 font-bold ${isSelected ? "text-yellow-300" : "text-slate-500"}`}>
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
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">Especialidad de la Orilla</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setOrillaRellena(false)}
                      className={`p-3 rounded-xl border flex flex-col text-left transition-all ${
                        !orillaRellena
                          ? "bg-purple-50/75 border-[#3B0D4B] text-slate-900 ring-2 ring-[#3B0D4B]/30"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-bold">Orilla Tradicional</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Masa crujiente artesanal.</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setOrillaRellena(true)}
                      className={`p-3 rounded-xl border flex flex-col text-left transition-all ${
                        orillaRellena
                          ? "bg-purple-50/75 border-[#3B0D4B] text-slate-900 ring-2 ring-[#3B0D4B]/30"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                        Orilla Rellena de Queso 🧀🌟
                      </span>
                      <span className="text-[9px] text-purple-700/80 font-semibold mt-0.5">
                        Queso fundido + ajonjolí crujiente (+${selectedProduct.prices[selectedSize].orillaRellena - selectedProduct.prices[selectedSize].standard})
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">Notas especiales / Instrucciones</label>
                <input 
                  type="text" 
                  placeholder="Ej. Sin cebolla, bien doradita, partir en rebanadas chicas, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Bottom section with quantity & total */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200/50">
                  <button 
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="w-7 h-7 bg-white hover:bg-slate-50 rounded-full shadow-xs flex items-center justify-center text-slate-700 font-bold"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold px-3.5 text-slate-800">{itemQuantity}</span>
                  <button 
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-7 h-7 bg-white hover:bg-slate-50 rounded-full shadow-xs flex items-center justify-center text-slate-700 font-bold"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block leading-none font-bold uppercase">Total del Producto</span>
                  <span className="font-display font-black text-lg md:text-xl text-red-600">
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
                className="w-full py-3 bg-[#ffd400] hover:bg-yellow-300 text-slate-950 font-display font-black text-xs md:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 uppercase tracking-wide"
              >
                <ShoppingBag size={15} />
                <span>Añadir al Pedido de Pizza</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation action bar */}
      <div className="bg-white border-t border-slate-200 py-3.5 px-6 flex justify-around items-center text-slate-400 z-30 shadow-md shrink-0">
        <button 
          onClick={() => setViewState("menu")}
          className={`flex flex-col items-center space-y-1 transition-colors ${viewState === "menu" ? "text-purple-900 font-extrabold" : "hover:text-slate-600"}`}
        >
          <span className="text-lg">🍕</span>
          <span className="text-[10px] font-bold">La Carta</span>
        </button>
        
        <button 
          onClick={() => setViewState("cart")}
          className={`flex flex-col items-center space-y-1 relative transition-colors ${viewState === "cart" ? "text-purple-900 font-extrabold" : "hover:text-slate-600"}`}
        >
          <ShoppingBag size={18} />
          {cart.length > 0 && (
            <span className="absolute top-0 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
          )}
          <span className="text-[10px] font-bold">Carrito ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
        </button>

        <button 
          onClick={() => setViewState("status")}
          className={`flex flex-col items-center space-y-1 relative transition-colors ${viewState === "status" ? "text-purple-900 font-extrabold" : "hover:text-slate-600"}`}
        >
          <Bike size={18} />
          {placedOrders.some(o => o.status !== "Entregado") && (
            <span className="absolute top-0 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
          <span className="text-[10px] font-bold">Rastreo ({placedOrders.length})</span>
        </button>
      </div>

    </div>
  );
}
