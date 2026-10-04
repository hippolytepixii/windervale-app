import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'windervale-secret-key-editorial-1990';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check cookie or fallback
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication session' });
  }
}

export function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        name: string;
        role: string;
      };
      req.user = decoded;
    } catch {
      // ignore
    }
  }
  next();
}

export const roleHierarchy: Record<string, number> = {
  viewer: 1,
  member: 2,
  editor: 3,
  admin: 4,
  owner: 5,
};

/**
 * Enforces strict project membership and authorization.
 * Non-members are completely prevented from accessing private workspaces.
 */
export function requireProjectAccess(minRole: 'viewer' | 'member' | 'editor' | 'admin' | 'owner' = 'viewer') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const projectId = req.params.projectId || req.params.id;
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    // Check project exists
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is the direct creator/owner of the project
    if (project.created_by === req.user.id) {
      return next();
    }

    // Check if user is owner or admin of the project's parent workspace
    if (project.workspace_id) {
      const wsMembership = db.prepare(`
        SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?
      `).get(project.workspace_id, req.user.id) as { role: string } | undefined;

      if (wsMembership && (wsMembership.role === 'owner' || wsMembership.role === 'admin')) {
        return next();
      }
    }

    // Check project_members table
    const membership = db.prepare(`
      SELECT role FROM project_members WHERE project_id = ? AND user_id = ?
    `).get(projectId, req.user.id) as { role: string } | undefined;

    if (!membership) {
      // If project is public, viewer level is permitted for viewing metadata, but private workspaces require membership
      if (project.visibility === 'public' && minRole === 'viewer' && req.method === 'GET') {
        return next();
      }
      return res.status(403).json({ error: 'Access denied: You are not an authorized member of this creative workspace.' });
    }

    const userRoleRank = roleHierarchy[membership.role] || 1;
    const requiredRank = roleHierarchy[minRole] || 1;

    if (userRoleRank < requiredRank) {
      return res.status(403).json({ error: `Insufficient permissions: Action requires ${minRole} privileges.` });
    }

    next();
  };
}

/**
 * Enforces strict workspace membership and authorization.
 */
export function requireWorkspaceAccess(minRole: 'viewer' | 'member' | 'editor' | 'admin' | 'owner' = 'viewer') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const workspaceId = req.params.workspaceId || req.params.id;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(workspaceId) as any;
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.owner_id === req.user.id) {
      return next();
    }

    const membership = db.prepare(`
      SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?
    `).get(workspaceId, req.user.id) as { role: string } | undefined;

    if (!membership) {
      return res.status(403).json({ error: 'Access denied: You are not a member of this workspace.' });
    }

    const userRoleRank = roleHierarchy[membership.role] || 1;
    const requiredRank = roleHierarchy[minRole] || 1;

    if (userRoleRank < requiredRank) {
      return res.status(403).json({ error: `Insufficient permissions: Action requires ${minRole} privileges.` });
    }

    next();
  };
}

