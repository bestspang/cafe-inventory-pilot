
import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useStores } from '@/context/StoresContext';
import CreateStoreDialog from './CreateStoreDialog';

export default function StoreSwitcher() {
  const { stores, currentStoreId, setCurrentStoreId, isLoading } = useStores();
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Find the current store
  const currentStore = stores.find((store) => store.id === currentStoreId);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a branch"
            className={cn("w-[200px] justify-between", isLoading && "opacity-70 cursor-not-allowed")}
            disabled={isLoading}
          >
            {currentStore ? (
              <div className="flex items-center">
                <Store className="mr-2 h-4 w-4" />
                <span className="truncate">{currentStore.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">
                {isLoading ? "Loading..." : "Select branch"}
              </span>
            )}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search branch..." />
            <CommandList>
              <CommandEmpty>No branches found.</CommandEmpty>
              <CommandGroup heading="Your Branches">
                {stores.map((store) => (
                  <CommandItem
                    key={store.id}
                    value={store.id}
                    onSelect={() => {
                      setCurrentStoreId(store.id);
                      setOpen(false);
                    }}
                  >
                    <Store className="mr-2 h-4 w-4" />
                    <span className="truncate">{store.name}</span>
                    {store.id === currentStoreId && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="p-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setOpen(false);
                  setShowCreateDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Branch
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
      
      <CreateStoreDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </>
  );
}
