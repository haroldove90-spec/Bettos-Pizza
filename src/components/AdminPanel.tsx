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
  Calendar
} from "lucide-react";
import { Product, Order, Category, PizzaSize } from "../types";
import { getStoredProducts, saveProducts, getStoredOrders, saveOrders, resetToInitial } from "../utils/pizzaStore";

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Stats
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [averageTicket, setAverageTicket] = useState<number>(0);

  // Active view: "stats" or "products" or "orders"
  const [activeSubTab, setActiveSubTab] = useState<"stats" | "products" | "orders">("stats");

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
    <div className="w-full h-full bg-[#0a070e] text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Admin Panel Header */}
      <div className="bg-[#191122] border-b border-purple-950/60 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-[#ffd400] text-slate-900 rounded-xl">
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="font-display font-black text-base text-[#ffd400] uppercase tracking-wide">Panel de Administración</h2>
            <p className="text-[10px] text-purple-300 font-mono">BETTO'S PIZZA • SISTEMA CENTRAL</p>
          </div>
        </div>

        {/* Subtabs selectors */}
        <div className="flex items-center space-x-2 bg-[#2d1a3a] p-1 rounded-xl border border-purple-900/40">
          {[
            { id: "stats", label: "Estadísticas" },
            { id: "products", label: "Menú / Carta" },
            { id: "orders", label: "Historial Pedidos" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
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
        <button
          onClick={handleResetData}
          className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center space-x-1 border border-red-900/30 bg-red-950/10 hover:bg-red-950/40 px-2.5 py-1.5 rounded-lg transition-all"
          title="Restaurar base de datos"
        >
          <Database size={11} />
          <span className="hidden sm:inline">Restaurar Demo</span>
        </button>
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

              {/* Table of products */}
              <div className="bg-[#160f1e] rounded-2xl border border-purple-950/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-purple-950/30 text-purple-300 font-mono text-[9px] uppercase border-b border-purple-900/40">
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3">Descripción</th>
                        <th className="p-3">Precio / Rangos</th>
                        <th className="p-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-950/20">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-purple-950/10">
                          <td className="p-3 font-semibold text-slate-200">{p.name}</td>
                          <td className="p-3">
                            <span className="text-[10px] font-mono bg-[#280c33] px-2 py-0.5 rounded text-purple-300 border border-purple-900/30">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 max-w-xs truncate">{p.description}</td>
                          <td className="p-3 font-mono">
                            {p.prices ? (
                              <span className="text-[#ffd400] font-bold">
                                CH: ${p.prices[PizzaSize.CH].standard} - MEGA: ${p.prices[PizzaSize.MEGA].standard}
                              </span>
                            ) : (
                              <span>${p.price}</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                              title="Eliminar del menú"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

              <div className="bg-[#160f1e] rounded-2xl border border-purple-950/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-purple-950/30 text-purple-300 font-mono text-[9px] uppercase border-b border-purple-900/40">
                        <th className="p-3">Folio</th>
                        <th className="p-3">Fecha / Hora</th>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Tipo / Pago</th>
                        <th className="p-3">Artículos</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-center">Operación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-950/20">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-purple-950/10">
                          <td className="p-3 font-mono font-bold text-purple-300">#{o.orderNumber}</td>
                          <td className="p-3 text-slate-400 text-[10px]">
                            {new Date(o.timestamp).toLocaleString("es-MX", { hour: "numeric", minute: "numeric", second: "numeric" })}
                          </td>
                          <td className="p-3 font-semibold text-slate-200">
                            <div>{o.customerName}</div>
                            {o.customerPhone && <div className="text-[10px] text-slate-500 font-normal">{o.customerPhone}</div>}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-300">{o.type}</div>
                            <div className="text-[10px] text-slate-500">{o.paymentMethod}</div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5 text-[10px] text-slate-400">
                              {o.items.map((it, idx) => (
                                <p key={idx}>• {it.quantity}x {it.name}</p>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 font-bold text-red-400 font-mono">${o.total}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.status === "Pendiente" ? "bg-amber-100 text-amber-800" :
                              o.status === "En Cocina" ? "bg-purple-100 text-purple-800" :
                              o.status === "Listo" ? "bg-emerald-100 text-emerald-800" :
                              o.status === "Entregado" ? "bg-slate-100 text-slate-800" : "bg-red-100 text-red-800"
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center space-x-1.5">
                              {o.status !== "Cancelado" && o.status !== "Entregado" && (
                                <button
                                  onClick={() => handleCancelOrder(o.id)}
                                  className="text-red-400 hover:underline text-[10px] bg-red-950/20 px-2 py-1 rounded border border-red-900/30"
                                >
                                  Cancelar
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteOrder(o.id)}
                                className="p-1 text-slate-400 hover:text-red-400"
                                title="Borrar de la base de datos"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
