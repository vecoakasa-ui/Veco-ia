// ============================================
// VENANCE IMO — Utility Functions
// ============================================

/**
 * Format a number as FCFA currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

/**
 * Format a date to French locale string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format month/year label
 */
export function formatMonth(month: string, year: number): string {
  const months: Record<string, string> = {
    'Jan': 'Janvier', 'Feb': 'Février', 'Mar': 'Mars', 'Apr': 'Avril',
    'May': 'Mai', 'Jun': 'Juin', 'Jul': 'Juillet', 'Aug': 'Août',
    'Sep': 'Septembre', 'Oct': 'Octobre', 'Nov': 'Novembre', 'Dec': 'Décembre',
  };
  return `${months[month] || month} ${year}`;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get status color class for payment status
 */
export function getPaymentStatusClass(status: string): string {
  switch (status) {
    case 'paid': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'late': return 'badge-danger';
    case 'upcoming': return 'badge-info';
    default: return 'badge-info';
  }
}

/**
 * Get status label in French
 */
export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'paid': return 'Payé';
    case 'pending': return 'En attente';
    case 'late': return 'En retard';
    case 'upcoming': return 'À venir';
    default: return status;
  }
}

/**
 * Get property status label
 */
export function getPropertyStatusLabel(status: string): string {
  switch (status) {
    case 'occupied': return 'Occupé';
    case 'vacant': return 'Vacant';
    case 'maintenance': return 'Maintenance';
    default: return status;
  }
}

/**
 * Get property status badge class
 */
export function getPropertyStatusClass(status: string): string {
  switch (status) {
    case 'occupied': return 'badge-success';
    case 'vacant': return 'badge-warning';
    case 'maintenance': return 'badge-danger';
    default: return 'badge-info';
  }
}

/**
 * Get property type label
 */
export function getPropertyTypeLabel(type: string): string {
  switch (type) {
    case 'apartment': return 'Appartement';
    case 'studio': return 'Studio';
    case 'villa': return 'Villa';
    case 'house': return 'Maison';
    default: return type;
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Classname helper - combines classes conditionally
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
