'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRegister } from '@/features/auth/hooks/use-auth';

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Le prénom est requis'),
    lastName: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { mutate: register, isPending } = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    setError(null);
    register(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (error: any) => {
          setError(error.message || "Erreur lors de l'inscription");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600 mb-1">FreelanceFlow</h1>
          <p className="text-slate-500 text-sm">Créez votre compte gratuitement</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Inscription</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="label-text">
                  Prénom
                </label>
                <input
                  {...registerField('firstName')}
                  type="text"
                  id="firstName"
                  placeholder="Jean"
                  className="input-field"
                  disabled={isPending}
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="label-text">
                  Nom
                </label>
                <input
                  {...registerField('lastName')}
                  type="text"
                  id="lastName"
                  placeholder="Dupont"
                  className="input-field"
                  disabled={isPending}
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label-text">
                Email
              </label>
              <input
                {...registerField('email')}
                type="email"
                id="email"
                placeholder="vous@exemple.com"
                className="input-field"
                disabled={isPending}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label-text">
                Mot de passe
              </label>
              <input
                {...registerField('password')}
                type="password"
                id="password"
                placeholder="Min. 8 caractères"
                className="input-field"
                disabled={isPending}
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label-text">
                Confirmer le mot de passe
              </label>
              <input
                {...registerField('confirmPassword')}
                type="password"
                id="confirmPassword"
                placeholder="Retapez votre mot de passe"
                className="input-field"
                disabled={isPending}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button type="submit" disabled={isPending} className="btn-primary w-full mt-2">
              {isPending ? 'Création du compte...' : "S'inscrire"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
