import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  label: {
    color: '#6b7280',
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontFamily: 'Helvetica-Bold',
  },
  colDescription: { flex: 4 },
  colQty: { flex: 1, textAlign: 'right' },
  colUnit: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  totalsLabel: { width: 100, textAlign: 'right', color: '#6b7280' },
  totalsValue: { width: 80, textAlign: 'right' },
  totalsBold: { fontFamily: 'Helvetica-Bold' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: 9,
    alignSelf: 'flex-start',
  },
});

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceTemplateProps {
  invoice: {
    number: string;
    status: string;
    issueDate: Date;
    dueDate: Date;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes?: string | null;
    lines: InvoiceLine[];
    client: {
      name: string;
      email: string;
      address?: string | null;
      vatNumber?: string | null;
    };
  };
  issuerName: string;
}

function fmt(amount: number): string {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
}

function fmtDate(date: Date): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

export function InvoiceTemplate({ invoice, issuerName }: InvoiceTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FACTURE</Text>
            <Text style={{ marginTop: 4, fontSize: 12 }}>{invoice.number}</Text>
            <View style={[styles.badge, { marginTop: 8 }]}>
              <Text>{invoice.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{issuerName}</Text>
            <Text style={styles.label}>Émise le : {fmtDate(invoice.issueDate)}</Text>
            <Text style={styles.label}>Échéance : {fmtDate(invoice.dueDate)}</Text>
          </View>
        </View>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facturé à</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{invoice.client.name}</Text>
          <Text>{invoice.client.email}</Text>
          {invoice.client.address && <Text>{invoice.client.address}</Text>}
          {invoice.client.vatNumber && <Text>TVA : {invoice.client.vatNumber}</Text>}
        </View>

        {/* Lines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prestations</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colUnit}>P.U. HT</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {invoice.lines.map((line, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.colDescription}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colUnit}>{fmt(line.unitPrice)}</Text>
              <Text style={styles.colTotal}>{fmt(line.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Sous-total HT</Text>
            <Text style={styles.totalsValue}>{fmt(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>TVA ({Number(invoice.taxRate)}%)</Text>
            <Text style={styles.totalsValue}>{fmt(invoice.taxAmount)}</Text>
          </View>
          <View style={[styles.totalsRow, { marginTop: 6 }]}>
            <Text style={[styles.totalsLabel, styles.totalsBold]}>Total TTC</Text>
            <Text style={[styles.totalsValue, styles.totalsBold]}>{fmt(invoice.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={[styles.section, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
