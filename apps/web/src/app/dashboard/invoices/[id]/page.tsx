'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  useInvoice,
  useDownloadPdf,
  useUpdateInvoiceStatus,
  useSendInvoiceEmail,
} from '@/features/invoices/hooks/use-invoices';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download, ArrowLeft, FileText, Mail } from 'lucide-react';

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  overdue: 'Retard',
  cancelled: 'Annulée',
};

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { data: invoice, isLoading } = useInvoice(params.id);
  const { mutate: downloadPdf } = useDownloadPdf();
  const { mutate: updateStatus } = useUpdateInvoiceStatus();
  const { mutate: sendInvoiceEmail, isPending: isSendingEmail } = useSendInvoiceEmail();
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 text-center py-12 px-6">
        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 mb-4">Facture non trouvée</p>
        <Link href="/dashboard/invoices" className="btn-primary inline-block">
          Retour aux factures
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Retour aux factures
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{invoice.number}</h1>
            <p className="text-slate-500">Client : {invoice.client?.name ?? '—'}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-start">
            <select
              value={invoice.status}
              onChange={(e) => updateStatus({ id: invoice.id, status: e.target.value })}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold cursor-pointer border-0 ${
                statusColors[invoice.status] ?? 'bg-slate-100 text-slate-700'
              }`}
            >
              <option value="draft">{statusLabels.draft}</option>
              <option value="sent">{statusLabels.sent}</option>
              <option value="paid">{statusLabels.paid}</option>
              <option value="overdue">{statusLabels.overdue}</option>
              <option value="cancelled">{statusLabels.cancelled}</option>
            </select>
            <button
              onClick={() => downloadPdf(invoice.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Date d'émission
            </p>
            <p className="font-medium text-slate-900">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Échéance
            </p>
            <p className="font-medium text-slate-900">{formatDate(invoice.dueDate)}</p>
          </div>
          {invoice.notes && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Notes
              </p>
              <p className="text-slate-700">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Invoice Lines */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
            Prestations
          </h2>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Prix unitaire
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.lines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-3 text-slate-900">{line.description}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{Number(line.quantity)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(Number(line.unitPrice))}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(Number(line.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {invoice.lines.map((line) => (
              <div key={line.id} className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-slate-900 mb-2">{line.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {Number(line.quantity)} x {formatCurrency(Number(line.unitPrice))}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(Number(line.total))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-80 bg-slate-50 rounded-xl p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sous-total HT</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(Number(invoice.subtotal))}
              </span>
            </div>
            <div className="flex justify-between text-sm pb-3 border-b border-slate-200">
              <span className="text-slate-500">TVA ({Number(invoice.taxRate)}%)</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(Number(invoice.taxAmount))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-900">Total TTC</span>
              <span className="font-bold text-lg text-indigo-600">
                {formatCurrency(Number(invoice.total))}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Link href="/dashboard/invoices" className="btn-secondary">
            Retour
          </Link>
          {invoice.status === 'draft' && (
            <button
              onClick={() => setShowEmailConfirm(true)}
              disabled={isSendingEmail}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail size={16} />
              {isSendingEmail ? 'Envoi en cours...' : 'Envoyer par email'}
            </button>
          )}
        </div>

        {/* Email Confirmation Modal */}
        {showEmailConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Envoyer la facture par email ?
              </h2>
              <p className="text-slate-600 mb-6">
                La facture sera envoyée à <strong>{invoice.client?.email}</strong> et le statut
                passera à "Envoyée".
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEmailConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    sendInvoiceEmail(invoice.id, {
                      onSuccess: () => {
                        setShowEmailConfirm(false);
                      },
                    });
                  }}
                  disabled={isSendingEmail}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSendingEmail ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
