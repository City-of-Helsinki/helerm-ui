import { BrowserRouter } from 'react-router-dom';
import { fireEvent, waitFor, render } from '@testing-library/react';

import InfinityMenu from '../InfinityMenu';
import { navigationStateFilters } from '../../../constants';

vi.mock('react-sticky-el', () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock('../../Exporter', () => ({
  default: () => <div data-testid='exporter' />,
}));

// Build a predictable tree for test assertions
const buildSimpleTree = () => [
  {
    id: 'node-1',
    name: '01 Root One',
    code: '01',
    title: 'Root One',
    path: [],
    isOpen: false,
    isSearchOpen: false,
    function_state: 'approved',
    children: [
      {
        id: 'leaf-1',
        name: '01 01 Leaf One',
        code: '01 01',
        title: 'Leaf One',
        path: ['01 Root One'],
        function: 'func-1',
        isOpen: false,
      },
      {
        id: 'leaf-2',
        name: '01 02 Leaf Two',
        code: '01 02',
        title: 'Leaf Two',
        path: ['01 Root One'],
        function: 'func-2',
        isOpen: false,
      },
    ],
  },
  {
    id: 'node-2',
    name: '02 Root Two',
    code: '02',
    title: 'Root Two',
    path: [],
    isOpen: false,
    isSearchOpen: false,
    function_state: 'draft',
    children: [
      {
        id: 'leaf-3',
        name: '02 01 Leaf Three',
        code: '02 01',
        title: 'Leaf Three',
        path: ['02 Root Two'],
        isOpen: false,
      },
    ],
  },
];

const defaultProps = {
  addSearchInput: vi.fn(),
  removeSearchInput: vi.fn(),
  setSearchInput: vi.fn(),
  searchInputs: [''],
  filters: navigationStateFilters,
  handleFilterChange: vi.fn(),
  isUser: false,
  isFetching: false,
  isSearching: false,
  isSearchChanged: false,
  isDetailSearch: false,
  isOpen: true,
  toggleNavigationVisibility: vi.fn(),
  onNodeMouseClick: vi.fn(),
  onLeafMouseClick: vi.fn(),
  path: [],
  tree: [],
};

const renderMenu = (props = {}) =>
  render(
    <BrowserRouter>
      <InfinityMenu {...defaultProps} {...props} />
    </BrowserRouter>,
  );

describe('<InfinityMenu />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the navigation menu container', () => {
      const { container } = renderMenu();
      expect(container.querySelector('#navigation-menu')).toBeInTheDocument();
    });

    it('renders EmptyTree when tree is empty, not fetching, after initialization', async () => {
      // Simulate the fetch lifecycle: first isFetching=true (ends initialization),
      // then isFetching=false with empty result → EmptyTree should appear.
      const { queryByText, rerender } = renderMenu({ isFetching: true, tree: [] });

      rerender(
        <BrowserRouter>
          <InfinityMenu {...defaultProps} isFetching={false} tree={[]} />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(queryByText(/Ei tuloksia/)).toBeInTheDocument();
      });
    });

    it('suppresses EmptyTree while initializing (isFetching=true, tree=[])', () => {
      // On the very first render before any fetch starts, EmptyTree must not flash.
      // isInitializing stays true when both isFetching=false and tree=[] on first render.
      const { queryByText } = renderMenu({ isFetching: false, tree: [] });
      expect(queryByText(/Ei tuloksia/)).toBeNull();
    });

    it('renders a node button for each root-level item', async () => {
      const tree = buildSimpleTree();
      const { getAllByRole } = renderMenu({ tree });

      await waitFor(() => {
        const buttons = getAllByRole('button');
        const nodeButtons = buttons.filter((b) => b.classList.contains('infinity-menu-node-container'));
        expect(nodeButtons.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('renders node buttons with the node name as label', async () => {
      const tree = buildSimpleTree();
      const { getByText } = renderMenu({ tree });

      await waitFor(() => {
        expect(getByText(/01 Root One/)).toBeInTheDocument();
        expect(getByText(/02 Root Two/)).toBeInTheDocument();
      });
    });

    it('renders children as list items when node isOpen is true', async () => {
      const tree = buildSimpleTree();
      tree[0].isOpen = true;

      const { findByText } = renderMenu({ tree });

      // Wait for the open root to render first (forces a commit cycle so
      // setDisplayTreeRef.current is populated before any leaf assertion).
      expect(await findByText(/01 Root One/)).toBeInTheDocument();
      expect(await findByText(/01 01 Leaf One/)).toBeInTheDocument();
      expect(await findByText(/01 02 Leaf Two/)).toBeInTheDocument();
    });

    it('does not render children when node isOpen is false', async () => {
      const tree = buildSimpleTree();

      const { findByText, queryByText } = renderMenu({ tree });

      // Wait for the closed root to commit before asserting absence of leaves.
      expect(await findByText(/01 Root One/)).toBeInTheDocument();
      expect(queryByText(/01 01 Leaf One/)).toBeNull();
    });

    it('renders leaf with new-leaf class when function field is missing', async () => {
      const tree = buildSimpleTree();
      tree[1].isOpen = true; // Open node-2 to see leaf-3 (no function field)

      const { container, findByText } = renderMenu({ tree });

      expect(await findByText(/02 Root Two/)).toBeInTheDocument();
      await waitFor(() => {
        const newLeaf = container.querySelector('.new-leaf');
        expect(newLeaf).toBeInTheDocument();
      });
    });

    it('renders leaf without new-leaf class when function field is present', async () => {
      const tree = buildSimpleTree();
      tree[0].isOpen = true; // Open node-1 — leaf-1 and leaf-2 have function field

      const { container, findByText } = renderMenu({ tree });

      expect(await findByText(/01 Root One/)).toBeInTheDocument();
      await waitFor(() => {
        const leaves = container.querySelectorAll('.infinity-menu-leaf-container');
        expect(leaves.length).toBeGreaterThanOrEqual(1);
        // Leaves with function should not have new-leaf class
        leaves.forEach((leaf) => {
          expect(leaf.classList.contains('new-leaf')).toBe(false);
        });
      });
    });

    it('does not render navigation-container when isOpen is false', () => {
      const { container } = renderMenu({ isOpen: false });
      expect(container.querySelector('.navigation-container')).toBeNull();
    });

    it('renders navigation-container when isOpen is true', async () => {
      const { container } = renderMenu({ isOpen: true });
      await waitFor(() => {
        expect(container.querySelector('.navigation-container')).toBeInTheDocument();
      });
    });
  });

  describe('Node interaction', () => {
    it('clicking a closed node calls onNodeMouseClick with that node isOpen set to true', async () => {
      const onNodeMouseClick = vi.fn();
      const tree = buildSimpleTree();

      const { container } = renderMenu({ tree, onNodeMouseClick });

      await waitFor(() => {
        const nodeBtn = container.querySelector('.infinity-menu-node-container');
        expect(nodeBtn).toBeInTheDocument();
      });

      const nodeBtn = container.querySelector('.infinity-menu-node-container');
      fireEvent.click(nodeBtn);

      expect(onNodeMouseClick).toHaveBeenCalledOnce();
      const [, newTree] = onNodeMouseClick.mock.calls[0];
      expect(newTree[0].isOpen).toBe(true);
    });

    it('clicking an open node calls onNodeMouseClick with that node isOpen set to false', async () => {
      const onNodeMouseClick = vi.fn();
      const tree = buildSimpleTree();
      tree[0].isOpen = true;

      const { container } = renderMenu({ tree, onNodeMouseClick });

      await waitFor(() => {
        const nodeBtns = container.querySelectorAll('.infinity-menu-node-container');
        expect(nodeBtns.length).toBeGreaterThanOrEqual(1);
      });

      // The first button is node-1 (already open)
      const openNodeBtn = container.querySelectorAll('.infinity-menu-node-container')[0];
      fireEvent.click(openNodeBtn);

      expect(onNodeMouseClick).toHaveBeenCalledOnce();
      const [, newTree] = onNodeMouseClick.mock.calls[0];
      expect(newTree[0].isOpen).toBe(false);
    });

    it('leaf click invokes onLeafMouseClick with the leaf data', async () => {
      const onLeafMouseClick = vi.fn();
      const tree = buildSimpleTree();
      tree[0].isOpen = true;

      const { container } = renderMenu({ tree, onLeafMouseClick });

      await waitFor(() => {
        expect(container.querySelector('.infinity-menu-leaf-container')).toBeInTheDocument();
      });

      const leaf = container.querySelector('.infinity-menu-leaf-container');
      fireEvent.click(leaf);

      expect(onLeafMouseClick).toHaveBeenCalledOnce();
      expect(onLeafMouseClick.mock.calls[0][1].id).toBe('leaf-1');
    });
  });

  describe('Search filtering', () => {
    it('empty search input shows the full unfiltered tree', async () => {
      const tree = buildSimpleTree();
      const { queryByText } = renderMenu({ tree, searchInputs: [''], isSearchChanged: false });
      await waitFor(() => {
        expect(queryByText(/01 Root One/)).toBeInTheDocument();
        expect(queryByText(/02 Root Two/)).toBeInTheDocument();
      });
    });
    it('non-empty search filters nodes by name substring match', async () => {
      const tree = buildSimpleTree();
      tree[0].isOpen = true;
      const { queryByText } = renderMenu({
        tree,
        searchInputs: ['Root One'],
        isSearchChanged: true,
        isSearching: true,
      });
      await waitFor(() => {
        // "01 Root One" should still appear (it matches the search)
        expect(queryByText(/01 Root One/)).toBeInTheDocument();
      });
    });
    it('search expands parent nodes whose leaf children match', async () => {
      const tree = buildSimpleTree();
      const { queryByText } = renderMenu({
        tree,
        searchInputs: ['Leaf One'],
        isSearchChanged: true,
        isSearching: true,
      });
      await waitFor(() => {
        // The leaf should appear (parent expanded due to isSearchOpen)
        expect(queryByText(/01 01 Leaf One/)).toBeInTheDocument();
      });
    });
    it('search hides non-matching nodes', async () => {
      const tree = buildSimpleTree();
      const { queryByText } = renderMenu({
        tree,
        searchInputs: ['Leaf One'],
        isSearchChanged: true,
        isSearching: true,
      });
      await waitFor(() => {
        // "02 Root Two" has no matching children, should not be visible
        expect(queryByText(/02 Root Two/)).toBeNull();
      });
    });
  });

  describe('Load more', () => {
    it('shows load-more button when leaves exceed maxLeaves', async () => {
      const tree = buildSimpleTree();
      tree[0].isOpen = true;
      // maxLeaves=1, but node-1 has 2 children
      const { getByText } = renderMenu({ tree, maxLeaves: 1 });
      await waitFor(() => {
        expect(getByText(/Näytä lisää/)).toBeInTheDocument();
      });
    });
    it('clicking load-more calls onNodeMouseClick with increased maxLeaves', async () => {
      const onNodeMouseClick = vi.fn();
      const tree = buildSimpleTree();
      tree[0].isOpen = true;
      const { getByText } = renderMenu({ tree, maxLeaves: 1, onNodeMouseClick });
      await waitFor(() => {
        expect(getByText(/Näytä lisää/)).toBeInTheDocument();
      });
      fireEvent.click(getByText(/Näytä lisää/));
      expect(onNodeMouseClick).toHaveBeenCalledOnce();
    });
  });

  describe('Detail search UI', () => {
    it('isDetailSearch=true renders Sisältöhaku heading when tree has items', async () => {
      const tree = buildSimpleTree();
      const { getByText } = renderMenu({ tree, isDetailSearch: true });
      await waitFor(() => {
        expect(getByText('Sisältöhaku')).toBeInTheDocument();
      });
    });
    it('isDetailSearch=false does not render Sisältöhaku heading', async () => {
      const tree = buildSimpleTree();
      const { queryByText } = renderMenu({ tree, isDetailSearch: false });
      await waitFor(() => {
        expect(queryByText('Sisältöhaku')).toBeNull();
      });
    });
    it('isDetailSearch=false renders the classification-tree link', async () => {
      const tree = buildSimpleTree();
      const { container } = renderMenu({ tree, isDetailSearch: false });
      await waitFor(() => {
        expect(container.querySelector('.classification-link')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation header', () => {
    it('nav-button click calls toggleNavigationVisibility', async () => {
      const toggleNavigationVisibility = vi.fn();
      const { container } = renderMenu({ toggleNavigationVisibility });
      const navBtn = container.querySelector('.nav-button');
      fireEvent.click(navBtn);
      expect(toggleNavigationVisibility).toHaveBeenCalledOnce();
    });
    it('breadcrumb path items render as li elements', async () => {
      const path = ['Taso 1', 'Taso 2'];
      const { container } = renderMenu({ path });
      await waitFor(() => {
        const breadcrumb = container.querySelector('.breadcrumb');
        expect(breadcrumb).toBeInTheDocument();
        const items = breadcrumb.querySelectorAll('li');
        expect(items).toHaveLength(2);
        expect(items[0].textContent).toBe('Taso 1');
        expect(items[1].textContent).toBe('Taso 2');
      });
    });
    it('clicking breadcrumb calls toggleNavigationVisibility', async () => {
      const toggleNavigationVisibility = vi.fn();
      const path = ['Taso 1'];
      const { container } = renderMenu({ path, toggleNavigationVisibility });
      await waitFor(() => {
        expect(container.querySelector('.breadcrumb')).toBeInTheDocument();
      });
      fireEvent.click(container.querySelector('.breadcrumb'));
      expect(toggleNavigationVisibility).toHaveBeenCalled();
    });
    it('does not render breadcrumb when path is empty', async () => {
      const { container } = renderMenu({ path: [] });
      expect(container.querySelector('.breadcrumb')).toBeNull();
    });
  });

  describe('Custom component mappings', () => {
    it('resolves a string customComponent field via customComponentMappings', async () => {
      // eslint-disable-next-line @eslint-react/component-hook-factories
      const CustomLeaf = ({ name }) => <div data-testid='custom-leaf'>{name}</div>;
      const tree = [
        {
          id: 'custom-root',
          name: 'Custom Root',
          isOpen: true,
          children: [
            {
              id: 'custom-leaf-1',
              name: 'Custom Leaf',
              customComponent: 'CustomLeaf',
            },
          ],
        },
      ];
      const { getByTestId } = renderMenu({
        tree,
        customComponentMappings: { CustomLeaf },
      });
      await waitFor(() => {
        expect(getByTestId('custom-leaf')).toBeInTheDocument();
        expect(getByTestId('custom-leaf').textContent).toBe('Custom Leaf');
      });
    });
    it('renders an inline customComponent reference on a leaf', async () => {
      // eslint-disable-next-line @eslint-react/component-hook-factories
      const InlineLeaf = ({ name }) => <div data-testid='inline-leaf'>{name}</div>;
      const tree = [
        {
          id: 'inline-root',
          name: 'Inline Root',
          isOpen: true,
          children: [
            {
              id: 'inline-leaf-1',
              name: 'Inline Leaf',
              customComponent: InlineLeaf,
            },
          ],
        },
      ];
      const { getByTestId } = renderMenu({ tree });
      await waitFor(() => {
        expect(getByTestId('inline-leaf')).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('does not crash when tree is undefined', () => {
      expect(() => renderMenu({ tree: undefined })).not.toThrow();
    });

    it('does not crash when path is undefined', () => {
      expect(() => renderMenu({ path: undefined })).not.toThrow();
    });
  });
});
