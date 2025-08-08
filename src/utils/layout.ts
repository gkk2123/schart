// src/utils/layout.ts
import type { Table } from '../types';

export const SEAT_DIAMETER = 56; // w-14
export const TABLE_PADDING = 32;

export const calculateSeatPositions = (table: Table) => {
    const positions = [];
    const { capacity, shape } = table;
    const centerOffset = SEAT_DIAMETER / 2;

    if (shape === 'Circle') {
        const radius = Math.max(70, capacity * 11);
        const tableWidth = radius * 2 + SEAT_DIAMETER + TABLE_PADDING;
        const tableHeight = tableWidth;
        const tableCenter = tableWidth / 2;

        for (let i = 0; i < capacity; i++) {
            const angle = (i / capacity) * 2 * Math.PI - Math.PI / 2;
            positions.push({
                top: `${tableCenter + radius * Math.sin(angle) - centerOffset}px`,
                left: `${tableCenter + radius * Math.cos(angle) - centerOffset}px`,
            });
        }
        return { positions, width: tableWidth, height: tableHeight };

    } else { // Rectangle
        const seatsPerSide = Math.ceil(capacity / 2);
        const tableWidth = seatsPerSide * (SEAT_DIAMETER + 24) + 48;
        const tableHeight = SEAT_DIAMETER * 2 + 96;

        for (let i = 0; i < capacity; i++) {
            const isTopRow = i < seatsPerSide;
            const indexInRow = isTopRow ? i : i - seatsPerSide;
            const left = indexInRow * (SEAT_DIAMETER + 24) + 32;
            const top = isTopRow ? 0 : tableHeight - SEAT_DIAMETER;
            positions.push({
                top: `${top}px`,
                left: `${left}px`,
            });
        }
        return { positions, width: tableWidth, height: tableHeight };
    }
};