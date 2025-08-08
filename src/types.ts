// src/types.ts

export interface Guest {
  id: number;
  name: string;
  group?: string;
  rsvp?: 'Attending' | 'Not Attending' | 'Pending';
  plusOnes?: number;
  sourceSheet?: string;
}

export interface Seat {
  id: string; // Will be in the format `seat-tableId-seatIndex`
  guestId: number | null;
}

export interface Table {
  id: number;
  name: string;
  capacity: number;
  shape: 'Circle' | 'Rectangle';
  seats: Seat[];
  x: number;
  y: number;
}