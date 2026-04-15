'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface UploadLogoResponse {
  message: string;
}

export function UploadLogo() {
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawUser = localStorage.getItem('user');
    if (!rawUser) return;

    try {
      const user = JSON.parse(rawUser) as { logo?: string | null };
      if (user.logo) {
        setPreview(user.logo);
      }
    } catch {
      // Ignore malformed local storage data.
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      return api.post<UploadLogoResponse>('/users/logo', formData);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);

    const file = e.currentTarget.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Le fichier doit être une image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('La taille du fichier ne doit pas dépasser 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview((reader.result as string) || null);
    };
    reader.readAsDataURL(file);

    mutation.mutate(file, {
      onSuccess: () => {
        if (typeof window === 'undefined') return;

        const rawUser = localStorage.getItem('user');
        if (!rawUser) return;

        try {
          const user = JSON.parse(rawUser) as Record<string, unknown>;
          localStorage.setItem('user', JSON.stringify({ ...user, logo: reader.result }));
        } catch {
          // Ignore malformed local storage data.
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Logo entreprise</h2>
      <p className="text-sm text-slate-500 mb-4">
        Image uniquement, taille max 2MB. Ce logo sera affiché sur vos factures PDF.
      </p>

      {preview ? (
        <div className="mb-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Logo actuel</p>
          <img
            src={preview}
            alt="Aperçu du logo"
            className="w-24 h-24 object-contain border rounded-lg p-2"
          />
        </div>
      ) : null}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={mutation.isPending}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
      />

      {mutation.isPending ? (
        <p className="text-sm text-slate-600 mt-3">Upload en cours...</p>
      ) : null}
      {mutation.isSuccess ? (
        <p className="text-sm text-emerald-600 mt-3">Logo uploadé avec succès.</p>
      ) : null}
      {mutation.isError ? (
        <p className="text-sm text-red-600 mt-3">Erreur pendant l upload.</p>
      ) : null}
      {errorMessage ? <p className="text-sm text-red-600 mt-3">{errorMessage}</p> : null}
    </div>
  );
}
