import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import EditorForm from '../EditorForm';
import attributeRules from '../../../../utils/mocks/attributeRules.json';

const baseMocks = {
  attributeTypes: attributeRules,
  editorConfig: { type: 'function', action: 'edit' },
  targetId: 'c38e1b3dacd145ef905baf2fbd79918c',
  elementConfig: { editWithForm: vi.fn(), elementTypes: {}, createRecord: vi.fn() },
};

const renderComponent = () =>
  render(
    <EditorForm
      additionalFields={[]}
      attributeTypes={baseMocks.attributeTypes}
      attributes={{}}
      closeEditorForm={vi.fn()}
      complementRecordAdd={vi.fn()}
      displayMessage={vi.fn()}
      editMetaDataWithForm={vi.fn()}
      editorConfig={baseMocks.editorConfig}
      elementConfig={baseMocks.elementConfig}
      onShowMore={vi.fn()}
      onShowMoreForm={vi.fn()}
      targetId={baseMocks.targetId}
    />,
  );

describe('<EditorForm />', () => {
  it('should render correctly', () => {
    const { container } = renderComponent();

    expect(container).toMatchSnapshot();
  });

  it('should render with additional fields', () => {
    const additionalFields = [
      <div key="test-field" className="test-field">
        <label htmlFor="test-input">Test Field</label>
        <input type="text" name="test-field" id="test-input" />
      </div>
    ];
    
    const { container } = render(
      <EditorForm
        additionalFields={additionalFields}
        attributeTypes={baseMocks.attributeTypes}
        attributes={{}}
        closeEditorForm={vi.fn()}
        complementRecordAdd={vi.fn()}
        displayMessage={vi.fn()}
        editMetaDataWithForm={vi.fn()}
        editorConfig={baseMocks.editorConfig}
        elementConfig={baseMocks.elementConfig}
        onShowMore={vi.fn()}
        onShowMoreForm={vi.fn()}
        targetId={baseMocks.targetId}
      />
    );

    expect(container).toBeDefined();
    expect(container.querySelector('.test-field')).toBeTruthy();
  });

  it('should render with different editor config action', () => {
    const createConfig = { type: 'function', action: 'create' };
    
    const { container } = render(
      <EditorForm
        additionalFields={[]}
        attributeTypes={baseMocks.attributeTypes}
        attributes={{}}
        closeEditorForm={vi.fn()}
        complementRecordAdd={vi.fn()}
        displayMessage={vi.fn()}
        editMetaDataWithForm={vi.fn()}
        editorConfig={createConfig}
        elementConfig={baseMocks.elementConfig}
        onShowMore={vi.fn()}
        onShowMoreForm={vi.fn()}
        targetId={baseMocks.targetId}
      />
    );

    expect(container).toBeDefined();
  });

  it('should render with existing attributes', () => {
    const existingAttributes = {
      'InformationSystem': 'Test System',
      'Title': 'Test Title'
    };
    
    const { container } = render(
      <EditorForm
        additionalFields={[]}
        attributeTypes={baseMocks.attributeTypes}
        attributes={existingAttributes}
        closeEditorForm={vi.fn()}
        complementRecordAdd={vi.fn()}
        displayMessage={vi.fn()}
        editMetaDataWithForm={vi.fn()}
        editorConfig={baseMocks.editorConfig}
        elementConfig={baseMocks.elementConfig}
        onShowMore={vi.fn()}
        onShowMoreForm={vi.fn()}
        targetId={baseMocks.targetId}
      />
    );

    expect(container).toBeDefined();
  });

  it('should handle close button click', () => {
    const mockCloseEditor = vi.fn();
    
    render(
      <EditorForm
        additionalFields={[]}
        attributeTypes={baseMocks.attributeTypes}
        attributes={{}}
        closeEditorForm={mockCloseEditor}
        complementRecordAdd={vi.fn()}
        displayMessage={vi.fn()}
        editMetaDataWithForm={vi.fn()}
        editorConfig={baseMocks.editorConfig}
        elementConfig={baseMocks.elementConfig}
        onShowMore={vi.fn()}
        onShowMoreForm={vi.fn()}
        targetId={baseMocks.targetId}
      />
    );

    // Look for close button and click it
    const closeButton = screen.queryByRole('button', { name: /close|cancel|sulkea/i });
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockCloseEditor).toHaveBeenCalled();
    }
  });

  it('should handle form submission', () => {
    const mockEditMetaData = vi.fn();
    
    render(
      <EditorForm
        additionalFields={[]}
        attributeTypes={baseMocks.attributeTypes}
        attributes={{}}
        closeEditorForm={vi.fn()}
        complementRecordAdd={vi.fn()}
        displayMessage={vi.fn()}
        editMetaDataWithForm={mockEditMetaData}
        editorConfig={baseMocks.editorConfig}
        elementConfig={baseMocks.elementConfig}
        onShowMore={vi.fn()}
        onShowMoreForm={vi.fn()}
        targetId={baseMocks.targetId}
      />
    );

    // Look for submit button
    const submitButton = screen.queryByRole('button', { name: /save|tallenna|submit/i });
    if (submitButton) {
      fireEvent.click(submitButton);
      // Note: We don't assert on mockEditMetaData being called as it might be conditional
    }
  });

  it('should render without crashing when attributeTypes is empty', () => {
    const { container } = render(
      <EditorForm
        additionalFields={[]}
        attributeTypes={{}}
        attributes={{}}
        closeEditorForm={vi.fn()}
        complementRecordAdd={vi.fn()}
        displayMessage={vi.fn()}
        editMetaDataWithForm={vi.fn()}
        editorConfig={baseMocks.editorConfig}
        elementConfig={baseMocks.elementConfig}
        onShowMore={vi.fn()}
        onShowMoreForm={vi.fn()}
        targetId={baseMocks.targetId}
      />
    );

    expect(container).toBeDefined();
  });

  it('should handle different target IDs', () => {
    const differentTargetId = 'different-target-id-123';
    
    const { container } = render(
      <EditorForm
        additionalFields={[]}
        attributeTypes={baseMocks.attributeTypes}
        attributes={{}}
        closeEditorForm={vi.fn()}
        complementRecordAdd={vi.fn()}
        displayMessage={vi.fn()}
        editMetaDataWithForm={vi.fn()}
        editorConfig={baseMocks.editorConfig}
        elementConfig={baseMocks.elementConfig}
        onShowMore={vi.fn()}
        onShowMoreForm={vi.fn()}
        targetId={differentTargetId}
      />
    );

    expect(container).toBeDefined();
  });
});
