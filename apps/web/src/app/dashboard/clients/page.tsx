'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClients, useDeleteClient, type Client } from '@/features/clients/hooks/use-clients';
import { Trash2, Edit2, Plus, Users } from 'lucide-react';

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
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Ajouter un client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 text-center py-16 px-6">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun client</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Ajoutez votre premier client pour commencer à créer des factures.
          </p>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Créer un client
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ville
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{client.name}</td>
                      <td className="px-6 py-4 text-slate-600">{client.email}</td>
                      <td className="px-6 py-4 text-slate-600">{client.phone || '—'}</td>
                      <td className="px-6 py-4 text-slate-600">{client.city || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Éditer"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(client)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{client.name}</p>
                    <p className="text-sm text-slate-500 truncate">{client.email}</p>
                    {client.city && <p className="text-sm text-slate-400 mt-1">{client.city}</p>}
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(client)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {isConfirming && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Confirmer la suppression</h2>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le client <strong>{selectedClient.name}</strong> ?
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
