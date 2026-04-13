/**
 * Formate un montant en euros
 * @param amount - Montant à formater
 * @returns Montant formaté en euros
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Formate une date complète (jour mois année heure:minute)
 * @param date - Date à formater (string ou Date)
 * @returns Date formatée
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Formate une date courte (jour/mois/année)
 * @param date - Date à formater (string ou Date)
 * @returns Date formatée courte
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Classe utilitaire pour combiner des classes Tailwind
 * @param classes - Classes à combiner
 * @returns Classes combinées
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
