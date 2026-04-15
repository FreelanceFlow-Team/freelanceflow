'use client';

import { UploadLogo } from './upload-logo';

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil</h1>
        <p className="text-slate-500 text-sm mt-1">Paramètres de votre compte.</p>
      </div>

      <UploadLogo />
    </div>
  );
}
