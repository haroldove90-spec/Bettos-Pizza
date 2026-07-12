/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Sliders, 
  PlusCircle, 
  Phone, 
  Check, 
  X, 
  Filter, 
  Database,
  Tag,
  MapPin,
  Calendar,
  Home,
  LogOut,
  User,
  Upload
} from "lucide-react";
import { Product, Order, Category, PizzaSize } from "../types";
import { getStoredProducts, saveProducts, getStoredOrders, saveOrders, resetToInitial } from "../utils/pizzaStore";

interface AdminPanelProps {
  onBackToHome?: () => void;
}

export default function AdminPanel({ onBackToHome }: AdminPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Stats
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [averageTicket, setAverageTicket] = useState<number>(0);

  // Active view: "stats" or "products" or "orders"
  const [activeSubTab, setActiveSubTab] = useState<"stats" | "products" | "orders">("stats");

  // Admin Profile state
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [adminName, setAdminName] = useState<string>(() => {
    return localStorage.getItem("bettos_admin_name") || "Don Humberto (Propietario)";
  });
  const [adminPhone, setAdminPhone] = useState<string>(() => {
    return localStorage.getItem("bettos_admin_phone") || "55 1020-3040";
  });
  const [adminAvatar, setAdminAvatar] = useState<string>(() => {
    return localStorage.getItem("bettos_admin_avatar") || "👑";
  });

  // Product Editor state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newProductName, setNewProductName] = useState<string>("");
  const [newProductDesc, setNewProductDesc] = useState<string>("");
  const [newProductCategory, setNewProductCategory] = useState<Category>("Especialidad");
  
  // Prices
  const [newProductFixedPrice, setNewProductFixedPrice] = useState<number>(100);
  // Custom sizes prices
  const [chStandard, setChStandard] = useState<number>(245);
  const [chOrilla, setChOrilla] = useState<number>(280);
  const [medStandard, setMedStandard] = useState<number>(290);
  const [medOrilla, setMedOrilla] = useState<number>(340);
  const [gdeStandard, setGdeStandard] = useState<number>(350);
  const [gdeOrilla, setGdeOrilla] = useState<number>(410);
  const [famStandard, setFamStandard] = useState<number>(375);
  const [famOrilla, setFamOrilla] = useState<number>(440);
  const [megaStandard, setMegaStandard] = useState<number>(600);
  const [megaOrilla, setMegaOrilla] = useState<number>(670);

  // Initialize
  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("bettos_pizza_db_update", handleUpdate);
    return () => window.removeEventListener("bettos_pizza_db_update", handleUpdate);
  }, []);

  const loadData = () => {
    const prods = getStoredProducts();
    const ords = getStoredOrders();
    setProducts(prods);
    setOrders(ords);

    // Calculate metrics
    const sales = ords
      .filter(o => o.status === "Entregado" || o.status === "Listo" || o.status === "En Cocina" || o.status === "Pendiente")
      .reduce((acc, o) => acc + o.total, 0);
    
    setTotalSales(sales);
    setTotalOrders(ords.length);
    setPendingCount(ords.filter(o => o.status === "Pendiente" || o.status === "En Cocina").length);
    setAverageTicket(ords.length > 0 ? Math.round(sales / ords.length) : 0);
  };

  const handleResetData = () => {
    if (confirm("¿Estás seguro de que deseas restaurar la base de datos a sus valores iniciales? Esto borrará tus ventas y modificaciones recientes.")) {
      resetToInitial();
      loadData();
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto de la carta?")) {
      const updated = products.filter(p => p.id !== id);
      saveProducts(updated);
      setProducts(updated);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;

    let newProd: Product = {
      id: "prod_" + Date.now(),
      name: newProductName,
      description: newProductDesc,
      category: newProductCategory
    };

    // If it's a pizza category, we assign customizable sizes
    if (newProductCategory === "Especialidad" || newProductCategory === "Un Solo Ingrediente") {
      newProd.prices = {
        [PizzaSize.CH]: { standard: chStandard, orillaRellena: chOrilla },
        [PizzaSize.MED]: { standard: medStandard, orillaRellena: medOrilla },
        [PizzaSize.GDE]: { standard: gdeStandard, orillaRellena: gdeOrilla },
        [PizzaSize.FAM]: { standard: famStandard, orillaRellena: famOrilla },
        [PizzaSize.MEGA]: { standard: megaStandard, orillaRellena: megaOrilla }
      };
    } else {
      newProd.price = newProductFixedPrice;
    }

    const updated = [newProd, ...products];
    saveProducts(updated);
    setProducts(updated);

    // Reset Form
    setNewProductName("");
    setNewProductDesc("");
    setShowAddForm(false);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este pedido de la base de datos?")) {
      const updated = orders.filter(o => o.id !== orderId);
      saveOrders(updated);
      setOrders(updated);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: "Cancelado" as const };
      }
      return o;
    });
    saveOrders(updated);
    setOrders(updated);
  };

  return (
    <div className="w-full h-full bg-[#0a070e] text-slate-100 flex flex-col font-sans overflow-hidden pb-16 md:pb-0 relative">
      
      {/* Admin Panel Header */}
      <div className="bg-[#191122] border-b border-purple-950/60 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-lg gap-2 overflow-hidden shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0 shrink-0">
          <div className="p-1.5 sm:p-2 bg-[#ffd400] text-slate-900 rounded-xl shrink-0">
            <Sliders size={16} sm:size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-black text-xs sm:text-sm md:text-base text-[#ffd400] uppercase tracking-wide whitespace-nowrap truncate">Administración</h2>
            <p className="text-[9px] sm:text-[10px] text-purple-300 font-mono whitespace-nowrap truncate">SISTEMA CENTRAL</p>
          </div>
        </div>

        {/* Subtabs selectors (Desktop Only) */}
        <div className="hidden md:flex items-center space-x-1 sm:space-x-2 bg-[#2d1a3a] p-1 rounded-xl border border-purple-900/40 shrink-0">
          {[
            { id: "stats", label: "Estadísticas" },
            { id: "products", label: "Menú" },
            { id: "orders", label: "Historial" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                activeSubTab === tab.id
                  ? "bg-[#ffd400] text-slate-950 font-bold"
                  : "text-purple-200 hover:bg-purple-950/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Trigger */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center space-x-1.5 bg-[#2d1a3a] hover:bg-[#3c254b] border border-purple-800/30 px-2.5 py-1.5 rounded-lg text-slate-100 hover:text-white text-[10px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Mi Perfil de Administrador"
          >
            <span className="text-xs">{adminAvatar}</span>
            <span className="hidden md:inline truncate max-w-[100px]">{adminName.split(" ")[0]}</span>
          </button>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="text-[10px] font-bold text-red-200 hover:text-white flex items-center space-x-1 border border-red-900/30 bg-red-950/20 hover:bg-red-900/40 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shrink-0"
              title="Cambiar de Rol / Salir"
            >
              <LogOut size={11} className="shrink-0" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}

          <button
            onClick={handleResetData}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center space-x-1 border border-red-900/30 bg-red-950/10 hover:bg-red-950/40 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shrink-0"
            title="Restaurar base de datos"
          >
            <Database size={11} />
            <span className="hidden sm:inline">Restaurar</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          
          {/* STATS VIEW */}
          {activeSubTab === "stats" && (
            <motion.div
              key="stats-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Quick stats board */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-[#160f1e] p-4 rounded-2xl border border-purple-950/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-purple-400">Ventas Totales</span>
                    <h3 className="font-display font-black text-2xl text-green-400 font-mono mt-1">${totalSales}</h3>
                    <p className="text-[9px] text-slate-400 mt-1">Órdenes cobradas y activas</p>
                  </div>
                  <div className="p-2.5 bg-green-500/10 text-green-400 rounded-xl">
                    <DollarSign size={20} />
                  </div>
                </div>

                <div className="bg-[#160f1e] p-4 rounded-2xl border border-purple-950/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-purple-400">Total Pedidos</span>
                    <h3 className="font-display font-black text-2xl text-slate-100 font-mono mt-1">{totalOrders}</h3>
                    <p className="text-[9px] text-slate-400 mt-1">Registrados en el sistema</p>
                  </div>
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                    <ShoppingBag size={20} />
                  </div>
                </div>

                <div className="bg-[#160f1e] p-4 rounded-2xl border border-purple-950/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-purple-400">En Preparación</span>
                    <h3 className="font-display font-black text-2xl text-amber-400 font-mono mt-1">{pendingCount}</h3>
                    <p className="text-[9px] text-slate-400 mt-1">Activos en cocina ahora</p>
                  </div>
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Clock size={20} className="animate-pulse" />
                  </div>
                </div>

                <div className="bg-[#160f1e] p-4 rounded-2xl border border-purple-950/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-purple-400">Ticket Promedio</span>
                    <h3 className="font-display font-black text-2xl text-purple-300 font-mono mt-1">${averageTicket}</h3>
                    <p className="text-[9px] text-slate-400 mt-1">Valor medio por compra</p>
                  </div>
                  <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                </div>

              </div>

              {/* Layout for popular pizza and details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Popular categories visual bar */}
                <div className="lg:col-span-2 bg-[#160f1e] rounded-2xl p-4 border border-purple-950/40 space-y-4">
                  <h3 className="font-display font-bold text-sm uppercase text-[#ffd400] tracking-wide">Popularidad por Categoría</h3>
                  
                  <div className="space-y-3.5">
                    {[
                      { name: "Pizzas de Especialidad (2x1)", value: 65, color: "bg-red-500" },
                      { name: "Súper Paquetes Familiares", value: 45, color: "bg-amber-500" },
                      { name: "Un Solo Ingrediente", value: 30, color: "bg-purple-500" },
                      { name: "Bebidas / Refrescos", value: 50, color: "bg-blue-500" },
                      { name: "Hamburguesas & Empanadas", value: 25, color: "bg-green-500" }
                    ].map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{cat.name}</span>
                          <span className="text-slate-400">{cat.value}% de ventas</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color}`} style={{ width: `${cat.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Info and Quick Edit mock display */}
                <div className="bg-[#160f1e] rounded-2xl p-4 border border-purple-950/40 space-y-4 text-xs">
                  <h3 className="font-display font-bold text-sm uppercase text-[#ffd400] tracking-wide">Detalles de Sucursal</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-red-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-300 leading-tight">Dirección de Operación</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Av. Sta Cecilia Mz. 6Lt. 26, Edo. de México</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone size={16} className="text-green-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-300 leading-tight">Teléfonos de Contacto</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">55 1326-5826, 55 5309-1089</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-yellow-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-300 leading-tight">Horario Establecido</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Lunes a Domingo • 12:00 PM A 10:30 PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-950/30 p-3 rounded-xl border border-purple-950/50 mt-4 text-[10px] text-purple-300 leading-relaxed">
                    <p className="font-bold text-yellow-300 mb-1">💡 Súper Paquetes</p>
                    <p>Contamos con 14 paquetes familiares cargados directamente en el menú para que los clientes compren cómodamente desde el móvil.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* PRODUCTS/MENU VIEW */}
          {activeSubTab === "products" && (
            <motion.div
              key="products-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-base text-slate-100">Administrar Menú / Carta</h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-[#ffd400] text-slate-900 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 hover:bg-yellow-400 transition-all"
                >
                  {showAddForm ? <X size={14} /> : <PlusCircle size={14} />}
                  <span>{showAddForm ? "Cancelar" : "Nuevo Producto"}</span>
                </button>
              </div>

              {/* Add Product Form */}
              {showAddForm && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleAddProduct}
                  className="bg-[#1c1226] p-4 rounded-2xl border border-purple-950/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
                >
                  <div className="space-y-2">
                    <div>
                      <label className="block font-bold text-slate-300 uppercase text-[9px] mb-1">Nombre del Producto</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Pizza Hawaiana Especial"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/60 rounded-lg p-2 focus:outline-none focus:border-[#ffd400]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 uppercase text-[9px] mb-1">Categoría</label>
                      <select 
                        value={newProductCategory}
                        onChange={(e) => setNewProductCategory(e.target.value as Category)}
                        className="w-full bg-slate-800 border border-slate-700/60 rounded-lg p-2 focus:outline-none focus:border-[#ffd400]"
                      >
                        <option value="Especialidad">Especialidad de la Casa</option>
                        <option value="Un Solo Ingrediente">Un Solo Ingrediente / Mariscos</option>
                        <option value="Hamburguesa">Hamburguesa</option>
                        <option value="Empanada">Empanada / Papas</option>
                        <option value="Spaghetti">Spaghetti</option>
                        <option value="Bebida">Bebida</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block font-bold text-slate-300 uppercase text-[9px] mb-1">Descripción / Ingredientes</label>
                      <textarea 
                        rows={2}
                        placeholder="Ej. Jamón, piña y cerezas deliciosas..."
                        value={newProductDesc}
                        onChange={(e) => setNewProductDesc(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700/60 rounded-lg p-2 focus:outline-none focus:border-[#ffd400]"
                      />
                    </div>
                    
                    {/* Fixed price configuration (if not a pizza) */}
                    {(newProductCategory !== "Especialidad" && newProductCategory !== "Un Solo Ingrediente") && (
                      <div>
                        <label className="block font-bold text-slate-300 uppercase text-[9px] mb-1">Precio Fijo ($)</label>
                        <input 
                          type="number" 
                          required
                          value={newProductFixedPrice}
                          onChange={(e) => setNewProductFixedPrice(parseInt(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700/60 rounded-lg p-2 focus:outline-none focus:border-[#ffd400]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Custom sizes pricing grid (visible only for pizzas) */}
                  {(newProductCategory === "Especialidad" || newProductCategory === "Un Solo Ingrediente") && (
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
                      <p className="font-bold text-[9px] uppercase text-[#ffd400]">Precios por Tamaño (Estándar / Rellena)</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <label className="block text-slate-400">CH ($):</label>
                          <div className="flex space-x-1 mt-0.5">
                            <input type="number" className="w-12 bg-slate-800 p-1 rounded" value={chStandard} onChange={e => setChStandard(parseInt(e.target.value))} />
                            <input type="number" className="w-12 bg-slate-800 p-1 rounded text-purple-300" value={chOrilla} onChange={e => setChOrilla(parseInt(e.target.value))} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-400">MED ($):</label>
                          <div className="flex space-x-1 mt-0.5">
                            <input type="number" className="w-12 bg-slate-800 p-1 rounded" value={medStandard} onChange={e => setMedStandard(parseInt(e.target.value))} />
                            <input type="number" className="w-12 bg-slate-800 p-1 rounded text-purple-300" value={medOrilla} onChange={e => setMedOrilla(parseInt(e.target.value))} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-400">GDE ($):</label>
                          <div className="flex space-x-1 mt-0.5">
                            <input type="number" className="w-12 bg-slate-800 p-1 rounded" value={gdeStandard} onChange={e => setGdeStandard(parseInt(e.target.value))} />
                            <input type="number" className="w-12 bg-slate-800 p-1 rounded text-purple-300" value={gdeOrilla} onChange={e => setGdeOrilla(parseInt(e.target.value))} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-400">FAM ($):</label>
                          <div className="flex space-x-1 mt-0.5">
                            <input type="number" className="w-12 bg-slate-800 p-1 rounded" value={famStandard} onChange={e => setFamStandard(parseInt(e.target.value))} />
                            <input type="number" className="w-12 bg-slate-800 p-1 rounded text-purple-300" value={famOrilla} onChange={e => setFamOrilla(parseInt(e.target.value))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2 rounded-lg"
                    >
                      Guardar en Menú
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Cards List of products - completely responsive, full width, no side scrolling */}
              <div className="space-y-3.5">
                {products.map(p => {
                  const getCategoryIcon = (cat: Category) => {
                    switch (cat) {
                      case "Especialidad": return "🍕";
                      case "Un Solo Ingrediente": return "🍕";
                      case "Hamburguesa": return "🍔";
                      case "Empanada": return "🥟";
                      case "Spaghetti": return "🍝";
                      case "Bebida": return "🥤";
                      default: return "🍴";
                    }
                  };

                  return (
                    <div 
                      key={p.id} 
                      className="bg-[#160f1e]/85 hover:bg-[#1e1428] border border-purple-950/45 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all w-full shadow-md group relative overflow-hidden"
                    >
                      {/* Left side: Icon, Name, Category and Description */}
                      <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                        <span className="text-2xl sm:text-3xl p-2.5 bg-purple-950/40 rounded-2xl border border-purple-900/30 shrink-0 select-none">
                          {getCategoryIcon(p.category)}
                        </span>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-display font-semibold text-sm sm:text-base text-slate-100 group-hover:text-yellow-400 transition-colors leading-snug">
                              {p.name}
                            </h4>
                            <span className="text-[10px] tracking-wide font-mono bg-[#280c33] px-2.5 py-0.5 rounded-full text-purple-300 border border-purple-900/40 font-medium shrink-0">
                              {p.category}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Prices and Action */}
                      <div className="flex flex-wrap items-center justify-between md:justify-end gap-3.5 w-full md:w-auto border-t md:border-t-0 border-purple-950/40 pt-3 md:pt-0 shrink-0">
                        {/* Prices block */}
                        <div className="bg-purple-950/20 px-3 py-2 rounded-xl border border-purple-900/10 flex items-center">
                          {p.prices ? (
                            <div className="grid grid-cols-2 xs:flex xs:flex-row gap-x-3 gap-y-1 text-[10px] font-mono text-purple-300">
                              <div className="flex items-center space-x-1">
                                <span className="text-slate-500 font-bold">CH:</span>
                                <span className="text-yellow-400 font-bold">${p.prices[PizzaSize.CH].standard}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-slate-500 font-bold">MED:</span>
                                <span className="text-yellow-400 font-bold">${p.prices[PizzaSize.MED].standard}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-slate-500 font-bold">GDE:</span>
                                <span className="text-yellow-400 font-bold">${p.prices[PizzaSize.GDE].standard}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-slate-500 font-bold">FAM:</span>
                                <span className="text-yellow-400 font-bold">${p.prices[PizzaSize.FAM].standard}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-slate-500 font-bold">MEGA:</span>
                                <span className="text-yellow-400 font-bold">${p.prices[PizzaSize.MEGA].standard}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1.5 font-mono">
                              <span className="text-slate-500 text-[10px] font-bold">PRECIO FIJO:</span>
                              <span className="text-yellow-400 font-bold text-xs sm:text-sm">${p.price}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/15"
                          title="Eliminar del menú"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* HISTORIAL PEDIDOS */}
          {activeSubTab === "orders" && (
            <motion.div
              key="orders-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="font-display font-bold text-base text-slate-100">Bitácora General de Órdenes</h3>

              {/* Bitácora General de Órdenes Cards List - completely responsive, full width, no side scrolling */}
              <div className="space-y-3.5">
                {orders.map(o => (
                  <div 
                    key={o.id} 
                    className="bg-[#160f1e]/85 hover:bg-[#1e1428] border border-purple-950/45 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all w-full shadow-md group relative overflow-hidden"
                  >
                    {/* Header line + Details */}
                    <div className="flex-1 space-y-3 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="font-mono font-black text-purple-300 text-sm">
                          #{o.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center">
                          <Clock size={11} className="mr-1 inline text-purple-400" />
                          {new Date(o.timestamp).toLocaleString("es-MX", { hour: "numeric", minute: "numeric", second: "numeric" })}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
                          o.status === "Pendiente" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          o.status === "En Cocina" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                          o.status === "Listo" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          o.status === "Entregado" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      {/* Customer info and Delivery type */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-950/15 p-3 rounded-xl border border-purple-900/10">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Cliente</p>
                          <p className="font-semibold text-slate-200 text-xs mt-0.5">{o.customerName}</p>
                          {o.customerPhone && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{o.customerPhone}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Tipo / Pago</p>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="text-[10px] font-bold bg-[#280c33] px-2 py-0.5 rounded text-purple-300 border border-purple-900/30">
                              {o.type}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {o.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Item breakdown */}
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Productos de la Orden</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {o.items.map((it, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] text-slate-300 bg-slate-800/60 border border-slate-700/30 px-2.5 py-1 rounded-lg"
                            >
                              <strong className="text-yellow-400">{it.quantity}x</strong> {it.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Total and actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full md:w-auto border-t md:border-t-0 border-purple-950/40 pt-3.5 md:pt-0 shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Monto Total</p>
                        <p className="font-black text-red-400 font-mono text-base sm:text-lg mt-0.5">${o.total}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {o.status !== "Cancelado" && o.status !== "Entregado" && (
                          <button
                            onClick={() => handleCancelOrder(o.id)}
                            className="bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-xl border border-red-500/20 text-[10px] font-bold transition-all"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          className="p-2 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 rounded-xl transition-all border border-slate-700/40"
                          title="Borrar de la base de datos"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation action bar for mobile/tablet only */}
      <div className="md:hidden bg-[#191122] border-t border-purple-950/60 py-2.5 px-4 flex justify-around items-center text-slate-400 z-30 shadow-md shrink-0 fixed bottom-0 left-0 right-0 h-16">
        <button 
          onClick={() => setActiveSubTab("stats")}
          className={`flex flex-col items-center space-y-0.5 transition-colors ${activeSubTab === "stats" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <TrendingUp size={16} />
          <span className="text-[9px] font-bold">Estadísticas</span>
        </button>
        
        <button 
          onClick={() => setActiveSubTab("products")}
          className={`flex flex-col items-center space-y-0.5 relative transition-colors ${activeSubTab === "products" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <Tag size={16} />
          <span className="text-[9px] font-bold">Menú / Precios</span>
        </button>

        <button 
          onClick={() => setActiveSubTab("orders")}
          className={`flex flex-col items-center space-y-0.5 relative transition-colors ${activeSubTab === "orders" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <ShoppingBag size={16} />
          <span className="text-[9px] font-bold">Historial</span>
        </button>
      </div>

      {/* Admin Profile Modal */}
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
              className="bg-[#191122] border border-purple-950/80 text-slate-100 rounded-2xl p-5 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
                <div className="flex items-center space-x-2">
                  <User size={18} className="text-[#ffd400]" />
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#ffd400]">Mi Perfil (Propietario / Admin)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Avatar selection */}
                <div className="flex items-center gap-4 bg-[#0a070e] p-3 rounded-xl border border-purple-950/50">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-purple-950/60 flex items-center justify-center text-3xl shadow-inner">
                    {adminAvatar}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-bold text-slate-200">Avatar del Administrador</p>
                    <p className="text-[10px] text-slate-400">Selecciona tu emoji preferido:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {["👑", "🧔", "🍕", "👔", "💼", "🔥", "🚀"].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setAdminAvatar(emoji)}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs transition-all ${
                            adminAvatar === emoji
                              ? "bg-purple-900/60 border-[#ffd400] scale-110 shadow-sm"
                              : "bg-slate-900 border-slate-800 hover:bg-slate-800"
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
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Nombre del Propietario</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full bg-[#0a070e] border border-purple-950/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffd400] transition-all font-medium"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="Ej: 55 1020-3040"
                    className="w-full bg-[#0a070e] border border-purple-950/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffd400] transition-all font-medium"
                  />
                </div>

                {/* Role Info */}
                <div className="bg-[#0a070e]/80 p-2.5 rounded-lg border border-purple-950 text-[10px] text-slate-400 space-y-1">
                  <p>🔑 <strong>Rol asignado:</strong> Administrador Supremo (Owner)</p>
                  <p>📈 <strong>Acceso:</strong> Control Total de Menú, Inventarios y Finanzas</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("bettos_admin_name", adminName);
                    localStorage.setItem("bettos_admin_phone", adminPhone);
                    localStorage.setItem("bettos_admin_avatar", adminAvatar);
                    setShowProfileModal(false);
                    window.dispatchEvent(new Event("bettos_pizza_db_update"));
                  }}
                  className="w-full py-2.5 bg-[#ffd400] hover:bg-yellow-300 text-slate-950 font-display font-black text-xs uppercase rounded-xl shadow-md transition-all mt-2"
                >
                  Guardar Perfil de Administrador
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
