/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bike, 
  MapPin, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  User, 
  AlertCircle, 
  Bell, 
  Sparkles,
  Award,
  Navigation,
  LogOut,
  Phone,
  Layers,
  ChevronRight,
  ClipboardList,
  Upload
} from "lucide-react";
import { Order, OrderStatus } from "../types";
import { getStoredOrders, saveOrders } from "../utils/pizzaStore";

interface DeliveryPanelProps {
  onBackToHome?: () => void;
}

const COMMISSION_RATE = 35; // $35 MXN per delivery

export default function DeliveryPanel({ onBackToHome }: DeliveryPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [courierName, setCourierName] = useState<string>(() => {
    return localStorage.getItem("bettos_active_courier_name") || "Carlos Gómez";
  });
  const [courierPhone, setCourierPhone] = useState<string>(() => {
    return localStorage.getItem("bettos_active_courier_phone") || "55 9812-4321";
  });
  const [courierAvatar, setCourierAvatar] = useState<string>(() => {
    return localStorage.getItem("bettos_active_courier_avatar") || "🛵";
  });
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(courierName);
  const [activeTab, setActiveTab] = useState<"semaphore" | "available" | "my-deliveries" | "history" | "commissions">("semaphore");
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string }[]>([]);
  
  const ordersRef = useRef<Order[]>([]);
  const lastOrdersCountRef = useRef<number>(0);
  const lastReadyCountRef = useRef<number>(0);
  
  // Keep ordersRef in sync with state
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Load orders and sync
  useEffect(() => {
    const handleUpdate = () => {
      const updated = getStoredOrders();
      const prevList = ordersRef.current;
      
      // Prevent redundant state updates by checking stringified values
      if (JSON.stringify(prevList) === JSON.stringify(updated)) {
        return;
      }

      // Check for status-specific changes to trigger notifications
      if (prevList.length > 0) {
        // 1. Check if a new order entered preparation (moved to "En Cocina")
        const isNowPreparing = updated.filter(o => o.status === "En Cocina" && !prevList.find(po => po.id === o.id && po.status === "En Cocina"));
        if (isNowPreparing.length > 0) {
          triggerInAppNotification(`Pedido #${isNowPreparing[0].orderNumber} (${isNowPreparing[0].customerName}) está siendo preparado en Cocina 🟡`);
          playNotificationSound(600); // lower tone
        }

        // 2. Check if a delivery order is now "Listo" (Ready)
        const isNowReady = updated.filter(o => o.status === "Listo" && o.type === "Domicilio" && !prevList.find(po => po.id === o.id && po.status === "Listo"));
        if (isNowReady.length > 0) {
          triggerInAppNotification(`¡Pedido #${isNowReady[0].orderNumber} listo para repartir! 🟢`);
          playNotificationSound(880); // high tone
        }
      }

      setOrders(updated);
      lastOrdersCountRef.current = updated.length;
      lastReadyCountRef.current = updated.filter(o => o.status === "Listo" && o.type === "Domicilio").length;
    };

    // Run once initially
    handleUpdate();

    window.addEventListener("bettos_pizza_db_update", handleUpdate);
    const interval = setInterval(handleUpdate, 1500);

    return () => {
      window.removeEventListener("bettos_pizza_db_update", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Handle courier name change
  const handleSaveCourierName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setCourierName(trimmed);
      localStorage.setItem("bettos_active_courier_name", trimmed);
      setIsEditingName(false);
      triggerInAppNotification(`Perfil cambiado a: ${trimmed} 🛵`);
    }
  };

  // Trigger custom synthesize beep
  const playNotificationSound = (pitch: number) => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, context.currentTime);
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, context.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
      osc.start();
      osc.stop(context.currentTime + 0.4);
    } catch (e) {
      console.log("Audio not authorized");
    }
  };

  // In-app notifications
  const triggerInAppNotification = (text: string) => {
    const id = Date.now().toString();
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setNotifications(prev => [{ id, text, time }, ...prev].slice(0, 5));
  };

  // Action: Accept order to deliver (Moves to "En Camino")
  const handleAcceptDelivery = (orderId: string) => {
    const list = getStoredOrders();
    const updated = list.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "En Camino" as OrderStatus,
          deliveryManId: courierName.toLowerCase().replace(/\s+/g, "-"),
          deliveryManName: courierName,
          commissionEarned: COMMISSION_RATE
        };
      }
      return o;
    });
    saveOrders(updated);
    setOrders(updated);
    triggerInAppNotification(`Iniciaste reparto para Pedido #${list.find(o => o.id === orderId)?.orderNumber} 🔵`);
    playNotificationSound(700);
    setActiveTab("my-deliveries");
  };

  // Action: Finish delivery (Moves to "Entregado")
  const handleCompleteDelivery = (orderId: string) => {
    const list = getStoredOrders();
    const updated = list.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Entregado" as OrderStatus,
          deliveredAt: new Date().toISOString()
        };
      }
      return o;
    });
    saveOrders(updated);
    setOrders(updated);
    triggerInAppNotification(`¡Pedido #${list.find(o => o.id === orderId)?.orderNumber} entregado con éxito! ✅`);
    playNotificationSound(1000);
  };

  // Calculations for this courier
  const myCourierId = courierName.toLowerCase().replace(/\s+/g, "-");
  
  // My active delivery orders (En Camino)
  const myActiveDeliveries = orders.filter(o => o.status === "En Camino" && o.deliveryManName === courierName);
  
  // My completed delivery orders (Entregado)
  const myCompletedDeliveries = orders.filter(o => o.status === "Entregado" && o.deliveryManName === courierName);
  
  // Available delivery orders (status "Listo" and type "Domicilio", without courier)
  const availableDeliveries = orders.filter(o => o.status === "Listo" && o.type === "Domicilio" && !o.deliveryManName);

  // Financial Stats
  const totalCommissions = myCompletedDeliveries.length * COMMISSION_RATE;
  const totalValueDelivered = myCompletedDeliveries.reduce((sum, o) => sum + o.total, 0);
  
  // Cash collected (For delivery cash sales, we must return to base)
  const cashCollectedToSurrender = myCompletedDeliveries
    .filter(o => o.paymentMethod === "Efectivo")
    .reduce((sum, o) => sum + o.total, 0);

  // Kitchen Live Status counts (Traffic Light counts)
  const pendingCount = orders.filter(o => o.status === "Pendiente").length;
  const preparingCount = orders.filter(o => o.status === "En Cocina").length;
  const readyDomicilioCount = orders.filter(o => o.status === "Listo" && o.type === "Domicilio").length;

  return (
    <div className="w-full h-full bg-[#0d0714] text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Header Panel */}
      <header className="bg-[#150a22] border-b border-purple-950/70 px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg gap-2 shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="p-2 bg-[#ffd400] text-slate-950 rounded-xl shrink-0 shadow-[0_0_15px_rgba(255,212,0,0.2)]">
            <Bike size={20} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-black text-sm sm:text-base md:text-lg uppercase tracking-tight text-yellow-400 truncate">
              Módulo de Mensajero
            </h2>
            <p className="text-[10px] sm:text-xs text-purple-300 truncate">
              Reparto & Comisiones • Betto's Pizza
            </p>
          </div>
        </div>

        {/* Courier Active Profile */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => {
              setTempName(courierName);
              setShowProfileModal(true);
            }}
            className="flex items-center space-x-1.5 bg-[#1c0f2e] hover:bg-[#25133d] border border-purple-900/40 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-xs font-bold text-slate-200"
            title="Mi Perfil de Repartidor"
          >
            <span className="text-sm">{courierAvatar}</span>
            <span className="truncate max-w-[90px] sm:max-w-none">{courierName}</span>
          </button>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-900/30 text-red-200 text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer shrink-0"
            >
              <LogOut size={12} className="shrink-0" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Panel Content (Split: Navigation Menu Left or Top, Active Module right) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        
        {/* Navigation Sidebar (Desktop) / Tabs bar (Mobile) */}
        <aside className="w-full md:w-60 bg-[#0f0717] md:border-r border-purple-950/40 flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-x-visible md:overflow-y-auto scrollbar-none z-10">
          <div className="flex md:flex-col w-full p-2 gap-1.5 md:p-3">
            
            {/* Tab 1: Semáforo Live */}
            <button
              onClick={() => setActiveTab("semaphore")}
              className={`flex items-center justify-center md:justify-start space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-none ${
                activeTab === "semaphore"
                  ? "bg-[#fdc001] text-slate-950 font-black shadow-md shadow-[#fdc001]/10"
                  : "text-slate-400 hover:text-slate-100 bg-[#160a22]/30 hover:bg-[#1a0c28]/70 border border-purple-950/30"
              }`}
            >
              <Layers size={14} className="shrink-0" />
              <span>🚥 Semáforo Cocina</span>
              {pendingCount + preparingCount > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "semaphore" ? "bg-slate-900 text-white" : "bg-purple-950 text-purple-300 animate-pulse"}`}>
                  {pendingCount + preparingCount}
                </span>
              )}
            </button>

            {/* Tab 2: Pedidos Listos */}
            <button
              onClick={() => setActiveTab("available")}
              className={`flex items-center justify-center md:justify-start space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-none relative ${
                activeTab === "available"
                  ? "bg-[#fdc001] text-slate-950 font-black shadow-md shadow-[#fdc001]/10"
                  : "text-slate-400 hover:text-slate-100 bg-[#160a22]/30 hover:bg-[#1a0c28]/70 border border-purple-950/30"
              }`}
            >
              <Bike size={14} className="shrink-0" />
              <span>📦 Pedidos Listos</span>
              {availableDeliveries.length > 0 && (
                <span className="absolute -top-1 right-1 md:relative md:top-0 md:right-0 bg-red-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-slate-950 animate-bounce">
                  {availableDeliveries.length}
                </span>
              )}
            </button>

            {/* Tab 3: En Reparto */}
            <button
              onClick={() => setActiveTab("my-deliveries")}
              className={`flex items-center justify-center md:justify-start space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-none ${
                activeTab === "my-deliveries"
                  ? "bg-[#fdc001] text-slate-950 font-black shadow-md shadow-[#fdc001]/10"
                  : "text-slate-400 hover:text-slate-100 bg-[#160a22]/30 hover:bg-[#1a0c28]/70 border border-purple-950/30"
              }`}
            >
              <Navigation size={14} className="shrink-0" />
              <span>🚀 En Reparto</span>
              {myActiveDeliveries.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === "my-deliveries" ? "bg-slate-900 text-yellow-400" : "bg-purple-600 text-white animate-pulse"}`}>
                  {myActiveDeliveries.length} Activos
                </span>
              )}
            </button>

            {/* Tab 4: Entregas Realizadas */}
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center justify-center md:justify-start space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-none ${
                activeTab === "history"
                  ? "bg-[#fdc001] text-slate-950 font-black shadow-md shadow-[#fdc001]/10"
                  : "text-slate-400 hover:text-slate-100 bg-[#160a22]/30 hover:bg-[#1a0c28]/70 border border-purple-950/30"
              }`}
            >
              <CheckCircle size={14} className="shrink-0" />
              <span>✅ Entregas Hechas</span>
              {myCompletedDeliveries.length > 0 && (
                <span className="ml-1 text-[10px] font-bold text-slate-400">({myCompletedDeliveries.length})</span>
              )}
            </button>

            {/* Tab 5: Comisiones */}
            <button
              onClick={() => setActiveTab("commissions")}
              className={`flex items-center justify-center md:justify-start space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-none ${
                activeTab === "commissions"
                  ? "bg-[#fdc001] text-slate-950 font-black shadow-md shadow-[#fdc001]/10"
                  : "text-slate-400 hover:text-slate-100 bg-[#160a22]/30 hover:bg-[#1a0c28]/70 border border-purple-950/30"
              }`}
            >
              <DollarSign size={14} className="shrink-0" />
              <span>💰 Mis Comisiones</span>
              {totalCommissions > 0 && (
                <span className="ml-1 text-[10px] text-green-400 font-bold font-mono">${totalCommissions}</span>
              )}
            </button>

          </div>

          {/* Real-time Alerts Panel (Bottom of sidebar, desktop only) */}
          <div className="hidden md:flex flex-col mt-auto p-4 border-t border-purple-950/30 max-h-48 overflow-y-auto scrollbar-none">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-purple-400 flex items-center mb-2">
              <Bell size={10} className="mr-1 text-yellow-400" /> Historial de Alertas
            </h4>
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">No hay alertas recientes.</p>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className="text-[9px] bg-purple-950/20 border border-purple-950/40 p-1.5 rounded-lg">
                    <p className="text-slate-300 leading-tight">{notif.text}</p>
                    <span className="text-slate-500 text-[8px] font-mono block mt-1">{notif.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Core content view */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto min-h-0 flex flex-col space-y-6">
          
          {/* TOP METRICS STRIP (Always visible on desktop or at top of panel) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Commissions */}
            <div className="bg-[#190a29]/60 border border-purple-950/40 rounded-2xl p-4 flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="absolute right-2 top-2 text-purple-950/20 pointer-events-none">
                <Award size={64} />
              </div>
              <div>
                <p className="text-xs text-purple-400 font-medium">Comisión Ganada</p>
                <p className="text-xl sm:text-2xl font-mono font-black text-green-400 mt-1">
                  ${totalCommissions.toLocaleString("es-MX")} <span className="text-xs text-slate-400">MXN</span>
                </p>
                <span className="text-[9px] text-slate-400 block mt-1">
                  {myCompletedDeliveries.length} entregas completadas
                </span>
              </div>
              <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                <DollarSign size={20} />
              </div>
            </div>

            {/* Metric 2: Deliveries Completed */}
            <div className="bg-[#190a29]/60 border border-purple-950/40 rounded-2xl p-4 flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="absolute right-2 top-2 text-purple-950/20 pointer-events-none">
                <CheckCircle size={64} />
              </div>
              <div>
                <p className="text-xs text-purple-400 font-medium">Entregas Hechas</p>
                <p className="text-xl sm:text-2xl font-mono font-black text-[#ffd400] mt-1">
                  {myCompletedDeliveries.length}
                </p>
                <span className="text-[9px] text-slate-400 block mt-1">
                  Tasa de efectividad: 100%
                </span>
              </div>
              <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl">
                <Bike size={20} />
              </div>
            </div>

            {/* Metric 3: Value Delivered */}
            <div className="bg-[#190a29]/60 border border-purple-950/40 rounded-2xl p-4 flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="absolute right-2 top-2 text-purple-950/20 pointer-events-none">
                <TrendingUp size={64} />
              </div>
              <div>
                <p className="text-xs text-purple-400 font-medium">Ventas Entregadas</p>
                <p className="text-xl sm:text-2xl font-mono font-black text-purple-300 mt-1">
                  ${totalValueDelivered.toLocaleString("es-MX")}
                </p>
                <span className="text-[9px] text-slate-400 block mt-1">
                  Suma total de tickets
                </span>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-300 rounded-xl">
                <TrendingUp size={20} />
              </div>
            </div>

            {/* Metric 4: Cash to Surrender */}
            <div className="bg-[#190a29]/60 border border-purple-950/40 rounded-2xl p-4 flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="absolute right-2 top-2 text-purple-950/20 pointer-events-none">
                <DollarSign size={64} />
              </div>
              <div>
                <p className="text-xs text-purple-400 font-medium">Efectivo por Entregar</p>
                <p className="text-xl sm:text-2xl font-mono font-black text-red-400 mt-1">
                  ${cashCollectedToSurrender.toLocaleString("es-MX")}
                </p>
                <span className="text-[9px] text-slate-400 block mt-1">
                  Cobrado en Efectivo para caja
                </span>
              </div>
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                <DollarSign size={20} />
              </div>
            </div>
          </section>

          {/* ACTIVE TAB VIEWS */}
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: SEMAPHORE / LIVE TRACKING OF PIZZAS */}
            {activeTab === "semaphore" && (
              <motion.div
                key="semaphore-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-[#150a22]/80 border border-purple-950/50 rounded-2xl p-4 sm:p-6 shadow-xl relative">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-purple-950/40 gap-3">
                    <div>
                      <h3 className="font-display font-black text-base uppercase text-yellow-400 flex items-center gap-1.5">
                        <span>🚥 Semáforo de Producción de Pizzas</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Monitorea en tiempo real el estado de los pedidos que vienen en camino.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                      <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-950/40 px-2 py-0.5 rounded">
                        Monitor En Vivo
                      </span>
                    </div>
                  </div>

                  {/* Semaphore Graphical Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    
                    {/* Stage 🔴: PENDIENTE */}
                    <div className="bg-slate-900/60 rounded-xl p-4 border border-red-500/20 shadow-md flex flex-col justify-between h-40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase text-red-500 tracking-wider">Llegó a Cocina</span>
                        <span className="w-3.5 h-3.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                      </div>
                      <div className="my-3 text-center">
                        <p className="text-3xl font-black text-red-400 font-mono">
                          {pendingCount}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Pedidos por preparar</p>
                      </div>
                      <div className="text-[9px] text-red-400 bg-red-950/30 py-1 px-2 rounded font-medium text-center truncate">
                        🔴 Semáforo Rojo
                      </div>
                    </div>

                    {/* Stage 🟡: EN PREPARACION */}
                    <div className="bg-slate-900/60 rounded-xl p-4 border border-amber-500/20 shadow-md flex flex-col justify-between h-40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase text-amber-500 tracking-wider">Preparándose</span>
                        <span className="w-3.5 h-3.5 bg-amber-500 rounded-full animate-ping shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                      </div>
                      <div className="my-3 text-center">
                        <p className="text-3xl font-black text-amber-400 font-mono">
                          {preparingCount}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Pizzas en el horno</p>
                      </div>
                      <div className="text-[9px] text-amber-400 bg-amber-950/30 py-1 px-2 rounded font-medium text-center truncate">
                        🟡 Semáforo Amarillo
                      </div>
                    </div>

                    {/* Stage 🟢: LISTO PARA ENTREGAR */}
                    <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-500/20 shadow-md flex flex-col justify-between h-40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase text-emerald-500 tracking-wider">Listo</span>
                        <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                      </div>
                      <div className="my-3 text-center">
                        <p className="text-3xl font-black text-emerald-400 font-mono">
                          {readyDomicilioCount}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Esperando repartidor</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("available")}
                        className="text-[9px] text-slate-950 bg-emerald-400 hover:bg-emerald-300 py-1 px-2 rounded font-bold text-center transition-colors truncate"
                      >
                        🛵 Reclamar Pedidos ({readyDomicilioCount})
                      </button>
                    </div>

                    {/* Stage 🔵: EN CAMINO */}
                    <div className="bg-slate-900/60 rounded-xl p-4 border border-blue-500/20 shadow-md flex flex-col justify-between h-40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase text-blue-400 tracking-wider">En Camino</span>
                        <span className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                      </div>
                      <div className="my-3 text-center">
                        <p className="text-3xl font-black text-blue-400 font-mono">
                          {myActiveDeliveries.length}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Llevas tú en reparto</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("my-deliveries")}
                        className="text-[9px] text-blue-100 bg-blue-900/60 hover:bg-blue-800 border border-blue-700 py-1 px-2 rounded font-semibold text-center transition-colors truncate"
                      >
                        🗺️ Ver Mi Ruta
                      </button>
                    </div>

                  </div>
                </div>

                {/* Queue monitoring list for the courier */}
                <div className="bg-[#150a22]/40 border border-purple-950/40 rounded-2xl p-4">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-purple-300 flex items-center mb-4">
                    <ClipboardList size={14} className="mr-1.5 text-yellow-400" /> Cola de Órdenes Actuales por Tipo y Estatus
                  </h4>
                  <div className="space-y-2.5">
                    {orders.filter(o => o.status !== "Entregado" && o.status !== "Cancelado").length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-6">No hay pedidos activos registrados en la pizzería actualmente.</p>
                    ) : (
                      orders.filter(o => o.status !== "Entregado" && o.status !== "Cancelado").map(order => {
                        let badgeColor = "bg-red-950 text-red-400 border border-red-800/40";
                        if (order.status === "En Cocina") badgeColor = "bg-amber-950 text-amber-400 border border-amber-800/40";
                        if (order.status === "Listo") badgeColor = "bg-emerald-950 text-emerald-400 border border-emerald-800/40";
                        if (order.status === "En Camino") badgeColor = "bg-blue-950 text-blue-400 border border-blue-800/40";

                        return (
                          <div key={order.id} className="bg-slate-900/50 p-3 rounded-xl border border-purple-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-bold text-slate-200">#{order.orderNumber}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono ${badgeColor}`}>
                                  {order.status === "Pendiente" ? "Llegó a Cocina" : order.status}
                                </span>
                                <span className="text-[10px] text-purple-400 font-medium">({order.type})</span>
                              </div>
                              <p className="text-xs font-bold text-slate-300 mt-1">{order.customerName}</p>
                              {order.customerAddress && (
                                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center">
                                  <MapPin size={10} className="mr-1 text-red-500" /> {order.customerAddress}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <span className="text-xs font-mono font-bold text-yellow-400">${order.total} MXN</span>
                              {order.status === "Listo" && order.type === "Domicilio" && (
                                <button
                                  onClick={() => handleAcceptDelivery(order.id)}
                                  className="px-3 py-1.5 bg-[#ffd400] hover:bg-yellow-300 text-slate-950 text-[10px] font-black uppercase rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                                >
                                  <Bike size={11} />
                                  <span>Repartir</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: AVAILABLE READYS FOR DELIVERY */}
            {activeTab === "available" && (
              <motion.div
                key="available-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-black text-base uppercase text-[#ffd400]">
                      Pedidos Listos para Entregar Domicilio
                    </h3>
                    <p className="text-xs text-slate-400">
                      Toma un pedido listo y empieza tu ruta de entrega. Ganarás una comisión de ${COMMISSION_RATE} MXN por cada uno.
                    </p>
                  </div>
                  <span className="bg-purple-950 text-purple-300 text-xs px-2.5 py-1 rounded-xl font-bold border border-purple-900/50">
                    {availableDeliveries.length} disponibles
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableDeliveries.length === 0 ? (
                    <div className="col-span-2 bg-[#12091c]/60 rounded-2xl border border-purple-950/40 p-12 text-center flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-purple-950/40 text-purple-400 flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 uppercase">¡Felicidades, todo al día!</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No hay pedidos de reparto a domicilio pendientes de salir ahora mismo. Quédate al pendiente de las alertas del semáforo.
                      </p>
                    </div>
                  ) : (
                    availableDeliveries.map(order => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#140b1e]/90 border border-purple-950/60 rounded-2xl p-4 flex flex-col justify-between hover:border-yellow-400/30 transition-all shadow-md relative"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-md">
                                Pedido #{order.orderNumber}
                              </span>
                              <h4 className="text-sm font-bold text-slate-200 mt-2">{order.customerName}</h4>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-400 block font-mono">
                                {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-xs font-mono font-bold text-yellow-400 block mt-0.5">${order.total} MXN</span>
                            </div>
                          </div>

                          <div className="my-3 space-y-2 border-t border-purple-950/30 pt-3">
                            <div className="flex items-start space-x-1.5 text-xs text-slate-300">
                              <MapPin size={13} className="text-red-500 shrink-0 mt-0.5" />
                              <span className="font-semibold">{order.customerAddress || "No registrada"}</span>
                            </div>
                            {order.customerPhone && (
                              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                                <Phone size={12} className="text-green-500 shrink-0" />
                                <span>{order.customerPhone}</span>
                              </div>
                            )}
                          </div>

                          {/* Items summary */}
                          <div className="bg-slate-950/40 p-2 rounded-xl text-[11px] text-slate-400 space-y-1">
                            {order.items.map((item, idx) => (
                              <p key={idx} className="font-medium text-slate-300">
                                {item.quantity}x {item.name} {item.selectedSize ? `(${item.selectedSize})` : ""}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-purple-950/20 flex items-center justify-between">
                          <span className="text-[10px] text-[#ffd400] font-black uppercase tracking-wider flex items-center">
                            <Award size={12} className="mr-1" /> Comisión: +${COMMISSION_RATE}
                          </span>
                          <button
                            onClick={() => handleAcceptDelivery(order.id)}
                            className="bg-[#ffd400] hover:bg-yellow-300 text-slate-950 font-display font-black text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors shadow-md cursor-pointer"
                          >
                            <Bike size={12} />
                            <span>ACEPTAR Y ENTREGAR</span>
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW 3: MY ACTIVE DELIVERIES ON THE ROUTE */}
            {activeTab === "my-deliveries" && (
              <motion.div
                key="my-deliveries-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-display font-black text-base uppercase text-blue-400">
                    Mis Envíos en Ruta Activa
                  </h3>
                  <p className="text-xs text-slate-400">
                    Aquí están los pedidos que estás llevando. El cliente ya sabe que su pizza va en camino con tu nombre.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myActiveDeliveries.length === 0 ? (
                    <div className="col-span-2 bg-[#12091c]/60 rounded-2xl border border-purple-950/40 p-12 text-center flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-blue-950/40 text-blue-400 flex items-center justify-center mb-4">
                        <Navigation size={32} className="animate-spin" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 uppercase">Sin repartos en tránsito</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No has tomado ninguna entrega para llevar todavía. Selecciona la pestaña "Pedidos Listos" para cargar una.
                      </p>
                    </div>
                  ) : (
                    myActiveDeliveries.map(order => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#140b1e]/90 border-l-4 border-blue-500 rounded-2xl p-4 flex flex-col justify-between shadow-md"
                      >
                        <div>
                          <div className="flex justify-between items-start pb-2.5 border-b border-purple-950/20">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] bg-blue-950 text-blue-400 font-mono font-bold px-2 py-0.5 rounded-md">
                                  Pedido #{order.orderNumber}
                                </span>
                                <span className="bg-blue-900/30 text-blue-300 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-blue-800/20">
                                  En Camino 🛵
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-200 mt-1.5">{order.customerName}</h4>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-yellow-400 block">${order.total} MXN</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">{order.paymentMethod}</span>
                            </div>
                          </div>

                          <div className="my-3 space-y-2.5">
                            <div className="flex items-start space-x-1.5 text-xs text-slate-200 bg-slate-950/30 p-2.5 rounded-xl border border-purple-950/10">
                              <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold block text-[10px] text-slate-400">DIRECCIÓN DE ENTREGA</span>
                                <span className="font-bold">{order.customerAddress || "No registrada"}</span>
                              </div>
                            </div>

                            {order.customerPhone && (
                              <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                                <Phone size={13} className="text-green-500 shrink-0" />
                                <span>{order.customerPhone}</span>
                              </div>
                            )}
                          </div>

                          {/* Simulation of a dynamic Map placeholder to enrich design */}
                          <div className="bg-[#180a29] p-3 rounded-xl border border-purple-950/40 text-[10px] text-slate-400 space-y-2 relative overflow-hidden h-24 flex flex-col justify-between">
                            <div className="absolute inset-0 bg-[radial-gradient(#1e1136_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                            <div className="relative flex items-center justify-between text-yellow-400 font-bold uppercase tracking-wider text-[9px]">
                              <span>🧭 MAPA GPS SIMULADO</span>
                              <span className="text-blue-400 animate-pulse">● Conectando satélite</span>
                            </div>
                            <div className="relative flex items-center space-x-2 text-slate-300 font-mono text-[9px] truncate">
                              <Navigation size={11} className="text-blue-400 animate-bounce" />
                              <span>De: Betto's Pizza → Av. Sta Cecilia</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden relative">
                              <div className="bg-blue-500 h-full w-2/3 animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        {/* Order Traffic Light bar inside specific card */}
                        <div className="mt-4 pt-3 border-t border-purple-950/30">
                          <div className="flex items-center justify-between text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-3">
                            <span>Llegó 🔴</span>
                            <span>Cocina 🟡</span>
                            <span>Listo 🟢</span>
                            <span className="text-blue-400">En Ruta 🔵</span>
                            <span>Entregado ✅</span>
                          </div>
                          
                          <button
                            onClick={() => handleCompleteDelivery(order.id)}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-display font-black text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-lg cursor-pointer"
                          >
                            <CheckCircle size={13} />
                            <span>MARCAR COMO ENTREGADO ¡PAGADO!</span>
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW 4: DELIVERY HISTORY */}
            {activeTab === "history" && (
              <motion.div
                key="history-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-black text-base uppercase text-green-400">
                      Historial de Entregas Realizadas
                    </h3>
                    <p className="text-xs text-slate-400">
                      Aquí puedes ver la bitácora de tus entregas finalizadas para llevar control de lo que debes reportar en caja.
                    </p>
                  </div>
                  <span className="bg-green-950/60 border border-green-800/30 text-green-300 font-bold text-xs px-2.5 py-1 rounded-xl">
                    {myCompletedDeliveries.length} entregas
                  </span>
                </div>

                <div className="bg-[#12081d]/80 border border-purple-950/40 rounded-2xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-purple-950/40 bg-purple-950/30 text-purple-300 font-bold uppercase tracking-wider">
                          <th className="p-3">Pedido</th>
                          <th className="p-3">Cliente</th>
                          <th className="p-3">Dirección</th>
                          <th className="p-3">Pago</th>
                          <th className="p-3 font-mono text-right">Comisión</th>
                          <th className="p-3 font-mono text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-950/20">
                        {myCompletedDeliveries.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                              Aún no has completado entregas en este turno.
                            </td>
                          </tr>
                        ) : (
                          myCompletedDeliveries.map(order => (
                            <tr key={order.id} className="hover:bg-purple-950/10 transition-colors">
                              <td className="p-3 font-mono font-bold text-slate-200">
                                #{order.orderNumber}
                              </td>
                              <td className="p-3">
                                <div>
                                  <p className="font-semibold text-slate-200">{order.customerName}</p>
                                  {order.deliveredAt && (
                                    <span className="text-[9px] text-slate-400">
                                      {new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-slate-300 max-w-xs truncate">
                                {order.customerAddress || "N/A"}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  order.paymentMethod === "Efectivo" 
                                    ? "bg-red-950/40 text-red-400 border border-red-900/20" 
                                    : "bg-blue-950/40 text-blue-400 border border-blue-900/20"
                                }`}>
                                  {order.paymentMethod}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-right font-bold text-green-400">
                                +${COMMISSION_RATE}
                              </td>
                              <td className="p-3 font-mono text-right font-black text-yellow-400">
                                ${order.total}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 5: COMMISSIONS REPORT */}
            {activeTab === "commissions" && (
              <motion.div
                key="commissions-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-display font-black text-base uppercase text-yellow-400">
                    Control & Cálculo de Comisiones
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tu esquema de cobros es fijo: recibes una comisión garantizada de **${COMMISSION_RATE} MXN** por cada pedido entregado a domicilio.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Summary Card */}
                  <div className="bg-[#150a22]/80 border border-purple-950/50 rounded-2xl p-4 flex flex-col justify-between h-44 shadow-lg">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-purple-400">Esquema Actual</span>
                      <h4 className="text-lg font-bold text-slate-100 mt-1">Sueldo de Reparto</h4>
                      <p className="text-xs text-slate-400 mt-2">
                        Comisión fija garantizada por orden a domicilio entregada exitosamente.
                      </p>
                    </div>
                    <div className="text-2xl font-mono font-black text-green-400">
                      ${COMMISSION_RATE} MXN <span className="text-xs text-slate-400">/ pedido</span>
                    </div>
                  </div>

                  {/* Liquidation calculations */}
                  <div className="bg-[#150a22]/80 border border-purple-950/50 rounded-2xl p-4 flex flex-col justify-between h-44 shadow-lg">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-purple-400">Arqueo de Caja</span>
                      <h4 className="text-lg font-bold text-slate-100 mt-1">Efectivo a Entregar</h4>
                      <p className="text-xs text-slate-400 mt-2">
                        Monto total cobrado en efectivo a los clientes que debes entregar al administrador.
                      </p>
                    </div>
                    <div className="text-2xl font-mono font-black text-red-400">
                      ${cashCollectedToSurrender} MXN
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="bg-[#150a22]/80 border border-purple-950/50 rounded-2xl p-4 flex flex-col justify-between h-44 shadow-lg">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-purple-400">Ganancias Netas</span>
                      <h4 className="text-lg font-bold text-slate-100 mt-1">Saldo del Turno</h4>
                      <p className="text-xs text-slate-400 mt-2">
                        Tus comisiones ya ganadas en este turno que el administrador te pagará al finalizar.
                      </p>
                    </div>
                    <div className="text-2xl font-mono font-black text-yellow-400">
                      ${totalCommissions} MXN
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-purple-950/30 p-4 rounded-2xl text-xs space-y-3">
                  <h4 className="font-bold text-slate-200">¿Cómo cobrar tus comisiones con el administrador?</h4>
                  <p className="text-slate-400 leading-relaxed">
                    1. Al final de tu turno, dirígete a la caja con el Administrador.<br />
                    2. Entrega el total de **Efectivo a Entregar** (${cashCollectedToSurrender} MXN) correspondiente a los pedidos pagados en Efectivo.<br />
                    3. El Administrador validará en su sistema las **{myCompletedDeliveries.length} entregas** registradas con tu usuario y te entregará tus **${totalCommissions} MXN** de comisiones ganadas.
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </main>

      </div>

      {/* Courier Profile Modal */}
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
              className="bg-[#150a22] border border-purple-950/80 text-slate-100 rounded-2xl p-5 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 mb-4">
                <div className="flex items-center space-x-2">
                  <Bike size={18} className="text-yellow-400" />
                  <h3 className="font-display font-bold text-sm sm:text-base text-yellow-400">Mi Perfil (Mensajero)</h3>
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
                <div className="flex items-center gap-4 bg-[#0d0714] p-3 rounded-xl border border-purple-950/50">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-purple-950/60 flex items-center justify-center text-3xl shadow-inner">
                    {courierAvatar}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-bold text-slate-200">Avatar del Mensajero</p>
                    <p className="text-[10px] text-slate-400">Selecciona tu vehículo/emoji:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {["🛵", "🏍️", "🚲", "🚗", "🏃‍♂️", "⚡", "🧔"].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setCourierAvatar(emoji)}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs transition-all ${
                            courierAvatar === emoji
                              ? "bg-purple-900/60 border-yellow-400 scale-110 shadow-sm"
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
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Nombre del Repartidor</label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full bg-[#0d0714] border border-purple-950/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 transition-all font-medium"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value)}
                    placeholder="Ej: 55 9812-4321"
                    className="w-full bg-[#0d0714] border border-purple-950/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 transition-all font-medium"
                  />
                </div>

                {/* Role Info */}
                <div className="bg-[#0d0714]/80 p-2.5 rounded-lg border border-purple-950 text-[10px] text-slate-400 space-y-1">
                  <p>🛵 <strong>Rol asignado:</strong> Repartidor / Mensajero Express</p>
                  <p>💵 <strong>Comisión por entrega:</strong> ${COMMISSION_RATE} MXN netos</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("bettos_active_courier_name", courierName);
                    localStorage.setItem("bettos_active_courier_phone", courierPhone);
                    localStorage.setItem("bettos_active_courier_avatar", courierAvatar);
                    setShowProfileModal(false);
                    window.dispatchEvent(new Event("bettos_pizza_db_update"));
                  }}
                  className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-display font-black text-xs uppercase rounded-xl shadow-md transition-all mt-2"
                >
                  Guardar Perfil de Repartidor
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
