// src/utils/validation.ts
import { z } from 'zod';
import type { Guest, Table } from '../types';

// Guest validation schema
export const GuestSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  group: z.string().optional(),
  rsvp: z.enum(['Attending', 'Not Attending', 'Pending']).default('Attending'),
  plusOnes: z.number().min(0, 'Cannot have negative plus ones').max(10, 'Too many plus ones (max 10)').default(0),
  sourceSheet: z.string().optional()
});

// Table validation schema
export const TableSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Table name required').max(50, 'Table name too long'),
  capacity: z.number().min(1, 'Minimum 1 seat').max(50, 'Maximum 50 seats'),
  shape: z.enum(['Circle', 'Rectangle']).default('Circle'),
  seats: z.array(z.object({
    id: z.string(),
    guestId: z.number().nullable()
  })),
  x: z.number(),
  y: z.number()
});

// Project state validation schema
export const ProjectStateSchema = z.object({
  version: z.string(),
  guests: z.array(GuestSchema),
  tables: z.array(TableSchema),
  metadata: z.object({
    eventName: z.string().optional(),
    eventDate: z.string().optional(),
    lastModified: z.string()
  }).optional()
});

// Excel row validation
export const ExcelRowSchema = z.object({
  name: z.string().min(1),
  group: z.string().optional(),
  rsvp: z.string().optional(),
  plusOnes: z.union([z.string(), z.number()]).optional()
});

// Validation helper functions
export const validateGuest = (guest: unknown): Guest | { error: string } => {
  try {
    return GuestSchema.parse(guest) as Guest;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map(e => e.message).join(', ') };
    }
    return { error: 'Invalid guest data' };
  }
};

export const validateTable = (table: unknown): Table | { error: string } => {
  try {
    return TableSchema.parse(table) as Table;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map(e => e.message).join(', ') };
    }
    return { error: 'Invalid table data' };
  }
};

export const validateProjectState = (state: unknown): { valid: boolean; errors?: string[] } => {
  try {
    ProjectStateSchema.parse(state);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        valid: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { valid: false, errors: ['Invalid project state'] };
  }
};

// Check for duplicate guests
export const findDuplicateGuests = (guests: Guest[]): string[] => {
  const seen = new Map<string, number>();
  const duplicates: string[] = [];
  
  guests.forEach(guest => {
    const key = guest.name.toLowerCase().trim();
    const count = seen.get(key) || 0;
    seen.set(key, count + 1);
    
    if (count === 1) {
      duplicates.push(guest.name);
    }
  });
  
  return duplicates;
};

// Validate seating capacity
export const validateSeatingCapacity = (guests: Guest[], tables: Table[]): { 
  valid: boolean; 
  totalGuests: number; 
  totalSeats: number; 
  message?: string 
} => {
  const attendingGuests = guests.filter(g => g.rsvp === 'Attending');
  const totalGuests = attendingGuests.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  
  return {
    valid: totalSeats >= totalGuests,
    totalGuests,
    totalSeats,
    message: totalSeats < totalGuests 
      ? `Not enough seats! Need ${totalGuests} seats but only have ${totalSeats}`
      : undefined
  };
};

// Validate file upload
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json'
  ];
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large (max 10MB)' };
  }
  
  const isExcel = file.name.match(/\.(xlsx?|xls)$/i);
  const isJson = file.name.match(/\.json$/i);
  
  if (!isExcel && !isJson) {
    return { valid: false, error: 'Invalid file type. Please upload Excel (.xlsx, .xls) or JSON (.json) files' };
  }
  
  return { valid: true };
};