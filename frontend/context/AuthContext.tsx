'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ sessionStorage : isolé par onglet, pas de conflit multi-comptes
  useEffect(() => {
    const stored = sessionStorage.getItem('sc_token');
    const storedUser = sessionStorage.getItem('sc_user');
    if (stored && storedUser) {
      try {
        // Vérifier expiration JWT côté client
        const payload = JSON.parse(atob(stored.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          sessionStorage.removeItem('sc_token');
          sessionStorage.removeItem('sc_user');
        } else {
          setToken(stored);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
        }
      } catch {
        sessionStorage.removeItem('sc_token');
        sessionStorage.removeItem('sc_user');
      }
    }
    setLoading(false);
  }, []);

  // ❌ Plus de StorageEvent — sessionStorage n'est pas partagé entre onglets
  // donc pas besoin d'écouter les changements

  const login = async (email: string, password: string) => {
    // Vider l'ancien state avant de set le nouveau
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('sc_token');
    sessionStorage.removeItem('sc_user');
    delete axios.defaults.headers.common['Authorization'];

    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    sessionStorage.setItem('sc_token', t);
    sessionStorage.setItem('sc_user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;

    if (u.role === 'admin') router.push('/admin/dashboard');
    else if (u.role === 'doctor') router.push('/doctor/dashboard');
    else router.push('/patient/dashboard');
  };

  const register = async (data: any) => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('sc_token');
    sessionStorage.removeItem('sc_user');
    delete axios.defaults.headers.common['Authorization'];

    const res = await axios.post(`${API}/auth/register`, data);
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    sessionStorage.setItem('sc_token', t);
    sessionStorage.setItem('sc_user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;

    if (u.role === 'doctor') router.push('/doctor/dashboard');
    else router.push('/patient/dashboard');
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('sc_token');
    sessionStorage.removeItem('sc_user');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/');
  }, [router]);

  const updateUser = (updated: User) => {
    setUser(updated);
    sessionStorage.setItem('sc_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);