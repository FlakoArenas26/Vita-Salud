"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandItem, CommandList, CommandInput } from "@/components/ui/command";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ComboboxContextValue {
  items: any[];
  filteredItems: any[];
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  value: string;
  onValueChange: (value: string) => void;
  itemValue: (item: any) => string;
  itemLabel: (item: any) => string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ComboboxContext = React.createContext<ComboboxContextValue | undefined>(undefined);

const useCombobox = () => {
  const context = React.useContext(ComboboxContext);
  if (!context) {
    throw new Error("Combobox components must be used inside a Combobox.");
  }
  return context;
};

interface ComboboxProps<T> {
  items: T[];
  value: string;
  onValueChange: (value: string) => void;
  itemValue: (item: T) => string;
  itemLabel: (item: T) => string;
  children: React.ReactNode;
}

function Combobox<T>({
  items,
  value,
  onValueChange,
  itemValue,
  itemLabel,
  children,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const filteredItems = React.useMemo(
    () =>
      items.filter((item) =>
        itemLabel(item).toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [items, query, itemLabel],
  );

  return (
    <ComboboxContext.Provider
      value={{
        items,
        filteredItems,
        query,
        setQuery,
        value,
        onValueChange,
        itemValue,
        itemLabel,
        open,
        setOpen,
      }}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </PopoverPrimitive.Root>
    </ComboboxContext.Provider>
  );
}

const ComboboxInput = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button"> & { placeholder?: string }>(
  ({ className, placeholder, ...props }, ref) => {
    const { open, setOpen, value, items, itemValue, itemLabel } = useCombobox();

    const selectedItem = React.useMemo(
      () => items.find((item) => itemValue(item) === value),
      [items, value, itemValue],
    );

    return (
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          role="combobox"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          <span className="truncate">
            {selectedItem ? itemLabel(selectedItem) : (placeholder ?? "Seleccionar...")}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
    );
  },
);
ComboboxInput.displayName = "ComboboxInput";

const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  Omit<React.ComponentPropsWithoutRef<typeof PopoverContent>, "style">
>(({ className, children, ...props }, ref) => {
  const { query, setQuery } = useCombobox();
  return (
    <PopoverContent
      ref={ref}
      align="start"
      sideOffset={4}
      className={cn("p-0", className)}
      style={{ width: "var(--radix-popover-trigger-width)", maxHeight: "none" }}
      {...props}
    >
      <div className="overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
        <Command>
          <CommandInput 
            placeholder="Escribe para buscar..." 
            value={query} 
            onValueChange={setQuery} 
          />
          {children}
        </Command>
      </div>
    </PopoverContent>
  );
});
ComboboxContent.displayName = "ComboboxContent";

const ComboboxList = React.forwardRef<
  React.ElementRef<typeof CommandList>,
  Omit<React.ComponentPropsWithoutRef<typeof CommandList>, "children"> & {
    children: (item: any) => React.ReactNode;
  }
>(({ className, children, ...props }, ref) => {
  const { filteredItems } = useCombobox();

  return (
    <CommandList ref={ref} className={cn("max-h-60 overflow-y-auto", className)} {...props}>
      {filteredItems.map((item, index) => (
        <React.Fragment key={index}>{children(item)}</React.Fragment>
      ))}
    </CommandList>
  );
});
ComboboxList.displayName = "ComboboxList";

const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof CommandEmpty>,
  React.ComponentPropsWithoutRef<typeof CommandEmpty>
>(({ className, ...props }, ref) => (
  <CommandEmpty ref={ref} className={cn("py-6 text-center text-sm", className)} {...props} />
));
ComboboxEmpty.displayName = "ComboboxEmpty";

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem> & {
    item: any;
  }
>(({ item, className, children, ...props }, ref) => {
  const { onValueChange, itemValue, itemLabel, setOpen, value } = useCombobox();
  const isSelected = itemValue(item) === value;

  return (
    <CommandItem
      ref={ref}
      className={cn("cursor-pointer flex items-center justify-between", className)}
      onSelect={() => {
        setOpen(false);
        onValueChange(itemValue(item));
      }}
      {...props}
    >
      <span className="truncate">{children ?? itemLabel(item)}</span>
      {isSelected && <Check className="ml-2 h-4 w-4 shrink-0 opacity-100" />}
    </CommandItem>
  );
});
ComboboxItem.displayName = "ComboboxItem";

export { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList };

