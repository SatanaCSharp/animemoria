import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import { ComponentType, ReactElement, ReactNode, useMemo } from 'react';

import { DownArrow } from '@/icons';

import type { Selection } from '@heroui/react';

type SelectItem = {
  key: string;
  element: ReactElement;
};

interface WrapperProps {
  children: ReactNode;
}

interface SingleSelectProps {
  items: SelectItem[];
  selectedValue: string;
  TriggerWrapper?: ComponentType<WrapperProps>;
  ItemWrapper?: ComponentType<WrapperProps>;
  renderTrigger?: (selectedElement: ReactElement | string) => ReactNode;
  renderItem?: (item: SelectItem) => ReactNode;
  onChange: <TSelectedValue extends string>(
    selectedValue: TSelectedValue,
  ) => void;
}

export const SingleSelect = ({
  TriggerWrapper,
  ItemWrapper,
  renderTrigger,
  renderItem,
  ...props
}: SingleSelectProps): ReactElement => {
  const selectedElement = useMemo(() => {
    const selectedItem = props.items.find(
      (it) => it.key === props.selectedValue,
    );
    return selectedItem?.element ?? '--';
  }, [props.items, props.selectedValue]);

  const onChange = (keys: Selection): void => {
    if (keys === 'all') {
      return;
    }

    const [selectedKey] = Array.from(keys);
    if (selectedKey) {
      props.onChange(String(selectedKey));
    }
  };

  // Render trigger content
  const triggerContent = useMemo(() => {
    if (renderTrigger) {
      return renderTrigger(selectedElement);
    }
    if (TriggerWrapper) {
      return <TriggerWrapper>{selectedElement}</TriggerWrapper>;
    }
    return <div>{selectedElement}</div>;
  }, [renderTrigger, TriggerWrapper, selectedElement]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <div className="flex flex-row items-center">
          {triggerContent} <DownArrow size={16} className="ml-2" />
        </div>
      </DropdownTrigger>
      <DropdownMenu
        color="default"
        selectedKeys={new Set([props.selectedValue])}
        selectionMode="single"
        variant="flat"
        onSelectionChange={onChange}
      >
        {props.items.map((item) => {
          const itemContent = renderItem ? (
            renderItem(item)
          ) : ItemWrapper ? (
            <ItemWrapper>{item.element}</ItemWrapper>
          ) : (
            item.element
          );

          return <DropdownItem key={item.key}>{itemContent}</DropdownItem>;
        })}
      </DropdownMenu>
    </Dropdown>
  );
};
