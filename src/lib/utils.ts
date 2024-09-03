import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTableId(tableName: string): string {
  return tableName.toLowerCase().replace(/\s+/g, '-');
}
