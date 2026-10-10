import { AdminCategory, AdminHostingPlan } from '../types';

// ==========================================
// Central SQLite Database API Client
// ==========================================

export async function fetchCategoriesFromDb(): Promise<AdminCategory[]> {
  try {
    const res = await fetch('/api/categories', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('[SQLite API] Failed to fetch categories from server DB:', err);
  }
  return [];
}

export async function saveCategoryToDb(category: AdminCategory): Promise<AdminCategory | null> {
  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (err) {
    console.error('[SQLite API] Failed to create category in server DB:', err);
  }
  return null;
}

export async function updateCategoryInDb(id: string, updates: Partial<AdminCategory>): Promise<AdminCategory | null> {
  try {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (err) {
    console.error('[SQLite API] Failed to update category in server DB:', err);
  }
  return null;
}

export async function deleteCategoryFromDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error('[SQLite API] Failed to delete category from server DB:', err);
    return false;
  }
}

export async function syncCategoriesToDb(categories: AdminCategory[]): Promise<AdminCategory[]> {
  try {
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) return json.data;
  } catch (err) {
    console.error('[SQLite API] Failed to sync categories to server DB:', err);
  }
  return categories;
}

// ==========================================
// Plans SQLite API
// ==========================================

export async function fetchPlansFromDb(): Promise<AdminHostingPlan[]> {
  try {
    const res = await fetch('/api/plans', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('[SQLite API] Failed to fetch plans from server DB:', err);
  }
  return [];
}

export async function savePlanToDb(plan: AdminHostingPlan): Promise<AdminHostingPlan | null> {
  try {
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (err) {
    console.error('[SQLite API] Failed to create plan in server DB:', err);
  }
  return null;
}

export async function updatePlanInDb(id: string, updates: Partial<AdminHostingPlan>): Promise<AdminHostingPlan | null> {
  try {
    const res = await fetch(`/api/plans/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (err) {
    console.error('[SQLite API] Failed to update plan in server DB:', err);
  }
  return null;
}

export async function deletePlanFromDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/plans/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error('[SQLite API] Failed to delete plan from server DB:', err);
    return false;
  }
}

export async function syncPlansToDb(plans: AdminHostingPlan[]): Promise<AdminHostingPlan[]> {
  try {
    const res = await fetch('/api/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plans)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) return json.data;
  } catch (err) {
    console.error('[SQLite API] Failed to sync plans to server DB:', err);
  }
  return plans;
}
