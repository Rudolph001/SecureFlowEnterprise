export const SECURITY_MODULES = {
  GUARDIAN: 'guardian',
  ENFORCER: 'enforcer',
  DEFENDER: 'defender',
  ARCHITECT: 'architect',
  COACH: 'coach',
} as const;

export const THREAT_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const MODULE_ICONS = {
  guardian: 'fas fa-eye',
  enforcer: 'fas fa-ban',
  defender: 'fas fa-shield-virus',
  architect: 'fas fa-brain',
  coach: 'fas fa-graduation-cap',
} as const;

export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  learning: 'bg-blue-100 text-blue-800',
  training: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800',
} as const;

export const THREAT_COLORS = {
  critical: 'bg-red-50 border-red-200',
  high: 'bg-amber-50 border-amber-200',
  medium: 'bg-blue-50 border-blue-200',
  low: 'bg-green-50 border-green-200',
} as const;
