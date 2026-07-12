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
  Home,
  Bike
} from "lucide-react";
import ClientMobileApp from "./components/ClientMobileApp";
import POSSystem from "./components/POSSystem";
import KitchenDisplay from "./components/KitchenDisplay";
import AdminPanel from "./components/AdminPanel";
import DeliveryPanel from "./components/DeliveryPanel";
import { Role } from "./types";
import { getStoredOrders, resetToInitial } from "./utils/pizzaStore";

export const INITIAL_BRANDING = {
  appName: "Betto's Pizza",
  logoUrl: "",
  bgType: "gradient", // "color" | "gradient"
  bgColor: "#0a070e",
  bgGradientStart: "#1f0824",
  bgGradientEnd: "#0d020e",
  cardColor: "#160f1e",
  accentColor: "#ffd400",
  accentTextColor: "#0a070e",
  textColor: "#f1f5f9",
  headerColor: "#191122",
  // Customizable text defaults
  homeSubtitle: "SISTEMA DE GESTIÓN DE ROLES",
  clientPromoTag: "2X1 TODOS LOS DÍAS",
  clientSpecialtyTitle: "Especialidades al 2x1",
  clientWelcomeText: "Edo. de México",
  clientPhoneText: "55 1326-5826",
  clientMinOrderAmount: 200,
  clientFooterSchedule: "Abierto todos los días de 1:00 PM a 11:00 PM",
  clientDeliveryInstruction: "Tu pizza se prepara al momento con ingredientes frescos.",
  posTerminalName: "Betto's Pizza - POS Terminal"
};

export default function App() {
  const [branding, setBranding] = useState(() => {
    const saved = localStorage.getItem("bettos_pizza_branding");
    if (saved) {
      try {
        return { ...INITIAL_BRANDING, ...JSON.parse(saved) };
      } catch {
        return INITIAL_BRANDING;
      }
    }
    return INITIAL_BRANDING;
  });

  // Active viewing mode: can be "HOME", "MULTIPANEL", or individual roles (Role.CLIENTE, Role.VENDEDOR, Role.COCINA, Role.ADMIN, Role.MENSAJERO)
  const [viewMode, setViewMode] = useState<"HOME" | "MULTIPANEL" | Role>(() => {
    const saved = localStorage.getItem("bettos_pizza_view_mode");
    if (saved && (saved === "HOME" || saved === "MULTIPANEL" || Object.values(Role).includes(saved as Role))) {
      return saved as "HOME" | "MULTIPANEL" | Role;
    }
    return "HOME";
  });
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [readyDeliveriesCount, setReadyDeliveriesCount] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem("bettos_pizza_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    const handleBrandingUpdate = () => {
      const saved = localStorage.getItem("bettos_pizza_branding");
      if (saved) {
        try {
          setBranding({ ...INITIAL_BRANDING, ...JSON.parse(saved) });
        } catch (e) {
          console.error("Error reading updated branding", e);
        }
      }
    };
    window.addEventListener("bettos_pizza_branding_update", handleBrandingUpdate);
    return () => window.removeEventListener("bettos_pizza_branding_update", handleBrandingUpdate);
  }, []);

  useEffect(() => {
    // Read total order count for notification badge
    const updateCount = () => {
      const orders = getStoredOrders();
      setOrdersCount(orders.filter(o => o.status === "Pendiente" || o.status === "En Cocina").length);
      setReadyDeliveriesCount(orders.filter(o => o.status === "Listo" && o.type === "Domicilio" && !o.deliveryManName).length);
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
    <div className={`bg-slate-950 flex flex-col pizza-gradient text-slate-100 select-none animate-fadeIn ${
      viewMode === "HOME" || viewMode === Role.CLIENTE ? "min-h-screen" : "h-[100dvh] overflow-hidden"
    }`}>
      {/* Dynamic Branding Style Overrides */}
      <style>{`
        :root {
          --app-bg: ${branding.bgType === 'color' ? branding.bgColor : `linear-gradient(135deg, ${branding.bgGradientStart} 0%, ${branding.bgGradientEnd} 100%)`};
          --app-card: ${branding.cardColor};
          --app-accent: ${branding.accentColor};
          --app-accent-text: ${branding.accentTextColor || '#0a070e'};
          --app-text: ${branding.textColor};
          --app-header: ${branding.headerColor};
        }
        
        /* Background Overrides */
        body, .pizza-gradient, .bg-slate-950, .bg-slate-900, .bg-\\[\\#0a070e\\], .bg-\\[\\#0a0f1d\\], .bg-\\[\\#0d0714\\] {
          background: ${branding.bgType === 'color' ? branding.bgColor : `linear-gradient(135deg, ${branding.bgGradientStart} 0%, ${branding.bgGradientEnd} 100%)`} !important;
          background-image: ${branding.bgType === 'color' ? 'none' : `linear-gradient(135deg, ${branding.bgGradientStart} 0%, ${branding.bgGradientEnd} 100%)`} !important;
        }
        
        /* Card Background Overrides */
        .bg-\\[\\#160f1e\\], 
        .bg-\\[\\#12192c\\]\\/60, 
        .bg-\\[\\#12192c\\], 
        .bg-\\[\\#111726\\], 
        .bg-slate-900, 
        .bg-slate-900\\/80, 
        .bg-slate-800,
        .bg-slate-800\\/60,
        .bg-slate-800\\/40,
        .bg-purple-950\\/15, 
        .bg-purple-950\\/30, 
        .bg-\\[\\#150a22\\], 
        .bg-\\[\\#0f0717\\], 
        .bg-\\[\\#1c1226\\],
        .bg-\\[\\#160f1e\\]\\/85,
        .bg-\\[\\#1e1428\\],
        .bg-slate-900\\/60 {
          background-color: ${branding.cardColor} !important;
        }
        
        /* Header Background Overrides */
        .bg-\\[\\#191122\\], 
        .bg-\\[\\#2C0C30\\], 
        .bg-\\[\\#150a22\\], 
        .bg-\\[\\#111726\\], 
        .bg-\\[\\#1a1122\\] {
          background-color: ${branding.headerColor} !important;
        }
        
        /* Accent Texts */
        .text-\\[\\#ffd400\\], .text-yellow-400, .text-yellow-300, .group-hover\\:text-yellow-400:hover, .text-amber-400, .text-purple-300, .text-red-400 {
          color: ${branding.accentColor} !important;
        }
        
        /* Accent Backgrounds (such as primary buttons) */
        .bg-\\[\\#ffd400\\], .bg-yellow-400, .bg-yellow-300, .yellow-accent, .hover\\:bg-yellow-400:hover, .bg-amber-500 {
          background-color: ${branding.accentColor} !important;
          color: ${branding.accentTextColor || '#0a070e'} !important;
        }
        
        /* Make sure button icon children are colored properly in accent bg */
        .bg-\\[\\#ffd400\\] svg, .bg-yellow-400 svg, .bg-yellow-300 svg, .yellow-accent svg {
          stroke: ${branding.accentTextColor || '#0a070e'} !important;
        }
        
        /* General Texts */
        .text-slate-100, .text-slate-200, .text-slate-300, .text-white {
          color: ${branding.textColor} !important;
        }
        
        /* Secondary Dimmed Texts */
        .text-slate-400, .text-slate-500, .text-purple-200 {
          color: ${branding.textColor} !important;
          opacity: 0.75;
        }
        
        /* Accent borders */
        .border-\\[\\#ffd400\\], .border-yellow-400, .border-yellow-500, .border-purple-950\\/40, .border-slate-800, .border-slate-700\\/40, .border-purple-950\\/60 {
          border-color: ${branding.accentColor}40 !important; /* light alpha */
        }
        
        /* Custom scrollbars */
        ::-webkit-scrollbar-thumb {
          background: ${branding.accentColor}4D !important;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${branding.accentColor} !important;
        }
      `}</style>
      
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
              <div className="text-center mb-10 max-w-md flex flex-col items-center justify-center">
                {branding.logoUrl ? (
                  <div className="mb-4 relative">
                    <img 
                      src={branding.logoUrl} 
                      alt="Brand Logo" 
                      className="max-h-28 w-auto object-contain rounded-2xl shadow-xl border border-white/10 p-2 bg-black/20"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="inline-flex h-4 w-7 rounded overflow-hidden shadow-sm border border-white/20 mb-4 animate-pulse">
                    <div className="w-1/3 bg-green-600 h-full"></div>
                    <div className="w-1/3 bg-white h-full"></div>
                    <div className="w-1/3 bg-red-600 h-full"></div>
                  </div>
                )}
                <h1 className="font-display font-black text-4xl md:text-5xl text-yellow-400 tracking-tight leading-none uppercase">
                  {branding.appName || "BETTO'S PIZZA"}
                </h1>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-3">
                  {branding.homeSubtitle || "SISTEMA DE GESTIÓN DE ROLES"}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl">
                {/* Role 1: Cliente */}
                <button
                  onClick={() => setViewMode(Role.CLIENTE)}
                  className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-purple-500/50 rounded-2xl p-4 sm:p-6 transition-all duration-300 flex flex-col items-center text-center justify-center h-36 sm:h-48 shadow-lg hover:shadow-purple-500/10 cursor-pointer animate-fadeIn"
                >
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400 flex items-center justify-center transition-all duration-300 mb-2 sm:mb-4 shadow-inner transform group-hover:scale-110">
                    <ShoppingBag size={24} className="sm:hidden" />
                    <ShoppingBag size={32} className="hidden sm:block" />
                  </div>
                  <h3 className="font-display font-black text-sm sm:text-xl text-slate-100 group-hover:text-purple-300 transition-colors">
                    Cliente (Móvil)
                  </h3>
                </button>

                {/* Role 2: Vendedor */}
                <button
                  onClick={() => setViewMode(Role.VENDEDOR)}
                  className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-6 transition-all duration-300 flex flex-col items-center text-center justify-center h-36 sm:h-48 shadow-lg hover:shadow-emerald-500/10 cursor-pointer animate-fadeIn"
                >
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-all duration-300 mb-2 sm:mb-4 shadow-inner transform group-hover:scale-110">
                    <Grid size={24} className="sm:hidden" />
                    <Grid size={32} className="hidden sm:block" />
                  </div>
                  <h3 className="font-display font-black text-sm sm:text-xl text-slate-100 group-hover:text-emerald-300 transition-colors">
                    Vendedor (POS)
                  </h3>
                </button>

                {/* Role 3: Cocina */}
                <button
                  onClick={() => setViewMode(Role.COCINA)}
                  className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-4 sm:p-6 transition-all duration-300 flex flex-col items-center text-center justify-center h-36 sm:h-48 shadow-lg hover:shadow-amber-500/10 cursor-pointer animate-fadeIn"
                >
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-all duration-300 mb-2 sm:mb-4 shadow-inner relative transform group-hover:scale-110">
                    <ChefHat size={24} className="sm:hidden" />
                    <ChefHat size={32} className="hidden sm:block" />
                    {ordersCount > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-600 text-white font-mono text-[9px] sm:text-xs w-5 h-5 sm:w-6.5 sm:h-6.5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce shadow-md">
                        {ordersCount}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-black text-sm sm:text-xl text-slate-100 group-hover:text-amber-300 transition-colors">
                    Cocina
                  </h3>
                </button>

                {/* Role 4: Mensajero */}
                <button
                  onClick={() => setViewMode(Role.MENSAJERO)}
                  className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-yellow-500/50 rounded-2xl p-4 sm:p-6 transition-all duration-300 flex flex-col items-center text-center justify-center h-36 sm:h-48 shadow-lg hover:shadow-yellow-500/10 cursor-pointer animate-fadeIn"
                >
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 text-yellow-400 flex items-center justify-center transition-all duration-300 mb-2 sm:mb-4 shadow-inner relative transform group-hover:scale-110">
                    <Bike size={24} className="sm:hidden" />
                    <Bike size={32} className="hidden sm:block" />
                    {readyDeliveriesCount > 0 && (
                      <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-600 text-white font-mono text-[9px] sm:text-xs w-5 h-5 sm:w-6.5 sm:h-6.5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce shadow-md">
                        {readyDeliveriesCount}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-black text-sm sm:text-xl text-slate-100 group-hover:text-yellow-300 transition-colors">
                    Mensajero
                  </h3>
                </button>

                {/* Role 5: Admin */}
                <button
                  onClick={() => setViewMode(Role.ADMIN)}
                  className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-rose-500/50 rounded-2xl p-4 sm:p-6 transition-all duration-300 flex flex-col items-center text-center justify-center h-36 sm:h-48 shadow-lg hover:shadow-rose-500/10 cursor-pointer animate-fadeIn col-span-2 sm:col-span-2 md:col-span-1"
                >
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-all duration-300 mb-2 sm:mb-4 shadow-inner transform group-hover:scale-110">
                    <Sliders size={24} className="sm:hidden" />
                    <Sliders size={32} className="hidden sm:block" />
                  </div>
                  <h3 className="font-display font-black text-sm sm:text-xl text-slate-100 group-hover:text-rose-300 transition-colors">
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

          {viewMode === Role.MENSAJERO && (
            <motion.div
              key="mensajero-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 w-full"
            >
              <DeliveryPanel onBackToHome={() => setViewMode("HOME")} />
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
      {(viewMode === "HOME" || viewMode === Role.CLIENTE) && (
        <footer className="bg-slate-950 border-t border-slate-900/60 py-4 px-6 text-center text-[11px] text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shrink-0">
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
      )}

    </div>
  );
}
