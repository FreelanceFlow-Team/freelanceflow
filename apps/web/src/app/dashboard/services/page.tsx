'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useServices,
  useDeleteService,
  type Service,
} from '@/features/services/hooks/use-services';
import { Trash2, Plus, Briefcase } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ServicesPage() {
  const { data: services = [], isLoading } = useServices('');
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = (service: Service) => {
    setSelectedService(service);
    setIsConfirming(true);
  };

  const confirmDelete = () => {
    if (selectedService) {
      deleteService(selectedService.id, {
        onSuccess: () => {
          setIsConfirming(false);
          setSelectedService(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const unitLabel = (unit: string) => {
    switch (unit) {
      case 'hour':
        return '/ heure';
      case 'day':
        return '/ jour';
      default:
        return 'forfait';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services</h1>
          <p className="text-slate-500 text-sm mt-1">
            {services.length} service{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Ajouter un service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 text-center py-16 px-6">
          <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun service</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Définissez vos prestations pour les ajouter rapidement à vos factures.
          </p>
          <Link
            href="/dashboard/services/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Créer un service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col"
            >
              <h3 className="text-base font-semibold text-slate-900 mb-1">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{service.description}</p>
              )}
              <div className="mt-auto">
                <div className="bg-indigo-50 rounded-lg px-4 py-3 mb-4">
                  <p className="text-indigo-700 font-bold text-lg">
                    {formatCurrency(Number(service.defaultRate))}{' '}
                    <span className="text-sm font-normal text-indigo-500">
                      {unitLabel(service.unit)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(service)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {isConfirming && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Confirmer la suppression</h2>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le service <strong>{selectedService.name}</strong>{' '}
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirming(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
