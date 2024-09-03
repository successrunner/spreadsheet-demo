import clsx from 'clsx';
import { useState } from 'react';

import { useTableStore } from '@/store/tableStore';

import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface TableCellInputProps {
  tableId: string;
  options?: string[];
  rowIndex: number;
  columnId: string;
  columnType: 'text' | 'number' | 'select';
  initialValue: string;
}

export default function TableCellInput({
  tableId,
  options,
  rowIndex,
  columnId,
  columnType,
  initialValue,
}: TableCellInputProps) {
  const { editCell } = useTableStore();
  const [value, setValue] = useState(initialValue);
  const [isEditable, setIsEditable] = useState(false);

  const finishEditing = () => {
    editCell(tableId, rowIndex, columnId, value);
    setIsEditable(false);
  };

  const onKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      finishEditing();
    }
  };

  const handleDoubleClick = (
    e: React.MouseEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    if (isEditable) return;
    setIsEditable(true);
  };

  const renderInput = () => {
    switch (columnType) {
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onBlur={finishEditing}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            readOnly={!isEditable}
            className={clsx('border-none', { 'cursor-pointer': !isEditable })}
            onDoubleClick={handleDoubleClick}
          />
        );
      case 'select':
        return (
          <Select
            value={value}
            onOpenChange={(open) => {
              if (!open) {
                finishEditing();
              }
            }}
            onValueChange={(newValue) => setValue(newValue)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'text':
      default:
        return (
          <Input
            value={value}
            onBlur={finishEditing}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            readOnly={!isEditable}
            className={clsx('border-none', { 'cursor-pointer': !isEditable })}
            onDoubleClick={handleDoubleClick}
          />
        );
    }
  };

  return renderInput();
}
