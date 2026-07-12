/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, 
  Check, 
  ChefHat, 
  Bell, 
  Bike, 
  CheckSquare, 
  Play, 
  ThumbsUp, 
  CheckCircle, 
  Volume2, 
  VolumeX,
  MapPin,
  FileText,
  Home,
  LogOut
} from "lucide-react";
import { Order, OrderStatus } from "../types";
import { getStoredOrders, saveOrders } from "../utils/pizzaStore";

interface KitchenDisplayProps {
  onBackToHome?: () => void;
}

export default function KitchenDisplay({ onBackToHome }: KitchenDisplayProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const previousOrdersCount = useRef<number>(0);

  // Load orders and handle real-time simulation updates
  useEffect(() => {
    const list = getStoredOrders();
    setOrders(list);
    previousOrdersCount.current = list.length;

    const handleUpdate = () => {
      const updated = getStoredOrders();
      
      // If there are more orders now than before, play the new order alarm chime!
      if (updated.length > previousOrdersCount.current) {
        const pendingNew = updated.filter(o => o.status === "Pendiente");
        if (pendingNew.length > 0) {
          playAlarmChime();
        }
      }
      previousOrdersCount.current = updated.length;
      setOrders(updated);
    };

    window.addEventListener("bettos_pizza_db_update", handleUpdate);
    
    // Set up a quick 1.5-second polling interval to capture mock operations placed in other views/roles
    const interval = setInterval(() => {
      handleUpdate();
    }, 1500);

    return () => {
      window.removeEventListener("bettos_pizza_db_update", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Web Audio synth chime
  const playAlarmChime = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Double ding bell sound
      const playDing = (delay: number, pitch: number) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(pitch, context.currentTime + delay);
        gain.gain.setValueAtTime(0, context.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.15, context.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + delay + 0.5);
        osc.start(context.currentTime + delay);
        osc.stop(context.currentTime + delay + 0.55);
      };

      playDing(0, 880);   // High bell A5
      playDing(0.12, 1109); // High bell C#6
      playDing(0.24, 1318); // High bell E6
    } catch (e) {
      console.log("Audio not allowed or initialized");
    }
  };

  // Kitchen success ding
  const playSuccessChime = () => {
    if (!soundEnabled) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, context.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.12, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);
      osc.start();
      osc.stop(context.currentTime + 0.4);
    } catch (e) {
      console.log("Audio not allowed");
    }
  };

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus };
      }
      return o;
    });
    saveOrders(updated);
    setOrders(updated);
    playSuccessChime();
  };

  // Divide orders into columns for kitchen dashboard
  const pendingOrders = orders.filter(o => o.status === "Pendiente");
  const cookingOrders = orders.filter(o => o.status === "En Cocina");
  const readyOrders = orders.filter(o => o.status === "Listo");

  const getElapsedTime = (isoString: string) => {
    const orderTime = new Date(isoString).getTime();
    const diffMs = Date.now() - orderTime;
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 1) return "Hace un momento";
    return `${diffMins} min`;
  };

  return (
    <div className="w-full h-full bg-[#0a0f1d] text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Kitchen Header */}
      <div className="bg-[#111726] border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-md gap-2 overflow-hidden shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 shrink-0">
          <div className="p-1.5 sm:p-2 bg-[#ffd400] text-slate-950 rounded-lg shrink-0">
            <ChefHat size={18} sm:size={22} className="animate-bounce" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-black text-xs sm:text-sm md:text-lg tracking-tight uppercase text-yellow-400 whitespace-nowrap truncate">Pantalla de Cocina</h2>
            <p className="text-[9px] sm:text-xs text-slate-400 whitespace-nowrap truncate">Pedidos en Tiempo Real</p>
          </div>
        </div>

        {/* Audio control & Quick Trigger */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
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

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center space-x-1 sm:space-x-1.5 transition-all shrink-0 ${
              soundEnabled 
                ? "bg-slate-800 hover:bg-slate-700 text-yellow-400" 
                : "bg-red-950/40 border border-red-900/60 text-red-400"
            }`}
          >
            {soundEnabled ? <Volume2 size={13} sm:size={14} /> : <VolumeX size={13} sm:size={14} />}
            <span className="hidden sm:inline">{soundEnabled ? "Sonido Activo" : "Silenciado"}</span>
          </button>

          <button
            onClick={playAlarmChime}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 shrink-0"
            title="Probar Alarma"
          >
            <Bell size={13} sm:size={14} />
          </button>
        </div>
      </div>

      {/* Grid columns */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* COLUMN 1: PENDIENTE */}
        <div className="flex flex-col bg-[#12192c]/60 rounded-2xl border border-slate-800/80 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
              <h3 className="font-display font-bold text-sm uppercase text-amber-500 tracking-wider">Por Confirmar ({pendingOrders.length})</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            <AnimatePresence>
              {pendingOrders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-slate-900 border-l-4 border-amber-500 rounded-xl p-3.5 space-y-3 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">Pedido #{order.orderNumber}</span>
                      <h4 className="text-xs font-bold text-slate-200 mt-0.5">{order.customerName}</h4>
                    </div>
                    <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded flex items-center font-mono">
                      <Clock size={10} className="mr-1" /> {getElapsedTime(order.timestamp)}
                    </span>
                  </div>

                  {/* Items list inside order card */}
                  <div className="space-y-1 text-xs border-y border-slate-800/60 py-2 my-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-300">
                            {item.quantity}x {item.name} {item.selectedSize ? `(${item.selectedSize})` : ""}
                          </p>
                          {item.orillaRellena && (
                            <p className="text-[10px] text-yellow-400 font-medium">★ Con Orilla Rellena y Ajonjolí</p>
                          )}
                          {item.notes && (
                            <p className="text-[10px] text-amber-500 italic mt-0.5">"{item.notes}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Move action */}
                  <button
                    onClick={() => handleUpdateStatus(order.id, "En Cocina")}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Play size={12} />
                    <span>ENVIAR A PREPARACIÓN</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {pendingOrders.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-20 text-center">
                <CheckCircle size={32} className="text-slate-700 mb-2" />
                <p>No hay pedidos pendientes por confirmar.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: EN COCINA / PREPARANDO */}
        <div className="flex flex-col bg-[#12192c]/60 rounded-2xl border border-slate-800/80 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping"></span>
              <h3 className="font-display font-bold text-sm uppercase text-purple-400 tracking-wider">En Preparación ({cookingOrders.length})</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            <AnimatePresence>
              {cookingOrders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-[#18112b] border-l-4 border-purple-500 rounded-xl p-3.5 space-y-3 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-purple-300 font-mono">Pedido #{order.orderNumber}</span>
                      <h4 className="text-xs font-bold text-slate-200 mt-0.5">{order.customerName}</h4>
                    </div>
                    <span className="text-[9px] text-purple-300 bg-purple-950/40 px-1.5 py-0.5 rounded flex items-center font-mono">
                      <Clock size={10} className="mr-1 animate-pulse" /> {getElapsedTime(order.timestamp)}
                    </span>
                  </div>

                  {/* Interactive checklist for cooker to check off ingredients */}
                  <div className="space-y-2 border-y border-slate-800/60 py-2.5 my-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/40 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-xs text-yellow-300 leading-tight">
                            {item.quantity}x {item.name} {item.selectedSize ? `(${item.selectedSize})` : ""}
                          </p>
                        </div>
                        {item.orillaRellena && (
                          <div className="flex items-center text-[10px] text-orange-400 font-bold space-x-1">
                            <CheckSquare size={10} />
                            <span>¡Añadir Orilla Rellena de Queso + Ajonjolí!</span>
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-[10px] text-amber-500 italic">Nota: "{item.notes}"</p>
                        )}
                        
                        {/* Fake ingredients checklist for playfulness */}
                        <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-slate-800/40">
                          {["Base de Salsa", "Queso Mozzarella", "Ingredientes Pizza", "Horneado"].map((stepText, stepIdx) => (
                            <label key={stepIdx} className="flex items-center space-x-1.5 cursor-pointer text-[9px] text-slate-400 hover:text-slate-200">
                              <input type="checkbox" className="rounded-xs accent-purple-500 w-3 h-3 border-slate-700 bg-slate-800" />
                              <span>{stepText}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Move action */}
                  <button
                    onClick={() => handleUpdateStatus(order.id, "Listo")}
                    className="w-full bg-purple-500 hover:bg-purple-400 text-slate-950 font-display font-black text-xs py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <ThumbsUp size={12} />
                    <span>MARCAR COMO LISTO / HORNEADO ¡YA!</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {cookingOrders.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-20 text-center">
                <ChefHat size={32} className="text-slate-700 mb-2" />
                <p>No hay pizzas horneándose ahora mismo.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: LISTO / COMPLETADO */}
        <div className="flex flex-col bg-[#12192c]/60 rounded-2xl border border-slate-800/80 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
              <h3 className="font-display font-bold text-sm uppercase text-emerald-500 tracking-wider">Listo para Entrega ({readyOrders.length})</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            <AnimatePresence>
              {readyOrders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-900 border-l-4 border-emerald-500 rounded-xl p-3.5 space-y-3 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-slate-400 font-mono">Pedido #{order.orderNumber}</span>
                        <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                          {order.type}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-1">{order.customerName}</h4>
                    </div>
                  </div>

                  {/* Delivery address helper */}
                  {order.type === "Domicilio" && order.customerAddress && (
                    <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-start space-x-1">
                      <MapPin size={12} className="text-red-400 shrink-0 mt-0.5" />
                      <span>{order.customerAddress}</span>
                    </div>
                  )}

                  {/* Summary list */}
                  <div className="space-y-0.5 text-xs text-slate-400">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="font-semibold text-slate-300">
                        {item.quantity}x {item.name} {item.selectedSize ? `(${item.selectedSize})` : ""}
                      </p>
                    ))}
                  </div>

                  {/* Move action */}
                  <button
                    onClick={() => handleUpdateStatus(order.id, "Entregado")}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <CheckSquare size={12} />
                    <span>CONFORME / ENTREGAR PEDIDO</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {readyOrders.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-20 text-center">
                <Bike size={32} className="text-slate-700 mb-2" />
                <p>No hay pedidos listos para despachar aún.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
