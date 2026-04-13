'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useInvoices,
  useDeleteInvoice,
  useUpdateInvoiceStatus,
  useDownloadPdf,
  type Invoice,
} from '@/features/invoices/hooks/use-invoices';
import { Trash2, Download, Plus, Eye } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils';

const statusColors = {
  draft: 'bg-gray-lighter text-navy',
  sent: 'bg-blue-primary bg-opacity-20 text-blue-primary',
  paid: 'bg-green-success bg-opacity-20 text-green-success',
  overdue: 'bg-red-error bg-opacity-20 text-red-error',
};

const statusLabels = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  overdue: 'Retard',
};

export default function InvoicesPage() {
  const { data: invoices = [], isLoading } = useInvoices('');
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
  const { mutate: updateStatus } = useUpdateInvoiceStatus();
  const { mutate: downloadPdf } = useDownloadPdf();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsConfirming(true);
  };

  const confirmDelete = () => {
    if (selectedInvoice) {
      deleteInvoice(selectedInvoice.id, {
        onSuccess: () => {
          setIsConfirming(false);
          setSelectedInvoice(null);
        },
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des factures...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-navy">Factures</h1>
        <Link href="/dashboard/invoices/new" className="btn-primary">
          <Plus className="inline mr-2" size={20} />
          Nouvelle facture
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-light mb-4">Aucune facture pour le moment</p>
          <Link href="/dashboard/invoices/new" className="btn-primary inline-block">
            Créer la première facture
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-light text-white">
              <tr>
                <th className="px-6 py-3 text-left">N° Facture</th>
                <th className="px-6 py-3 text-left">Client</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-right">Montant</th>
                <th className="px-6 py-3 text-center">Statut</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-lighter">
                  <td className="px-6 py-4 font-bold text-navy">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 text-gray-light">{invoice.clientName}</td>
                  <td className="px-6 py-4 text-gray-light">
                    {formatDateShort(invoice.issueDate)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={invoice.status}
                      onChange={(e) => updateStatus({ id: invoice.id, status: e.target.value })}
                      className={`px-3 py-1 rounded text-sm font-medium cursor-pointer border-0 ${
                        statusColors[invoice.status as keyof typeof statusColors]
                      }`}
                    >
                      <option value="draft">{statusLabels.draft}</option>
                      <option value="sent">{statusLabels.sent}</option>
                      <option value="paid">{statusLabels.paid}</option>
                      <option value="overdue">{statusLabels.overdue}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="btn-secondary inline-flex items-center"
                    >
                      <Eye size={16} className="mr-1" />
                      Voir
                    </Link>
                    <button
                      onClick={() => downloadPdf(invoice.id)}
                      className="btn-secondary inline-flex items-center"
                    >
                      <Download size={16} className="mr-1" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleDelete(invoice)}
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

      {isConfirming && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-navy mb-4">Confirmer la suppression</h2>
            <p className="text-gray-light mb-6">
              Êtes-vous sûr de vouloir supprimer la facture{' '}
              <strong>{selectedInvoice.invoiceNumber}</strong> ?
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
