import { get, set } from 'idb-keyval';
import { AdminHostingPlan } from '../types';
import { formatCpuSpec, formatRamSpec, formatDiskSpec } from './specFormat';
import { 
  fetchPlansFromDb, 
  syncPlansToDb, 
  savePlanToDb, 
  updatePlanInDb, 
  deletePlanFromDb 
} from './databaseClient';

const PLANS_STORAGE_KEY = 'astro_hosting_plans';
const PLANS_IDB_KEY = 'astro_hosting_plans_idb';

// In-memory cache for synchronous operations across the app
let memoryPlansCache: AdminHostingPlan[] | null = null;

export const INITIAL_PLANS: AdminHostingPlan[] = [
  {
    id: 'plan-vps-1',
    name: 'VPS Cloud Starter',
    categoryId: 'cat-2',
    description: 'High performance KVM cloud VPS with lightning fast NVMe SSD storage.',
    fullDescription: '2 vCPU Ryzen/EPYC cores, 4GB DDR5 RAM, 80GB NVMe SSD, Unmetered Bandwidth, Tbps DDoS Defense.',
    price: 499,
    currency: 'INR',
    billingCycle: 'mo',
    badge: 'Popular',
    featured: true,
    cpu: '2 vCPU EPYC / Ryzen',
    ram: '4 GB DDR5',
    storage: '80 GB NVMe SSD',
    disk: '80 GB NVMe SSD',
    bandwidth: '2 TB @ 1 Gbps',
    network: '1 Gbps Dedicated',
    ddos: 'Path.net 12Tbps Protection',
    locations: ['Mumbai, India', 'Singapore', 'Frankfurt', 'New York'],
    os: ['Ubuntu 24.04', 'Debian 12', 'AlmaLinux 9', 'Windows Server'],
    features: ['Root Access', 'Instant Setup', 'Dedicated IPv4', 'Automated Daily Backups'],
    status: 'active',
    order: 1
  },
  {
    id: 'plan-vps-2',
    name: 'VPS Cloud Pro',
    categoryId: 'cat-2',
    description: 'Scalable cloud computing for demanding web applications and game servers.',
    fullDescription: '4 vCPU cores, 8GB DDR5 RAM, 160GB NVMe SSD, dedicated IPv4 & IPv6, priority routing.',
    price: 999,
    currency: 'INR',
    billingCycle: 'mo',
    badge: 'Recommended',
    featured: true,
    cpu: '4 vCPU EPYC / Ryzen',
    ram: '8 GB DDR5',
    storage: '160 GB NVMe SSD',
    disk: '160 GB NVMe SSD',
    bandwidth: '5 TB @ 1 Gbps',
    network: '1 Gbps Dedicated',
    ddos: 'Path.net 12Tbps Protection',
    locations: ['Mumbai, India', 'Singapore', 'Frankfurt'],
    os: ['Ubuntu 24.04', 'Debian 12', 'Windows Server 2022'],
    features: ['Root Access', 'Instant Setup', 'Dedicated IPv4', 'Snapshot Support'],
    status: 'active',
    order: 2
  },
  {
    id: 'plan-vps-3',
    name: 'VPS Cloud Ultra',
    categoryId: 'cat-2',
    description: 'Maximum performance cloud instance with dedicated hardware priority.',
    fullDescription: '8 vCPU cores, 16GB DDR5 RAM, 320GB NVMe SSD, 10Gbps burstable network.',
    price: 1899,
    currency: 'INR',
    billingCycle: 'mo',
    badge: 'Premium',
    featured: false,
    cpu: '8 vCPU EPYC / Ryzen',
    ram: '16 GB DDR5',
    storage: '320 GB NVMe SSD',
    disk: '320 GB NVMe SSD',
    bandwidth: '10 TB @ 1 Gbps',
    network: '1 Gbps Dedicated',
    ddos: 'Path.net 12Tbps Protection',
    locations: ['Mumbai, India', 'Singapore'],
    os: ['Ubuntu 24.04', 'Debian 12', 'Windows Server 2022'],
    features: ['Root Access', 'Instant Provisioning', 'Dedicated IPv4', 'VIP Support'],
    status: 'active',
    order: 3
  },
  {
    id: 'plan-mc-1',
    name: 'Creeper Node (4GB)',
    categoryId: 'cat-1',
    description: 'Blazing fast Minecraft server hosting on AMD Ryzen 9 7950X.',
    fullDescription: '4GB DDR5 RAM, Ryzen 9 7950X, 50GB NVMe, unlimited player slots, instant modpack installer.',
    price: 299,
    currency: 'INR',
    billingCycle: 'mo',
    badge: 'Popular',
    featured: true,
    cpu: '2 vCPU Ryzen 9 7950X (5.7GHz)',
    ram: '4 GB DDR5 5600MHz',
    storage: '50 GB Gen4 NVMe',
    disk: '50 GB Gen4 NVMe',
    bandwidth: 'Unmetered',
    network: '1 Gbps Uplink',
    ddos: 'Cosmic Guard Game DDoS',
    locations: ['Mumbai, India', 'Singapore', 'Frankfurt'],
    os: ['PaperMC', 'Purpur', 'Fabric', 'Forge', 'Spigot', 'BungeeCord'],
    features: ['Subdomain Included', 'Modpack 1-Click Installer', 'Automated Backups', 'Full SFTP Access'],
    status: 'active',
    order: 1
  },
  {
    id: 'plan-mc-2',
    name: 'Enderman Node (8GB)',
    categoryId: 'cat-1',
    description: 'For large community SMPs, network hubs, and heavy modpacks.',
    fullDescription: '8GB DDR5 RAM, Ryzen 9 7950X, 100GB NVMe, high tick-rate performance.',
    price: 599,
    currency: 'INR',
    billingCycle: 'mo',
    badge: 'Recommended',
    featured: true,
    cpu: '4 vCPU Ryzen 9 7950X (5.7GHz)',
    ram: '8 GB DDR5 5600MHz',
    storage: '100 GB Gen4 NVMe',
    disk: '100 GB Gen4 NVMe',
    bandwidth: 'Unmetered',
    network: '1 Gbps Uplink',
    ddos: 'Cosmic Guard Game DDoS',
    locations: ['Mumbai, India', 'Singapore'],
    os: ['PaperMC', 'Purpur', 'Fabric', 'Forge', 'Spigot'],
    features: ['Subdomain Included', 'MySQL Database Free', 'Automated Backups', 'BungeeCord Ready'],
    status: 'active',
    order: 2
  },
  {
    id: 'plan-bot-1',
    name: 'Bot Nano',
    categoryId: 'cat-3',
    description: '24/7 low-latency container hosting for Python, NodeJS, and Go Discord bots.',
    fullDescription: '1GB RAM, 1 vCPU, 10GB NVMe SSD, auto-restart on crash, web console.',
    price: 99,
    currency: 'INR',
    billingCycle: 'mo',
    badge: 'New',
    featured: false,
    cpu: '1 vCPU 3.8GHz',
    ram: '1 GB RAM',
    storage: '10 GB NVMe',
    disk: '10 GB NVMe',
    bandwidth: '500 GB',
    network: 'Shared 1 Gbps',
    ddos: 'Layer 7 Bot Protection',
    locations: ['Mumbai, India', 'Singapore'],
    os: ['NodeJS 20/22', 'Python 3.11/3.12', 'Go 1.22', 'Java 21'],
    features: ['Always Online 24/7', 'GitHub Auto-Deploy', 'Live Logs Console', 'Discord Webhook Alerts'],
    status: 'active',
    order: 1
  },
  {
    id: 'plan-dedi-1',
    name: 'EPYC Bare Metal',
    categoryId: 'cat-4',
    description: 'Enterprise dedicated server hardware with zero virtualization overhead.',
    fullDescription: 'AMD EPYC 7763, 64 Cores / 128 Threads, 128GB ECC RAM, 2x 1.92TB Enterprise NVMe.',
    price: 4999,
    currency: 'INR',
    billingCycle: 'mo',
    badge: 'Premium',
    featured: true,
    cpu: 'AMD EPYC 7763 64C/128T',
    ram: '128 GB ECC DDR4',
    storage: '2x 1.92 TB NVMe RAID',
    disk: '2x 1.92 TB NVMe RAID',
    bandwidth: '50 TB @ 10 Gbps',
    network: '10 Gbps Burstable',
    ddos: 'Corero Tbps Scrubbing',
    locations: ['Mumbai, India', 'Frankfurt'],
    os: ['Proxmox VE', 'Ubuntu Server', 'Debian', 'Windows Server DC'],
    features: ['IPMI / KVM-over-IP', 'Custom ISO Mount', 'BGP Session Available', 'SLA 99.99%'],
    status: 'active',
    order: 1
  }
];

function sanitizePlan(p: AdminHostingPlan): AdminHostingPlan {
  const seed = INITIAL_PLANS.find(s => s.id === p.id);
  const rawCpu = p.cpu || seed?.cpu || p.customSpecs?.find(s => /cpu|processor|core/i.test(s.label))?.value || '';
  const rawRam = p.ram || seed?.ram || p.customSpecs?.find(s => /ram|memory/i.test(s.label))?.value || '';
  const rawDisk = p.storage || (p as any).disk || seed?.storage || p.customSpecs?.find(s => /storage|disk|nvme|ssd/i.test(s.label))?.value || '';
  
  return {
    ...p,
    cpu: formatCpuSpec(rawCpu),
    ram: formatRamSpec(rawRam),
    storage: formatDiskSpec(rawDisk),
    disk: formatDiskSpec(rawDisk),
    currency: 'INR'
  };
}

function createLightweightPlan(p: AdminHostingPlan): AdminHostingPlan {
  const copy = { ...p };
  // Never store heavy base64 strings or massive data URLs in localStorage
  if (copy.logo && copy.logo.length > 250) {
    copy.logo = copy.logo.startsWith('http') ? copy.logo : '';
  }
  if (copy.bannerImage && copy.bannerImage.length > 250) {
    copy.bannerImage = copy.bannerImage.startsWith('http') ? copy.bannerImage : '';
  }
  if (copy.footerImage && (copy as any).footerImage.length > 250) {
    (copy as any).footerImage = (copy as any).footerImage.startsWith('http') ? (copy as any).footerImage : '';
  }
  return copy;
}

function savePlansToLocalStorage(plans: AdminHostingPlan[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const compactPlans = plans.map(createLightweightPlan);
    const serialized = JSON.stringify(compactPlans);
    
    try {
      localStorage.removeItem(PLANS_STORAGE_KEY);
      localStorage.setItem(PLANS_STORAGE_KEY, serialized);
    } catch {
      try {
        const minimal = compactPlans.map(p => ({
          id: p.id,
          name: p.name,
          categoryId: p.categoryId,
          price: p.price,
          currency: 'INR',
          billingCycle: p.billingCycle,
          cpu: p.cpu,
          ram: p.ram,
          storage: p.storage,
          disk: p.disk,
          status: p.status,
          badge: p.badge,
          featured: p.featured,
          order: p.order,
          features: (p.features || []).slice(0, 4)
        }));
        localStorage.removeItem(PLANS_STORAGE_KEY);
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(minimal));
      } catch {
        // Fallback safely
      }
    }
  } catch {
    // Non-fatal
  }
}

// Initial bootstrap of memory cache from localStorage if available
try {
  if (typeof localStorage !== 'undefined') {
    const rawStored = localStorage.getItem(PLANS_STORAGE_KEY);
    if (rawStored) {
      if (rawStored.length > 60000 || rawStored.includes('data:image')) {
        try {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryPlansCache = parsed.map(sanitizePlan);
            savePlansToLocalStorage(memoryPlansCache);
          } else {
            localStorage.removeItem(PLANS_STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(PLANS_STORAGE_KEY);
        }
      } else {
        const parsed = JSON.parse(rawStored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryPlansCache = parsed.map(sanitizePlan);
        }
      }
    }
  }
} catch {
  // Ignore initial read error
}

if (!memoryPlansCache) {
  memoryPlansCache = INITIAL_PLANS.map(sanitizePlan);
}

// Asynchronously load authoritative plans from SQLite database on startup
if (typeof window !== 'undefined') {
  // 1. Check SQLite backend database first
  fetchPlansFromDb()
    .then((dbPlans) => {
      if (Array.isArray(dbPlans) && dbPlans.length > 0) {
        memoryPlansCache = dbPlans.map(sanitizePlan);
        savePlansToLocalStorage(memoryPlansCache);
        set(PLANS_IDB_KEY, memoryPlansCache).catch(() => {});
        window.dispatchEvent(new CustomEvent('astro_plans_changed', { detail: memoryPlansCache }));
      } else {
        // Fallback to IndexedDB if API is warming up
        get(PLANS_IDB_KEY)
          .then((idbPlans) => {
            if (Array.isArray(idbPlans) && idbPlans.length > 0) {
              memoryPlansCache = (idbPlans as AdminHostingPlan[]).map(sanitizePlan);
              window.dispatchEvent(new CustomEvent('astro_plans_changed', { detail: memoryPlansCache }));
            }
          })
          .catch(() => {});
      }
    })
    .catch(() => {
      get(PLANS_IDB_KEY)
        .then((idbPlans) => {
          if (Array.isArray(idbPlans) && idbPlans.length > 0) {
            memoryPlansCache = (idbPlans as AdminHostingPlan[]).map(sanitizePlan);
            window.dispatchEvent(new CustomEvent('astro_plans_changed', { detail: memoryPlansCache }));
          }
        })
        .catch(() => {});
    });
}

export const getStoredPlans = (): AdminHostingPlan[] => {
  if (memoryPlansCache && memoryPlansCache.length > 0) {
    return memoryPlansCache;
  }

  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(PLANS_STORAGE_KEY) : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryPlansCache = parsed.map(sanitizePlan);
        return memoryPlansCache;
      }
    }
  } catch {
    // Ignore read parse error safely
  }

  memoryPlansCache = INITIAL_PLANS.map(sanitizePlan);
  return memoryPlansCache;
};

export const updateStoredPlans = (plans: AdminHostingPlan[]) => {
  const inrPlans = plans.map(sanitizePlan);
  memoryPlansCache = inrPlans;

  // 1. Instantly dispatch event so all UI components update without waiting
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('astro_plans_changed', { detail: inrPlans }));
  }

  // 2. Authoritative persistence in SQLite server database
  syncPlansToDb(inrPlans).catch((err) => {
    console.error('Failed to sync plans to SQLite database:', err);
  });

  // 3. Local persistence in IndexedDB
  set(PLANS_IDB_KEY, inrPlans).catch((idbErr) => {
    console.warn('IndexedDB save warning for plans:', idbErr);
  });

  // 4. Quota-safe sync to localStorage as instant sync fallback
  savePlansToLocalStorage(inrPlans);
};

// Asynchronous CRUD helpers for components that want async promises
export async function addPlanAsync(plan: AdminHostingPlan): Promise<AdminHostingPlan> {
  const current = getStoredPlans();
  const created = await savePlanToDb(plan);
  const finalPlan = created || plan;
  updateStoredPlans([...current, finalPlan]);
  return finalPlan;
}

export async function updatePlanAsync(id: string, updates: Partial<AdminHostingPlan>): Promise<AdminHostingPlan | null> {
  const current = getStoredPlans();
  const updatedFromDb = await updatePlanInDb(id, updates);
  const updatedList = current.map(p => p.id === id ? { ...p, ...updates, ...(updatedFromDb || {}) } : p);
  updateStoredPlans(updatedList);
  return updatedFromDb || updatedList.find(p => p.id === id) || null;
}

export async function deletePlanAsync(id: string): Promise<boolean> {
  const current = getStoredPlans();
  const success = await deletePlanFromDb(id);
  const updatedList = current.filter(p => p.id !== id);
  updateStoredPlans(updatedList);
  return success;
}
