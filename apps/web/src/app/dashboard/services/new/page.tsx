'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useCreateService } from '@/features/services/hooks/use-services';
import { ArrowLeft } from 'lucide-react';

const serviceSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  defaultRate: z.number().positive('Le tarif doit être supérieur à 0'),
  unit: z.enum(['hour', 'day', 'flat']),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function NewServicePage() {
  const router = useRouter();
  const { mutate: createService, isPending } = useCreateService();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      defaultRate: 50,
      unit: 'hour',
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    createService(data, {
      onSuccess: () => {
        router.push('/dashboard/services');
      },
    });
  };

  return (
    <div>
      <Link
        href="/dashboard/services"
        className="flex items-center text-blue-primary hover:text-blue-dark mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Retour aux services
      </Link>

      <div className="card bg-white max-w-2xl">
        <h1 className="text-2xl font-bold text-navy mb-6">Créer un nouveau service</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="label-text">
              Nom du service*
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              placeholder="ex: Développement web"
              className="input-field"
              disabled={isPending}
            />
            {errors.name && <p className="text-red-error text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="label-text">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              placeholder="Description détaillée du service..."
              className="input-field min-h-24"
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-red-error text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="defaultRate" className="label-text">
                Tarif par défaut (€)*
              </label>
              <input
                {...register('defaultRate', { valueAsNumber: true })}
                type="number"
                id="defaultRate"
                placeholder="50"
                step="0.01"
                min="0"
                className="input-field"
                disabled={isPending}
              />
              {errors.defaultRate && (
                <p className="text-red-error text-sm mt-1">{errors.defaultRate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="unit" className="label-text">
                Unité*
              </label>
              <select {...register('unit')} id="unit" className="input-field" disabled={isPending}>
                <option value="hour">Heure</option>
                <option value="day">Jour</option>
                <option value="flat">Forfait</option>
              </select>
              {errors.unit && <p className="text-red-error text-sm mt-1">{errors.unit.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/services" className="btn-secondary flex-1 text-center">
              Annuler
            </Link>
            <button type="submit" disabled={isPending} className="btn-primary flex-1">
              {isPending ? 'Création en cours...' : 'Créer le service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
