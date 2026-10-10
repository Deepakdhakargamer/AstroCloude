import type { Plugin } from 'vite';
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  syncAllCategories,
  getAllPlans, 
  getPlanById, 
  createPlan, 
  updatePlan, 
  deletePlan, 
  syncAllPlans 
} from '../db/planCategoryService';

// Helper to parse JSON request bodies in standard Connect/Vite middleware
function parseJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: any, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.end(JSON.stringify(data));
}

export function sqliteApiPlugin(): Plugin {
  return {
    name: 'astrocloude-sqlite-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const method = req.method || 'GET';

        if (!url.startsWith('/api/')) {
          return next();
        }

        try {
          const parsedUrl = new URL(url, 'http://localhost');
          const pathname = parsedUrl.pathname;

          // ----------------------------------------------------
          // /api/categories
          // ----------------------------------------------------
          if (pathname === '/api/categories') {
            if (method === 'GET') {
              const categories = await getAllCategories();
              return sendJson(res, 200, { success: true, data: categories });
            }
            if (method === 'POST') {
              const body = await parseJsonBody(req);
              const created = await createCategory(body);
              return sendJson(res, 201, { success: true, data: created });
            }
            if (method === 'PUT') {
              // Batch sync categories
              const body = await parseJsonBody(req);
              const categories = Array.isArray(body) ? body : (body.categories || []);
              const synced = await syncAllCategories(categories);
              return sendJson(res, 200, { success: true, data: synced });
            }
          }

          // /api/categories/:id
          const catIdMatch = pathname.match(/^\/api\/categories\/([^/]+)$/);
          if (catIdMatch) {
            const catId = decodeURIComponent(catIdMatch[1]);
            if (method === 'GET') {
              const cat = await getCategoryById(catId);
              if (!cat) return sendJson(res, 404, { success: false, error: 'Category not found' });
              return sendJson(res, 200, { success: true, data: cat });
            }
            if (method === 'PUT' || method === 'PATCH') {
              const body = await parseJsonBody(req);
              const updated = await updateCategory(catId, body);
              if (!updated) return sendJson(res, 404, { success: false, error: 'Category not found' });
              return sendJson(res, 200, { success: true, data: updated });
            }
            if (method === 'DELETE') {
              await deleteCategory(catId);
              return sendJson(res, 200, { success: true, message: 'Category deleted' });
            }
          }

          // ----------------------------------------------------
          // /api/plans
          // ----------------------------------------------------
          if (pathname === '/api/plans') {
            if (method === 'GET') {
              const plans = await getAllPlans();
              return sendJson(res, 200, { success: true, data: plans });
            }
            if (method === 'POST') {
              const body = await parseJsonBody(req);
              const created = await createPlan(body);
              return sendJson(res, 201, { success: true, data: created });
            }
            if (method === 'PUT') {
              // Batch sync plans
              const body = await parseJsonBody(req);
              const plans = Array.isArray(body) ? body : (body.plans || []);
              const synced = await syncAllPlans(plans);
              return sendJson(res, 200, { success: true, data: synced });
            }
          }

          // /api/plans/:id
          const planIdMatch = pathname.match(/^\/api\/plans\/([^/]+)$/);
          if (planIdMatch) {
            const planId = decodeURIComponent(planIdMatch[1]);
            if (method === 'GET') {
              const plan = await getPlanById(planId);
              if (!plan) return sendJson(res, 404, { success: false, error: 'Plan not found' });
              return sendJson(res, 200, { success: true, data: plan });
            }
            if (method === 'PUT' || method === 'PATCH') {
              const body = await parseJsonBody(req);
              const updated = await updatePlan(planId, body);
              if (!updated) return sendJson(res, 404, { success: false, error: 'Plan not found' });
              return sendJson(res, 200, { success: true, data: updated });
            }
            if (method === 'DELETE') {
              await deletePlan(planId);
              return sendJson(res, 200, { success: true, message: 'Plan deleted' });
            }
          }

          return sendJson(res, 404, { success: false, error: 'API route not found' });
        } catch (err: any) {
          console.error('[API Error]', err);
          return sendJson(res, 500, { success: false, error: err.message || 'Internal server error' });
        }
      });
    }
  };
}
