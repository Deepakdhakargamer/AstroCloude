import { getDatabase } from './sqlite';
import { AdminCategory, AdminHostingPlan } from '../types';

// Helper to format Category DB row into AdminCategory object
function rowToCategory(row: any): AdminCategory {
  let features: string[] = [];
  try {
    features = typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []);
  } catch {
    features = [];
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug || '',
    description: row.description || '',
    longDescription: row.longDescription || '',
    logo: row.logo || '',
    bannerImage: row.bannerImage || '',
    icon: row.icon || 'Server',
    order: Number(row.order) || 1,
    status: row.status === 'disabled' ? 'disabled' : 'active',
    featured: Boolean(row.featured),
    buttonText: row.buttonText || 'Buy Now',
    buttonLink: row.buttonLink || '#plans',
    badge: row.badge || '',
    colorTheme: row.colorTheme || 'purple',
    seoMetaTitle: row.seoMetaTitle || '',
    seoMetaDescription: row.seoMetaDescription || '',
    seoKeywords: row.seoKeywords || '',
    seoOgImage: row.seoOgImage || '',
    features
  };
}

// Helper to format Plan DB row into AdminHostingPlan object
function rowToPlan(row: any): AdminHostingPlan {
  let features: string[] = [];
  let os: string[] = [];
  let locations: string[] = [];
  let customSpecs: { label: string; value: string }[] = [];

  try {
    features = typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []);
  } catch {
    features = [];
  }

  try {
    os = typeof row.os === 'string' ? JSON.parse(row.os) : (row.os || []);
  } catch {
    os = [];
  }

  try {
    locations = typeof row.locations === 'string' ? JSON.parse(row.locations) : (row.locations || []);
  } catch {
    locations = [];
  }

  try {
    customSpecs = typeof row.customSpecs === 'string' ? JSON.parse(row.customSpecs) : (row.customSpecs || []);
  } catch {
    customSpecs = [];
  }

  return {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    description: row.description || '',
    fullDescription: row.fullDescription || '',
    logo: row.logo || '',
    bannerImage: row.bannerImage || '',
    footerImage: row.footerImage || '',
    footerText: row.footerText || '',
    badge: row.badge || '',
    buttonText: row.buttonText || 'Buy Now',
    buttonLink: row.buttonLink || '#contact',
    featured: Boolean(row.featured),
    cpu: row.cpu || '',
    ram: row.ram || '',
    storage: row.storage || '',
    disk: row.disk || row.storage || '',
    bandwidth: row.bandwidth || '',
    network: row.network || '',
    ddos: row.ddos || '',
    backup: row.backup || '',
    os,
    locations,
    features,
    customSpecs,
    seoTitle: row.seoTitle || '',
    seoDescription: row.seoDescription || '',
    price: Number(row.price) || 0,
    currency: row.currency || 'INR',
    billingCycle: row.billingCycle || 'mo',
    status: (row.status === 'hidden' || row.status === 'draft') ? row.status : 'active',
    order: Number(row.order) || 1
  };
}

// ==========================================
// Category Asynchronous CRUD Methods
// ==========================================

export async function getAllCategories(): Promise<AdminCategory[]> {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM categories ORDER BY "order" ASC, createdAt ASC').all();
  return rows.map(rowToCategory);
}

export async function getCategoryById(id: string): Promise<AdminCategory | null> {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  return row ? rowToCategory(row) : null;
}

export async function createCategory(cat: AdminCategory): Promise<AdminCategory> {
  const db = getDatabase();
  const id = cat.id || `cat-${Date.now()}`;
  const featuresJson = JSON.stringify(cat.features || []);

  const stmt = db.prepare(`
    INSERT INTO categories (
      id, name, slug, description, longDescription, logo, bannerImage, icon,
      "order", status, featured, buttonText, buttonLink, badge, colorTheme,
      seoMetaTitle, seoMetaDescription, seoKeywords, seoOgImage, features, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, datetime('now')
    )
  `);

  stmt.run(
    id,
    cat.name,
    cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    cat.description || '',
    cat.longDescription || '',
    cat.logo || '',
    cat.bannerImage || '',
    cat.icon || 'Server',
    cat.order || 1,
    cat.status || 'active',
    cat.featured ? 1 : 0,
    cat.buttonText || 'Buy Now',
    cat.buttonLink || '#plans',
    cat.badge || '',
    cat.colorTheme || 'purple',
    cat.seoMetaTitle || '',
    cat.seoMetaDescription || '',
    cat.seoKeywords || '',
    cat.seoOgImage || '',
    featuresJson
  );

  return (await getCategoryById(id))!;
}

export async function updateCategory(id: string, updates: Partial<AdminCategory>): Promise<AdminCategory | null> {
  const db = getDatabase();
  const existing = await getCategoryById(id);
  if (!existing) return null;

  const merged: AdminCategory = { ...existing, ...updates, id };
  const featuresJson = JSON.stringify(merged.features || []);

  const stmt = db.prepare(`
    UPDATE categories SET
      name = ?, slug = ?, description = ?, longDescription = ?,
      logo = ?, bannerImage = ?, icon = ?, "order" = ?, status = ?,
      featured = ?, buttonText = ?, buttonLink = ?, badge = ?, colorTheme = ?,
      seoMetaTitle = ?, seoMetaDescription = ?, seoKeywords = ?, seoOgImage = ?,
      features = ?, updatedAt = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    merged.name,
    merged.slug || merged.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    merged.description || '',
    merged.longDescription || '',
    merged.logo || '',
    merged.bannerImage || '',
    merged.icon || 'Server',
    merged.order || 1,
    merged.status || 'active',
    merged.featured ? 1 : 0,
    merged.buttonText || 'Buy Now',
    merged.buttonLink || '#plans',
    merged.badge || '',
    merged.colorTheme || 'purple',
    merged.seoMetaTitle || '',
    merged.seoMetaDescription || '',
    merged.seoKeywords || '',
    merged.seoOgImage || '',
    featuresJson,
    id
  );

  return (await getCategoryById(id))!;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = getDatabase();
  const deleteTx = db.transaction(() => {
    // Delete category; plans will have categoryId set to NULL or can be retained safely
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  });
  deleteTx();
  return true;
}

export async function syncAllCategories(categoriesList: AdminCategory[]): Promise<AdminCategory[]> {
  const db = getDatabase();
  const syncTx = db.transaction((cats: AdminCategory[]) => {
    // Upsert each category
    const upsertStmt = db.prepare(`
      INSERT INTO categories (
        id, name, slug, description, longDescription, logo, bannerImage, icon,
        "order", status, featured, buttonText, buttonLink, badge, colorTheme,
        seoMetaTitle, seoMetaDescription, seoKeywords, seoOgImage, features, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, datetime('now')
      )
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        slug=excluded.slug,
        description=excluded.description,
        longDescription=excluded.longDescription,
        logo=excluded.logo,
        bannerImage=excluded.bannerImage,
        icon=excluded.icon,
        "order"=excluded."order",
        status=excluded.status,
        featured=excluded.featured,
        buttonText=excluded.buttonText,
        buttonLink=excluded.buttonLink,
        badge=excluded.badge,
        colorTheme=excluded.colorTheme,
        seoMetaTitle=excluded.seoMetaTitle,
        seoMetaDescription=excluded.seoMetaDescription,
        seoKeywords=excluded.seoKeywords,
        seoOgImage=excluded.seoOgImage,
        features=excluded.features,
        updatedAt=datetime('now')
    `);

    // Remove categories not in the list
    const incomingIds = cats.map(c => c.id);
    if (incomingIds.length > 0) {
      const placeholders = incomingIds.map(() => '?').join(',');
      db.prepare(`DELETE FROM categories WHERE id NOT IN (${placeholders})`).run(...incomingIds);
    } else {
      db.prepare('DELETE FROM categories').run();
    }

    for (const cat of cats) {
      upsertStmt.run(
        cat.id,
        cat.name,
        cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        cat.description || '',
        cat.longDescription || '',
        cat.logo || '',
        cat.bannerImage || '',
        cat.icon || 'Server',
        cat.order || 1,
        cat.status || 'active',
        cat.featured ? 1 : 0,
        cat.buttonText || 'Buy Now',
        cat.buttonLink || '#plans',
        cat.badge || '',
        cat.colorTheme || 'purple',
        cat.seoMetaTitle || '',
        cat.seoMetaDescription || '',
        cat.seoKeywords || '',
        cat.seoOgImage || '',
        JSON.stringify(cat.features || [])
      );
    }
  });

  syncTx(categoriesList);
  return getAllCategories();
}

// ==========================================
// Plan Asynchronous CRUD Methods
// ==========================================

export async function getAllPlans(): Promise<AdminHostingPlan[]> {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM plans ORDER BY "order" ASC, createdAt ASC').all();
  return rows.map(rowToPlan);
}

export async function getPlanById(id: string): Promise<AdminHostingPlan | null> {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
  return row ? rowToPlan(row) : null;
}

export async function createPlan(plan: AdminHostingPlan): Promise<AdminHostingPlan> {
  const db = getDatabase();
  const id = plan.id || `plan-${Date.now()}`;

  const stmt = db.prepare(`
    INSERT INTO plans (
      id, name, categoryId, description, fullDescription, logo, bannerImage, footerImage, footerText,
      badge, buttonText, buttonLink, featured, cpu, ram, storage, disk, bandwidth, network,
      ddos, backup, os, locations, features, customSpecs, seoTitle, seoDescription,
      price, currency, billingCycle, status, "order", updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, datetime('now')
    )
  `);

  stmt.run(
    id,
    plan.name,
    plan.categoryId,
    plan.description || '',
    plan.fullDescription || '',
    plan.logo || '',
    plan.bannerImage || '',
    plan.footerImage || '',
    plan.footerText || '',
    plan.badge || '',
    plan.buttonText || 'Buy Now',
    plan.buttonLink || '#contact',
    plan.featured ? 1 : 0,
    plan.cpu || '',
    plan.ram || '',
    plan.storage || plan.disk || '',
    plan.disk || plan.storage || '',
    plan.bandwidth || '',
    plan.network || '',
    plan.ddos || '',
    plan.backup || '',
    JSON.stringify(plan.os || []),
    JSON.stringify(plan.locations || []),
    JSON.stringify(plan.features || []),
    JSON.stringify(plan.customSpecs || []),
    plan.seoTitle || '',
    plan.seoDescription || '',
    plan.price || 0,
    plan.currency || 'INR',
    plan.billingCycle || 'mo',
    plan.status || 'active',
    plan.order || 1
  );

  return (await getPlanById(id))!;
}

export async function updatePlan(id: string, updates: Partial<AdminHostingPlan>): Promise<AdminHostingPlan | null> {
  const db = getDatabase();
  const existing = await getPlanById(id);
  if (!existing) return null;

  const merged: AdminHostingPlan = { ...existing, ...updates, id };

  const stmt = db.prepare(`
    UPDATE plans SET
      name = ?, categoryId = ?, description = ?, fullDescription = ?,
      logo = ?, bannerImage = ?, footerImage = ?, footerText = ?,
      badge = ?, buttonText = ?, buttonLink = ?, featured = ?,
      cpu = ?, ram = ?, storage = ?, disk = ?, bandwidth = ?, network = ?,
      ddos = ?, backup = ?, os = ?, locations = ?, features = ?, customSpecs = ?,
      seoTitle = ?, seoDescription = ?, price = ?, currency = ?, billingCycle = ?,
      status = ?, "order" = ?, updatedAt = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    merged.name,
    merged.categoryId,
    merged.description || '',
    merged.fullDescription || '',
    merged.logo || '',
    merged.bannerImage || '',
    merged.footerImage || '',
    merged.footerText || '',
    merged.badge || '',
    merged.buttonText || 'Buy Now',
    merged.buttonLink || '#contact',
    merged.featured ? 1 : 0,
    merged.cpu || '',
    merged.ram || '',
    merged.storage || merged.disk || '',
    merged.disk || merged.storage || '',
    merged.bandwidth || '',
    merged.network || '',
    merged.ddos || '',
    merged.backup || '',
    JSON.stringify(merged.os || []),
    JSON.stringify(merged.locations || []),
    JSON.stringify(merged.features || []),
    JSON.stringify(merged.customSpecs || []),
    merged.seoTitle || '',
    merged.seoDescription || '',
    merged.price || 0,
    merged.currency || 'INR',
    merged.billingCycle || 'mo',
    merged.status || 'active',
    merged.order || 1,
    id
  );

  return (await getPlanById(id))!;
}

export async function deletePlan(id: string): Promise<boolean> {
  const db = getDatabase();
  db.prepare('DELETE FROM plans WHERE id = ?').run(id);
  return true;
}

export async function syncAllPlans(plansList: AdminHostingPlan[]): Promise<AdminHostingPlan[]> {
  const db = getDatabase();
  const syncTx = db.transaction((plans: AdminHostingPlan[]) => {
    const upsertStmt = db.prepare(`
      INSERT INTO plans (
        id, name, categoryId, description, fullDescription, logo, bannerImage, footerImage, footerText,
        badge, buttonText, buttonLink, featured, cpu, ram, storage, disk, bandwidth, network,
        ddos, backup, os, locations, features, customSpecs, seoTitle, seoDescription,
        price, currency, billingCycle, status, "order", updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, datetime('now')
      )
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        categoryId=excluded.categoryId,
        description=excluded.description,
        fullDescription=excluded.fullDescription,
        logo=excluded.logo,
        bannerImage=excluded.bannerImage,
        footerImage=excluded.footerImage,
        footerText=excluded.footerText,
        badge=excluded.badge,
        buttonText=excluded.buttonText,
        buttonLink=excluded.buttonLink,
        featured=excluded.featured,
        cpu=excluded.cpu,
        ram=excluded.ram,
        storage=excluded.storage,
        disk=excluded.disk,
        bandwidth=excluded.bandwidth,
        network=excluded.network,
        ddos=excluded.ddos,
        backup=excluded.backup,
        os=excluded.os,
        locations=excluded.locations,
        features=excluded.features,
        customSpecs=excluded.customSpecs,
        seoTitle=excluded.seoTitle,
        seoDescription=excluded.seoDescription,
        price=excluded.price,
        currency=excluded.currency,
        billingCycle=excluded.billingCycle,
        status=excluded.status,
        "order"=excluded."order",
        updatedAt=datetime('now')
    `);

    // Remove plans not in the list
    const incomingIds = plans.map(p => p.id);
    if (incomingIds.length > 0) {
      const placeholders = incomingIds.map(() => '?').join(',');
      db.prepare(`DELETE FROM plans WHERE id NOT IN (${placeholders})`).run(...incomingIds);
    } else {
      db.prepare('DELETE FROM plans').run();
    }

    for (const plan of plans) {
      upsertStmt.run(
        plan.id,
        plan.name,
        plan.categoryId,
        plan.description || '',
        plan.fullDescription || '',
        plan.logo || '',
        plan.bannerImage || '',
        plan.footerImage || '',
        plan.footerText || '',
        plan.badge || '',
        plan.buttonText || 'Buy Now',
        plan.buttonLink || '#contact',
        plan.featured ? 1 : 0,
        plan.cpu || '',
        plan.ram || '',
        plan.storage || plan.disk || '',
        plan.disk || plan.storage || '',
        plan.bandwidth || '',
        plan.network || '',
        plan.ddos || '',
        plan.backup || '',
        JSON.stringify(plan.os || []),
        JSON.stringify(plan.locations || []),
        JSON.stringify(plan.features || []),
        JSON.stringify(plan.customSpecs || []),
        plan.seoTitle || '',
        plan.seoDescription || '',
        plan.price || 0,
        plan.currency || 'INR',
        plan.billingCycle || 'mo',
        plan.status || 'active',
        plan.order || 1
      );
    }
  });

  syncTx(plansList);
  return getAllPlans();
}
