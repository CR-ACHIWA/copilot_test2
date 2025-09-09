# Code Style and Conventions

## TypeScript Configuration
- **Target**: ES2022
- **Module**: ESNext with bundler resolution
- **JSX**: react-jsx (new JSX transform)
- **Strict mode**: Enabled with additional strict rules
- **Unused locals/parameters**: Not allowed (noUnusedLocals, noUnusedParameters)

## ESLint Configuration
- Uses TypeScript ESLint with recommended rules
- React Hooks plugin for hook-related rules
- React Refresh plugin for Vite integration
- Global browser environment
- ECMAScript 2020 features enabled

## React Component Patterns
- **Function Components**: Use `React.FC` type annotation
- **State Management**: useState hooks for local state
- **Effect Hooks**: useEffect for side effects (data fetching)
- **Event Handlers**: Arrow functions with explicit event types
- **Props**: Interface-based type definitions

## Naming Conventions
- **Components**: PascalCase (e.g., `TodoApp`, `App`)
- **Variables/Functions**: camelCase (e.g., `addTodo`, `selectedMembers`)
- **Interfaces**: PascalCase (e.g., `Todo`, `Member`)
- **Types**: PascalCase with descriptive names (e.g., `TodoStatus`)

## Code Organization
- **Interfaces**: Defined at top of files before components
- **Component Structure**: State declarations, effects, event handlers, render
- **Inline Styles**: CSS-in-JS objects for styling
- **Import Order**: External libraries first, then local imports

## Comments
- Minimal commenting approach
- Japanese comments for drag-and-drop related functions
- Self-documenting code preferred over extensive comments