import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CellType, Column, useTableStore } from '@/store/tableStore';

const AddColumn: React.FC<{ tableId: string }> = ({ tableId }) => {
  const { addColumn } = useTableStore();

  const [newOption, setNewOption] = useState('');
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState<CellType>('text');
  const [selectOptions, setSelectOptions] = useState<string[]>([]);

  const handleAddOption = () => {
    if (newOption.trim()) {
      setSelectOptions([...selectOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (indexToRemove: number) => {
    setSelectOptions(
      selectOptions.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSave = () => {
    if (columnName && columnType) {
      const newColumn: Column = {
        name: columnName,
        type: columnType,
        options: columnType === 'select' ? selectOptions : undefined,
      };
      addColumn(tableId, newColumn);

      setColumnName('');
      setColumnType('text');
      setSelectOptions([]);
      setNewOption('');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Add Column</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Column</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select onValueChange={(value) => setColumnType(value as CellType)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select column type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                {/* Add more column types as needed */}
              </SelectContent>
            </Select>
          </div>
          {columnType === 'select' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="option" className="text-right">
                  Option
                </Label>
                <Input
                  id="option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="col-span-2"
                />
                <Button onClick={handleAddOption}>Add</Button>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Options</Label>
                <ul className="col-span-3 flex list-disc flex-col gap-4 pl-5">
                  {selectOptions.map((option, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span>{option}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={handleSave}>
              Save changes
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddColumn;
