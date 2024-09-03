import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface AddTableProps {
  onAddTable: (tableName: string) => void;
}

const AddTable: React.FC<AddTableProps> = ({ onAddTable }) => {
  const [newTableName, setNewTableName] = useState('');

  const handleAddTable = () => {
    if (newTableName.trim()) {
      onAddTable(newTableName);
      setNewTableName('');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="rounded-sm px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-gray-200">
          + Add
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Table</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-4 items-center gap-4 py-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            className="col-span-3"
          />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={handleAddTable}>
              Add
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddTable;
