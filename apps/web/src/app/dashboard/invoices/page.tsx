'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useInvoices,
  useDeleteInvoice,
  useUpdateInvoiceStatus,
  useDownloadPdf,
  useSendInvoiceEmail,
  type Invoice,
} from '@/features/invoices/hooks/use-invoices';
import { Trash2, Download, Plus, Eye, FileText, Mail, FileDown } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { exportToCsv } from '@/lib/csv-export';

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  overdue: 'Retard',
  cancelled: 'Annulée',
};

export default function InvoicesPage() {
  const { data: invoices = [], isLoading } = useInvoices('');
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
  const { mutate: updateStatus } = useUpdateInvoiceStatus();
  const { mutate: downloadPdf } = useDownloadPdf();
  const { mutate: sendInvoiceEmail, isPending: isSendingEmail } = useSendInvoiceEmail();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsConfirming(true);
  };

  const handleSendEmail = (invoice: Invoice) => {
    setSendingInvoiceId(invoice.id);
    sendInvoiceEmail(invoice.id, {
      onSuccess: () => {
        setSendingInvoiceId(null);
      },
      onError: () => {
        setSendingInvoiceId(null);
      },
    });
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
          <h1 className="text-2xl font-bold text-slate-900">Factures</h1>
          <p className="text-slate-500 text-sm mt-1">
            {invoices.length} facture{invoices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {invoices.length > 0 && (
            <button
              onClick={() => {
                const statusLabelsMap: Record<string, string> = {
                  draft: 'Brouillon',
                  sent: 'Envoyée',
                  paid: 'Payée',
                  overdue: 'Retard',
                  cancelled: 'Annulée',
                };
                const rows = invoices.map((inv) => ({
                  number: inv.number,
                  client: inv.client?.name ?? '',
                  status: statusLabelsMap[inv.status] ?? inv.status,
                  issueDate: formatDateShort(inv.issueDate),
                  dueDate: formatDateShort(inv.dueDate),
                  subtotal: Number(inv.subtotal).toFixed(2),
                  taxRate: Number(inv.taxRate).toFixed(2),
                  taxAmount: Number(inv.taxAmount).toFixed(2),
                  total: Number(inv.total).toFixed(2),
                }));
                exportToCsv('factures.csv', rows, [
                  { key: 'number', label: 'N° Facture' },
                  { key: 'client', label: 'Client' },
                  { key: 'status', label: 'Statut' },
                  { key: 'issueDate', label: "Date d'émission" },
                  { key: 'dueDate', label: "Date d'échéance" },
                  { key: 'subtotal', label: 'Sous-total (€)' },
                  { key: 'taxRate', label: 'Taux TVA (%)' },
                  { key: 'taxAmount', label: 'Montant TVA (€)' },
                  { key: 'total', label: 'Total (€)' },
                ]);
              }}
              className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              <FileDown size={18} />
              <span className="hidden sm:inline">Exporter CSV</span>
            </button>
          )}
          <Link
            href="/dashboard/invoices/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Nouvelle facture
          </Link>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 text-center py-16 px-6">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune facture</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Créez votre première facture pour commencer à facturer vos clients.
          </p>
          <Link
            href="/dashboard/invoices/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Créer une facture
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
                      N° Facture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{invoice.number}</td>
                      <td className="px-6 py-4 text-slate-600">{invoice.client?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDateShort(invoice.issueDate)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {formatCurrency(Number(invoice.total))}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={invoice.status}
                          onChange={(e) => updateStatus({ id: invoice.id, status: e.target.value })}
                          className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border-0 ${
                            statusColors[invoice.status] ?? 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <option value="draft">{statusLabels.draft}</option>
                          <option value="sent">{statusLabels.sent}</option>
                          <option value="paid">{statusLabels.paid}</option>
                          <option value="overdue">{statusLabels.overdue}</option>
                          <option value="cancelled">{statusLabels.cancelled}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <Eye size={16} />
                          </Link>
                          {invoice.status === 'draft' && (
                            <button
                              onClick={() => handleSendEmail(invoice)}
                              disabled={isSendingEmail || sendingInvoiceId === invoice.id}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Envoyer par email"
                            >
                              <Mail size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => downloadPdf(invoice.id)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Télécharger PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice)}
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
            {invoices.map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-slate-900">{invoice.number}</p>
                    <p className="text-sm text-slate-500">{invoice.client?.name ?? '—'}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[invoice.status] ?? 'bg-slate-100 text-slate-700'}`}
                  >
                    {statusLabels[invoice.status] ?? invoice.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(Number(invoice.total))}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateShort(invoice.issueDate)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </Link>
                    {invoice.status === 'draft' && (
                      <button
                        onClick={() => handleSendEmail(invoice)}
                        disabled={isSendingEmail || sendingInvoiceId === invoice.id}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mail size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => downloadPdf(invoice.id)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(invoice)}
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
      {isConfirming && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Confirmer la suppression</h2>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer la facture{' '}
              <strong>{selectedInvoice.number}</strong> ?
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
