export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  tenantId: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Simple auth state management for demo
let authState: AuthState = {
  user: {
    id: 1,
    username: 'admin',
    email: 'admin@acme.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'security_admin',
    tenantId: 1,
  },
  token: 'demo_jwt_token',
  isAuthenticated: true,
};

export const getAuthState = (): AuthState => authState;

export const login = async (username: string, password: string): Promise<AuthState> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const { user, token } = await response.json();
    authState = {
      user,
      token,
      isAuthenticated: true,
    };

    return authState;
  } catch (error) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    authState = {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const hasPermission = (requiredRole: string): boolean => {
  if (!authState.user) return false;
  
  const roleHierarchy = {
    'admin': 3,
    'security_admin': 2,
    'user': 1,
  };

  const userLevel = roleHierarchy[authState.user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
};
