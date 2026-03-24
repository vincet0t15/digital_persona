'use client';

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';

type CustomComboBoxItem = { value: string; label: string };

interface CustomComboBoxProps {
    items: CustomComboBoxItem[];
    placeholder: string;
    value?: string | null;
    defaultValue?: string | null;
    onSelect?: (value: string | null) => void;
}
export function CustomComboBox({ items, placeholder, value, defaultValue, onSelect }: CustomComboBoxProps) {
    const selectedItem = value == null ? null : (items.find((item) => item.value === value) ?? null);

    const defaultSelectedItem = defaultValue == null ? null : (items.find((item) => item.value === defaultValue) ?? null);

    return (
        <Combobox
            items={items}
            itemToStringValue={(item: CustomComboBoxItem) => item.label}
            value={value === undefined ? undefined : selectedItem}
            defaultValue={defaultValue === undefined ? undefined : defaultSelectedItem}
            onValueChange={(item: CustomComboBoxItem | null) => onSelect?.(item?.value ?? null)}
        >
            <ComboboxInput placeholder={placeholder} />
            <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                    {(item) => (
                        <ComboboxItem key={item.value} value={item}>
                            {item.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
