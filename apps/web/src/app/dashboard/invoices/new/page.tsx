'use client';

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
  const { data: clients = [] } = useClients('');
  const { mutate: createInvoice, isPending } = useCreateInvoice();

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

  const calculateTotals = () => {
    const subtotal = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice || 0), 0);
    const taxAmount = subtotal * 0.2;
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

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
        className="inline-flex items-center text-blue-primary hover:text-blue-dark mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Retour aux factures
      </Link>

      <div className="card">
        <h1 className="text-2xl font-bold text-navy mb-6">Nouvelle facture</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-navy mb-2">Client</label>
            <select {...register('clientId')} className="input-field w-full">
              <option value="">Sélectionner un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-red-error text-sm mt-1">{errors.clientId.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Date de facture</label>
              <input type="date" {...register('issueDate')} className="input-field w-full" />
              {errors.issueDate && (
                <p className="text-red-error text-sm mt-1">{errors.issueDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-2">
                Date d&apos;échéance
              </label>
              <input type="date" {...register('dueDate')} className="input-field w-full" />
              {errors.dueDate && (
                <p className="text-red-error text-sm mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Invoice Lines */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-navy">Lignes de facture</label>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                className="btn-secondary inline-flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Ajouter une ligne
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-light mb-1">
                      Description
                    </label>
                    <input
                      {...register(`lines.${index}.description`)}
                      placeholder="Description"
                      className="input-field w-full"
                    />
                    {errors.lines?.[index]?.description && (
                      <p className="text-red-error text-xs mt-1">
                        {errors.lines[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-light mb-1">
                      Quantité
                    </label>
                    <input
                      {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                      type="number"
                      step="1"
                      min="0"
                      placeholder="1"
                      className="input-field w-full"
                    />
                    {errors.lines?.[index]?.quantity && (
                      <p className="text-red-error text-xs mt-1">
                        {errors.lines[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-light mb-1">
                      Prix unitaire
                    </label>
                    <input
                      {...register(`lines.${index}.unitPrice`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="input-field w-full"
                    />
                    {errors.lines?.[index]?.unitPrice && (
                      <p className="text-red-error text-xs mt-1">
                        {errors.lines[index]?.unitPrice?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-light mb-1">Total</p>
                      <p className="font-bold text-navy">
                        {formatCurrency(
                          (lines[index]?.quantity ?? 0) * (lines[index]?.unitPrice ?? 0),
                        )}
                      </p>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="btn-danger p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-lighter p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-light">Sous-total HT</span>
              <span className="font-bold text-navy">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-light">TVA (20%)</span>
              <span className="font-bold text-navy">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold text-navy">Total TTC</span>
              <span className="font-bold text-lg text-blue-primary">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-navy mb-2">Notes</label>
            <textarea
              {...register('notes')}
              placeholder="Notes de facture (conditions de paiement, etc.)"
              rows={3}
              className="input-field w-full"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/invoices" className="btn-secondary flex-1">
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
