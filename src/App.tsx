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
  Monitor,
  ArrowLeft,
  Home
} from "lucide-react";
import ClientMobileApp from "./components/ClientMobileApp";
import POSSystem from "./components/POSSystem";
import KitchenDisplay from "./components/KitchenDisplay";
import AdminPanel from "./components/AdminPanel";
import { Role } from "./types";
import { getStoredOrders, resetToInitial } from "./utils/pizzaStore";

export default function App() {
  // Active viewing mode: can be "HOME", "MULTIPANEL", or individual roles (Role.CLIENTE, Role.VENDEDOR, Role.COCINA, Role.ADMIN)
  const [viewMode, setViewMode] = useState<"HOME" | "MULTIPANEL" | Role>("HOME");
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
    <div className="min-h-screen bg-slate-950 flex flex-col pizza-gradient text-slate-100 select-none animate-fadeIn">
      
      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <AnimatePresence mode="wait">
          
          {/* AESTHETIC HOME PORTAL MENU */}
          {viewMode === "HOME" && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 min-h-0"
            >
              <div className="text-center mb-10 max-w-md">
                <div className="inline-flex h-4 w-7 rounded overflow-hidden shadow-sm border border-white/20 mb-4 animate-pulse">
                  <div className="w-1/3 bg-green-600 h-full"></div>
                  <div className="w-1/3 bg-white h-full"></div>
                  <div className="w-1/3 bg-red-600 h-full"></div>
                </div>
                <h1 className="font-display font-black text-4xl md:text-5xl text-yellow-400 tracking-tight leading-none uppercase">
                  BETTO'S PIZZA
                </h1>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-3">
                  SISTEMA DE GESTIÓN DE ROLES
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                {/* Role 1: Cliente */}
                <button
                  onClick={() => setViewMode(Role.CLIENTE)}
                  className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center text-center justify-center h-48 shadow-lg hover:shadow-purple-500/10 cursor-pointer animate-fadeIn"
                >
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400 flex items-center justify-center transition-all duration-300 mb-4 shadow-inner transform group-hover:scale-110">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="font-display font-black text-xl text-slate-100 group-hover:text-purple-300 transition-colors">
                    Cliente (Móvil)
                  </h3>
                </button>

                {/* Role 2: Vendedor */}
                <button
                  onClick={() => setViewMode(Role.VENDEDOR)}
                  className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center text-center justify-center h-48 shadow-lg hover:shadow-emerald-500/10 cursor-pointer animate-fadeIn"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-all duration-300 mb-4 shadow-inner transform group-hover:scale-110">
                    <Grid size={32} />
                  </div>
                  <h3 className="font-display font-black text-xl text-slate-100 group-hover:text-emerald-300 transition-colors">
                    Vendedor (POS)
                  </h3>
                </button>

                {/* Role 3: Cocina */}
                <button
                  onClick={() => setViewMode(Role.COCINA)}
                  className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center text-center justify-center h-48 shadow-lg hover:shadow-amber-500/10 cursor-pointer animate-fadeIn"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-all duration-300 mb-4 shadow-inner relative transform group-hover:scale-110">
                    <ChefHat size={32} />
                    {ordersCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-mono text-xs w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce shadow-md">
                        {ordersCount}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-black text-xl text-slate-100 group-hover:text-amber-300 transition-colors">
                    Cocina
                  </h3>
                </button>

                {/* Role 4: Admin */}
                <button
                  onClick={() => setViewMode(Role.ADMIN)}
                  className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-rose-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center text-center justify-center h-48 shadow-lg hover:shadow-rose-500/10 cursor-pointer animate-fadeIn"
                >
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-all duration-300 mb-4 shadow-inner transform group-hover:scale-110">
                    <Sliders size={32} />
                  </div>
                  <h3 className="font-display font-black text-xl text-slate-100 group-hover:text-rose-300 transition-colors">
                    Admin
                  </h3>
                </button>
              </div>
            </motion.div>
          )}

          {/* 2. SINGLE ROLE VIEWS */}
          {viewMode === Role.CLIENTE && (
            <motion.div
              key="client-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 w-full"
            >
              <ClientMobileApp onOrderPlaced={handleOrderNotification} onBackToHome={() => setViewMode("HOME")} />
            </motion.div>
          )}

          {viewMode === Role.VENDEDOR && (
            <motion.div
              key="vendedor-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 w-full"
            >
              <POSSystem onOrderPlaced={handleOrderNotification} onBackToHome={() => setViewMode("HOME")} />
            </motion.div>
          )}

          {viewMode === Role.COCINA && (
            <motion.div
              key="cocina-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 w-full"
            >
              <KitchenDisplay onBackToHome={() => setViewMode("HOME")} />
            </motion.div>
          )}

          {viewMode === Role.ADMIN && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 w-full"
            >
              <AdminPanel onBackToHome={() => setViewMode("HOME")} />
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
          {viewMode !== "HOME" && (
            <button
              onClick={() => setViewMode("HOME")}
              className="px-2.5 py-1 rounded-lg bg-[#ffd400] hover:bg-yellow-300 text-slate-950 font-extrabold transition-all text-[10px] uppercase tracking-wider cursor-pointer mr-1 flex items-center space-x-1 shadow-md shrink-0"
              title="Volver al menú de selección de roles"
            >
              <span>← Ver Otros Roles</span>
            </button>
          )}
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
