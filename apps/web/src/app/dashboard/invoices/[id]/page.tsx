'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  useInvoice,
  useDownloadPdf,
  useUpdateInvoiceStatus,
} from '@/features/invoices/hooks/use-invoices';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download, Plus, ArrowLeft } from 'lucide-react';

const statusLabels = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  overdue: 'Retard',
};

const statusColors = {
  draft: 'bg-gray-lighter text-navy',
  sent: 'bg-blue-primary bg-opacity-20 text-blue-primary',
  paid: 'bg-green-success bg-opacity-20 text-green-success',
  overdue: 'bg-red-error bg-opacity-20 text-red-error',
};

export default function InvoiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { data: invoice, isLoading } = useInvoice(params.id);
  const { mutate: downloadPdf } = useDownloadPdf();
  const { mutate: updateStatus } = useUpdateInvoiceStatus();

  if (isLoading) {
    return <div className="text-center py-8">Chargement de la facture...</div>;
  }

  if (!invoice) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-light mb-4">Facture non trouvée</p>
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
        className="inline-flex items-center text-blue-primary hover:text-blue-dark mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Retour aux factures
      </Link>

      <div className="card">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold text-navy mb-2">{invoice.invoiceNumber}</h1>
            <p className="text-gray-light">Client: {invoice.clientName}</p>
          </div>
          <div className="flex gap-2 items-start">
            <select
              value={invoice.status}
              onChange={(e) => updateStatus({ id: invoice.id, status: e.target.value })}
              className={`px-4 py-2 rounded font-medium cursor-pointer border-0 ${
                statusColors[invoice.status as keyof typeof statusColors]
              }`}
            >
              <option value="draft">{statusLabels.draft}</option>
              <option value="sent">{statusLabels.sent}</option>
              <option value="paid">{statusLabels.paid}</option>
              <option value="overdue">{statusLabels.overdue}</option>
            </select>
            <button
              onClick={() => downloadPdf(invoice.id)}
              className="btn-secondary inline-flex items-center"
            >
              <Download size={20} className="mr-2" />
              Télécharger PDF
            </button>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-light">Date de facture</p>
            <p className="font-bold text-navy">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-light">Date d&apos;échéance</p>
            <p className="font-bold text-navy">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-light">Notes</p>
            <p className="font-bold text-navy">{invoice.notes || '-'}</p>
          </div>
        </div>

        {/* Invoice Lines */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-navy mb-4">Articles</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-light text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-right">Quantité</th>
                  <th className="px-4 py-2 text-right">Prix unitaire</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.lines.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-lighter">
                    <td className="px-4 py-3">{line.description}</td>
                    <td className="px-4 py-3 text-right">{line.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(line.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-bold text-navy">
                      {formatCurrency(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-full md:w-80 bg-gray-lighter p-6 rounded-lg">
            <div className="flex justify-between mb-3">
              <span className="text-gray-light">Sous-total HT</span>
              <span className="font-bold text-navy">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between mb-3 pb-3 border-b">
              <span className="text-gray-light">TVA (20%)</span>
              <span className="font-bold text-navy">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-navy">Total TTC</span>
              <span className="font-bold text-lg text-blue-primary">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Link href="/dashboard/invoices" className="btn-secondary">
            Retour
          </Link>
          <Link href={`/dashboard/invoices/${invoice.id}/edit`} className="btn-primary">
            <Plus size={20} className="mr-2 inline" />
            Modifier
          </Link>
        </div>
      </div>
    </div>
  );
}
