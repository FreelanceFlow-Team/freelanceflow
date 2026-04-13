'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClients, useDeleteClient, type Client } from '@/features/clients/hooks/use-clients';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useClients('');
  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setIsConfirming(true);
  };

  const confirmDelete = () => {
    if (selectedClient) {
      deleteClient(selectedClient.id, {
        onSuccess: () => {
          setIsConfirming(false);
          setSelectedClient(null);
        },
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des clients...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy">Clients</h1>
        <Link href="/dashboard/clients/new" className="btn-primary">
          <Plus className="inline mr-2" size={20} />
          Ajouter un client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-light mb-4">Aucun client pour le moment</p>
          <Link href="/dashboard/clients/new" className="btn-primary inline-block">
            Créer le premier client
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-light text-white">
              <tr>
                <th className="px-6 py-3 text-left">Nom</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Téléphone</th>
                <th className="px-6 py-3 text-left">Ville</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-lighter">
                  <td className="px-6 py-4 font-medium text-navy">{client.name}</td>
                  <td className="px-6 py-4 text-gray-light">{client.email}</td>
                  <td className="px-6 py-4 text-gray-light">{client.phone || '-'}</td>
                  <td className="px-6 py-4 text-gray-light">{client.city || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="btn-secondary inline-flex items-center"
                    >
                      <Edit2 size={16} className="mr-1" />
                      Éditer
                    </Link>
                    <button
                      onClick={() => handleDelete(client)}
                      className="btn-danger inline-flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isConfirming && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-navy mb-4">Confirmer la suppression</h2>
            <p className="text-gray-light mb-6">
              Êtes-vous sûr de vouloir supprimer le client <strong>{selectedClient.name}</strong> ?
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
