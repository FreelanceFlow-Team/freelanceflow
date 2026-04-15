/**
 * Exporte un tableau d'objets en fichier CSV et déclenche le téléchargement.
 */
export function exportToCsv<T>(
  filename: string,
  rows: T[],
  columns: { key: keyof T & string; label: string }[],
) {
  if (rows.length === 0) return;

  const separator = ';';

  const header = columns.map((c) => escapeCsvField(c.label)).join(separator);

  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const value = row[c.key as keyof T];
          if (value === null || value === undefined) return '';
          return escapeCsvField(String(value));
        })
        .join(separator),
    )
    .join('\n');

  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const csv = bom + header + '\n' + body;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsvField(field: string): string {
  if (field.includes(';') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
