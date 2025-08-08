// src/utils/rsvpHelpers.ts
import type { Guest } from '../types';

/**
 * Parse various RSVP formats and normalize them
 */
export const normalizeRsvpStatus = (value: string | undefined | null): Guest['rsvp'] => {
  if (!value) return 'Pending';
  
  const normalized = String(value).trim().toLowerCase();
  
  // Attending variations
  const attendingKeywords = ['attending', 'yes', 'y', 'true', '참석', 'o', '출석', '1', 'confirmed'];
  if (attendingKeywords.some(keyword => normalized.includes(keyword))) {
    return 'Attending';
  }
  
  // Not Attending variations
  const notAttendingKeywords = ['not attending', 'no', 'n', 'false', '불참', 'x', '결석', '0', 'declined'];
  if (notAttendingKeywords.some(keyword => normalized.includes(keyword))) {
    return 'Not Attending';
  }
  
  // Pending variations
  const pendingKeywords = ['pending', 'maybe', '미정', 'uncertain', 'undecided', 'tbd'];
  if (pendingKeywords.some(keyword => normalized.includes(keyword))) {
    return 'Pending';
  }
  
  // Default to Pending for unknown values
  return 'Pending';
};

/**
 * Get display color for RSVP status
 */
export const getRsvpColor = (rsvp: Guest['rsvp']): string => {
  switch (rsvp) {
    case 'Attending':
      return 'text-green-600';
    case 'Not Attending':
      return 'text-red-600';
    case 'Pending':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Get badge style for RSVP status
 */
export const getRsvpBadgeClass = (rsvp: Guest['rsvp']): string => {
  switch (rsvp) {
    case 'Attending':
      return 'bg-green-100 text-green-800';
    case 'Not Attending':
      return 'bg-red-100 text-red-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Check if guest should be shown in seating area
 */
export const isGuestSeatable = (guest: Guest): boolean => {
  return guest.rsvp === 'Attending';
};

/**
 * Get guest list statistics
 */
export const getGuestStatistics = (guests: Guest[]) => {
  const total = guests.length;
  const attending = guests.filter(g => g.rsvp === 'Attending').length;
  const notAttending = guests.filter(g => g.rsvp === 'Not Attending').length;
  const pending = guests.filter(g => g.rsvp === 'Pending').length;
  
  const attendingWithPlusOnes = guests
    .filter(g => g.rsvp === 'Attending')
    .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
  
  return {
    total,
    attending,
    notAttending,
    pending,
    attendingWithPlusOnes,
    percentageAttending: total > 0 ? Math.round((attending / total) * 100) : 0,
    percentageResponded: total > 0 ? Math.round(((attending + notAttending) / total) * 100) : 0
  };
};