'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useClients } from '@/features/clients/hooks/use-clients';
import { useCreateInvoice } from '@/features/invoices/hooks/use-invoices';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const invoiceLineSchema = z.object({
  description: z.string().min(1, 'La description est requise'),
  quantity: z.number().min(1, 'La quantité doit être supérieure à 0'),
  unitPrice: z.number().min(0, 'Le prix unitaire doit être positif'),
});

const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Veuillez sélectionner un client'),
  issueDate: z.string().min(1, 'La date est requise'),
  dueDate: z.string().min(1, "La date d'échéance est requise"),
  lines: z.array(invoiceLineSchema).min(1, 'Au moins une ligne est requise'),
  notes: z.string().optional(),
});

type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export default function NewInvoicePage() {
  const router = useRouter();
  const [logo, setLogo] = useState<string | null>(null);
  const { data: clients = [] } = useClients('');
  const { mutate: createInvoice, isPending } = useCreateInvoice();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawUser = localStorage.getItem('user');
    if (!rawUser) return;

    try {
      const user = JSON.parse(rawUser) as { logo?: string | null };
      setLogo(user.logo ?? null);
    } catch {
      setLogo(null);
    }
  }, []);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      clientId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lines: [{ description: '', quantity: 1, unitPrice: 0 }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const lines = watch('lines');

  const subtotal = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice || 0), 0);
  const taxAmount = subtotal * 0.2;
  const totalAmount = subtotal + taxAmount;

  const onSubmit = (data: CreateInvoiceInput) => {
    createInvoice(data, {
      onSuccess: () => {
        router.push('/dashboard/invoices');
      },
    });
  };

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
        <h1 className="text-xl font-bold text-slate-900 mb-6">Nouvelle facture</h1>

        {logo ? (
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Logo utilisé dans le PDF
            </p>
            <img
              src={logo}
              alt="Logo de facture"
              className="h-16 w-16 rounded-lg border border-slate-200 bg-white p-1 object-contain"
            />
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client Selection */}
          <div>
            <label className="label-text">Client *</label>
            <select {...register('clientId')} className="input-field">
              <option value="">Sélectionner un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-red-600 text-sm mt-1">{errors.clientId.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Date d'émission *</label>
              <input type="date" {...register('issueDate')} className="input-field" />
              {errors.issueDate && (
                <p className="text-red-600 text-sm mt-1">{errors.issueDate.message}</p>
              )}
            </div>
            <div>
              <label className="label-text">Date d&apos;échéance *</label>
              <input type="date" {...register('dueDate')} className="input-field" />
              {errors.dueDate && (
                <p className="text-red-600 text-sm mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Invoice Lines */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Prestations
              </label>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <Plus size={16} />
                Ajouter une ligne
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Description
                      </label>
                      <input
                        {...register(`lines.${index}.description`)}
                        placeholder="Description"
                        className="input-field"
                      />
                      {errors.lines?.[index]?.description && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.lines[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Quantité
                      </label>
                      <input
                        {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                        type="number"
                        step="1"
                        min="0"
                        placeholder="1"
                        className="input-field"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Prix unitaire
                      </label>
                      <input
                        {...register(`lines.${index}.unitPrice`, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="input-field"
                      />
                    </div>

                    <div className="md:col-span-3 flex items-end gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 mb-1">Total</p>
                        <p className="font-semibold text-slate-900 py-2.5">
                          {formatCurrency(
                            (lines[index]?.quantity ?? 0) * (lines[index]?.unitPrice ?? 0),
                          )}
                        </p>
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-xl p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sous-total HT</span>
              <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm pb-3 border-b border-slate-200">
              <span className="text-slate-500">TVA (20%)</span>
              <span className="font-medium text-slate-900">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-900">Total TTC</span>
              <span className="font-bold text-lg text-indigo-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label-text">Notes</label>
            <textarea
              {...register('notes')}
              placeholder="Notes de facture (conditions de paiement, etc.)"
              rows={3}
              className="input-field"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/invoices" className="btn-secondary flex-1 text-center">
              Annuler
            </Link>
            <button type="submit" disabled={isPending} className="btn-primary flex-1">
              {isPending ? 'Création...' : 'Créer la facture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
