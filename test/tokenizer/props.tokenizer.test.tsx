import * as React from 'react';
import { mount } from 'enzyme';
import Tokenizer from '../../src/Tokenizer';
import Keyevent from '../../src/keyevent';
import simulateTextInput from '../helpers/simulateTextInput';
import simulateKeyEvent from '../helpers/simulateKeyEvent';
import { BEATLES, BEATLES_COMPLEX } from '../helpers/data';

describe('TypeaheadTokenizer Component props', () => {
  describe('displayOption', () => {
    test('renders simple options verbatim when not specified', () => {
      const component = mount(<Tokenizer options={BEATLES} />);
      const results = simulateTextInput(component, 'john');
      expect(results.text()).toEqual('John');
    });

    test('renders custom options when specified as a string', () => {
      const component = mount(
        <Tokenizer
          options={BEATLES_COMPLEX}
          filterOption="firstName"
          displayOption="nameWithTitle"
        />
      );
      const results = simulateTextInput(component, 'john');
      expect(results.text()).toEqual('John Winston Ono Lennon MBE');
    });

    test('renders custom options when specified as a function', () => {
      const component = mount(
        <Tokenizer
          options={BEATLES_COMPLEX}
          filterOption="firstName"
          displayOption={(o, i) => `${i} ${o.firstName} ${o.lastName}`}
        />
      );
      const results = simulateTextInput(component, 'john');
      expect(results.text()).toEqual('0 John Lennon');
    });
  });

  describe('formInputOption', () => {
    test('uses displayOption for the custom option value by default', () => {
      const component = mount(
        <Tokenizer
          name="tokenizer"
          options={BEATLES_COMPLEX}
          filterOption="firstName"
          displayOption="nameWithTitle"
        />
      );

      simulateKeyEvent(component, Keyevent.DOM_VK_DOWN);
      simulateKeyEvent(component, Keyevent.DOM_VK_DOWN);
      simulateKeyEvent(component, Keyevent.DOM_VK_RETURN);

      const tokens = component.find('div.typeahead-token');
      expect(tokens).toHaveLength(1);
      expect(
        component.find('input[name="tokenizer[]"]').get(0).props.value
      ).toEqual('John Winston Ono Lennon MBE');
    });

    test('renders custom option value when specified as a string', () => {
      const component = mount(
        <Tokenizer
          name="tokenizer"
          options={BEATLES_COMPLEX}
          filterOption="firstName"
          displayOption="nameWithTitle"
          formInputOption="lastName"
        />
      );
      simulateTextInput(component, 'john');

      simulateKeyEvent(component, Keyevent.DOM_VK_DOWN); // Activate
      simulateKeyEvent(component, Keyevent.DOM_VK_DOWN);
      simulateKeyEvent(component, Keyevent.DOM_VK_RETURN);

      const tokens = component.find('div.typeahead-token');
      expect(tokens).toHaveLength(1);

      expect(
        component.find('input[name="tokenizer[]"]').get(0).props.value
      ).toEqual('Lennon');
    });

    test('renders custom option value when specified as a function', () => {
      const component = mount(
        <Tokenizer
          name="tokenizer"
          options={BEATLES_COMPLEX}
          filterOption="firstName"
          displayOption="nameWithTitle"
          formInputOption={o => `${o.firstName} ${o.lastName}`}
        />
      );
      simulateTextInput(component, 'john');

      simulateKeyEvent(component, Keyevent.DOM_VK_DOWN);
      simulateKeyEvent(component, Keyevent.DOM_VK_DOWN);
      simulateKeyEvent(component, Keyevent.DOM_VK_RETURN);

      const tokens = component.find('div.typeahead-token');
      expect(tokens).toHaveLength(1);

      expect(
        component.find('input[name="tokenizer[]"]').get(0).props.value
      ).toEqual('John Lennon');
    });
  });
});
