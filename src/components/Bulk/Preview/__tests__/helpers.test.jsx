import { render } from '@testing-library/react';

import helpers from '../helpers';

const mockGetAttributeName = vi.fn((attr) => `Attribute: ${attr}`);

describe('Preview helpers', () => {
  describe('renderAttributeChange', () => {
    it('renders attribute change correctly', () => {
      const item = { id: '1' };
      const attribute = 'testAttr';
      const value = 'newValue';
      const currentValue = 'oldValue';

      const result = helpers.renderAttributeChange(item, attribute, value, mockGetAttributeName, currentValue);
      const { container } = render(result);

      expect(container.querySelector('h4')).toBeTruthy();
      expect(container.textContent).toContain('Attribute: testAttr');
      expect(container.textContent).toContain('(oldValue)');
      expect(container.textContent).toContain('newValue');
    });

    it('renders with default current value when not provided', () => {
      const item = { id: '1' };
      const attribute = 'testAttr';
      const value = 'newValue';

      const result = helpers.renderAttributeChange(item, attribute, value, mockGetAttributeName);
      const { container } = render(result);

      expect(container.textContent).toContain('( )');
    });
  });

  describe('renderFunctionAttributeChange', () => {
    it('renders function attribute change correctly', () => {
      const item = { id: '1' };
      const attribute = { value: 'testAttr', label: 'Test Label' };
      const value = 'newValue';
      const currentValue = 'oldValue';

      const result = helpers.renderFunctionAttributeChange(item, attribute, value, currentValue);
      const { container } = render(result);

      expect(container.querySelector('h4')).toBeTruthy();
      expect(container.textContent).toContain('Test Label');
      expect(container.textContent).toContain('(oldValue)');
      expect(container.textContent).toContain('newValue');
    });

    it('renders with default current value when not provided', () => {
      const item = { id: '1' };
      const attribute = { value: 'testAttr', label: 'Test Label' };
      const value = 'newValue';

      const result = helpers.renderFunctionAttributeChange(item, attribute, value);
      const { container } = render(result);

      expect(container.textContent).toContain('( )');
    });
  });

  describe('renderPhaseChanges', () => {
    it('renders phase changes with attributes', () => {
      const changed = {
        phases: {
          'phase1': {
            attributes: {
              'attr1': 'value1'
            }
          }
        }
      };
      const item = {
        phases: [
          { id: 'phase1', name: 'Test Phase', attributes: { attr1: 'oldValue' } }
        ]
      };
      const changes = [];

      helpers.renderPhaseChanges(changed, item, changes, mockGetAttributeName);

      expect(changes).toHaveLength(1);
      const { container } = render(changes[0]);
      expect(container.textContent).toContain('Test Phase');
      expect(container.textContent).toContain('Attribute: attr1');
    });

    it('renders phase changes with actions', () => {
      const changed = {
        phases: {
          'phase1': {
            actions: {
              'action1': {
                attributes: {
                  'attr1': 'value1'
                }
              }
            }
          }
        }
      };
      const item = {
        phases: [
          {
            id: 'phase1',
            name: 'Test Phase',
            actions: [
              { id: 'action1', name: 'Test Action', attributes: { attr1: 'oldValue' } }
            ]
          }
        ]
      };
      const changes = [];

      helpers.renderPhaseChanges(changed, item, changes, mockGetAttributeName);

      expect(changes).toHaveLength(1);
      const { container } = render(changes[0]);
      expect(container.textContent).toContain('Test Phase');
      expect(container.textContent).toContain('Test Action');
    });

    it('handles empty phases', () => {
      const changed = { phases: {} };
      const item = { phases: [] };
      const changes = [];

      helpers.renderPhaseChanges(changed, item, changes, mockGetAttributeName);

      expect(changes).toHaveLength(0);
    });
  });

  describe('renderActionErrors', () => {
    it('renders action errors correctly', () => {
      const phaseError = {
        actions: {
          'action1': {
            attributes: ['attr1', 'attr2']
          }
        }
      };
      const phase = {
        actions: [
          { id: 'action1', name: 'Test Action' }
        ]
      };
      const elem = [];

      helpers.renderActionErrors(phaseError, phase, elem, mockGetAttributeName);

      expect(elem).toHaveLength(1);
      const { container } = render(elem[0]);
      expect(container.textContent).toContain('Test Action');
      expect(container.textContent).toContain('Attribute: attr1, Attribute: attr2');
    });

    it('renders record errors correctly', () => {
      const phaseError = {
        actions: {
          'action1': {
            records: {
              'record1': {
                attributes: ['attr1']
              }
            }
          }
        }
      };
      const phase = {
        actions: [
          {
            id: 'action1',
            name: 'Test Action',
            records: [
              { id: 'record1', name: 'Test Record' }
            ]
          }
        ]
      };
      const elem = [];

      helpers.renderActionErrors(phaseError, phase, elem, mockGetAttributeName);

      expect(elem).toHaveLength(1);
      const { container } = render(elem[0]);
      expect(container.textContent).toContain('Test Record');
      expect(container.textContent).toContain('Attribute: attr1');
    });

    it('handles empty action errors', () => {
      const phaseError = {};
      const phase = { actions: [] };
      const elem = [];

      helpers.renderActionErrors(phaseError, phase, elem, mockGetAttributeName);

      expect(elem).toHaveLength(0);
    });
  });
});
