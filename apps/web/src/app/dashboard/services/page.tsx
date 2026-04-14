'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useServices,
  useDeleteService,
  type Service,
} from '@/features/services/hooks/use-services';
import { Trash2, Plus, DollarSign } from 'lucide-react';
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
    return <div className="text-center py-8">Chargement des services...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy">Services</h1>
        <Link href="/dashboard/services/new" className="btn-primary">
          <Plus className="inline mr-2" size={20} />
          Ajouter un service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="card text-center py-12">
          <DollarSign className="w-16 h-16 mx-auto text-gray-lighter mb-4" />
          <p className="text-gray-light mb-4">Aucun service pour le moment</p>
          <Link href="/dashboard/services/new" className="btn-primary inline-block">
            Créer le premier service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="card bg-white rounded-lg shadow p-6 border border-gray-lighter"
            >
              <h3 className="text-lg font-bold text-navy mb-2">{service.name}</h3>
              {service.description && (
                <p className="text-gray-light text-sm mb-4">{service.description}</p>
              )}
              <div className="bg-blue-primary bg-opacity-10 rounded-lg p-3 mb-4">
                <p className="text-blue-primary font-bold text-lg">
                  {formatCurrency(service.defaultRate)} /{' '}
                  {service.unit === 'hour' ? 'h' : service.unit === 'day' ? 'j' : 'forfait'}
                </p>
              </div>
              <button
                onClick={() => handleDelete(service)}
                className="btn-danger w-full justify-center flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {isConfirming && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-navy mb-4">Confirmer la suppression</h2>
            <p className="text-gray-light mb-6">
              Êtes-vous sûr de vouloir supprimer le service <strong>{selectedService.name}</strong>{' '}
              ?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsConfirming(false)} className="btn-secondary flex-1">
                Annuler
              </button>
              <button onClick={confirmDelete} disabled={isDeleting} className="btn-danger flex-1">
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
