import { create } from 'zustand';

import { generateTableId } from '@/lib/utils';

export type CellType = 'text' | 'number' | 'select';

interface Row {
  [key: string]: unknown;
}

export interface Column {
  name: string;
  type: CellType;
  options?: string[]; // For select type
}

export interface TableData {
  id: string;
  name: string;
  rows: Row[];
  columns: Column[];
}

interface TableState {
  tables: Record<string, TableData>;
  addTable: (tableName: string, initialColumns: Column[]) => void;
  addRow: (tableId: string, row: Row) => void;
  addColumn: (tableId: string, column: Column) => void;
  editCell: (
    tableId: string,
    rowIndex: number,
    columnName: string,
    value: unknown
  ) => void;
  editRow: (tableId: string, rowIndex: number, newRow: Row) => void;
  editColumnName: (tableId: string, oldName: string, newName: string) => void;
  editColumnType: (
    tableId: string,
    columnName: string,
    newType: CellType,
    options?: string[]
  ) => void;
  deleteRow: (tableId: string, rowIndex: number) => void;
  deleteRows: (tableId: string, rowIndices: number[]) => void;
  deleteColumn: (tableId: string, columnName: string) => void;
  getUniqueTableId: (baseName: string) => string;
}

export const useTableStore = create<TableState>((set, get) => ({
  tables: {
    'table-1': {
      id: 'table-1',
      name: 'Table 1',
      rows: [
        {
          email: 'm@example.com',
          amount: 100,
          status: 'pending',
        },
      ],
      columns: [
        { name: 'email', type: 'text' },
        { name: 'amount', type: 'number' },
        {
          name: 'status',
          type: 'select',
          options: ['pending', 'completed', 'failed'],
        },
      ],
    },
  },
  addTable: (tableName: string, initialColumns: Column[]) =>
    set((state) => {
      const tableId = state.getUniqueTableId(tableName);
      return {
        tables: {
          ...state.tables,
          [tableId]: {
            id: tableId,
            name: tableName,
            rows: [],
            columns: initialColumns,
          },
        },
      };
    }),
  addRow: (tableId: string, row: Row) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: {
          ...state.tables[tableId],
          rows: [...state.tables[tableId].rows, row],
        },
      },
    })),
  addColumn: (tableId: string, column: Column) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: {
          ...state.tables[tableId],
          columns: [...state.tables[tableId].columns, column],
          rows: state.tables[tableId].rows.map((row) => ({
            ...row,
            [column.name]: column.type === 'number' ? 0 : '',
          })),
        },
      },
    })),
  editCell: (
    tableId: string,
    rowIndex: number,
    columnName: string,
    value: unknown
  ) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: {
          ...state.tables[tableId],
          rows: state.tables[tableId].rows.map((row, index) =>
            index === rowIndex ? { ...row, [columnName]: value } : row
          ),
        },
      },
    })),
  editRow: (tableName: string, rowIndex: number, newRow: Row) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableName]: {
          ...state.tables[tableName],
          rows: state.tables[tableName].rows.map((row, index) =>
            index === rowIndex ? newRow : row
          ),
        },
      },
    })),
  editColumnName: (tableName: string, oldName: string, newName: string) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableName]: {
          ...state.tables[tableName],
          columns: state.tables[tableName].columns.map((col) =>
            col.name === oldName ? { ...col, name: newName } : col
          ),
        },
      },
    })),
  editColumnType: (
    tableName: string,
    columnName: string,
    newType: CellType,
    options?: string[]
  ) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableName]: {
          ...state.tables[tableName],
          columns: state.tables[tableName].columns.map((col) =>
            col.name === columnName ? { ...col, type: newType, options } : col
          ),
        },
      },
    })),
  deleteRow: (tableId: string, rowIndex: number) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: {
          ...state.tables[tableId],
          rows: state.tables[tableId].rows.filter(
            (_, index) => index !== rowIndex
          ),
        },
      },
    })),
  deleteRows: (tableId: string, rowIndices: number[]) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: {
          ...state.tables[tableId],
          rows: state.tables[tableId].rows.filter(
            (_, index) => !rowIndices.includes(index)
          ),
        },
      },
    })),
  deleteColumn: (tableId: string, columnName: string) =>
    set((state) => ({
      tables: {
        ...state.tables,
        [tableId]: {
          ...state.tables[tableId],
          columns: state.tables[tableId].columns.filter(
            (col) => col.name !== columnName
          ),
          rows: state.tables[tableId].rows.map((row) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [columnName]: _, ...rest } = row;
            return rest;
          }),
        },
      },
    })),
  getUniqueTableId: (baseName: string) => {
    const state = get();
    let id = generateTableId(baseName);
    let counter = 1;
    while (id in state.tables) {
      id = generateTableId(`${baseName} ${counter}`);
      counter++;
    }
    return id;
  },
}));
