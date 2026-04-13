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
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-navy mb-2">FreelanceFlow</h1>
          <p className="text-gray-light mb-6">Créer votre compte</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-error text-red-error rounded-md text-sm">
                {error}
              </div>
            )}

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
                <p className="text-red-error text-sm mt-1">{errors.firstName.message}</p>
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
                <p className="text-red-error text-sm mt-1">{errors.lastName.message}</p>
              )}
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
              {errors.email && (
                <p className="text-red-error text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label-text">
                Mot de passe
              </label>
              <input
                {...registerField('password')}
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

            <div>
              <label htmlFor="confirmPassword" className="label-text">
                Confirmez le mot de passe
              </label>
              <input
                {...registerField('confirmPassword')}
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                className="input-field"
                disabled={isPending}
              />
              {errors.confirmPassword && (
                <p className="text-red-error text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button type="submit" disabled={isPending} className="btn-primary w-full mt-6">
              {isPending ? 'Création du compte...' : "S'inscrire"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-light">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-blue-primary hover:text-blue-dark font-medium">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
