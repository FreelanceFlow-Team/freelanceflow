'use client';

import Link from 'next/link';
import { useInvoices } from '@/features/invoices/hooks/use-invoices';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { FileText, TrendingUp, Clock, AlertCircle } from 'lucide-react';

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

export default function DashboardPage() {
  const { data: invoices = [] } = useInvoices('');

  // Calculate stats
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const pendingInvoices = invoices.filter((inv) => inv.status === 'sent').length;
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue').length;
  const totalInvoices = invoices.length;

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy mb-8">Tableau de bord</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="card bg-gradient-to-br from-blue-primary to-blue-dark text-white p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Chiffre d&apos;affaires</p>
              <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <TrendingUp size={32} className="opacity-50" />
          </div>
          <p className="text-xs opacity-75">Factures payées</p>
        </div>

        {/* Pending Invoices */}
        <div className="card bg-gradient-to-br from-blue-primary to-navy p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 text-white">En attente</p>
              <p className="text-3xl font-bold text-white">{pendingInvoices}</p>
            </div>
            <Clock size={32} className="opacity-50 text-white" />
          </div>
          <p className="text-xs opacity-75 text-white">Factures envoyées</p>
        </div>

        {/* Overdue Invoices */}
        <div className="card bg-gradient-to-br from-red-error to-red-dark text-white p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">En retard</p>
              <p className="text-3xl font-bold">{overdueInvoices}</p>
            </div>
            <AlertCircle size={32} className="opacity-50" />
          </div>
          <p className="text-xs opacity-75">Paiements en retard</p>
        </div>

        {/* Total Invoices */}
        <div className="card bg-gradient-to-br from-green-success to-green-dark text-white p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold">{totalInvoices}</p>
            </div>
            <FileText size={32} className="opacity-50" />
          </div>
          <p className="text-xs opacity-75">Factures créées</p>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-navy">Factures récentes</h2>
          <Link
            href="/dashboard/invoices"
            className="text-blue-primary hover:text-blue-dark text-sm font-medium"
          >
            Voir tout →
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-light mb-4">Aucune facture pour le moment</p>
            <Link href="/dashboard/invoices/new" className="btn-primary inline-block">
              Créer la première facture
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-lighter border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-navy">Facture</th>
                  <th className="px-4 py-3 text-left font-bold text-navy">Client</th>
                  <th className="px-4 py-3 text-right font-bold text-navy">Montant</th>
                  <th className="px-4 py-3 text-center font-bold text-navy">Statut</th>
                  <th className="px-4 py-3 text-left font-bold text-navy">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-lighter">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="font-bold text-blue-primary hover:text-blue-dark"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-light">{invoice.clientName}</td>
                    <td className="px-4 py-3 text-right font-bold text-navy">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          statusColors[invoice.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusLabels[invoice.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-light">
                      {formatDateShort(invoice.issueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
