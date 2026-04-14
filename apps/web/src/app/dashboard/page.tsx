'use client';

import Link from 'next/link';
import { useInvoices } from '@/features/invoices/hooks/use-invoices';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { FileText, TrendingUp, Clock, AlertCircle, Plus, BarChart3, Calendar } from 'lucide-react';

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

// Utility function to get month label
const getMonthLabel = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

export default function DashboardPage() {
  const { data: invoices = [] } = useInvoices('');

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const pendingInvoices = invoices.filter((inv) => inv.status === 'sent').length;
  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue').length;
  const totalInvoices = invoices.length;

  // Calcul du chiffre d'affaires par client
  const revenueByClient = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce(
      (acc, inv) => {
        const clientName = inv.client?.name ?? 'Non renseigné';
        acc[clientName] = (acc[clientName] || 0) + Number(inv.total);
        return acc;
      },
      {} as Record<string, number>,
    );

  const topClients = Object.entries(revenueByClient)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Calcul du chiffre d'affaires par mois
  const revenueByMonth = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce(
      (acc, inv) => {
        const monthKey = getMonthLabel(inv.issueDate);
        acc[monthKey] = (acc[monthKey] || 0) + Number(inv.total);
        return acc;
      },
      {} as Record<string, number>,
    );

  const monthlyRevenue = Object.entries(revenueByMonth)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
    .slice(0, 6)
    .reverse();

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Nouvelle facture
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-slate-500 mt-1">Chiffre d'affaires</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{pendingInvoices}</p>
          <p className="text-sm text-slate-500 mt-1">En attente</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle size={20} className="text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{overdueInvoices}</p>
          <p className="text-sm text-slate-500 mt-1">En retard</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FileText size={20} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalInvoices}</p>
          <p className="text-sm text-slate-500 mt-1">Total factures</p>
        </div>
      </div>

      {/* Revenue by Client */}
      <div className="bg-white rounded-xl border border-slate-200 mb-8">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Chiffre d'affaires par client</h2>
          </div>
          <p className="text-sm text-slate-500">Top 5 des clients</p>
        </div>

        {topClients.length === 0 ? (
          <div className="text-center py-8 px-6">
            <p className="text-slate-500">Aucune facture payée pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {topClients.map((client, index) => (
              <div key={index} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-900">{client.name}</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(client.revenue)}</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${(client.revenue / (topClients[0]?.revenue || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Revenue */}
      <div className="bg-white rounded-xl border border-slate-200 mb-8">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={20} className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Chiffre d'affaires par mois</h2>
          </div>
          <p className="text-sm text-slate-500">Les 6 derniers mois</p>
        </div>

        {monthlyRevenue.length === 0 ? (
          <div className="text-center py-8 px-6">
            <p className="text-slate-500">Aucune facture payée pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 px-6 pb-6">
            {monthlyRevenue.map((item, index) => {
              const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));
              return (
                <div key={index} className="py-4 first:pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700 capitalize">{item.month}</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(item.revenue)}</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all"
                      style={{
                        width: `${(item.revenue / (maxRevenue || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Factures récentes</h2>
          <Link
            href="/dashboard/invoices"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Voir tout
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="text-center py-12 px-6">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 mb-4">Aucune facture pour le moment</p>
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
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Facture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          {invoice.number}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">{invoice.client?.name ?? '—'}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                        {formatCurrency(Number(invoice.total))}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            statusColors[invoice.status] ?? 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {statusLabels[invoice.status] ?? invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {formatDateShort(invoice.issueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-slate-100">
              {recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-900">{invoice.number}</p>
                    <p className="text-sm text-slate-500">{invoice.client?.name ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(Number(invoice.total))}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${statusColors[invoice.status] ?? 'bg-slate-100 text-slate-700'}`}
                    >
                      {statusLabels[invoice.status] ?? invoice.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
