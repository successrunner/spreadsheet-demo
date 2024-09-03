import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { ArrowUpDown } from 'lucide-react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { defaultColumns } from '@/lib/constants';
import { TableData, useTableStore } from '@/store/tableStore';

import AddColumn from './AddColumn';
import TableCellInput from './TableCellInput';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';

interface DataTableProps {
  data: TableData;
}

export function DataTable({ data }: DataTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const { addRow, deleteRows, deleteColumn } = useTableStore();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [focusedCell, setFocusedCell] = useState<{
    rowIndex: number;
    columnIndex: number;
  } | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<unknown>[] = defaultColumns.concat(
    data.columns.map((column) => ({
      accessorKey: column.name,
      header: ({ column: curColumn }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              curColumn.toggleSorting(curColumn.getIsSorted() === 'asc')
            }
          >
            {column.name}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row, column: curColumn, getValue }) => {
        const initialValue = getValue() as string;
        return (
          <TableCellInput
            tableId={data.id}
            options={column.options}
            rowIndex={row.index}
            columnId={curColumn.id}
            columnType={column.type}
            initialValue={initialValue}
          />
        );
      },
    }))
  );

  const table = useReactTable({
    data: data.rows,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
  });

  useEffect(() => {
    if (focusedCell && tableRef.current) {
      const cell = tableRef.current.querySelector(
        `[data-row="${focusedCell.rowIndex}"][data-col="${focusedCell.columnIndex}"]`
      ) as HTMLElement;
      if (cell) {
        cell.focus();
      }
    }
  }, [focusedCell]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    if (!focusedCell) return;

    const { rowIndex, columnIndex } = focusedCell;
    const visibleColumns = table.getVisibleLeafColumns();
    const rows = table.getRowModel().rows;

    switch (e.key) {
      case 'ArrowUp':
        if (rowIndex > 0)
          setFocusedCell({ rowIndex: rowIndex - 1, columnIndex });
        break;
      case 'ArrowDown':
        if (rowIndex < rows.length - 1)
          setFocusedCell({ rowIndex: rowIndex + 1, columnIndex });
        break;
      case 'ArrowLeft':
        if (columnIndex > 0)
          setFocusedCell({ rowIndex, columnIndex: columnIndex - 1 });
        break;
      case 'ArrowRight':
        if (columnIndex < visibleColumns.length - 1)
          setFocusedCell({ rowIndex, columnIndex: columnIndex + 1 });
        break;
    }
  };

  const handleAddRow = () => {
    const newRow = data.columns.reduce(
      (acc, col) => {
        acc[col.name] = '';
        return acc;
      },
      {} as Record<string, string>
    );
    addRow(data.id, newRow);
  };

  const handleRemoveSelectedRows = () => {
    const selectedRowIds = Object.keys(rowSelection);
    deleteRows(
      data.id,
      selectedRowIds.map((id) => parseInt(id, 10))
    );
    setRowSelection({});
  };

  const handleHideColumn = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: false,
    }));
  };

  const handleDeleteColumn = (columnId: string) => {
    deleteColumn(data.id, columnId);
  };

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        <Button onClick={handleAddRow}>Add Row</Button>
        <AddColumn tableId={data.id} />
        <Button
          variant="destructive"
          onClick={handleRemoveSelectedRows}
          disabled={Object.keys(rowSelection).length === 0}
        >
          Remove Selected Rows
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table
        ref={tableRef}
        onKeyDown={handleKeyDown}
        style={{ width: table.getCenterTotalSize() }}
        className="rounded-md border"
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.getSize(),
                    }}
                    colSpan={header.colSpan}
                    className="relative border"
                  >
                    <ContextMenu>
                      <ContextMenuTrigger>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={() => handleHideColumn(header.column.id)}
                        >
                          Hide
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => handleDeleteColumn(header.column.id)}
                        >
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                    <div
                      {...{
                        onDoubleClick: () => header.column.resetSize(),
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `resizer ${
                          table.options.columnResizeDirection
                        } ${header.column.getIsResizing() ? 'isResizing' : ''}`,
                        style: {
                          transform: header.column.getIsResizing()
                            ? `translateX(${
                                (table.options.columnResizeDirection === 'rtl'
                                  ? -1
                                  : 1) *
                                (table.getState().columnSizingInfo
                                  .deltaOffset ?? 0)
                              }px)`
                            : '',
                        },
                      }}
                    />
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell, columnIndex) => (
                  <TableCell
                    key={cell.id}
                    data-row={rowIndex}
                    data-col={columnIndex}
                    tabIndex={-1}
                    onFocus={(e) => {
                      if (e.target === e.currentTarget) {
                        setFocusedCell({ rowIndex, columnIndex });
                      }
                    }}
                    style={{ width: cell.column.getSize() }}
                    className={clsx('border', {
                      'px-1 py-0': columnIndex !== 0,
                    })}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
