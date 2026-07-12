/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChefHat, 
  User, 
  Sliders, 
  ShoppingBag, 
  Grid, 
  Clock, 
  Phone, 
  MapPin, 
  Pizza, 
  Sparkles, 
  Info,
  Layers,
  Monitor
} from "lucide-react";
import ClientMobileApp from "./components/ClientMobileApp";
import POSSystem from "./components/POSSystem";
import KitchenDisplay from "./components/KitchenDisplay";
import AdminPanel from "./components/AdminPanel";
import { Role } from "./types";
import { getStoredOrders, resetToInitial } from "./utils/pizzaStore";

export default function App() {
  // Active viewing mode: can be MULTIPANEL or individual roles (Role.CLIENTE, Role.VENDEDOR, Role.COCINA, Role.ADMIN)
  const [viewMode, setViewMode] = useState<"MULTIPANEL" | Role>("MULTIPANEL");
  const [ordersCount, setOrdersCount] = useState<number>(0);

  useEffect(() => {
    // Read total order count for notification badge
    const updateCount = () => {
      const orders = getStoredOrders();
      setOrdersCount(orders.filter(o => o.status === "Pendiente" || o.status === "En Cocina").length);
    };

    updateCount();
    window.addEventListener("bettos_pizza_db_update", updateCount);
    const interval = setInterval(updateCount, 2500);

    return () => {
      window.removeEventListener("bettos_pizza_db_update", updateCount);
      clearInterval(interval);
    };
  }, []);

  const handleOrderNotification = () => {
    // Forces children elements to re-sync
    window.dispatchEvent(new Event("bettos_pizza_db_update"));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pizza-gradient text-slate-100 select-none">
      
      {/* Top Universal Branding Bar with Italian accent flag */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-40 sticky top-0 shadow-xl">
        <div className="flex items-center space-x-3">
          {/* Pizza logo */}
          <div className="w-11 h-11 bg-yellow-400 border-2 border-red-500 rounded-full flex items-center justify-center shadow-lg font-display font-black text-red-600 text-sm tracking-tight shrink-0">
            BP
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-black text-lg text-yellow-400 uppercase tracking-tight leading-none">
                BETTO'S PIZZA
              </h1>
              {/* Italian flag element */}
              <div className="flex h-3 w-5 rounded overflow-hidden shadow-xs border border-white/20 shrink-0">
                <div className="w-1/3 bg-green-600 h-full"></div>
                <div className="w-1/3 bg-white h-full"></div>
                <div className="w-1/3 bg-red-600 h-full"></div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-none tracking-wide font-medium">
              EL AUTENTICO SABOR ITALIANO • ¡LA MAGIA DEL SABOR!
            </p>
          </div>
        </div>

        {/* Universal Role Navigator Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80 max-w-full">
          
          <button
            onClick={() => setViewMode("MULTIPANEL")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === "MULTIPANEL"
                ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor size={13} />
            <span className="hidden lg:inline">Simulador Realtime</span>
            <span className="lg:hidden">4-en-1</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1 hidden md:block"></div>

          <button
            onClick={() => setViewMode(Role.CLIENTE)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === Role.CLIENTE
                ? "bg-purple-900 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShoppingBag size={13} />
            <span>Cliente (Móvil)</span>
          </button>

          <button
            onClick={() => setViewMode(Role.VENDEDOR)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === Role.VENDEDOR
                ? "bg-purple-900 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Grid size={13} />
            <span>Vendedor (POS)</span>
          </button>

          <button
            onClick={() => setViewMode(Role.COCINA)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 relative ${
              viewMode === Role.COCINA
                ? "bg-purple-900 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ChefHat size={13} />
            <span>Cocina</span>
            {ordersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
                {ordersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setViewMode(Role.ADMIN)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === Role.ADMIN
                ? "bg-purple-900 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders size={13} />
            <span>Admin</span>
          </button>

        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <AnimatePresence mode="wait">
          
          {/* 1. MULTIPANEL REALTIME SIMULATOR GRID */}
          {viewMode === "MULTIPANEL" && (
            <motion.div
              key="sim-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0 items-start overflow-y-auto"
            >
              
              {/* CLIENT PHONE MODULE (3/12 width) */}
              <div className="xl:col-span-3 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2 px-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-yellow-400 flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                    MÓDULO 1: CLIENTE
                  </span>
                  <span className="text-[10px] text-slate-400">Mockup Celular</span>
                </div>
                <ClientMobileApp onOrderPlaced={handleOrderNotification} />
              </div>

              {/* REST OF ROLES SIMULATION (9/12 width) - Grid of Cocina, POS, Admin */}
              <div className="xl:col-span-9 flex flex-col space-y-6">
                
                {/* Intro guide banner for simulator */}
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-[#ffd400] flex items-center uppercase tracking-wider">
                      <Sparkles size={14} className="mr-1.5 text-yellow-400" />
                      SIMULADOR EN TIEMPO REAL ACTIVO (Vistas Simultáneas)
                    </h3>
                    <p className="text-[11px] text-slate-400 max-w-2xl">
                      Prueba el flujo de trabajo completo de la Pizzeria Betto's: agrega un producto o paquete familiar en el <b>Celular del Cliente</b> o en la <b>Terminal POS del Vendedor</b>. El pedido sonará de inmediato y aparecerá en la <b>Pantalla de Cocina</b> para ser preparado. ¡Las ventas se actualizarán en el panel del <b>Administrador</b>!
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      resetToInitial();
                      handleOrderNotification();
                    }}
                    className="shrink-0 text-[10px] font-bold text-yellow-400 hover:text-slate-950 border border-yellow-500/30 hover:bg-[#ffd400] px-3 py-1.5 rounded-lg transition-all"
                  >
                    Reiniciar Datos Demo
                  </button>
                </div>

                {/* Sub panels row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* KITCHEN DISPLAY BLOCK */}
                  <div className="bg-[#0e1424] rounded-2xl border border-slate-800 shadow-lg h-[460px] overflow-hidden flex flex-col">
                    <div className="bg-[#12192c] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-purple-400 uppercase tracking-wider">MÓDULO 2: COCINA</span>
                      <span className="text-[10px] text-slate-400">Rastreador de Preparación</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <KitchenDisplay />
                    </div>
                  </div>

                  {/* ADMIN STATS BLOCK */}
                  <div className="bg-[#0b080f] rounded-2xl border border-slate-800 shadow-lg h-[460px] overflow-hidden flex flex-col">
                    <div className="bg-[#140f1a] border-b border-purple-950/60 px-4 py-2.5 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#ffd400] uppercase tracking-wider">MÓDULO 3: ADMIN & MÉTRICAS</span>
                      <span className="text-[10px] text-slate-400">Métricas & Menú</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <AdminPanel />
                    </div>
                  </div>

                </div>

                {/* POS SYSTEM BLOCK */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg h-[500px] overflow-hidden flex flex-col">
                  <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider">MÓDULO 4: VENDEDOR / CAJERO (POS)</span>
                    <span className="text-[10px] text-slate-400">Terminal de Venta Rápida (Optimizado para Tablet/PC)</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <POSSystem onOrderPlaced={handleOrderNotification} />
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* 2. SINGLE ROLE VIEWS */}
          {viewMode === Role.CLIENTE && (
            <motion.div
              key="client-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex items-center justify-center p-6 overflow-y-auto"
            >
              <ClientMobileApp onOrderPlaced={handleOrderNotification} />
            </motion.div>
          )}

          {viewMode === Role.VENDEDOR && (
            <motion.div
              key="vendedor-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <POSSystem onOrderPlaced={handleOrderNotification} />
            </motion.div>
          )}

          {viewMode === Role.COCINA && (
            <motion.div
              key="cocina-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <KitchenDisplay />
            </motion.div>
          )}

          {viewMode === Role.ADMIN && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <AdminPanel />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer detailing addresses and quick transfer support info */}
      <footer className="bg-slate-950 border-t border-slate-900/60 py-4 px-6 text-center text-[11px] text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <p className="flex items-center justify-center md:justify-start">
          <MapPin size={12} className="mr-1.5 text-red-500" />
          <span>Sucursal Principal: Av. Sta Cecilia Mz. 6Lt. 26, Hugo Cervantes del Río (priv. Sta Cecilia y Circuito Chicoasen) Tlanepantla, Edo. de México</span>
        </p>
        <div className="flex items-center justify-center gap-3 font-medium text-slate-300">
          <span className="flex items-center text-green-400"><Phone size={11} className="mr-1" /> 55 1326-5826</span>
          <span>•</span>
          <span className="text-[#ffd400]">Se Aceptan Transferencias</span>
          <span>•</span>
          <span className="text-slate-400">Consumo Mínimo Domicilio $200</span>
        </div>
      </footer>

    </div>
  );
}
