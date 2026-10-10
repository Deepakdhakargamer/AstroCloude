import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Stable database path inside workspace/server storage
const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create database directory:', err);
  }
}

export const DB_PATH = path.join(DB_DIR, 'astrocloude.db');

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    // Enable Write-Ahead Logging (WAL) for concurrency & durability
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initDatabaseSchema(dbInstance);
  }
  return dbInstance;
}

// Initial default categories
const DEFAULT_CATEGORIES = [
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
    featured: 1,
    buttonText: 'Deploy Server',
    buttonLink: '#plans',
    badge: 'Popular',
    colorTheme: 'purple',
    seoMetaTitle: 'High-Performance Minecraft Server Hosting | AstroCloude',
    seoMetaDescription: 'Instant setup NVMe Minecraft server hosting with unlimited slots and DDoS protection.',
    seoKeywords: 'minecraft server hosting, nvme minecraft, modded minecraft host',
    features: JSON.stringify(['High Performance Node', 'Instant Deployment', 'DDoS Protection', 'Cloud Backups'])
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
    featured: 1,
    buttonText: 'Configure VPS',
    buttonLink: '#plans',
    badge: 'Premium',
    colorTheme: 'blue',
    seoMetaTitle: 'Cloud VPS Hosting with NVMe SSD | AstroCloude',
    seoMetaDescription: 'Deploy scalable KVM Virtual Private Servers with full root access in seconds.',
    seoKeywords: 'vps hosting, cloud vps, kvm vps, nvme vps',
    features: JSON.stringify(['Root Access', 'Instant Setup', 'Dedicated IPv4', 'Automated Daily Backups'])
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
    featured: 0,
    buttonText: 'Host Bot',
    buttonLink: '#plans',
    badge: 'New',
    colorTheme: 'emerald',
    seoMetaTitle: '24/7 Discord Bot Hosting | AstroCloude',
    seoMetaDescription: 'Keep your Discord bots online 24/7 with zero downtime container hosting.',
    seoKeywords: 'discord bot hosting, python bot host, nodejs bot hosting',
    features: JSON.stringify(['Always Online 24/7', 'GitHub Auto-Deploy', 'Live Logs Console', 'Discord Webhook Alerts'])
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
    featured: 0,
    buttonText: 'View Hardware',
    buttonLink: '#plans',
    badge: 'Recommended',
    colorTheme: 'rose',
    seoMetaTitle: 'Dedicated Server & Bare Metal Hosting | AstroCloude',
    seoMetaDescription: 'Enterprise dedicated bare metal servers with high-speed unmetered network ports.',
    seoKeywords: 'dedicated servers, bare metal, enterprise hosting',
    features: JSON.stringify(['IPMI / KVM-over-IP', 'Custom ISO Mount', 'BGP Session Available', 'SLA 99.99%'])
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
    featured: 0,
    buttonText: 'Launch Website',
    buttonLink: '#plans',
    badge: '',
    colorTheme: 'amber',
    seoMetaTitle: 'Fast NVMe Web Hosting & cPanel | AstroCloude',
    seoMetaDescription: 'Lightning-fast web hosting powered by LiteSpeed web servers and NVMe storage.',
    seoKeywords: 'web hosting, cpanel hosting, wordpress host',
    features: JSON.stringify(['Free Let\'s Encrypt SSL', 'Daily JetBackup Protection', 'NVMe SSD Speed', 'Unlimited Email Accounts'])
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
    featured: 0,
    buttonText: 'Explore Games',
    buttonLink: '#plans',
    badge: 'Popular',
    colorTheme: 'cyan',
    seoMetaTitle: 'Multi-Game Server Hosting (ARK, Rust, CS2) | AstroCloude',
    seoMetaDescription: 'High-performance game server hosting with instant mod installation and DDoS protection.',
    seoKeywords: 'game server hosting, rust server, ark server, cs2 server',
    features: JSON.stringify(['Instant Setup', 'Game Switching', 'DDoS Protection', 'Mod Manager'])
  }
];

// Initial default plans
const DEFAULT_PLANS = [
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
    featured: 1,
    cpu: '2 vCPU EPYC / Ryzen',
    ram: '4 GB DDR5',
    storage: '80 GB NVMe SSD',
    disk: '80 GB NVMe SSD',
    bandwidth: '2 TB @ 1 Gbps',
    network: '1 Gbps Dedicated',
    ddos: 'Path.net 12Tbps Protection',
    locations: JSON.stringify(['Mumbai, India', 'Singapore', 'Frankfurt', 'New York']),
    os: JSON.stringify(['Ubuntu 24.04', 'Debian 12', 'AlmaLinux 9', 'Windows Server']),
    features: JSON.stringify(['Root Access', 'Instant Setup', 'Dedicated IPv4', 'Automated Daily Backups']),
    customSpecs: JSON.stringify([]),
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
    featured: 1,
    cpu: '4 vCPU EPYC / Ryzen',
    ram: '8 GB DDR5',
    storage: '160 GB NVMe SSD',
    disk: '160 GB NVMe SSD',
    bandwidth: '5 TB @ 1 Gbps',
    network: '1 Gbps Dedicated',
    ddos: 'Path.net 12Tbps Protection',
    locations: JSON.stringify(['Mumbai, India', 'Singapore', 'Frankfurt']),
    os: JSON.stringify(['Ubuntu 24.04', 'Debian 12', 'Windows Server 2022']),
    features: JSON.stringify(['Root Access', 'Instant Setup', 'Dedicated IPv4', 'Snapshot Support']),
    customSpecs: JSON.stringify([]),
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
    featured: 0,
    cpu: '8 vCPU EPYC / Ryzen',
    ram: '16 GB DDR5',
    storage: '320 GB NVMe SSD',
    disk: '320 GB NVMe SSD',
    bandwidth: '10 TB @ 1 Gbps',
    network: '1 Gbps Dedicated',
    ddos: 'Path.net 12Tbps Protection',
    locations: JSON.stringify(['Mumbai, India', 'Singapore']),
    os: JSON.stringify(['Ubuntu 24.04', 'Debian 12', 'Windows Server 2022']),
    features: JSON.stringify(['Root Access', 'Instant Provisioning', 'Dedicated IPv4', 'VIP Support']),
    customSpecs: JSON.stringify([]),
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
    featured: 1,
    cpu: '2 vCPU Ryzen 9 7950X (5.7GHz)',
    ram: '4 GB DDR5 5600MHz',
    storage: '50 GB Gen4 NVMe',
    disk: '50 GB Gen4 NVMe',
    bandwidth: 'Unmetered',
    network: '1 Gbps Uplink',
    ddos: 'Cosmic Guard Game DDoS',
    locations: JSON.stringify(['Mumbai, India', 'Singapore', 'Frankfurt']),
    os: JSON.stringify(['PaperMC', 'Purpur', 'Fabric', 'Forge', 'Spigot', 'BungeeCord']),
    features: JSON.stringify(['Subdomain Included', 'Modpack 1-Click Installer', 'Automated Backups', 'Full SFTP Access']),
    customSpecs: JSON.stringify([]),
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
    featured: 1,
    cpu: '4 vCPU Ryzen 9 7950X (5.7GHz)',
    ram: '8 GB DDR5 5600MHz',
    storage: '100 GB Gen4 NVMe',
    disk: '100 GB Gen4 NVMe',
    bandwidth: 'Unmetered',
    network: '1 Gbps Uplink',
    ddos: 'Cosmic Guard Game DDoS',
    locations: JSON.stringify(['Mumbai, India', 'Singapore']),
    os: JSON.stringify(['PaperMC', 'Purpur', 'Fabric', 'Forge', 'Spigot']),
    features: JSON.stringify(['Subdomain Included', 'MySQL Database Free', 'Automated Backups', 'BungeeCord Ready']),
    customSpecs: JSON.stringify([]),
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
    featured: 0,
    cpu: '1 vCPU 3.8GHz',
    ram: '1 GB RAM',
    storage: '10 GB NVMe',
    disk: '10 GB NVMe',
    bandwidth: '500 GB',
    network: 'Shared 1 Gbps',
    ddos: 'Layer 7 Bot Protection',
    locations: JSON.stringify(['Mumbai, India', 'Singapore']),
    os: JSON.stringify(['NodeJS 20/22', 'Python 3.11/3.12', 'Go 1.22', 'Java 21']),
    features: JSON.stringify(['Always Online 24/7', 'GitHub Auto-Deploy', 'Live Logs Console', 'Discord Webhook Alerts']),
    customSpecs: JSON.stringify([]),
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
    featured: 1,
    cpu: 'AMD EPYC 7763 64C/128T',
    ram: '128 GB ECC DDR4',
    storage: '2x 1.92 TB NVMe RAID',
    disk: '2x 1.92 TB NVMe RAID',
    bandwidth: '50 TB @ 10 Gbps',
    network: '10 Gbps Burstable',
    ddos: 'Corero Tbps Scrubbing',
    locations: JSON.stringify(['Mumbai, India', 'Frankfurt']),
    os: JSON.stringify(['Proxmox VE', 'Ubuntu Server', 'Debian', 'Windows Server DC']),
    features: JSON.stringify(['IPMI / KVM-over-IP', 'Custom ISO Mount', 'BGP Session Available', 'SLA 99.99%']),
    customSpecs: JSON.stringify([]),
    status: 'active',
    order: 1
  }
];

export function initDatabaseSchema(db: Database.Database): void {
  // Safe transaction for table creation & seeding
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT,
      description TEXT DEFAULT '',
      longDescription TEXT DEFAULT '',
      logo TEXT DEFAULT '',
      bannerImage TEXT DEFAULT '',
      icon TEXT DEFAULT 'Server',
      "order" INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      featured INTEGER DEFAULT 0,
      buttonText TEXT DEFAULT 'Buy Now',
      buttonLink TEXT DEFAULT '#plans',
      badge TEXT DEFAULT '',
      colorTheme TEXT DEFAULT 'purple',
      seoMetaTitle TEXT DEFAULT '',
      seoMetaDescription TEXT DEFAULT '',
      seoKeywords TEXT DEFAULT '',
      seoOgImage TEXT DEFAULT '',
      features TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      categoryId TEXT NOT NULL,
      description TEXT DEFAULT '',
      fullDescription TEXT DEFAULT '',
      logo TEXT DEFAULT '',
      bannerImage TEXT DEFAULT '',
      footerImage TEXT DEFAULT '',
      footerText TEXT DEFAULT '',
      badge TEXT DEFAULT '',
      buttonText TEXT DEFAULT 'Buy Now',
      buttonLink TEXT DEFAULT '#contact',
      featured INTEGER DEFAULT 0,
      cpu TEXT DEFAULT '',
      ram TEXT DEFAULT '',
      storage TEXT DEFAULT '',
      disk TEXT DEFAULT '',
      bandwidth TEXT DEFAULT '',
      network TEXT DEFAULT '',
      ddos TEXT DEFAULT '',
      backup TEXT DEFAULT '',
      os TEXT DEFAULT '[]',
      locations TEXT DEFAULT '[]',
      features TEXT DEFAULT '[]',
      customSpecs TEXT DEFAULT '[]',
      seoTitle TEXT DEFAULT '',
      seoDescription TEXT DEFAULT '',
      price REAL DEFAULT 0,
      currency TEXT DEFAULT 'INR',
      billingCycle TEXT DEFAULT 'mo',
      status TEXT DEFAULT 'active',
      "order" INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_plans_category ON plans(categoryId);
    CREATE INDEX IF NOT EXISTS idx_plans_order ON plans("order");
    CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
  `);

  // Check if categories need initial seeding (seed ONLY if empty)
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (catCount.count === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (
        id, name, slug, description, longDescription, logo, bannerImage, icon,
        "order", status, featured, buttonText, buttonLink, badge, colorTheme,
        seoMetaTitle, seoMetaDescription, seoKeywords, seoOgImage, features
      ) VALUES (
        @id, @name, @slug, @description, @longDescription, @logo, @bannerImage, @icon,
        @order, @status, @featured, @buttonText, @buttonLink, @badge, @colorTheme,
        @seoMetaTitle, @seoMetaDescription, @seoKeywords, @seoOgImage, @features
      )
    `);

    const seedCatsTransaction = db.transaction((cats: typeof DEFAULT_CATEGORIES) => {
      for (const cat of cats) {
        insertCat.run({
          seoOgImage: '',
          ...cat
        });
      }
    });
    seedCatsTransaction(DEFAULT_CATEGORIES);
    console.log(`[Database] Successfully seeded ${DEFAULT_CATEGORIES.length} default categories into SQLite.`);
  }

  // Check if plans need initial seeding (seed ONLY if empty)
  const planCount = db.prepare('SELECT COUNT(*) as count FROM plans').get() as { count: number };
  if (planCount.count === 0) {
    const insertPlan = db.prepare(`
      INSERT INTO plans (
        id, name, categoryId, description, fullDescription, logo, bannerImage, footerImage, footerText,
        badge, buttonText, buttonLink, featured, cpu, ram, storage, disk, bandwidth, network,
        ddos, backup, os, locations, features, customSpecs, seoTitle, seoDescription,
        price, currency, billingCycle, status, "order"
      ) VALUES (
        @id, @name, @categoryId, @description, @fullDescription, @logo, @bannerImage, @footerImage, @footerText,
        @badge, @buttonText, @buttonLink, @featured, @cpu, @ram, @storage, @disk, @bandwidth, @network,
        @ddos, @backup, @os, @locations, @features, @customSpecs, @seoTitle, @seoDescription,
        @price, @currency, @billingCycle, @status, @order
      )
    `);

    const seedPlansTransaction = db.transaction((plansList: typeof DEFAULT_PLANS) => {
      for (const p of plansList) {
        insertPlan.run({
          logo: '',
          bannerImage: '',
          footerImage: '',
          footerText: '',
          badge: '',
          buttonText: 'Buy Now',
          buttonLink: '#contact',
          backup: '',
          seoTitle: '',
          seoDescription: '',
          ...p
        });
      }
    });
    seedPlansTransaction(DEFAULT_PLANS);
    console.log(`[Database] Successfully seeded ${DEFAULT_PLANS.length} default plans into SQLite.`);
  }
}
