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
    reset,
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
    return <div className="text-center py-8">Chargement du client...</div>;
  }

  if (!client) {
    return <div className="text-center py-8">Client non trouvé</div>;
  }

  return (
    <div>
      <Link
        href="/dashboard/clients"
        className="flex items-center text-blue-primary hover:text-blue-dark mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Retour aux clients
      </Link>

      <div className="card bg-white max-w-2xl">
        <h1 className="text-2xl font-bold text-navy mb-6">Éditer {client.name}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="label-text">
                Nom*
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="Nom du client"
                className="input-field"
                disabled={isPending}
              />
              {errors.name && <p className="text-red-error text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label-text">
                Email*
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="client@exemple.com"
                className="input-field"
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-red-error text-sm mt-1">{errors.email.message}</p>
              )}
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
