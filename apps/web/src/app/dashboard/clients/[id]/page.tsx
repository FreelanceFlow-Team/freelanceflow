'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useClient, useUpdateClient } from '@/features/clients/hooks/use-clients';
import { ArrowLeft } from 'lucide-react';

const clientSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: client, isLoading: isLoadingClient } = useClient(id);
  const { mutate: updateClient, isPending } = useUpdateClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    values: client
      ? {
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address,
          city: client.city,
          postalCode: client.postalCode,
          country: client.country,
        }
      : undefined,
  });

  const onSubmit = (data: ClientFormData) => {
    updateClient(
      { id, data: data as any },
      {
        onSuccess: () => {
          router.push('/dashboard/clients');
        },
      },
    );
  };

  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 text-center py-12 px-6">
        <p className="text-slate-500 mb-4">Client non trouvé</p>
        <Link href="/dashboard/clients" className="btn-primary inline-block">
          Retour aux clients
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Retour aux clients
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Éditer {client.name}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="label-text">
                Nom *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="Nom du client"
                className="input-field"
                disabled={isPending}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label-text">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="client@exemple.com"
                className="input-field"
                disabled={isPending}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="label-text">
                Téléphone
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                placeholder="+33 6 00 00 00 00"
                className="input-field"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="address" className="label-text">
                Adresse
              </label>
              <input
                {...register('address')}
                type="text"
                id="address"
                placeholder="Rue..."
                className="input-field"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="city" className="label-text">
                Ville
              </label>
              <input
                {...register('city')}
                type="text"
                id="city"
                placeholder="Paris"
                className="input-field"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="label-text">
                Code postal
              </label>
              <input
                {...register('postalCode')}
                type="text"
                id="postalCode"
                placeholder="75000"
                className="input-field"
                disabled={isPending}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="country" className="label-text">
                Pays
              </label>
              <input
                {...register('country')}
                type="text"
                id="country"
                placeholder="France"
                className="input-field"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/clients" className="btn-secondary flex-1 text-center">
              Annuler
            </Link>
            <button type="submit" disabled={isPending} className="btn-primary flex-1">
              {isPending ? 'Mise à jour en cours...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
