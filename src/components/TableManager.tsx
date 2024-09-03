import { TabsContent } from '@radix-ui/react-tabs';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useTableStore } from '../store/tableStore';
import AddTable from './AddTable';
import { DataTable } from './DataTable';

export function TableManager() {
  const { tables, addTable } = useTableStore();

  const handleAddTable = (tableName: string) => {
    if (tableName.trim()) {
      addTable(tableName, [
        { name: 'email', type: 'text' },
        { name: 'amount', type: 'number' },
        {
          name: 'status',
          type: 'select',
          options: ['pending', 'completed', 'failed'],
        },
      ]);
    }
  };

  return (
    <>
      <Tabs defaultValue={Object.keys(tables)[0]}>
        <TabsList className="w-full justify-start">
          {Object.entries(tables).map(([tableId, table]) => (
            <TabsTrigger key={tableId} value={tableId}>
              {table.name}
            </TabsTrigger>
          ))}
          <div className="ml-auto flex items-center space-x-2">
            <AddTable onAddTable={handleAddTable} />
          </div>
        </TabsList>
        {Object.entries(tables).map(([tableId, table]) => (
          <TabsContent key={tableId} value={tableId}>
            <div className="px-1 py-1">
              <DataTable data={table} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
