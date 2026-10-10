import { AdminCategory } from '../types';
import { 
  fetchCategoriesFromDb, 
  syncCategoriesToDb, 
  saveCategoryToDb, 
  updateCategoryInDb, 
  deleteCategoryFromDb 
} from './databaseClient';

const STORAGE_KEY = 'astro_admin_categories_v2';

export const INITIAL_CATEGORIES: AdminCategory[] = [
  { 
    id: 'cat-1', 
    name: 'Minecraft Hosting', 
    slug: 'minecraft-hosting',
    description: '', 
    longDescription: 'Deploy your Minecraft server in seconds with custom modpack support, automated backups, and 99.9% uptime SLA.',
    logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    icon: 'Boxes', 
    order: 1, 
    status: 'active',
    featured: true,
    buttonText: 'Deploy Server',
    buttonLink: '#plans',
    badge: 'Popular',
    colorTheme: 'purple',
    seoMetaTitle: 'High-Performance Minecraft Server Hosting | AstroCloude',
    seoMetaDescription: 'Instant setup NVMe Minecraft server hosting with unlimited slots and DDoS protection.',
    seoKeywords: 'minecraft server hosting, nvme minecraft, modded minecraft host',
    features: ['High Performance Node', 'Instant Deployment', 'DDoS Protection', 'Cloud Backups']
  },
  { 
    id: 'cat-2', 
    name: 'VPS Cloud Servers', 
    slug: 'vps-cloud-servers',
    description: '', 
    longDescription: 'Enterprise-grade KVM virtualization with lightning-fast NVMe storage and dedicated CPU threads.',
    logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    icon: 'Cpu', 
    order: 2, 
    status: 'active',
    featured: true,
    buttonText: 'Configure VPS',
    buttonLink: '#plans',
    badge: 'Premium',
    colorTheme: 'blue',
    seoMetaTitle: 'Cloud VPS Hosting with NVMe SSD | AstroCloude',
    seoMetaDescription: 'Deploy scalable KVM Virtual Private Servers with full root access in seconds.',
    seoKeywords: 'vps hosting, cloud vps, kvm vps, nvme vps',
    features: ['Root Access', 'Instant Setup', 'Dedicated IPv4', 'Automated Daily Backups']
  },
  { 
    id: 'cat-3', 
    name: 'Discord Bots 24/7', 
    slug: 'discord-bots-24-7',
    description: '', 
    longDescription: 'Optimized Node.js, Python, and Go container environments designed specifically for 24/7 Discord bots.',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    icon: 'Bot', 
    order: 3, 
    status: 'active',
    featured: false,
    buttonText: 'Host Bot',
    buttonLink: '#plans',
    badge: 'New',
    colorTheme: 'emerald',
    seoMetaTitle: '24/7 Discord Bot Hosting | AstroCloude',
    seoMetaDescription: 'Keep your Discord bots online 24/7 with zero downtime container hosting.',
    seoKeywords: 'discord bot hosting, python bot host, nodejs bot hosting',
    features: ['Always Online 24/7', 'GitHub Auto-Deploy', 'Live Logs Console', 'Discord Webhook Alerts']
  },
  { 
    id: 'cat-4', 
    name: 'Dedicated Bare Metal', 
    slug: 'dedicated-bare-metal',
    description: '', 
    longDescription: 'Raw uncompromised physical hardware with enterprise Intel & AMD EPYC processors and 10Gbps unmetered uplinks.',
    logo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    icon: 'Server', 
    order: 4, 
    status: 'active',
    featured: false,
    buttonText: 'View Hardware',
    buttonLink: '#plans',
    badge: 'Recommended',
    colorTheme: 'rose',
    seoMetaTitle: 'Dedicated Server & Bare Metal Hosting | AstroCloude',
    seoMetaDescription: 'Enterprise dedicated bare metal servers with high-speed unmetered network ports.',
    seoKeywords: 'dedicated servers, bare metal, enterprise hosting',
    features: ['IPMI / KVM-over-IP', 'Custom ISO Mount', 'BGP Session Available', 'SLA 99.99%']
  },
  { 
    id: 'cat-5', 
    name: 'NVMe Web Hosting', 
    slug: 'nvme-web-hosting',
    description: '', 
    longDescription: 'High-speed LiteSpeed web hosting optimized for WordPress, Magento, and custom web applications.',
    logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    icon: 'Globe', 
    order: 5, 
    status: 'active',
    featured: false,
    buttonText: 'Launch Website',
    buttonLink: '#plans',
    badge: '',
    colorTheme: 'amber',
    seoMetaTitle: 'Fast NVMe Web Hosting & cPanel | AstroCloude',
    seoMetaDescription: 'Lightning-fast web hosting powered by LiteSpeed web servers and NVMe storage.',
    seoKeywords: 'web hosting, cpanel hosting, wordpress host',
    features: ['Free Let\'s Encrypt SSL', 'Daily JetBackup Protection', 'NVMe SSD Speed', 'Unlimited Email Accounts']
  },
  { 
    id: 'cat-6', 
    name: 'Multi-Game Hosting', 
    slug: 'multi-game-hosting',
    description: '', 
    longDescription: 'One-click installer for over 100+ PC games with automated workshop mod updates and low ping.',
    logo: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=150&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    icon: 'Gamepad2', 
    order: 6, 
    status: 'active',
    featured: false,
    buttonText: 'Explore Games',
    buttonLink: '#plans',
    badge: 'Popular',
    colorTheme: 'cyan',
    seoMetaTitle: 'Multi-Game Server Hosting (ARK, Rust, CS2) | AstroCloude',
    seoMetaDescription: 'High-performance game server hosting with instant mod installation and DDoS protection.',
    seoKeywords: 'game server hosting, rust server, ark server, cs2 server',
    features: ['Instant Setup', 'Game Switching', 'DDoS Protection', 'Mod Manager']
  },
];

let memoryCategoriesCache: AdminCategory[] | null = null;

// Bootstrap from localStorage if present
try {
  if (typeof localStorage !== 'undefined') {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item) {
      const parsed: AdminCategory[] = JSON.parse(item);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCategoriesCache = parsed;
      }
    }
  }
} catch {
  // Ignore initial read error
}

if (!memoryCategoriesCache) {
  memoryCategoriesCache = INITIAL_CATEGORIES;
}

// Asynchronously sync from SQLite database on startup
if (typeof window !== 'undefined') {
  fetchCategoriesFromDb().then((dbCategories) => {
    if (Array.isArray(dbCategories) && dbCategories.length > 0) {
      memoryCategoriesCache = dbCategories;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbCategories));
      } catch {}
      window.dispatchEvent(new CustomEvent('astro_categories_changed', { detail: dbCategories }));
    }
  }).catch(() => {});
}

export function getStoredCategories(): AdminCategory[] {
  if (memoryCategoriesCache && memoryCategoriesCache.length > 0) {
    return memoryCategoriesCache;
  }

  try {
    const item = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (item) {
      const parsed: AdminCategory[] = JSON.parse(item);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCategoriesCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading categories from localStorage', e);
  }
  return INITIAL_CATEGORIES;
}

export function saveStoredCategories(categories: AdminCategory[]): void {
  memoryCategoriesCache = categories;

  // 1. Instantly dispatch event so all components react immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('astro_categories_changed', { detail: categories }));
  }

  // 2. Persist in localStorage as local fallback
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }
  } catch (e) {
    console.warn('Error saving categories to localStorage', e);
  }

  // 3. Permanently save to server SQLite database
  syncCategoriesToDb(categories).catch((err) => {
    console.error('Failed to sync categories to SQLite database:', err);
  });
}

// Asynchronous CRUD helpers for components that want async promises
export async function addCategoryAsync(category: AdminCategory): Promise<AdminCategory> {
  const current = getStoredCategories();
  const created = await saveCategoryToDb(category);
  const finalCat = created || category;
  saveStoredCategories([...current, finalCat]);
  return finalCat;
}

export async function updateCategoryAsync(id: string, updates: Partial<AdminCategory>): Promise<AdminCategory | null> {
  const current = getStoredCategories();
  const updatedFromDb = await updateCategoryInDb(id, updates);
  const updatedList = current.map(c => c.id === id ? { ...c, ...updates, ...(updatedFromDb || {}) } : c);
  saveStoredCategories(updatedList);
  return updatedFromDb || updatedList.find(c => c.id === id) || null;
}

export async function deleteCategoryAsync(id: string): Promise<boolean> {
  const current = getStoredCategories();
  const success = await deleteCategoryFromDb(id);
  const updatedList = current.filter(c => c.id !== id);
  saveStoredCategories(updatedList);
  return success;
}
