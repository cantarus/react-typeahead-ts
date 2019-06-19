import { useCallback } from 'react';
import KeyEvent from '../../keyevent';
import useNav from './useNav';
import { OnOptionSelectArg, Option } from '../../types';

interface Props<Opt extends Option>
  extends Pick<React.InputHTMLAttributes<HTMLInputElement>, 'onKeyDown'> {
  filteredOptions: Opt[];
  selectionIndex: number | undefined;
  setSelectionIndex: (args: number | undefined) => void;
  selected: boolean;
  hasHint: boolean;
  handleOptionSelected: OnOptionSelectArg<Opt>;
  maxVisible: number | undefined;
  hasCustomValue: boolean;
  entryValue: string;
}

export default <T extends Option>(props: Props<T>) => {
  const {
    onKeyDown,
    handleOptionSelected,
    selected,
    hasHint,
    filteredOptions,
    maxVisible,
    hasCustomValue,
    entryValue,
    selectionIndex,
    setSelectionIndex,
  } = props;
  const { navUp, navDown, clearSelection, selection } = useNav({
    hasHint,
    filteredOptions,
    maxVisible,
    hasCustomValue,
    entryValue,
    selectionIndex,
    setSelectionIndex,
  });

  const onEnter = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!selection) {
        return onKeyDown && onKeyDown(event);
      }

      return handleOptionSelected(selection, event);
    },
    [onKeyDown, getSelection, handleOptionSelected, selection]
  );

  const onTab = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      let option: T | undefined =
        selection || filteredOptions.length > 0
          ? filteredOptions[0]
          : undefined;

      if (option === undefined && hasCustomValue) {
        option = entryValue as T;
      }

      if (option !== undefined) {
        return handleOptionSelected(option, event);
      }
    },
    [filteredOptions, getSelection, handleOptionSelected]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // If there are no visible elements, don't perform selector navigation.
      // Just pass this up to the upstream onKeydown handler.
      // Also skip if the user is pressing the shift key,
      // since none of our handlers are looking for shift
      if (!hasHint || event.shiftKey) {
        return onKeyDown && onKeyDown(event);
      }

      const events: {
        [key: string]: (event: React.KeyboardEvent<HTMLInputElement>) => void;
      } = {};
      events[KeyEvent.DOM_VK_UP] = navUp;
      events[KeyEvent.DOM_VK_DOWN] = navDown;
      events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = onEnter;
      events[KeyEvent.DOM_VK_ESCAPE] = clearSelection;
      events[KeyEvent.DOM_VK_TAB] = onTab;

      const handler = events[event.keyCode];
      if (handler) {
        handler(event);
        if (!selected) {
          // Don't propagate the keystroke back to the DOM/browser
          event.preventDefault();
        }
      } else {
        return onKeyDown && onKeyDown(event);
      }
    },
    [
      hasHint,
      navUp,
      navDown,
      onEnter,
      clearSelection,
      onTab,
      onKeyDown,
      selected,
    ]
  );

  return { handleKeyDown };
};
