'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useLogin } from '@/features/auth/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    login(data, {
      onSuccess: () => {
        router.push('/dashboard');
      },
      onError: (error: any) => {
        setError(error.message || 'Erreur de connexion');
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-navy mb-2">FreelanceFlow</h1>
          <p className="text-gray-light mb-6">Gestion de facturation pour freelances</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-error text-red-error rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label-text">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="vous@exemple.com"
                className="input-field"
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-red-error text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label-text">
                Mot de passe
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                placeholder="••••••••"
                className="input-field"
                disabled={isPending}
              />
              {errors.password && (
                <p className="text-red-error text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button type="submit" disabled={isPending} className="btn-primary w-full mt-6">
              {isPending ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-light">
            Pas encore inscrit ?{' '}
            <Link href="/register" className="text-blue-primary hover:text-blue-dark font-medium">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
