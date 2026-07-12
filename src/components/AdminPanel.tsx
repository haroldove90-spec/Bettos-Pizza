/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
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
  Upload,
  Palette,
  Edit3,
  Eye,
  EyeOff,
  Truck,
  FileText,
  Download,
  AlertTriangle,
  Volume2,
  VolumeX,
  Layers,
  Award
} from "lucide-react";
import { Product, Order, Category, PizzaSize, Courier, IngredientInventory, ShippingZone } from "../types";
import { 
  getStoredProducts, 
  saveProducts, 
  getStoredOrders, 
  saveOrders, 
  resetToInitial,
  getStoredCouriers,
  saveCouriers,
  getStoredIngredients,
  saveIngredients,
  getStoredShippingZones,
  saveShippingZones,
  playNotificationChime
} from "../utils/pizzaStore";

interface AdminPanelProps {
  onBackToHome?: () => void;
}

export default function AdminPanel({ onBackToHome }: AdminPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // New states for extra features
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [ingredients, setIngredients] = useState<IngredientInventory[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("bettos_admin_sound_enabled") !== "false";
  });

  // Track previous orders count to avoid repeating sounds
  const previousOrdersCount = useRef<number>(-1);

  // Stats
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [averageTicket, setAverageTicket] = useState<number>(0);
  const [statsStartDate, setStatsStartDate] = useState<string>("");
  const [statsEndDate, setStatsEndDate] = useState<string>("");

  // Active view: "stats" | "products" | "orders" | "couriers" | "inventory" | "personalization"
  const [activeSubTab, setActiveSubTab] = useState<"stats" | "products" | "orders" | "personalization" | "couriers" | "inventory">("stats");

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  // Personalization State
  const [branding, setBranding] = useState(() => {
    const saved = localStorage.getItem("bettos_pizza_branding");
    const initial = {
      appName: "Betto's Pizza",
      logoUrl: "",
      bgType: "gradient",
      bgColor: "#0a070e",
      bgGradientStart: "#1f0824",
      bgGradientEnd: "#0d020e",
      cardColor: "#160f1e",
      accentColor: "#ffd400",
      accentTextColor: "#0a070e",
      textColor: "#f1f5f9",
      headerColor: "#191122",
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
    if (saved) {
      try {
        return { ...initial, ...JSON.parse(saved) };
      } catch {
        return initial;
      }
    }
    return initial;
  });

  // Auto-save and propagate branding updates in real-time
  useEffect(() => {
    localStorage.setItem("bettos_pizza_branding", JSON.stringify(branding));
    window.dispatchEvent(new Event("bettos_pizza_branding_update"));
  }, [branding]);

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
    const crs = getStoredCouriers();
    const ingrs = getStoredIngredients();
    const zns = getStoredShippingZones();
    
    setProducts(prods);
    setOrders(ords);
    setCouriers(crs);
    setIngredients(ingrs);
    setShippingZones(zns);

    // If there are more orders now than before, play the new order chime!
    if (soundEnabled && previousOrdersCount.current !== -1 && ords.length > previousOrdersCount.current) {
      const newest = ords[ords.length - 1];
      if (newest && newest.status === "Pendiente") {
        playNotificationChime("new_order");
      }
    }
    previousOrdersCount.current = ords.length;

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

  const handleExportCSV = () => {
    let filtered = [...orders];
    if (statsStartDate) {
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.createdAt || new Date()).toISOString().split("T")[0];
        return orderDate >= statsStartDate;
      });
    }
    if (statsEndDate) {
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.createdAt || new Date()).toISOString().split("T")[0];
        return orderDate <= statsEndDate;
      });
    }

    const headers = [
      "No. Pedido", 
      "Fecha/Hora", 
      "Cliente", 
      "Telefono", 
      "Direccion", 
      "Zona de Envio", 
      "Tipo", 
      "Estado", 
      "Metodo Pago", 
      "Costo Envio (MXN)", 
      "Total (MXN)", 
      "Articulos"
    ];
    
    const rows = filtered.map(o => {
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString("es-MX") : "";
      const itemsStr = o.items.map(item => `${item.quantity}x ${item.productName} (${item.size || "S/T"}${item.orillaRellena ? " c/Orilla" : ""})`).join(" | ");
      return [
        o.orderNumber,
        `"${dateStr}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${(o.customerPhone || "").replace(/"/g, '""')}"`,
        `"${(o.customerAddress || "").replace(/"/g, '""')}"`,
        `"${(o.shippingZone || "").replace(/"/g, '""')}"`,
        o.type,
        o.status,
        o.paymentMethod,
        o.shippingCost || 0,
        o.total,
        `"${itemsStr.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bettos_Pizza_Reporte_Ventas_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem("bettos_admin_sound_enabled", String(newVal));
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto de la carta?")) {
      const updated = products.filter(p => p.id !== id);
      saveProducts(updated);
      setProducts(updated);
    }
  };

  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setNewProductName(prod.name);
    setNewProductDesc(prod.description);
    setNewProductCategory(prod.category);
    if (prod.prices) {
      if (prod.prices[PizzaSize.CH]) {
        setChStandard(prod.prices[PizzaSize.CH].standard);
        setChOrilla(prod.prices[PizzaSize.CH].orillaRellena);
      }
      if (prod.prices[PizzaSize.MED]) {
        setMedStandard(prod.prices[PizzaSize.MED].standard);
        setMedOrilla(prod.prices[PizzaSize.MED].orillaRellena);
      }
      if (prod.prices[PizzaSize.GDE]) {
        setGdeStandard(prod.prices[PizzaSize.GDE].standard);
        setGdeOrilla(prod.prices[PizzaSize.GDE].orillaRellena);
      }
      if (prod.prices[PizzaSize.FAM]) {
        setFamStandard(prod.prices[PizzaSize.FAM].standard);
        setFamOrilla(prod.prices[PizzaSize.FAM].orillaRellena);
      }
      if (prod.prices[PizzaSize.MEGA]) {
        setMegaStandard(prod.prices[PizzaSize.MEGA].standard);
        setMegaOrilla(prod.prices[PizzaSize.MEGA].orillaRellena);
      }
    } else if (prod.price !== undefined) {
      setNewProductFixedPrice(prod.price);
    }
    setShowAddForm(true);
  };

  const handleToggleActiveProduct = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, isActive: p.isActive === false ? true : false };
      }
      return p;
    });
    saveProducts(updated);
    setProducts(updated);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;

    if (editingProduct) {
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          const u: Product = {
            ...p,
            name: newProductName,
            description: newProductDesc,
            category: newProductCategory
          };
          if (newProductCategory === "Especialidad" || newProductCategory === "Un Solo Ingrediente") {
            u.prices = {
              [PizzaSize.CH]: { standard: chStandard, orillaRellena: chOrilla },
              [PizzaSize.MED]: { standard: medStandard, orillaRellena: medOrilla },
              [PizzaSize.GDE]: { standard: gdeStandard, orillaRellena: gdeOrilla },
              [PizzaSize.FAM]: { standard: famStandard, orillaRellena: famOrilla },
              [PizzaSize.MEGA]: { standard: megaStandard, orillaRellena: megaOrilla }
            };
            delete u.price;
          } else {
            u.price = newProductFixedPrice;
            delete u.prices;
          }
          return u;
        }
        return p;
      });
      saveProducts(updated);
      setProducts(updated);
    } else {
      let newProd: Product = {
        id: "prod_" + Date.now(),
        name: newProductName,
        description: newProductDesc,
        category: newProductCategory,
        isActive: true
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
    }

    // Reset Form
    setNewProductName("");
    setNewProductDesc("");
    setNewProductFixedPrice(100);
    setEditingProduct(null);
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

  // Courier Actions
  const handleToggleCourierStatus = (id: string) => {
    const updated = couriers.map(c => {
      if (c.id === id) {
        let nextStatus: "Disponible" | "En Ruta" | "Inactivo" = "Disponible";
        if (c.status === "Disponible") nextStatus = "En Ruta";
        else if (c.status === "En Ruta") nextStatus = "Inactivo";
        return { ...c, status: nextStatus };
      }
      return c;
    });
    saveCouriers(updated);
    setCouriers(updated);
  };

  const handleDeleteCourier = (id: string) => {
    if (confirm("¿Estás seguro de que deseas dar de baja a este repartidor?")) {
      const updated = couriers.filter(c => c.id !== id);
      saveCouriers(updated);
      setCouriers(updated);
    }
  };

  const [newCourierName, setNewCourierName] = useState<string>("");
  const [newCourierPhone, setNewCourierPhone] = useState<string>("");
  const [newCourierVehicle, setNewCourierVehicle] = useState<"🛵 Motocicleta" | "🚲 Bicicleta" | "🚗 Automóvil">("🛵 Motocicleta");

  const handleCreateCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourierName || !newCourierPhone) return;

    const newC: Courier = {
      id: "cour-" + Date.now(),
      name: newCourierName,
      phone: newCourierPhone,
      vehicle: newCourierVehicle,
      status: "Disponible",
      avatar: newCourierVehicle.split(" ")[0]
    };

    const updated = [...couriers, newC];
    saveCouriers(updated);
    setCouriers(updated);
    
    // Clear inputs
    setNewCourierName("");
    setNewCourierPhone("");
  };

  const handleAssignCourierToOrder = (orderId: string, courierId: string) => {
    if (!courierId) return;
    const courier = couriers.find(c => c.id === courierId);
    if (!courier) return;

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "En Camino" as const,
          deliveryManId: courier.id,
          deliveryManName: courier.name
        };
      }
      return o;
    });

    const updatedCouriers = couriers.map(c => {
      if (c.id === courierId && c.status === "Disponible") {
        return { ...c, status: "En Ruta" as const };
      }
      return c;
    });

    saveOrders(updatedOrders);
    setOrders(updatedOrders);
    saveCouriers(updatedCouriers);
    setCouriers(updatedCouriers);

    playNotificationChime("status_assigned");
  };

  // Inventory actions
  const handleUpdateIngredientStock = (id: string, change: number) => {
    const updated = ingredients.map(ing => {
      if (ing.id === id) {
        const newStock = Math.max(0, ing.stock + change);
        return { ...ing, stock: newStock };
      }
      return ing;
    });
    saveIngredients(updated);
    setIngredients(updated);
  };

  const handleSetIngredientMinStock = (id: string, minStock: number) => {
    const updated = ingredients.map(ing => {
      if (ing.id === id) {
        return { ...ing, minStock: Math.max(0, minStock) };
      }
      return ing;
    });
    saveIngredients(updated);
    setIngredients(updated);
  };

  // Shipping zone actions
  const handleToggleShippingZone = (id: string) => {
    const updated = shippingZones.map(z => {
      if (z.id === id) {
        return { ...z, isActive: !z.isActive };
      }
      return z;
    });
    saveShippingZones(updated);
    setShippingZones(updated);
  };

  const handleUpdateShippingZoneCost = (id: string, cost: number) => {
    const updated = shippingZones.map(z => {
      if (z.id === id) {
        return { ...z, cost: Math.max(0, cost) };
      }
      return z;
    });
    saveShippingZones(updated);
    setShippingZones(updated);
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
            { id: "orders", label: "Historial" },
            { id: "couriers", label: "Repartidores" },
            { id: "inventory", label: "Inventario" },
            { id: "personalization", label: "Branding" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
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

              {/* CONTROL DE ALERTAS SONORAS Y EXPORTACIÓN DE REPORTES (CIERRE DE CAJA) */}
              <div className="bg-[#160f1e] rounded-2xl p-5 border border-purple-950/40 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Alertas Sonoras */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-display font-bold text-sm text-[#ffd400] flex items-center gap-2 uppercase tracking-wide">
                        {soundEnabled ? <Volume2 size={18} className="text-yellow-400" /> : <VolumeX size={18} className="text-purple-400" />}
                        Notificaciones de Sonido
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Timbre automático para cocina, POS y administración al recibir nuevos pedidos.
                      </p>
                    </div>
                    <button
                      onClick={handleToggleSound}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                        soundEnabled
                          ? "bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25"
                          : "bg-purple-950/20 border-purple-900/40 text-purple-400 hover:bg-purple-950/40"
                      }`}
                    >
                      {soundEnabled ? "🔊 ACTIVO" : "🔇 MUTED"}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 bg-purple-950/15 p-2.5 rounded-xl border border-purple-950/40">
                    <span className="text-[10px] text-purple-300 font-medium">Probar tonos:</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => playNotificationChime("new_order")}
                        className="bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 text-[9px] font-bold px-2 py-1 rounded-lg transition-all"
                      >
                        🔔 Nuevo
                      </button>
                      <button
                        onClick={() => playNotificationChime("status_ready")}
                        className="bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 text-[9px] font-bold px-2 py-1 rounded-lg transition-all"
                      >
                        🍕 Listo
                      </button>
                      <button
                        onClick={() => playNotificationChime("status_assigned")}
                        className="bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 text-[9px] font-bold px-2 py-1 rounded-lg transition-all"
                      >
                        🛵 Asignado
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reportes de Ventas y Cierre de Caja */}
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-purple-950/60 pt-4 md:pt-0 md:pl-6">
                  <h4 className="font-display font-bold text-sm text-[#ffd400] flex items-center gap-2 uppercase tracking-wide">
                    <FileText size={18} className="text-yellow-400" />
                    Cierre de Caja y Reportes (CSV)
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Filtra por rango de fecha para exportar el historial completo de ventas en formato CSV compatible con Excel.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400">Desde:</span>
                      <input
                        type="date"
                        value={statsStartDate}
                        onChange={(e) => setStatsStartDate(e.target.value)}
                        className="bg-slate-900/95 border border-purple-950/60 rounded-lg text-[10px] px-2 py-1 text-slate-100 outline-hidden focus:border-yellow-400 transition-all font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400">Hasta:</span>
                      <input
                        type="date"
                        value={statsEndDate}
                        onChange={(e) => setStatsEndDate(e.target.value)}
                        className="bg-slate-900/95 border border-purple-950/60 rounded-lg text-[10px] px-2 py-1 text-slate-100 outline-hidden focus:border-yellow-400 transition-all font-mono"
                      />
                    </div>
                    
                    <button
                      onClick={handleExportCSV}
                      className="bg-[#ffd400] hover:bg-[#ffe040] text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition-all active:scale-95 ml-auto md:ml-0 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>EXPORTAR CSV</span>
                    </button>
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
                  onClick={() => {
                    if (showAddForm) {
                      setEditingProduct(null);
                      setNewProductName("");
                      setNewProductDesc("");
                    }
                    setShowAddForm(!showAddForm);
                  }}
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

                  <div className="md:col-span-3 flex justify-end gap-2">
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setNewProductName("");
                          setNewProductDesc("");
                          setShowAddForm(false);
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-1.5 rounded-lg text-xs"
                    >
                      {editingProduct ? "Actualizar Producto" : "Guardar en Menú"}
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

                  const isInactive = p.isActive === false;

                  return (
                    <div 
                      key={p.id} 
                      className={`border p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all w-full shadow-md group relative overflow-hidden ${
                        isInactive
                          ? "bg-slate-950/40 border-slate-900/60 opacity-60 hover:opacity-80"
                          : "bg-[#160f1e]/85 hover:bg-[#1e1428] border-purple-950/45"
                      }`}
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
                            {isInactive && (
                              <span className="text-[9px] font-bold tracking-wider uppercase bg-red-950/40 border border-red-900/40 text-red-400 px-2 rounded-full">
                                INACTIVO
                              </span>
                            )}
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
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActiveProduct(p.id)}
                            className={`p-2 rounded-xl transition-all border cursor-pointer ${
                              p.isActive !== false 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15 hover:bg-emerald-500 hover:text-white"
                                : "bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-300"
                            }`}
                            title={p.isActive !== false ? "Desactivar Producto" : "Activar Producto"}
                          >
                            {p.isActive !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>

                          <button
                            onClick={() => handleStartEditProduct(p)}
                            className="p-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white rounded-xl transition-all border border-amber-500/15 cursor-pointer"
                            title="Editar Producto"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/15 cursor-pointer"
                            title="Eliminar del menú"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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

          {/* GESTIÓN DE REPARTIDORES */}
          {activeSubTab === "couriers" && (
            <motion.div
              key="couriers-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 max-w-6xl mx-auto pb-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-950/40 pb-4">
                <div>
                  <h3 className="font-display font-black text-lg text-slate-100 flex items-center gap-2">
                    <Truck className="text-yellow-400" size={20} />
                    Gestión de Repartidores y Asignación
                  </h3>
                  <p className="text-xs text-purple-300 font-mono">Da de alta repartidores, supervisa su estado en tiempo real y asigna pedidos listos.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1: NEW COURIER FORM & LIST */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Register courier card */}
                  <div className="bg-[#160f1e] rounded-2xl p-4 border border-purple-950/40 space-y-4">
                    <h4 className="font-display font-bold text-xs uppercase text-yellow-400 tracking-wider">Registrar Repartidor</h4>
                    <form onSubmit={handleCreateCourier} className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-purple-300 font-bold block">Nombre Completo:</label>
                        <input
                          type="text"
                          required
                          value={newCourierName}
                          onChange={(e) => setNewCourierName(e.target.value)}
                          placeholder="e.g. Manuel Torres"
                          className="w-full bg-slate-900/90 border border-purple-950/60 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 outline-hidden focus:border-yellow-400 transition-all"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-purple-300 font-bold block">Teléfono Móvil:</label>
                        <input
                          type="text"
                          required
                          value={newCourierPhone}
                          onChange={(e) => setNewCourierPhone(e.target.value)}
                          placeholder="e.g. 55 1234-5678"
                          className="w-full bg-slate-900/90 border border-purple-950/60 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 outline-hidden focus:border-yellow-400 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-purple-300 font-bold block">Medio de Transporte:</label>
                        <select
                          value={newCourierVehicle}
                          onChange={(e: any) => setNewCourierVehicle(e.target.value)}
                          className="w-full bg-slate-900/95 border border-purple-950/60 rounded-xl px-3 py-2 text-slate-100 outline-hidden focus:border-yellow-400 transition-all font-sans"
                        >
                          <option value="🛵 Motocicleta">🛵 Motocicleta</option>
                          <option value="🚲 Bicicleta">🚲 Bicicleta</option>
                          <option value="🚗 Automóvil">🚗 Automóvil</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#ffd400] hover:bg-[#ffe040] text-slate-950 py-2 rounded-xl font-bold uppercase transition-all shadow-md active:scale-95 cursor-pointer mt-2"
                      >
                        Alta de Repartidor
                      </button>
                    </form>
                  </div>

                  {/* Summary card */}
                  <div className="bg-purple-950/10 border border-purple-900/20 rounded-2xl p-4 text-xs text-purple-300 space-y-2">
                    <p className="font-bold text-[#ffd400]">💡 ¿Cómo funciona la asignación?</p>
                    <p className="leading-relaxed">Cuando la cocina marca un pedido de reparto domiciliario como <strong>"Listo"</strong>, aparecerá automáticamente en la lista de asignación. Selecciona un repartidor disponible para despacharlo; el pedido cambiará a estado <strong>"En Camino"</strong> y el repartidor lo verá en su propio panel.</p>
                  </div>
                </div>

                {/* COLUMN 2: ACTIVE DELIVERY ASSIGNMENT LIST */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Deliveries awaiting assignment */}
                  <div className="bg-[#160f1e] rounded-2xl p-5 border border-purple-950/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-bold text-xs uppercase text-yellow-400 tracking-wider">Despacho de Pedidos Listos</h4>
                      <span className="text-[10px] font-mono bg-yellow-400/10 text-yellow-400 px-2.5 py-0.5 rounded-full font-bold">
                        {orders.filter(o => o.type === "Domicilio" && o.status === "Listo").length} Esperando
                      </span>
                    </div>

                    {orders.filter(o => o.type === "Domicilio" && o.status === "Listo").length === 0 ? (
                      <div className="py-12 text-center text-slate-500 space-y-3">
                        <div className="inline-flex p-4 bg-purple-950/10 rounded-full text-purple-400">
                          <Truck size={32} />
                        </div>
                        <p className="text-xs max-w-md mx-auto leading-relaxed">No hay pedidos a domicilio listos para entrega en este momento. Los pedidos aparecerán aquí una vez que la cocina los prepare y los marque como <strong>"Listo"</strong>.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {orders.filter(o => o.type === "Domicilio" && o.status === "Listo").map(o => (
                          <div key={o.id} className="bg-slate-900/60 border border-purple-950/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                            <div className="space-y-1 max-w-md">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-[#ffd400] font-mono">Pedido #{o.orderNumber}</span>
                                <span className="text-[9px] bg-purple-950/40 text-purple-300 font-bold px-2 py-0.5 rounded-md uppercase">{o.paymentMethod}</span>
                                <span className="text-[10px] text-green-400 font-black font-mono">${o.total}</span>
                              </div>
                              <p className="font-bold text-slate-200">Cliente: {o.customerName} <span className="text-slate-400 font-normal">({o.customerPhone || "Sin Teléfono"})</span></p>
                              <p className="text-slate-400 text-[11px] leading-relaxed">📍 {o.customerAddress || "Sin Dirección"}</p>
                              <p className="text-purple-300 text-[10px]">📦 Detalle: {o.items.map(i => `${i.quantity}x ${i.productName}`).join(", ")}</p>
                            </div>
                            
                            <div className="shrink-0 flex items-center gap-2">
                              <select
                                id={`assign-select-${o.id}`}
                                defaultValue=""
                                className="bg-slate-950 border border-purple-950/80 rounded-xl text-xs px-3 py-2 text-slate-100 outline-hidden font-sans"
                              >
                                <option value="" disabled>Seleccionar Repartidor...</option>
                                {couriers.filter(c => c.status !== "Inactivo").map(c => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} ({c.status === "En Ruta" ? "🟡 En Ruta" : "🟢 Disponible"})
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  const selectEl = document.getElementById(`assign-select-${o.id}`) as HTMLSelectElement;
                                  if (selectEl && selectEl.value) {
                                    handleAssignCourierToOrder(o.id, selectEl.value);
                                  } else {
                                    alert("Por favor selecciona un repartidor antes de despachar.");
                                  }
                                }}
                                className="bg-[#ffd400] hover:bg-[#ffe040] text-slate-950 font-bold px-3 py-2 rounded-xl transition-all uppercase text-[10px] tracking-wide active:scale-95 cursor-pointer"
                              >
                                Despachar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Courier fleet registry */}
                  <div className="bg-[#160f1e] rounded-2xl p-5 border border-purple-950/40 space-y-4">
                    <h4 className="font-display font-bold text-xs uppercase text-yellow-400 tracking-wider">Flota de Reparto Activa</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {couriers.map(c => (
                        <div key={c.id} className="bg-slate-900/60 border border-purple-950/60 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl p-1 bg-purple-950/40 rounded-xl">{c.avatar}</span>
                            <div>
                              <p className="font-bold text-slate-200 leading-tight">{c.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{c.phone}</p>
                              <p className="text-[9px] text-purple-300 font-mono mt-0.5">{c.vehicle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleCourierStatus(c.id)}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                                c.status === "Disponible"
                                  ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                                  : c.status === "En Ruta"
                                  ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                                  : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                              }`}
                              title="Haz clic para alternar disponibilidad"
                            >
                              {c.status === "Disponible" ? "🟢 Disponible" : c.status === "En Ruta" ? "🟡 En Ruta" : "🔴 Inactivo"}
                            </button>

                            <button
                              onClick={() => handleDeleteCourier(c.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/15 text-red-400 rounded-lg transition-all"
                              title="Dar de baja"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* GESTIÓN DE INVENTARIO Y ENVÍOS */}
          {activeSubTab === "inventory" && (
            <motion.div
              key="inventory-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 max-w-6xl mx-auto pb-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-950/40 pb-4">
                <div>
                  <h3 className="font-display font-black text-lg text-slate-100 flex items-center gap-2">
                    <Layers className="text-yellow-400" size={20} />
                    Control de Inventario y Tarifas de Envío
                  </h3>
                  <p className="text-xs text-purple-300 font-mono">Controla el stock de ingredientes críticos y configura costos dinámicos de reparto por zona.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1 & 2: INVENTORY STOCK TABLE */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#160f1e] rounded-2xl p-5 border border-purple-950/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-purple-950/30 pb-3">
                      <h4 className="font-display font-bold text-xs uppercase text-yellow-400 tracking-wider">Ingredientes Críticos</h4>
                      <span className="text-[10px] text-purple-300 font-mono">
                        {ingredients.filter(ing => ing.stock <= ing.minStock).length} alertas de bajo stock
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-purple-300/10 text-purple-300 font-bold">
                            <th className="py-2.5">Ingrediente</th>
                            <th className="py-2.5">Stock Disponible</th>
                            <th className="py-2.5">Nivel Alerta Min</th>
                            <th className="py-2.5 text-center">Acciones Rápidas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-950/10">
                          {ingredients.map(ing => {
                            const isLow = ing.stock <= ing.minStock;
                            return (
                              <tr key={ing.id} className="hover:bg-purple-950/5 transition-all">
                                <td className="py-3 font-medium text-slate-200">
                                  <div className="flex flex-col">
                                    <span>{ing.name}</span>
                                    {isLow && (
                                      <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-sm font-black w-max mt-1 uppercase flex items-center gap-0.5 animate-pulse">
                                        <AlertTriangle size={8} /> stock crítico
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 font-mono font-bold">
                                  <span className={isLow ? "text-red-400" : "text-green-400"}>
                                    {ing.stock} {ing.unit}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      value={ing.minStock}
                                      onChange={(e) => handleSetIngredientMinStock(ing.id, parseInt(e.target.value) || 0)}
                                      className="w-14 bg-slate-900 border border-purple-950/60 rounded-md text-center py-0.5 font-mono text-[11px] text-slate-100 outline-hidden focus:border-yellow-400"
                                    />
                                    <span className="text-[10px] text-slate-400 font-mono">{ing.unit}</span>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleUpdateIngredientStock(ing.id, -5)}
                                      className="bg-slate-900 border border-purple-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-1.5 py-1 rounded-md font-mono font-bold text-[10px] transition-all cursor-pointer"
                                    >
                                      -5
                                    </button>
                                    <button
                                      onClick={() => handleUpdateIngredientStock(ing.id, -1)}
                                      className="bg-slate-900 border border-purple-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-1.5 py-1 rounded-md font-mono font-bold text-[10px] transition-all cursor-pointer"
                                    >
                                      -1
                                    </button>
                                    <button
                                      onClick={() => handleUpdateIngredientStock(ing.id, 1)}
                                      className="bg-[#ffd400] hover:bg-[#ffe040] text-slate-950 px-1.5 py-1 rounded-md font-mono font-bold text-[10px] transition-all cursor-pointer"
                                    >
                                      +1
                                    </button>
                                    <button
                                      onClick={() => handleUpdateIngredientStock(ing.id, 5)}
                                      className="bg-[#ffd400] hover:bg-[#ffe040] text-slate-950 px-1.5 py-1 rounded-md font-mono font-bold text-[10px] transition-all cursor-pointer"
                                    >
                                      +5
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: SHIPPING COSTS BY ZONE */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Shipping zones cost configuration */}
                  <div className="bg-[#160f1e] rounded-2xl p-4 border border-purple-950/40 space-y-4">
                    <h4 className="font-display font-bold text-xs uppercase text-yellow-400 tracking-wider">Tarifas de Envío por Zona</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Configura el cargo por entrega a domicilio basado en la distancia del cliente. Estas tarifas se calculan dinámicamente en tiempo real en la pantalla de pago del cliente.
                    </p>

                    <div className="space-y-4">
                      {shippingZones.map(zone => (
                        <div key={zone.id} className="bg-slate-900/60 border border-purple-950/60 p-3.5 rounded-xl space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-200">{zone.name}</p>
                              <p className="text-[10px] text-purple-300 font-mono">{zone.distance}</p>
                            </div>
                            
                            <button
                              onClick={() => handleToggleShippingZone(zone.id)}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                                zone.isActive
                                  ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                                  : "bg-purple-950/20 text-purple-400 hover:bg-purple-950/40"
                              }`}
                            >
                              {zone.isActive ? "🟢 ACTIVA" : "🔴 INACTIVA"}
                            </button>
                          </div>

                          {zone.isActive && (
                            <div className="flex items-center justify-between pt-2 border-t border-purple-950/30 gap-2">
                              <span className="text-[10px] text-slate-400">Cargo de envío:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-200 font-mono">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={zone.cost}
                                  onChange={(e) => handleUpdateShippingZoneCost(zone.id, parseInt(e.target.value) || 0)}
                                  className="w-18 bg-slate-950 border border-purple-950/80 rounded-lg py-1 px-2 font-mono text-center text-xs font-bold text-slate-100 focus:border-yellow-400 outline-hidden"
                                />
                                <span className="text-[10px] text-slate-400 font-mono">MXN</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary stock note */}
                  <div className="bg-purple-950/10 border border-purple-900/20 rounded-2xl p-4 text-xs text-purple-300 space-y-2">
                    <p className="font-bold text-[#ffd400]">💡 Desactivación de menú</p>
                    <p className="leading-relaxed">Si el stock de un ingrediente crítico llega a <strong>0</strong>, cualquier pizza u otro producto del menú que requiera ese ingrediente se mostrará automáticamente como <strong>"Sin Stock / Agotado"</strong> y no se podrá comprar ni agregar al carrito en el POS ni en la App Móvil.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* PERSONALIZACIÓN (BRANDING) */}
          {activeSubTab === "personalization" && (
            <motion.div
              key="personalization-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 max-w-4xl mx-auto pb-10"
            >
              <div className="flex justify-between items-center border-b border-purple-950/40 pb-3">
                <div>
                  <h3 className="font-display font-black text-lg text-slate-100 flex items-center gap-2">
                    <Palette className="text-yellow-400" size={20} />
                    Personalización Visual
                  </h3>
                  <p className="text-xs text-purple-300 font-mono">Modifica colores, logos y textos de toda la plataforma en tiempo real.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("¿Deseas restablecer el diseño y textos originales de la aplicación?")) {
                      const initial = {
                        appName: "Betto's Pizza",
                        logoUrl: "",
                        bgType: "gradient",
                        bgColor: "#0a070e",
                        bgGradientStart: "#1f0824",
                        bgGradientEnd: "#0d020e",
                        cardColor: "#160f1e",
                        accentColor: "#ffd400",
                        accentTextColor: "#0a070e",
                        textColor: "#f1f5f9",
                        headerColor: "#191122",
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
                      localStorage.setItem("bettos_pizza_branding", JSON.stringify(initial));
                      setBranding(initial);
                      window.dispatchEvent(new Event("bettos_pizza_branding_update"));
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg border border-slate-700/50 cursor-pointer"
                >
                  Restaurar Por Defecto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CONFIGURATION FORM */}
                <div className="bg-[#160f1e]/80 border border-purple-950/60 p-5 rounded-2xl space-y-4 shadow-xl">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#ffd400] border-b border-purple-950/40 pb-2">Identidad de Marca y Plataforma</h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Nombre de la Aplicación</label>
                        <input 
                          type="text" 
                          value={branding.appName}
                          onChange={e => {
                            const updated = { ...branding, appName: e.target.value };
                            setBranding(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-[#ffd400] text-slate-100"
                          placeholder="Ej. Betto's Pizza"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Subtítulo (Pantalla de Roles)</label>
                        <input 
                          type="text" 
                          value={branding.homeSubtitle || ""}
                          onChange={e => {
                            const updated = { ...branding, homeSubtitle: e.target.value };
                            setBranding(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-[#ffd400] text-slate-100"
                          placeholder="Ej. SISTEMA DE GESTIÓN DE ROLES"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">URL del Logo (Opcional)</label>
                        <input 
                          type="url" 
                          value={branding.logoUrl}
                          onChange={e => {
                            const updated = { ...branding, logoUrl: e.target.value };
                            setBranding(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-[#ffd400] text-slate-100 font-mono text-[11px]"
                          placeholder="https://ejemplo.com/logo.png"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Nombre de Terminal POS</label>
                        <input 
                          type="text" 
                          value={branding.posTerminalName || ""}
                          onChange={e => {
                            const updated = { ...branding, posTerminalName: e.target.value };
                            setBranding(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-[#ffd400] text-slate-100"
                          placeholder="Ej. Betto's Pizza - POS Terminal"
                        />
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#ffd400] border-b border-purple-950/40 pt-2 pb-2">Textos de Aplicación Cliente</h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Título de Especialidades (Carta)</label>
                        <input 
                          type="text" 
                          value={branding.clientSpecialtyTitle || ""}
                          onChange={e => {
                            const updated = { ...branding, clientSpecialtyTitle: e.target.value };
                            setBranding(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-[#ffd400] text-slate-100"
                          placeholder="Ej. Especialidades al 2x1"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Etiqueta Promocional (Tag)</label>
                        <input 
                          type="text" 
                          value={branding.clientPromoTag || ""}
                          onChange={e => {
                            const updated = { ...branding, clientPromoTag: e.target.value };
                            setBranding(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-[#ffd400] text-slate-100"
                          placeholder="Ej. 2X1 TODOS LOS DÍAS"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-300 font-bold mb-0.5">Ubicación (Sidebar)</label>
                        <input 
                          type="text" 
                          value={branding.clientWelcomeText || ""}
                          onChange={e => {
                            const updated = { ...branding, clientWelcomeText: e.target.value };
                            setBranding(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-[#ffd400] text-slate-100"
                          placeholder="Ej. Edo. de México"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-0.5">Teléfono Contacto</label>
                        <input 
                          type="text" 
                          value={branding.clientPhoneText || ""}
                          onChange={e => {
                            const updated = { ...branding, clientPhoneText: e.target.value };
                            setBranding(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-[#ffd400] text-slate-100 font-mono"
                          placeholder="Ej. 55 1326-5826"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-0.5">Monto Pedido Mínimo ($)</label>
                        <input 
                          type="number" 
                          value={branding.clientMinOrderAmount || 0}
                          onChange={e => {
                            const updated = { ...branding, clientMinOrderAmount: parseInt(e.target.value) || 0 };
                            setBranding(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-[#ffd400] text-slate-100 font-mono"
                          placeholder="200"
                        />
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#ffd400] border-b border-purple-950/40 pt-2 pb-2">Paleta de Colores</h4>
                  
                  <div className="space-y-3.5 text-xs">
                    {/* Background Selection Type */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Tipo de Fondo</label>
                        <select
                          value={branding.bgType}
                          onChange={e => {
                            const updated = { ...branding, bgType: e.target.value as any };
                            setBranding(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-[#ffd400] text-slate-100"
                        >
                          <option value="color">Color Sólido</option>
                          <option value="gradient">Gradiente Diagonal</option>
                        </select>
                      </div>

                      {branding.bgType === 'color' ? (
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Color de Fondo</label>
                          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
                            <input 
                              type="color" 
                              value={branding.bgColor}
                              onChange={e => setBranding({ ...branding, bgColor: e.target.value })}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                            <span className="font-mono text-[11px] uppercase">{branding.bgColor}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Inicio Gradiente</label>
                            <input 
                              type="color" 
                              value={branding.bgGradientStart}
                              onChange={e => setBranding({ ...branding, bgGradientStart: e.target.value })}
                              className="w-full h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Fin Gradiente</label>
                            <input 
                              type="color" 
                              value={branding.bgGradientEnd}
                              onChange={e => setBranding({ ...branding, bgGradientEnd: e.target.value })}
                              className="w-full h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accent and Accent Text */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Color de Acento (Botones/Títulos)</label>
                        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
                          <input 
                            type="color" 
                            value={branding.accentColor}
                            onChange={e => setBranding({ ...branding, accentColor: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-[11px] uppercase">{branding.accentColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Texto en Botón de Acento</label>
                        <select
                          value={branding.accentTextColor}
                          onChange={e => setBranding({ ...branding, accentTextColor: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 mt-1 focus:outline-none focus:border-[#ffd400] text-slate-100"
                        >
                          <option value="#0a070e">Oscuro (Fondo Claro)</option>
                          <option value="#ffffff">Claro (Fondo Oscuro)</option>
                        </select>
                      </div>
                    </div>

                    {/* Card and Header Colors */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-300 font-bold mb-1">Color de Tarjeta</label>
                        <input 
                          type="color" 
                          value={branding.cardColor}
                          onChange={e => setBranding({ ...branding, cardColor: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer bg-transparent border-0"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-300 font-bold mb-1">Color de Cabecera</label>
                        <input 
                          type="color" 
                          value={branding.headerColor}
                          onChange={e => setBranding({ ...branding, headerColor: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer bg-transparent border-0"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-300 font-bold mb-1">Color del Texto</label>
                        <input 
                          type="color" 
                          value={branding.textColor}
                          onChange={e => setBranding({ ...branding, textColor: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer bg-transparent border-0"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Actions buttons */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        alert("¡El diseño se guarda automáticamente en tiempo real! Todos los cambios ya han sido guardados y aplicados a la plataforma.");
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Check size={14} />
                      <span>¡Cambios Aplicados al Instante!</span>
                    </button>
                  </div>
                </div>

                {/* VISUAL LIVE PREVIEW CARD */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#ffd400]">Vista Previa En Vivo</h4>
                  
                  {/* Container styled in real-time with selected values */}
                  <div 
                    style={{
                      background: branding.bgType === 'color' ? branding.bgColor : `linear-gradient(135deg, ${branding.bgGradientStart} 0%, ${branding.bgGradientEnd} 100%)`,
                      color: branding.textColor
                    }}
                    className="border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 transition-all"
                  >
                    {/* Header preview */}
                    <div 
                      style={{ backgroundColor: branding.headerColor }} 
                      className="p-3 rounded-xl flex items-center justify-between border border-white/5 shadow-inner"
                    >
                      <div className="flex items-center space-x-2">
                        {branding.logoUrl ? (
                          <img src={branding.logoUrl} className="w-6 h-6 object-contain rounded" alt="logo" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-sm">🍕</span>
                        )}
                        <span className="font-bold text-xs font-display">{branding.appName}</span>
                      </div>
                      <span className="text-[9px] font-mono opacity-60">MODO CLIENTE</span>
                    </div>

                    {/* Card previews inside the background */}
                    <div 
                      style={{ backgroundColor: branding.cardColor, color: branding.textColor }}
                      className="p-4 rounded-xl border border-white/5 space-y-2.5 shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-xs" style={{ color: branding.textColor }}>Pizza Mexicana Tradicional</h5>
                          <p className="text-[10px] opacity-70 mt-0.5">Frijoles, chorizo, jalapeño fresco y cebolla dorada...</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: branding.accentColor, color: branding.accentTextColor }}>
                          $190
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <span className="text-[9px] opacity-50">Seleccionar Tamaño:</span>
                        <div className="flex space-x-1">
                          {['CH', 'MED', 'GDE'].map(sz => (
                            <span 
                              key={sz} 
                              className="text-[9px] px-2 py-0.5 rounded border border-white/10 cursor-pointer"
                              style={sz === 'GDE' ? { backgroundColor: branding.accentColor, color: branding.accentTextColor, borderColor: branding.accentColor } : {}}
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Button preview */}
                    <button 
                      type="button"
                      style={{ backgroundColor: branding.accentColor, color: branding.accentTextColor }}
                      className="w-full py-2.5 rounded-xl font-bold text-xs uppercase shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
                    >
                      <span>Ordenar Ahora</span>
                    </button>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 space-y-1">
                    <p className="font-bold text-[#ffd400]">💡 ¿Cómo funciona?</p>
                    <p>Al hacer clic en <strong>"Aplicar y Guardar Cambios"</strong>, el sistema generará una hoja de estilos dinámica que se inyecta en toda la aplicación. Los clientes y el punto de venta (POS) verán los nuevos colores y el nuevo logotipo de inmediato sin necesidad de recargar la página.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation action bar for mobile/tablet only */}
      <div className="md:hidden bg-[#191122] border-t border-purple-950/60 py-2 px-1 flex justify-around items-center text-slate-400 z-30 shadow-md shrink-0 fixed bottom-0 left-0 right-0 h-16">
        <button 
          onClick={() => setActiveSubTab("stats")}
          className={`flex flex-col items-center space-y-0.5 transition-colors ${activeSubTab === "stats" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <TrendingUp size={15} />
          <span className="text-[8px] font-bold">Estadísticas</span>
        </button>
        
        <button 
          onClick={() => setActiveSubTab("products")}
          className={`flex flex-col items-center space-y-0.5 relative transition-colors ${activeSubTab === "products" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <Tag size={15} />
          <span className="text-[8px] font-bold">Carta</span>
        </button>

        <button 
          onClick={() => setActiveSubTab("orders")}
          className={`flex flex-col items-center space-y-0.5 relative transition-colors ${activeSubTab === "orders" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <ShoppingBag size={15} />
          <span className="text-[8px] font-bold">Pedidos</span>
        </button>

        <button 
          onClick={() => setActiveSubTab("couriers")}
          className={`flex flex-col items-center space-y-0.5 relative transition-colors ${activeSubTab === "couriers" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <Truck size={15} />
          <span className="text-[8px] font-bold">Repartidores</span>
        </button>

        <button 
          onClick={() => setActiveSubTab("inventory")}
          className={`flex flex-col items-center space-y-0.5 relative transition-colors ${activeSubTab === "inventory" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <Layers size={15} />
          <span className="text-[8px] font-bold">Stock</span>
        </button>

        <button 
          onClick={() => setActiveSubTab("personalization")}
          className={`flex flex-col items-center space-y-0.5 relative transition-colors ${activeSubTab === "personalization" ? "text-[#ffd400] font-extrabold" : "text-purple-300 hover:text-white"}`}
        >
          <Palette size={15} />
          <span className="text-[8px] font-bold">Branding</span>
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
