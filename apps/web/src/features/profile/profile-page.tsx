'use client';

import { useEffect, useState } from 'react';
import { UploadLogo } from './upload-logo';
import { User, Mail, Shield } from 'lucide-react';

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  logo?: string | null;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  user: 'Utilisateur',
  freelancer: 'Freelance',
};

export function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('user');
    if (!raw) return;
    try {
      setUser(JSON.parse(raw) as UserInfo);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil</h1>
        <p className="text-slate-500 text-sm mt-1">Paramètres de votre compte.</p>
      </div>

      {/* User info card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Informations personnelles</h2>

        {user ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <User size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Nom complet</p>
                <p className="text-sm font-semibold text-slate-900">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Mail size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Adresse email</p>
                <p className="text-sm font-semibold text-slate-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Shield size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Rôle</p>
                <p className="text-sm font-semibold text-slate-900">
                  {roleLabels[user.role] ?? user.role}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Chargement des informations...</p>
        )}
      </div>

      {/* Logo upload */}
      <UploadLogo />
    </div>
  );
}
