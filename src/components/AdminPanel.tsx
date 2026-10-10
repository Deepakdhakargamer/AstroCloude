import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, ShieldAlert, Layers, Server, Ticket, Users, Shield, Plus, Edit3, Trash2, Contact,
  Search, Check, X, RefreshCw, Lock, Unlock, Key, Eye, EyeOff, Save,
  Sliders, ArrowUp, ArrowDown, Filter, MessageSquare, Send, CheckCircle2,
  AlertCircle, ChevronRight, Sparkles, Terminal, Activity, Globe, IndianRupee,
  Cpu, Upload, Image as ImageIcon, User, Tag, ChevronDown, CreditCard 
} from "lucide-react";
import { 
  AdminOrder, AdminCategory, AdminHostingPlan, AdminSupportTicket, AdminUser, AdminRole, AdminTicketMessage, AdminFeature, AdminCoupon 
} from '../types';
import { getStoredCategories, saveStoredCategories } from '../utils/categorySync';
import { getStoredFeatures, saveStoredFeatures } from '../utils/featureSync';
import { getStoredTickets, saveStoredTickets } from '../utils/ticketSync';
import { AdminTicketsTab } from './AdminTicketsTab';

import { AdminStaff } from '../types';
import { getStoredStaff, saveStoredStaff } from '../utils/staffSync';
import { AdminStaffManagementTab } from './AdminStaffManagementTab';

import { getStoredPlans, updateStoredPlans } from '../utils/planSync';
import { AdminPlanEditor } from './AdminPlanEditor';
import { AdminPaymentTab } from './AdminPaymentTab';
import { getStoredPaymentSettings, saveStoredPaymentSettings, PaymentSettings } from '../utils/paymentSync';
import { getStoredOrders, updateStoredOrders } from '../utils/orderSync';
import { AdminPlanManagementTab } from './AdminPlanManagementTab';
import { AdminOrderManagementTab } from './AdminOrderManagementTab';
import { getStoredCoupons } from '../utils/couponSync';
import { AdminCouponManagementTab } from './AdminCouponManagementTab';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  createUserByAdmin, 
  updateUser, 
  deleteUser, 
  resetUserPassword 
} from '../utils/userSync';

const INITIAL_USERS: AdminUser[] = [];
const INITIAL_ROLES: AdminRole[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    color: 'bg-rose-950 text-rose-300 border-rose-500/30',
    icon: 'ShieldAlert',
    permissions: {
      categories: { view: true, create: true, edit: true, delete: true, manage: true },
      plans: { view: true, create: true, edit: true, delete: true, manage: true },
      tickets: { view: true, create: true, edit: true, delete: true, manage: true },
      users: { view: true, create: true, edit: true, delete: true, manage: true },
      roles: { view: true, create: true, edit: true, delete: true, manage: true },
      staff: { view: true, create: true, edit: true, delete: true, manage: true },
      settings: { view: true, create: true, edit: true, delete: true, manage: true },
    }
  },
  {
    id: 'role-staff',
    name: 'Staff Support',
    color: 'bg-purple-950 text-purple-300 border-purple-500/30',
    icon: 'Users',
    permissions: {
      categories: { view: true, create: false, edit: false, delete: false, manage: false },
      plans: { view: true, create: false, edit: false, delete: false, manage: false },
      tickets: { view: true, create: true, edit: true, delete: false, manage: true },
      users: { view: true, create: false, edit: true, delete: false, manage: false },
      roles: { view: false, create: false, edit: false, delete: false, manage: false },
      staff: { view: false, create: false, edit: false, delete: false, manage: false },
      settings: { view: false, create: false, edit: false, delete: false, manage: false },
    }
  },
  {
    id: 'role-user',
    name: 'Standard User',
    color: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: 'User',
    permissions: {
      categories: { view: true, create: false, edit: false, delete: false, manage: false },
      plans: { view: true, create: false, edit: false, delete: false, manage: false },
      tickets: { view: true, create: true, edit: false, delete: false, manage: false },
      users: { view: false, create: false, edit: false, delete: false, manage: false },
      roles: { view: false, create: false, edit: false, delete: false, manage: false },
      staff: { view: false, create: false, edit: false, delete: false, manage: false },
      settings: { view: false, create: false, edit: false, delete: false, manage: false },
    }
  }
];

const INITIAL_CATEGORIES: AdminCategory[] = [
  { id: 'cat-1', name: 'Minecraft Hosting', description: 'High-performance NVMe Minecraft server nodes with DDoS protection', icon: 'Cpu', order: 1, status: 'active' },
  { id: 'cat-2', name: 'VPS Cloud Servers', description: 'Scalable KVM Virtual Private Servers with full root access', icon: 'Server', order: 2, status: 'active' },
  { id: 'cat-3', name: 'Discord Bots 24/7', description: 'Always-online low latency container hosting for your bots', icon: 'Terminal', order: 3, status: 'active' },
  { id: 'cat-4', name: 'Dedicated Bare Metal', description: 'Enterprise-grade dedicated hardware for heavy workloads', icon: 'HardDrive', order: 4, status: 'active' },
];



interface AdminPanelProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  currentUser?: AdminUser | null;
  onLogout?: () => void;
}

export function AdminPanel({ onShowToast, currentUser, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'plans' | 'tickets' | 'users' | 'roles' | 'features' | 'staff' | 'payment' | 'orders' | 'coupons'>('categories');
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<{ open: boolean; category: any | null }>({ open: false, category: null });


  // State
  const [categories, setCategories] = useState<AdminCategory[]>(() => getStoredCategories());
  const [features, setFeatures] = useState<AdminFeature[]>(() => getStoredFeatures());
  const [plans, setPlans] = useState<AdminHostingPlan[]>(getStoredPlans());
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [tickets, setTickets] = useState<AdminSupportTicket[]>(() => getStoredTickets());

  useEffect(() => {
    const handleCategoriesUpdate = (e: any) => {
      if (e.detail) setCategories(e.detail);
      else setCategories(getStoredCategories());
    };
    const handlePlansUpdate = (e: any) => {
      if (e.detail) setPlans(e.detail);
      else setPlans(getStoredPlans());
    };
    window.addEventListener('astro_categories_changed', handleCategoriesUpdate);
    window.addEventListener('astro_plans_changed', handlePlansUpdate);
    return () => {
      window.removeEventListener('astro_categories_changed', handleCategoriesUpdate);
      window.removeEventListener('astro_plans_changed', handlePlansUpdate);
    };
  }, []);

  useEffect(() => {
    getStoredUsers().then(data => setUsers(data));
    const handleUsersUpdate = (e: any) => {
      if (e.detail) setUsers(e.detail);
      else getStoredUsers().then(data => setUsers(data));
    };
    window.addEventListener('astro_users_changed', handleUsersUpdate);
    return () => window.removeEventListener('astro_users_changed', handleUsersUpdate);
  }, []);

  useEffect(() => {
    const handleTicketUpdate = (e: Event) => {
      if ((e as CustomEvent).detail) setTickets((e as CustomEvent).detail);
      else setTickets(getStoredTickets());
    };
    window.addEventListener('astro_tickets_changed', handleTicketUpdate);
    return () => window.removeEventListener('astro_tickets_changed', handleTicketUpdate);
  }, []);

  const updateTicketsAndSync = (newTickets: AdminSupportTicket[]) => {
    setTickets(newTickets);
    saveStoredTickets(newTickets);
  };

  const [roles, setRoles] = useState<AdminRole[]>(INITIAL_ROLES);
  const [staff, setStaff] = useState<AdminStaff[]>(() => getStoredStaff());
  const updateStaffAndSync = (newStaff: AdminStaff[]) => {
    setStaff(newStaff);
    saveStoredStaff(newStaff);
  };
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => getStoredPaymentSettings());
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  
  useEffect(() => {
    getStoredOrders().then(data => setOrders(data));
    const handleOrdersUpdate = (e: any) => setOrders(e.detail);
    window.addEventListener('astro_orders_changed', handleOrdersUpdate);
    return () => {
        window.removeEventListener('astro_orders_changed', handleOrdersUpdate);
    };
  }, []);

  useEffect(() => {
    getStoredCoupons().then(data => setCoupons(data));
    const handleCouponsUpdate = (e: any) => {
      if (e.detail) setCoupons(e.detail);
      else getStoredCoupons().then(data => setCoupons(data));
    };
    window.addEventListener('astro_coupons_changed', handleCouponsUpdate);
    return () => {
      window.removeEventListener('astro_coupons_changed', handleCouponsUpdate);
    };
  }, []);
  const updatePaymentAndSync = (newSettings: PaymentSettings) => {
    setPaymentSettings(newSettings);
    saveStoredPaymentSettings(newSettings);
  };


  const updateCategoriesAndSync = (newCategories: AdminCategory[]) => {
    setCategories(newCategories);
    saveStoredCategories(newCategories);
  };

  const updateFeaturesAndSync = (newFeatures: AdminFeature[]) => {
    setFeatures(newFeatures);
    saveStoredFeatures(newFeatures);
  };

  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [bannerProgress, setBannerProgress] = useState(0);

  const handleImageUpload = (file: File, type: 'logo' | 'banner') => {
    if (file.size > 5 * 1024 * 1024) {
      onShowToast('File size must be less than 5MB', 'error');
      return;
    }
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onShowToast('Invalid format. Please upload PNG, JPG, JPEG, SVG, or WEBP', 'error');
      return;
    }

    if (type === 'logo') {
      setLogoUploading(true);
      setLogoProgress(30);
    } else {
      setBannerUploading(true);
      setBannerProgress(30);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = type === 'logo' ? 300 : 800;
        const MAX_HEIGHT = type === 'logo' ? 300 : 450;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);

        if (type === 'logo') {
          setCatLogo(compressedDataUrl);
          setLogoUploading(false);
          setLogoProgress(100);
          onShowToast('Category logo compressed & uploaded successfully', 'success');
        } else {
          setCatBanner(compressedDataUrl);
          setBannerUploading(false);
          setBannerProgress(100);
          onShowToast('Category banner compressed & uploaded successfully', 'success');
        }
      };
      img.onerror = () => {
        if (type === 'logo') setLogoUploading(false);
        else setBannerUploading(false);
        onShowToast('Failed to process image', 'error');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      if (type === 'logo') setLogoUploading(false);
      else setBannerUploading(false);
      onShowToast('Failed to read image file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmStyle: string;
    onConfirm: () => void;
  } | null>(null);

  // Modals
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editId?: string }>({ open: false });
  const [featureModal, setFeatureModal] = useState<{ open: boolean; editId?: string }>({ open: false });
  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminHostingPlan | undefined>(undefined);
  // Feature Modal States
  const [featureModalTab, setFeatureModalTab] = useState<'general' | 'media' | 'styling' | 'preview'>('general');
  const [featTitle, setFeatTitle] = useState('');
  const [featDesc, setFeatDesc] = useState('');
  const [featIcon, setFeatIcon] = useState('sparkles');
  const [featBadge, setFeatBadge] = useState('');
  const [featCustomImage, setFeatCustomImage] = useState('');
  const [featStatus, setFeatStatus] = useState<'active' | 'disabled'>('active');
  const [featAnimation, setFeatAnimation] = useState('');
  const [featColorTheme, setFeatColorTheme] = useState('purple');

  // Category Modal States
  const [modalActiveTab, setModalActiveTab] = useState<'details' | 'media' | 'seo' | 'preview'>('details');
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catLongDesc, setCatLongDesc] = useState('');
  const [catLogo, setCatLogo] = useState('');
  const [catBanner, setCatBanner] = useState('');
  const [catIcon, setCatIcon] = useState('server');
  const [catStatus, setCatStatus] = useState<'active' | 'disabled'>('active');
  const [catFeatured, setCatFeatured] = useState(false);
  const [catButtonText, setCatButtonText] = useState('View Plans');
  const [catButtonLink, setCatButtonLink] = useState('');
  const [catBadge, setCatBadge] = useState<'New' | 'Popular' | 'Premium' | 'Recommended' | ''>('');
  const [catColorTheme, setCatColorTheme] = useState('purple');
  const [catMetaTitle, setCatMetaTitle] = useState('');
  const [catMetaDesc, setCatMetaDesc] = useState('');
  const [catKeywords, setCatKeywords] = useState('');
  const [catOgImage, setCatOgImage] = useState('');
  const [catFeatures, setCatFeatures] = useState('');
  
  // User Modal States
  const [userModal, setUserModal] = useState<{ open: boolean; editId?: string }>({ open: false });
  const [userDetailsModal, setUserDetailsModal] = useState<{ open: boolean; user: AdminUser | null }>({ open: false, user: null });
  const [editUserModal, setEditUserModal] = useState<{ open: boolean; user: AdminUser | null }>({ open: false, user: null });
  const [resetPassModal, setResetPassModal] = useState<{ open: boolean; user: AdminUser | null }>({ open: false, user: null });
  const [newPassInput, setNewPassInput] = useState('');
  
  // Role Modal States
  const [roleModal, setRoleModal] = useState<{ open: boolean; editId?: string }>({ open: false });


  // Form states for User
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRoleSelect, setUserRoleSelect] = useState(roles.length > 0 ? roles[0].name : 'Standard User');
  const [userStatusSelect, setUserStatusSelect] = useState<'active' | 'suspended' | 'banned'>('active');
  const [userPassword, setUserPassword] = useState('');

  // Form states for Role
  const [roleName, setRoleName] = useState('');
  const [roleColor, setRoleColor] = useState('bg-purple-950 text-purple-300 border-purple-500/30');

  const triggerAutoSave = () => {
    setIsAutoSaving(true);
    setTimeout(() => {
      setIsAutoSaving(false);
      onShowToast('Database synchronized successfully!', 'success');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900/95 border-r border-rose-500/20 p-6 flex flex-col justify-between shrink-0 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-600/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Hosting Admin</h4>
              <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">Management Suite</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'categories', label: `Category Manager (${categories.length})`, icon: <Layers className="w-4 h-4 text-purple-400" /> },
              { id: 'features', label: `Homepage Features (${features.length})`, icon: <Sparkles className="w-4 h-4 text-yellow-400" /> },
              { id: 'plans', label: `Plan Manager (${plans.length})`, icon: <Server className="w-4 h-4 text-blue-400" /> },
              { id: 'tickets', label: `Support Tickets (${tickets.filter(t => t.status === 'open' || t.status === 'pending').length})`, icon: <Ticket className="w-4 h-4 text-amber-400" /> },
              { id: 'users', label: `User Manager (${users.length})`, icon: <Users className="w-4 h-4 text-emerald-400" /> },
              { id: 'roles', label: `Roles & RBAC (${roles.length})`, icon: <Shield className="w-4 h-4 text-rose-400" /> },
              { id: 'staff', label: `Staff Management (${staff.length})`, icon: <Contact className="w-4 h-4 text-orange-400" /> },
              { id: 'payment', label: `Payment Settings`, icon: <CreditCard className="w-4 h-4 text-violet-400" /> },
              { id: 'coupons', label: `Coupon Management (${coupons.length})`, icon: <Tag className="w-4 h-4 text-pink-400" /> },
              { id: 'orders', label: `Orders Management (${orders.length})`, icon: <ShoppingCart className="w-4 h-4 text-cyan-400" /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-950/40'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Database Sync:</span>
            <span className={`font-semibold ${isAutoSaving ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
              {isAutoSaving ? 'Saving...' : 'Connected'}
            </span>
          </div>
          <button
            onClick={triggerAutoSave}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-3.5 h-3.5 text-purple-400" />
            <span>Save & Sync Database</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto space-y-8 bg-slate-950/30 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/5 relative z-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 capitalize tracking-tight mb-2">
              {activeTab === 'categories' ? 'Hosting Categories' :
               activeTab === 'features' ? 'Homepage Features Management' :
               activeTab === 'plans' ? 'Hosting Plans & Pricing' :
               activeTab === 'tickets' ? 'Support Ticket System' :
               activeTab === 'users' ? 'User & Account Management' :
               activeTab === 'roles' ? 'Role & Permission RBAC' : activeTab}
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Manage all hosting products, categories, support conversations, user permissions, and access controls in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white font-semibold">{currentUser.name}</span>
                <span className="text-[10px] text-purple-400">({currentUser.role || 'Admin'})</span>
              </div>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                <span>Logout</span>
              </button>
            )}
            <span className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 shadow-lg shadow-rose-900/20 text-rose-300 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              SECURE_RBAC_ACTIVE
            </span>
          </div>
        </div>

        {/* HOMEPAGE FEATURES MANAGEMENT */}
        {activeTab === 'features' && (
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search homepage features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={() => {
                  setFeatTitle('');
                  setFeatDesc('');
                  setFeatIcon('Zap');
                  setFeatBadge('');
                  setFeatCustomImage('');
                  setFeatStatus('active');
                  setFeatAnimation('fade-up');
                  setFeatColorTheme('slate');
                  setFeatureModalTab('general');
                  setFeatureModal({ open: true });
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Feature Card</span>
              </button>
            </div>

                        {features.length === 0 ? (
              <div className="text-center py-16 bg-slate-950/50 border border-white/5 rounded-3xl">
                <div className="w-20 h-20 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/50">
                  <Sparkles className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Features Available</h3>
                <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">You haven't created any homepage features yet. Create your first feature to highlight your services.</p>
                <button
                  onClick={() => {
                    setFeatTitle('');
                    setFeatDesc('');
                    setFeatIcon('Server');
                    setFeatCustomImage('');
                    setFeatColorTheme('purple');
                    setFeatBadge('');
                    setFeatStatus('active');
                    setFeatureModalTab('general');
                    setFeatureModal({ open: true });
                  }}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-bold text-white shadow-lg shadow-purple-600/30 inline-flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Feature</span>
                </button>
              </div>
            ) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase())).map((feat, idx) => (
                    <div key={feat.id} className="bg-slate-950 border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between group hover:border-purple-500/40 transition-all shadow-xl">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                              {feat.customImage ? (
                                <img src={feat.customImage} alt={feat.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Sparkles className="w-5 h-5 text-purple-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold">
                                  {feat.order}
                                </span>
                                <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                              </div>
                              {feat.badge && <span className="text-[10px] font-bold text-purple-300">{feat.badge}</span>}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            feat.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {feat.status}
                          </span>
                        </div>
    
                        <p className="text-xs text-slate-300 line-clamp-2">{feat.description}</p>
                      </div>
    
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs bg-slate-900/40 p-3 rounded-xl">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (idx > 0) {
                                const updated = [...features];
                                const temp = updated[idx];
                                updated[idx] = updated[idx - 1];
                                updated[idx - 1] = temp;
                                updated.forEach((item, i) => item.order = i + 1);
                                updateFeaturesAndSync(updated);
                                onShowToast('Feature reordered', 'success');
                              }
                            }}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (idx < features.length - 1) {
                                const updated = [...features];
                                const temp = updated[idx];
                                updated[idx] = updated[idx + 1];
                                updated[idx + 1] = temp;
                                updated.forEach((item, i) => item.order = i + 1);
                                updateFeaturesAndSync(updated);
                                onShowToast('Feature reordered', 'success');
                              }
                            }}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
    
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const updated = features.map(item => item.id === feat.id ? { ...item, status: item.status === 'active' ? 'disabled' : 'active' } : item);
                              updateFeaturesAndSync(updated);
                              onShowToast('Status toggled & synced', 'success');
                            }}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                          >
                            {feat.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => {
                              setFeatTitle(feat.title);
                              setFeatDesc(feat.description);
                              setFeatIcon(feat.icon || 'Zap');
                              setFeatBadge(feat.badge || '');
                              setFeatCustomImage(feat.customImage || '');
                              setFeatStatus(feat.status);
                              setFeatAnimation(feat.animationEffect || 'fade-up');
                              setFeatColorTheme(feat.colorTheme || 'slate');
                              setFeatureModalTab('general');
                              setFeatureModal({ open: true, editId: feat.id });
                            }}
                            className="px-2.5 py-1 rounded bg-purple-950/50 text-purple-300 border border-purple-500/30 hover:bg-purple-900/50 text-[11px]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                open: true,
                                title: 'Delete Feature',
                                message: `Are you sure you want to delete feature "${feat.title}"?`,
                                confirmText: 'Delete Feature',
                                confirmStyle: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30',
                                onConfirm: () => {
                                  const updated = features.filter(item => item.id !== feat.id);
                                  updated.forEach((item, i) => item.order = i + 1);
                                  updateFeaturesAndSync(updated);
                                  onShowToast('Feature deleted & synced', 'info');
                                }
                              });
                            }}
                            className="px-2 py-1 rounded bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-900/50 text-[11px]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
    
                
            )}
            {/* Comprehensive Feature Modal */}
            <AnimatePresence>
              {featureModal.open && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} className="bg-slate-900 border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
                      <div>
                        <h3 className="text-lg font-black text-white">
                          {featureModal.editId ? 'Edit Homepage Feature Card' : 'Create New Feature Card'}
                        </h3>
                        <p className="text-xs text-slate-400">Configure real-time homepage feature attributes, icons, badges, and live preview.</p>
                      </div>
                      <button
                        onClick={() => setFeatureModal({ open: false })}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
  
                    <div className="flex border-b border-white/10 bg-slate-950/40 px-6 gap-2 overflow-x-auto">
                      {[
                        { id: 'general', label: '1. General Info' },
                        { id: 'media', label: '2. Icon & Image' },
                        { id: 'settings', label: '3. Settings & Animation' },
                        { id: 'preview', label: '4. Live Preview' },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setFeatureModalTab(tab.id as any)}
                          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                            featureModalTab === tab.id
                              ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                              : 'border-transparent text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
  
                    <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
                      {featureModalTab === 'general' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Feature Title *</label>
                            <input
                              type="text"
                              value={featTitle}
                              onChange={(e) => setFeatTitle(e.target.value)}
                              placeholder="e.g. Instant Deployment"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
  
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Feature Description</label>
                            <textarea
                              rows={3}
                              value={featDesc}
                              onChange={(e) => setFeatDesc(e.target.value)}
                              placeholder="Detailed description appearing on homepage feature card..."
                              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                      )}
  
                      {featureModalTab === 'media' && (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Lucide Icon</label>
                            <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                              {['Zap', 'HardDrive', 'Cpu', 'ShieldCheck', 'Activity', 'Headphones', 'Globe', 'Database', 'Server', 'Boxes', 'Bot', 'Gamepad2', 'Sparkles', 'Lock', 'Cloud'].map(iconName => (
                                <button
                                  key={iconName}
                                  onClick={() => {
                                    setFeatIcon(iconName);
                                    setFeatCustomImage('');
                                  }}
                                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                                    featIcon === iconName && !featCustomImage
                                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                                      : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  <span className="text-[10px] font-bold">{iconName}</span>
                                </button>
                              ))}
                            </div>
                          </div>
  
                          <div className="space-y-3 pt-4 border-t border-white/10">
                            <label className="block text-xs font-semibold text-slate-300">Or Custom Image URL (Overrides Icon)</label>
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {featCustomImage ? (
                                  <img src={featCustomImage} alt="custom" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <Sparkles className="w-6 h-6 text-purple-400" />
                                )}
                              </div>
                              <div className="flex-1 space-y-2">
                                <input
                                  type="text"
                                  value={featCustomImage}
                                  onChange={(e) => setFeatCustomImage(e.target.value)}
                                  placeholder="https://example.com/icon.png"
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                                {featCustomImage && (
                                  <button
                                    onClick={() => setFeatCustomImage('')}
                                    className="text-[11px] text-rose-400 hover:underline"
                                  >
                                    Clear Custom Image
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
  
                        {featureModalTab === 'settings' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Card Status</label>
                              <div className="relative">
                                <select
                                  value={featStatus}
                                  onChange={(e) => setFeatStatus(e.target.value as any)}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-purple-500 appearance-none"
                                >
                                  <option value="active">Active (Visible on Homepage)</option>
                                  <option value="disabled">Disabled (Hidden)</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Badge Tag</label>
                              <input
                                type="text"
                                value={featBadge}
                                onChange={(e) => setFeatBadge(e.target.value)}
                                placeholder="e.g. Fast, NVMe, New"
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Animation Effect</label>
                              <div className="relative">
                                <select
                                  value={featAnimation}
                                  onChange={(e) => setFeatAnimation(e.target.value)}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-purple-500 appearance-none"
                                >
                                  <option value="fade-up">Fade Up</option>
                                  <option value="zoom-in">Zoom In</option>
                                  <option value="slide-in">Slide In</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Card Color Theme</label>
                              <div className="relative">
                                <select
                                  value={featColorTheme}
                                  onChange={(e) => setFeatColorTheme(e.target.value)}
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-purple-500 appearance-none"
                                >
                                  <option value="slate">Slate Modern</option>
                                  <option value="purple">Purple Glow</option>
                                  <option value="emerald">Emerald Trust</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {featureModalTab === 'preview' && (
                        <div className="space-y-4">
                          <div className="text-xs text-slate-400">
                            Live preview of how this feature card appears on the AstroCloude homepage:
                          </div>
  
                          <div className="max-w-xs mx-auto bg-slate-900/80 border border-purple-500/40 rounded-2xl p-6 shadow-2xl relative">
                            {featBadge && (
                              <span className="absolute top-4 right-4 bg-purple-600/30 border border-purple-500/40 text-purple-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                {featBadge}
                              </span>
                            )}
  
                            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center mb-5 overflow-hidden">
                              {featCustomImage ? (
                                <img src={featCustomImage} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Sparkles className="w-6 h-6 text-purple-400" />
                              )}
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">{featTitle || 'Feature Title'}</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {featDesc || 'Feature description preview goes here...'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
  
                    <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-slate-950/60">
                      <button
                        onClick={() => setFeatureModal({ open: false })}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-slate-300 hover:bg-white/20"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!featTitle) {
                            onShowToast('Feature title is required', 'error');
                            return;
                          }
                          if (featureModal.editId) {
                            const updated = features.map(f => f.id === featureModal.editId ? {
                              ...f,
                              title: featTitle,
                              description: featDesc,
                              icon: featIcon,
                              badge: featBadge,
                              customImage: featCustomImage,
                              status: featStatus,
                              animationEffect: featAnimation,
                              colorTheme: featColorTheme,
                            } : f);
                            updateFeaturesAndSync(updated);
                            onShowToast('Feature updated & synced to homepage!', 'success');
                          } else {
                            const newFeat: AdminFeature = {
                              id: 'feat-' + Date.now(),
                              title: featTitle,
                              description: featDesc,
                              icon: featIcon,
                              badge: featBadge,
                              customImage: featCustomImage,
                              order: features.length + 1,
                              status: featStatus,
                              animationEffect: featAnimation,
                              colorTheme: featColorTheme,
                            };
                            const updated = [...features, newFeat];
                            updateFeaturesAndSync(updated);
                            onShowToast('Feature created & synced to homepage!', 'success');
                          }
                          setFeatureModal({ open: false });
                        }}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                      >
                        Save & Sync Homepage
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          )}
  
          {/* 1. CATEGORY MANAGEMENT */}
                  {activeTab === 'staff' && (
          <AdminStaffManagementTab 
            staff={staff}
            roles={roles}
            onUpdate={updateStaffAndSync}
            onShowToast={onShowToast}
          />
        )}
        
        {activeTab === 'payment' && (
          <AdminPaymentTab 
            settings={paymentSettings}
            onUpdate={updatePaymentAndSync}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'categories' && (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setCatName('');
                    setCatSlug('');
                    setCatDesc('');
                    setCatLongDesc('');
                    setCatLogo('');
                    setCatBanner('');
                    setCatIcon('Server');
                    setCatStatus('active');
                    setCatFeatured(false);
                    setCatButtonText('Buy Now');
                    setCatButtonLink('#plans');
                    setCatBadge('');
                    setCatColorTheme('purple');
                    setCatMetaTitle('');
                    setCatMetaDesc('');
                    setCatKeywords('');
                    setCatOgImage('');
                    setCatFeatures('High Performance Node, Instant Deployment, DDoS Protection, Cloud Backups');
                    setModalActiveTab('details');
                    setCategoryModal({ open: true });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
  
                          {categories.length === 0 ? (
              <div className="text-center py-16 bg-slate-950/50 border border-white/5 rounded-3xl">
                <div className="w-20 h-20 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/50">
                  <Layers className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Categories Available</h3>
                <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">You haven't created any hosting categories yet. Create your first category to start organizing your plans.</p>
                <button
                  onClick={() => {
                    setCatName('');
                    setCatSlug('');
                    setCatDesc('');
                    setCatLongDesc('');
                    setCatLogo('');
                    setCatBanner('');
                    setCatIcon('Server');
                    setCatStatus('active');
                    setCatFeatured(false);
                    setCatButtonText('Buy Now');
                    setCatButtonLink('#plans');
                    setCatBadge('');
                    setCatColorTheme('purple');
                    setCatMetaTitle('');
                    setCatMetaDesc('');
                    setCatKeywords('');
                    setCatOgImage('');
                    setCatFeatures('High Performance Node, Instant Deployment, DDoS Protection, Cloud Backups');
                    setModalActiveTab('details');
                    setCategoryModal({ open: true });
                  }}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-bold text-white shadow-lg shadow-purple-600/30 inline-flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Category</span>
                </button>
              </div>
            ) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((cat, idx) => (
                    <div key={cat.id} className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-purple-500/40 transition-all">
                      {cat.bannerImage && (
                        <div className="h-28 w-full relative overflow-hidden border-b border-white/10">
                          <img src={cat.bannerImage} alt={cat.name} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                        </div>
                      )}
    
                      {cat.badge && (
                        <div className="absolute top-3 right-3 bg-purple-600 text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full shadow z-10">
                          {cat.badge}
                        </div>
                      )}
    
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                              {cat.logo ? (
                                <img src={cat.logo} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Server className="w-5 h-5 text-purple-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold">
                                  {cat.order}
                                </span>
                                <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                              </div>
                              {cat.slug && <span className="text-[10px] font-mono text-slate-500">/{cat.slug}</span>}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cat.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {cat.status}
                          </span>
                        </div>
    
                        <p className="text-xs text-slate-300 line-clamp-2">{cat.description}</p>
                        
                        {cat.featured && (
                          <div className="inline-block px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                            ★ Featured on Dashboard
                          </div>
                        )}
                      </div>
    
                      <div className="p-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs bg-slate-900/40">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const updated = [...categories];
                              if (idx > 0) {
                                const temp = updated[idx];
                                updated[idx] = updated[idx - 1];
                                updated[idx - 1] = temp;
                                updated.forEach((item, i) => item.order = i + 1);
                                updateCategoriesAndSync(updated);
                                onShowToast('Category reordered', 'success');
                              }
                            }}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const updated = [...categories];
                              if (idx < updated.length - 1) {
                                const temp = updated[idx];
                                updated[idx] = updated[idx + 1];
                                updated[idx + 1] = temp;
                                updated.forEach((item, i) => item.order = i + 1);
                                updateCategoriesAndSync(updated);
                                onShowToast('Category reordered', 'success');
                              }
                            }}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
    
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const updated = categories.map(item => item.id === cat.id ? { ...item, status: item.status === 'active' ? 'disabled' : 'active' } : item);
                              updateCategoriesAndSync(updated);
                              onShowToast('Status toggled', 'success');
                            }}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                          >
                            {cat.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => {
                              setCatName(cat.name);
                              setCatSlug(cat.slug || '');
                              setCatDesc(cat.description);
                              setCatLongDesc(cat.longDescription || '');
                              setCatLogo(cat.logo || '');
                              setCatBanner(cat.bannerImage || '');
                              setCatIcon(cat.icon || 'Server');
                              setCatStatus(cat.status);
                              setCatFeatured(cat.featured || false);
                              setCatButtonText(cat.buttonText || 'Buy Now');
                              setCatButtonLink(cat.buttonLink || '#plans');
                              setCatBadge(cat.badge || '');
                              setCatColorTheme(cat.colorTheme || 'purple');
                              setCatMetaTitle(cat.seoMetaTitle || '');
                              setCatMetaDesc(cat.seoMetaDescription || '');
                              setCatKeywords(cat.seoKeywords || '');
                              setCatOgImage(cat.seoOgImage || '');
                              setModalActiveTab('details');
                              setCategoryModal({ open: true, editId: cat.id });
                            }}
                            className="px-2.5 py-1 rounded bg-purple-950/50 text-purple-300 border border-purple-500/30 hover:bg-purple-900/50 text-[11px]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              const catPlans = plans.filter(p => p.categoryId === cat.id);
                              if (catPlans.length > 0) {
                                setDeleteCategoryModal({ open: true, category: cat });
                              } else {
                                setConfirmModal({
                                  open: true,
                                  title: 'Delete Category',
                                  message: `Are you sure you want to delete category "${cat.name}"? It has no plans associated with it.`,
                                  confirmText: 'Delete Category',
                                  confirmStyle: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30',
                                  onConfirm: () => {
                                    try {
                                      const updatedCategories = categories.filter(item => item.id !== cat.id);
                                      updateCategoriesAndSync(updatedCategories);
                                      onShowToast(`Category "${cat.name}" deleted successfully!`, 'success');
                                    } catch (err: any) {
                                      onShowToast(`Failed to delete category: ${err?.message || 'Unknown error'}`, 'error');
                                    }
                                  }
                                });
                              }
                            }}
                            className="px-2 py-1 rounded bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-900/50 text-[11px]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            )}
            {/* Comprehensive Category Modal */}
            <AnimatePresence>
            {categoryModal.open && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} className="bg-slate-900 border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                  {/* Modal Header */}
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {categoryModal.editId ? 'Edit Hosting Category' : 'Create New Hosting Category'}
                      </h3>
                      <p className="text-xs text-slate-400">Configure real-time dashboard category attributes, branding, and SEO.</p>
                    </div>
                    <button
                      onClick={() => setCategoryModal({ open: false })}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Tabs */}
                  <div className="flex border-b border-white/10 bg-slate-950/40 px-6 gap-2 overflow-x-auto">
                    {[
                      { id: 'general', label: '1. General Info' },
                      { id: 'media', label: '2. Media & Assets' },
                      { id: 'settings', label: '3. Settings & Badges' },
                      { id: 'seo', label: '4. SEO Settings' },
                      { id: 'preview', label: '5. Live Preview' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setModalActiveTab(tab.id as any)}
                        className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                          modalActiveTab === tab.id
                            ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                            : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
                    {modalActiveTab === 'general' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category Name *</label>
                            <input
                              type="text"
                              value={catName}
                              onChange={(e) => {
                                setCatName(e.target.value);
                                if (!categoryModal.editId) {
                                  setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                                }
                              }}
                              placeholder="e.g. AI Model Hosting"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">SEO Slug URL</label>
                            <input
                              type="text"
                              value={catSlug}
                              onChange={(e) => setCatSlug(e.target.value)}
                              placeholder="e.g. ai-model-hosting"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Short Summary Description</label>
                          <textarea
                            rows={2}
                            value={catDesc}
                            onChange={(e) => setCatDesc(e.target.value)}
                            placeholder="Brief overview appearing on dashboard cards..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Long Description / Markdown Support</label>
                          <textarea
                            rows={4}
                            value={catLongDesc}
                            onChange={(e) => setCatLongDesc(e.target.value)}
                            placeholder="Detailed explanation with markdown support for category detail pages..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category Features / Specs (Comma separated)</label>
                          <input
                            type="text"
                            value={catFeatures}
                            onChange={(e) => setCatFeatures(e.target.value)}
                            placeholder="e.g. High Performance Node, Instant Deployment, DDoS Protection, Cloud Backups"
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    {modalActiveTab === 'media' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Category Logo Upload */}
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-300">Category Logo / Icon Image</label>
                            
                            <div 
                              onDragOver={(e) => { e.preventDefault(); }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleImageUpload(e.dataTransfer.files[0], 'logo');
                                }
                              }}
                              className="border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl p-4 bg-slate-950/60 text-center flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden group min-h-[148px]"
                            >
                              {logoUploading && (
                                <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center gap-2 p-4">
                                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden max-w-[150px]">
                                    <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${logoProgress}%` }}></div>
                                  </div>
                                  <span className="text-[11px] text-purple-300 font-bold animate-pulse">Uploading... {logoProgress}%</span>
                                </div>
                              )}

                              {catLogo ? (
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-purple-500/40 shadow-xl group">
                                  <img src={catLogo} alt="Logo Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <label className="cursor-pointer px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold">
                                      Change
                                      <input 
                                        type="file" 
                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" 
                                        className="hidden" 
                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                                      />
                                    </label>
                                    <button
                                      onClick={() => setCatLogo('')}
                                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white">Drag & drop logo here</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG, WEBP (Max 5MB)</p>
                                  </div>
                                  <label className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 transition-all">
                                    Upload Image
                                    <input 
                                      type="file" 
                                      accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" 
                                      className="hidden" 
                                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                                    />
                                  </label>
                                </>
                              )}
                            </div>
                            {catLogo && (
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-emerald-400 font-semibold">✓ Logo uploaded & saved</span>
                                <button onClick={() => setCatLogo('')} className="text-rose-400 hover:underline">Remove logo</button>
                              </div>
                            )}
                          </div>

                          {/* Category Banner Upload */}
                          <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-300">Background Banner Image</label>
                            
                            <div 
                              onDragOver={(e) => { e.preventDefault(); }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleImageUpload(e.dataTransfer.files[0], 'banner');
                                }
                              }}
                              className="border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl p-4 bg-slate-950/60 text-center flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden group min-h-[148px]"
                            >
                              {bannerUploading && (
                                <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center gap-2 p-4">
                                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden max-w-[150px]">
                                    <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${bannerProgress}%` }}></div>
                                  </div>
                                  <span className="text-[11px] text-purple-300 font-bold animate-pulse">Uploading... {bannerProgress}%</span>
                                </div>
                              )}

                              {catBanner ? (
                                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-purple-500/40 shadow-xl group">
                                  <img src={catBanner} alt="Banner Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <label className="cursor-pointer px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold">
                                      Change Banner
                                      <input 
                                        type="file" 
                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" 
                                        className="hidden" 
                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
                                      />
                                    </label>
                                    <button
                                      onClick={() => setCatBanner('')}
                                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <Server className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white">Drag & drop banner here</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Recommended 1200x400px (Max 5MB)</p>
                                  </div>
                                  <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-white/10 transition-all">
                                    Upload Background Image
                                    <input 
                                      type="file" 
                                      accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" 
                                      className="hidden" 
                                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
                                    />
                                  </label>
                                </>
                              )}
                            </div>
                            {catBanner && (
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-emerald-400 font-semibold">✓ Banner uploaded & saved</span>
                                <button onClick={() => setCatBanner('')} className="text-rose-400 hover:underline">Remove banner</button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-2">Lucide Icon Identifier</label>
                          <div className="grid grid-cols-6 gap-3">
                            {['Boxes', 'Cpu', 'Bot', 'Server', 'Globe', 'Gamepad2'].map(iconName => (
                              <button
                                key={iconName}
                                onClick={() => setCatIcon(iconName)}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                                  catIcon === iconName
                                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                                    : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                                }`}
                              >
                                <span className="text-xs font-bold">{iconName}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {modalActiveTab === 'settings' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category Status</label>
                            <div className="relative">
<select
                              value={catStatus}
                              onChange={(e) => setCatStatus(e.target.value as any)}
                              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-4 pr-10 py-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 appearance-none"
                            >
                              <option value="active">Active (Visible)</option>
                              <option value="disabled">Disabled (Hidden)</option>
                            </select>
<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
</div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Badge Label</label>
                            <div className="relative">
<select
                              value={catBadge}
                              onChange={(e) => setCatBadge(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-4 pr-10 py-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 appearance-none"
                            >
                              <option value="">None</option>
                              <option value="New">New</option>
                              <option value="Popular">Popular</option>
                              <option value="Premium">Premium</option>
                              <option value="Recommended">Recommended</option>
                            </select>
<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Call to Action Button Text</label>
                            <input
                              type="text"
                              value={catButtonText}
                              onChange={(e) => setCatButtonText(e.target.value)}
                              placeholder="e.g. Deploy Server"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Button Target Link</label>
                            <input
                              type="text"
                              value={catButtonLink}
                              onChange={(e) => setCatButtonLink(e.target.value)}
                              placeholder="e.g. #plans or URL"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-white/10">
                          <div>
                            <h4 className="text-xs font-bold text-white">Featured Category Flag</h4>
                            <p className="text-[11px] text-slate-400">Pin this category to top priority sections on the website dashboard.</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={catFeatured}
                            onChange={(e) => setCatFeatured(e.target.checked)}
                            className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {modalActiveTab === 'seo' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">SEO Meta Title</label>
                          <input
                            type="text"
                            value={catMetaTitle}
                            onChange={(e) => setCatMetaTitle(e.target.value)}
                            placeholder="Optimized page title for search engines..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">SEO Meta Description</label>
                          <textarea
                            rows={2}
                            value={catMetaDesc}
                            onChange={(e) => setCatMetaDesc(e.target.value)}
                            placeholder="Meta description for search engine snippet..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Keywords (Comma Separated)</label>
                          <input
                            type="text"
                            value={catKeywords}
                            onChange={(e) => setCatKeywords(e.target.value)}
                            placeholder="e.g. vps hosting, cloud nodes, linux server"
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Open Graph (OG) Image URL</label>
                          <input
                            type="text"
                            value={catOgImage}
                            onChange={(e) => setCatOgImage(e.target.value)}
                            placeholder="Social share preview banner URL..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    {modalActiveTab === 'preview' && (
                      <div className="space-y-4">
                        <div className="text-xs text-slate-400">
                          Live preview of how this category card will appear on the AstroCloude website dashboard:
                        </div>

                        <div className="max-w-sm mx-auto bg-slate-900 border border-purple-500/50 rounded-3xl overflow-hidden shadow-2xl relative">
                          {catBanner && (
                            <div className="h-32 w-full relative">
                              <img src={catBanner} alt="banner" className="w-full h-full object-cover opacity-70" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                            </div>
                          )}

                          {catBadge && (
                            <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] uppercase font-extrabold px-3 py-1 rounded-full shadow z-10">
                              {catBadge}
                            </div>
                          )}

                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden">
                                {catLogo ? (
                                  <img src={catLogo} alt="logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <Server className="w-6 h-6 text-purple-400" />
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">Starting From</span>
                                <span className="text-sm font-bold text-purple-300 font-mono">₹499/mo</span>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-lg font-bold text-white mb-2">{catName || 'Category Name'}</h4>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {catDesc || 'Category description preview goes here...'}
                              </p>
                            </div>

                            <button className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 shadow-lg shadow-purple-600/30">
                              {catButtonText || 'Buy Now'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-slate-950/60">
                    <button
                      onClick={() => setCategoryModal({ open: false })}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-slate-300 hover:bg-white/20"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!catName) {
                          onShowToast('Category name is required', 'error');
                          return;
                        }
                        if (categoryModal.editId) {
                          const updated = categories.map(c => c.id === categoryModal.editId ? {
                            ...c,
                            name: catName,
                            slug: catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            description: catDesc,
                            longDescription: catLongDesc,
                            logo: catLogo,
                            bannerImage: catBanner,
                            icon: catIcon,
                            status: catStatus,
                            featured: catFeatured,
                            buttonText: catButtonText,
                            buttonLink: catButtonLink,
                            badge: catBadge,
                            colorTheme: catColorTheme,
                            seoMetaTitle: catMetaTitle,
                            seoMetaDescription: catMetaDesc,
                            seoKeywords: catKeywords,
                            seoOgImage: catOgImage,
                            features: catFeatures.split(',').map(s => s.trim()).filter(Boolean),
                          } : c);
                          updateCategoriesAndSync(updated);
                          onShowToast('Category updated & synced instantly!', 'success');
                        } else {
                          const newCat: AdminCategory = {
                            id: 'cat-' + Date.now(),
                            name: catName,
                            slug: catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            description: catDesc,
                            longDescription: catLongDesc,
                            logo: catLogo,
                            bannerImage: catBanner,
                            icon: catIcon,
                            order: categories.length + 1,
                            status: catStatus,
                            featured: catFeatured,
                            buttonText: catButtonText,
                            buttonLink: catButtonLink,
                            badge: catBadge,
                            colorTheme: catColorTheme,
                            seoMetaTitle: catMetaTitle,
                            seoMetaDescription: catMetaDesc,
                            seoKeywords: catKeywords,
                            seoOgImage: catOgImage,
                            features: catFeatures.split(',').map(s => s.trim()).filter(Boolean),
                          };
                          const updated = [...categories, newCat];
                          updateCategoriesAndSync(updated);
                          onShowToast('Category created & synced instantly!', 'success');
                        }
                        setCategoryModal({ open: false });
                      }}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                    >
                      Save & Sync Dashboard
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        )}

        {/* 2. PLAN MANAGEMENT */}
        {activeTab === 'plans' && (
          <AnimatePresence mode="wait">
          {isPlanEditorOpen ? (
            <motion.div key="editor" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="w-full">
              <AdminPlanEditor
                plan={editingPlan}
              categories={categories}
              onSave={(savedPlan) => {
                if (editingPlan) {
                  const updatedPlans = plans.map(p => p.id === savedPlan.id ? savedPlan : p);
                  setPlans(updatedPlans);
                  updateStoredPlans(updatedPlans);
                } else {
                  const updatedPlans = [...plans, savedPlan];
                  setPlans(updatedPlans);
                  updateStoredPlans(updatedPlans);
                }
                setIsPlanEditorOpen(false);
                setEditingPlan(undefined);
              }}
              onAutoSave={(savedPlan) => {
                setIsAutoSaving(true);
                if (editingPlan) {
                  const updatedPlans = plans.map(p => p.id === savedPlan.id ? savedPlan : p);
                  setPlans(updatedPlans);
                  updateStoredPlans(updatedPlans);
                } else {
                  const updatedPlans = [...plans, savedPlan];
                  setPlans(updatedPlans);
                  updateStoredPlans(updatedPlans);
                  setEditingPlan(savedPlan); // So it keeps autosaving the same plan
                }
                setTimeout(() => setIsAutoSaving(false), 1000);
              }}
              onClose={() => {
                setIsPlanEditorOpen(false);
                setEditingPlan(undefined);
              }}
              onShowToast={onShowToast}
              />
            </motion.div>
          ) : (

          <motion.div key="list" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="w-full">
            <AdminPlanManagementTab 
              plans={plans}
            categories={categories}
            setPlans={setPlans}
            onShowToast={onShowToast}
            setIsPlanEditorOpen={setIsPlanEditorOpen}
            setEditingPlan={setEditingPlan}
            />
          </motion.div>
          )}
          </AnimatePresence>
        )}

        {/* 3. SUPPORT TICKETS */}
        {activeTab === 'tickets' && (
          <AdminTicketsTab 
            tickets={tickets} 
            onUpdate={updateTicketsAndSync} 
            onShowToast={onShowToast} 
          />
        )}
        {/* 4. USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by name, username, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={() => {
                  setUserName('');
                  setUserUsername('');
                  setUserEmail('');
                  setUserPassword('');
                  setUserRoleSelect(roles.length > 0 ? roles[0].name : 'Standard User');
                  setUserStatusSelect('active');
                  setUserModal({ open: true });
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400">
                    <th className="py-3 font-semibold">User</th>
                    <th className="py-3 font-semibold">Username</th>
                    <th className="py-3 font-semibold">Role</th>
                    <th className="py-3 font-semibold">Status</th>
                    <th className="py-3 font-semibold">Joined</th>
                    <th className="py-3 font-semibold">Servers</th>
                    <th className="py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {users.filter(u => 
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-purple-300 text-xs">@{u.username || 'user'}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          u.role === 'Admin' || (u.roles && u.roles.includes('Administrator'))
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                            : 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                        }`}>
                          {u.role || u.roles[0] || 'User'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'active' ? 'bg-emerald-950 text-emerald-400' :
                          u.status === 'suspended' ? 'bg-amber-950 text-amber-400' :
                          'bg-rose-950 text-rose-400'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-[10px]">{u.joinedDate || 'Recent'}</td>
                      <td className="py-3 text-slate-300 font-semibold">{u.serversCount || 0}</td>
                      <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                        {/* View Details */}
                        <button
                          onClick={() => setUserDetailsModal({ open: true, user: u })}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          View
                        </button>

                        {/* Edit User */}
                        <button
                          onClick={() => {
                            setUserName(u.name);
                            setUserUsername(u.username || '');
                            setUserEmail(u.email);
                            setUserRoleSelect(u.role || (u.roles && u.roles[0]) || 'Standard User');
                            setUserStatusSelect(u.status || 'active');
                            setEditUserModal({ open: true, user: u });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/50 transition-colors"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                          Edit
                        </button>

                        {/* Suspend / Unsuspend */}
                        <button
                          onClick={async () => {
                            const newStatus = u.status === 'active' ? 'suspended' : 'active';
                            await updateUser(u.id, { status: newStatus });
                            onShowToast(`User "${u.name}" status changed to ${newStatus}`, 'success');
                          }}
                          className={`px-2.5 py-1 rounded-lg transition-colors ${
                            u.status === 'active'
                              ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/50'
                              : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => {
                            setNewPassInput('');
                            setResetPassModal({ open: true, user: u });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-950/40 text-blue-300 border border-blue-500/30 hover:bg-blue-900/50 transition-colors"
                        >
                          <Key className="w-3.5 h-3.5 inline mr-1" />
                          Reset
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => {
                            setConfirmModal({
                              open: true,
                              title: 'Delete User Account',
                              message: `Are you sure you want to permanently delete user "${u.name}" (@${u.username})? This action cannot be undone.`,
                              confirmText: 'Delete User',
                              confirmStyle: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30',
                              onConfirm: async () => {
                                await deleteUser(u.id);
                                onShowToast('User deleted successfully', 'info');
                              }
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-900/50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal 1: Create User Modal */}
            <AnimatePresence>
            {userModal.open && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} className="bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-purple-400" />
                    Create New User Account
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Username *</label>
                      <input
                        type="text"
                        value={userUsername}
                        onChange={(e) => setUserUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        placeholder="johndoe"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                        <select
                          value={userRoleSelect}
                          onChange={(e) => setUserRoleSelect(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="Standard User">Standard User</option>
                          <option value="Administrator">Administrator</option>
                          <option value="Staff Support">Staff Support</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                        <select
                          value={userStatusSelect}
                          onChange={(e) => setUserStatusSelect(e.target.value as any)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="banned">Banned</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
                      <input
                        type="password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="At least 6 characters (hashed securely)"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button onClick={() => setUserModal({ open: false })} className="px-4 py-2.5 rounded-xl text-xs bg-white/10 text-slate-300">Cancel</button>
                    <button
                      onClick={async () => {
                        if (!userName.trim() || !userEmail.trim() || !userPassword) {
                          onShowToast('Please fill all required fields', 'error');
                          return;
                        }
                        const finalRole = userRoleSelect === 'Administrator' ? 'Admin' : 'User';
                        const res = await createUserByAdmin({
                          name: userName,
                          username: userUsername || userName.toLowerCase().replace(/\s+/g, ''),
                          email: userEmail,
                          role: finalRole,
                          roles: [userRoleSelect],
                          status: userStatusSelect,
                          password: userPassword
                        });
                        if (res.success) {
                          onShowToast('User created successfully in database!', 'success');
                          setUserModal({ open: false });
                        } else {
                          onShowToast(res.error || 'Failed to create user', 'error');
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                    >
                      Create User
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Modal 2: Edit User Modal */}
            <AnimatePresence>
            {editUserModal.open && editUserModal.user && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} className="bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-purple-400" />
                    Edit User: {editUserModal.user.name}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                      <input
                        type="text"
                        value={userUsername}
                        onChange={(e) => setUserUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                        <select
                          value={userRoleSelect}
                          onChange={(e) => setUserRoleSelect(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="Standard User">Standard User</option>
                          <option value="Administrator">Administrator</option>
                          <option value="Staff Support">Staff Support</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                        <select
                          value={userStatusSelect}
                          onChange={(e) => setUserStatusSelect(e.target.value as any)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="banned">Banned</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button onClick={() => setEditUserModal({ open: false, user: null })} className="px-4 py-2.5 rounded-xl text-xs bg-white/10 text-slate-300">Cancel</button>
                    <button
                      onClick={async () => {
                        if (!userName.trim() || !userEmail.trim()) return;
                        const finalRole = userRoleSelect === 'Administrator' ? 'Admin' : 'User';
                        await updateUser(editUserModal.user!.id, {
                          name: userName.trim(),
                          username: userUsername.trim().toLowerCase(),
                          email: userEmail.trim().toLowerCase(),
                          role: finalRole,
                          roles: [userRoleSelect],
                          status: userStatusSelect
                        });
                        onShowToast('User details updated successfully!', 'success');
                        setEditUserModal({ open: false, user: null });
                      }}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                    >
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Modal 3: View User Details Modal */}
            <AnimatePresence>
            {userDetailsModal.open && userDetailsModal.user && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} className="bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-400" />
                      User Profile Details
                    </h3>
                    <button 
                      onClick={() => setUserDetailsModal({ open: false, user: null })}
                      className="text-slate-400 hover:text-white text-sm"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                        {userDetailsModal.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{userDetailsModal.user.name}</div>
                        <div className="text-purple-400 font-mono">@{userDetailsModal.user.username || 'client'}</div>
                        <div className="text-slate-400">{userDetailsModal.user.email}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase">Account ID</span>
                        <span className="font-mono text-white text-[11px] truncate block">{userDetailsModal.user.id}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase">Role</span>
                        <span className="font-semibold text-purple-300">{userDetailsModal.user.role || 'User'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase">Account Status</span>
                        <span className="font-semibold capitalize text-emerald-400">{userDetailsModal.user.status || 'Active'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase">Registration Date</span>
                        <span className="text-white">{userDetailsModal.user.joinedDate || 'Recent'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase">Active Servers</span>
                        <span className="text-white font-bold">{userDetailsModal.user.serversCount || 0}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase">Security Level</span>
                        <span className="text-emerald-400 font-mono text-[10px]">PBKDF2 SHA-256</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-white/10">
                    <button
                      onClick={() => setUserDetailsModal({ open: false, user: null })}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white"
                    >
                      Close Details
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Modal 4: Reset Password Modal */}
            <AnimatePresence>
            {resetPassModal.open && resetPassModal.user && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} className="bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-400" />
                    Reset Password: {resetPassModal.user.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enter a new secure password for <span className="text-white font-semibold">{resetPassModal.user.email}</span>. The password will be hashed using 100,000 PBKDF2 iterations with salt.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassInput}
                      onChange={(e) => setNewPassInput(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <button onClick={() => setResetPassModal({ open: false, user: null })} className="px-4 py-2.5 rounded-xl text-xs bg-white/10 text-slate-300">Cancel</button>
                    <button
                      onClick={async () => {
                        if (!newPassInput || newPassInput.length < 6) {
                          onShowToast('Password must be at least 6 characters long', 'error');
                          return;
                        }
                        const ok = await resetUserPassword(resetPassModal.user!.id, newPassInput);
                        if (ok) {
                          onShowToast(`Password for ${resetPassModal.user!.name} reset successfully!`, 'success');
                          setResetPassModal({ open: false, user: null });
                        } else {
                          onShowToast('Failed to reset password', 'error');
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30"
                    >
                      Update Password
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        )}

        {/* 5. ROLE & PERMISSION MANAGEMENT (RBAC) */}
        {activeTab === 'coupons' && (
          <AdminCouponManagementTab 
            coupons={coupons} 
            onRefresh={() => getStoredCoupons().then(setCoupons)} 
            onShowToast={onShowToast} 
          />
        )}
        {activeTab === 'orders' && (
          <AdminOrderManagementTab orders={orders} onUpdate={updateStoredOrders} onShowToast={onShowToast} />
        )}
        {activeTab === 'roles' && (          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Role-Based Access Control (RBAC) Matrix</h3>
                <p className="text-xs text-slate-400">Configure granular permissions for every module instantly.</p>
              </div>
              <button
                onClick={() => {
                  setRoleName('');
                  setRoleModal({ open: true });
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Role</span>
              </button>
            </div>

            <div className="space-y-6">
              {roles.map(role => (
                <div key={role.id} className="bg-slate-950 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${role.color}`}>
                        {role.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {role.id}</span>
                    </div>
                    {role.id !== 'role-admin' && (
                      <button
                        onClick={() => {
                          setConfirmModal({
                            open: true,
                            title: 'Delete Role',
                            message: `Are you sure you want to delete role "${role.name}"?`,
                            confirmText: 'Delete Role',
                            confirmStyle: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30',
                            onConfirm: () => {
                              setRoles(roles.filter(r => r.id !== role.id));
                              onShowToast('Role deleted', 'info');
                            }
                          });
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        Delete Role
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400">
                          <th className="py-2 px-3">Module</th>
                          <th className="py-2 px-3 text-center">View</th>
                          <th className="py-2 px-3 text-center">Create</th>
                          <th className="py-2 px-3 text-center">Edit</th>
                          <th className="py-2 px-3 text-center">Delete</th>
                          <th className="py-2 px-3 text-center">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {(['categories', 'plans', 'tickets', 'users', 'roles', 'staff', 'settings'] as const).map(mod => {
                          const perms = role.permissions[mod];
                          return (
                            <tr key={mod}>
                              <td className="py-2.5 px-3 font-bold text-white capitalize">{mod}</td>
                              {(['view', 'create', 'edit', 'delete', 'manage'] as const).map(action => (
                                <td key={action} className="py-2.5 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={perms[action]}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setRoles(roles.map(r => {
                                        if (r.id === role.id) {
                                          return {
                                            ...r,
                                            permissions: {
                                              ...r.permissions,
                                              [mod]: {
                                                ...r.permissions[mod],
                                                [action]: checked
                                              }
                                            }
                                          };
                                        }
                                        return r;
                                      }));
                                      onShowToast('RBAC permission updated instantly', 'success');
                                    }}
                                    className="w-4 h-4 rounded bg-slate-900 border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Role Modal */}
            <AnimatePresence>
            {roleModal.open && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} className="bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-white">Create New Role</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Role Name</label>
                      <input
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="e.g. Moderator"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button onClick={() => setRoleModal({ open: false })} className="px-4 py-2.5 rounded-xl text-xs bg-white/10 text-slate-300">Cancel</button>
                    <button
                      onClick={() => {
                        if (!roleName) return;
                        const newR: AdminRole = {
                          id: 'role-' + Date.now(),
                          name: roleName,
                          color: 'bg-blue-950 text-blue-300 border-blue-500/30',
                          icon: 'Shield',
                          permissions: {
                            categories: { view: true, create: false, edit: false, delete: false, manage: false },
                            plans: { view: true, create: false, edit: false, delete: false, manage: false },
                            tickets: { view: true, create: true, edit: true, delete: false, manage: true },
                            users: { view: true, create: false, edit: false, delete: false, manage: false },
                            roles: { view: false, create: false, edit: false, delete: false, manage: false },
                            staff: { view: false, create: false, edit: false, delete: false, manage: false },
                            settings: { view: false, create: false, edit: false, delete: false, manage: false },
                          }
                        };
                        setRoles([...roles, newR]);
                        onShowToast('New role created successfully!', 'success');
                        setRoleModal({ open: false });
                      }}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                    >
                      Create Role
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
        {confirmModal && confirmModal.open && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
                <button
                  onClick={() => setConfirmModal(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-slate-300 text-sm mb-8">{confirmModal.message}</p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmModal.onConfirm();
                      setConfirmModal(null);
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-lg ${confirmModal.confirmStyle}`}
                  >
                    {confirmModal.confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}
