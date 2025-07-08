import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import { Route, RoutesByMethod } from '../types';

export async function detectRoutes(projectRoot: string): Promise<RoutesByMethod | undefined> {
  const routes: Route[] = [];
  
  try {
    // Get all potential route files
    const files = await glob('**/*.{js,ts,jsx,tsx}', {
      cwd: projectRoot,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
      nodir: true // Only return files, not directories
    });

    for (const file of files) {
      const filePath = path.join(projectRoot, file);
      
      try {
        // Check if it's actually a file before reading
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) {
          continue;
        }
        
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract Express routes
        const expressRoutes = extractExpressRoutes(content);
        routes.push(...expressRoutes.map(route => ({ ...route, file })));
        
        // Extract Next.js API routes
        if (file.includes('pages/api/') || file.includes('app/api/')) {
          const nextRoutes = extractNextRoutes(content, file);
          routes.push(...nextRoutes.map(route => ({ ...route, file })));
        }
        
        // Extract other framework routes
        const otherRoutes = extractOtherRoutes(content);
        routes.push(...otherRoutes.map(route => ({ ...route, file })));
      } catch (error) {
        // Skip files that can't be read
        console.warn(`Skipping file ${file}: ${(error as Error).message}`);
        continue;
      }
    }

    return routes.length > 0 ? formatRoutes(routes) : undefined;
  } catch (error) {
    console.error('Error detecting routes:', (error as Error).message);
    return undefined;
  }
}

function extractExpressRoutes(content: string): Route[] {
  const routes: Route[] = [];
  
  // Match Express route patterns
  const routeRegex = /(?:app|router)\.(?:get|post|put|delete|patch|use)\s*\(\s*['"`]([^'"`]+)['"`]\s*,?\s*(?:.*?)(?:function|=>|\(req,\s*res\))/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[0].match(/\.(get|post|put|delete|patch|use)/i);
    if (method) {
      routes.push({
        method: method[1].toUpperCase(),
        path: match[1],
        type: 'express'
      });
    }
  }
  
  return routes;
}

function extractNextRoutes(content: string, filename: string): Route[] {
  const routes: Route[] = [];
  
  // Extract Next.js API route from filename
  const routePath = filename
    .replace(/^pages\/api\//, '/api/')
    .replace(/^app\/api\//, '/api/')
    .replace(/\.(js|ts|jsx|tsx)$/, '')
    .replace(/\/index$/, '');
  
  // Check for HTTP method handlers
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  methods.forEach(method => {
    if (content.includes(`export async function ${method}`) || 
        content.includes(`export function ${method}`)) {
      routes.push({
        method,
        path: routePath,
        type: 'nextjs'
      });
    }
  });
  
  return routes;
}

function extractOtherRoutes(content: string): Route[] {
  const routes: Route[] = [];
  
  // FastAPI routes
  const fastApiRegex = /@app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = fastApiRegex.exec(content)) !== null) {
    routes.push({
      method: match[1].toUpperCase(),
      path: match[2],
      type: 'fastapi'
    });
  }
  
  return routes;
}

function formatRoutes(routes: Route[]): RoutesByMethod {
  const routesByMethod: RoutesByMethod = {};
  
  routes.forEach(route => {
    if (!routesByMethod[route.method]) {
      routesByMethod[route.method] = [];
    }
    routesByMethod[route.method].push(route);
  });
  
  return routesByMethod;
}