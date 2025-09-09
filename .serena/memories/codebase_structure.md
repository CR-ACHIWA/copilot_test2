# Codebase Structure

## Root Directory Structure
```
copilot_test2/
├── .github/                 # GitHub templates and instructions
├── .serena/                 # Serena MCP server data
├── public/                  # Static assets served by Vite
│   ├── members.json         # Member data (JSON)
│   └── vite.svg            # Vite logo
├── src/                     # Source code
│   ├── assets/             # React assets
│   │   └── react.svg       # React logo
│   ├── App.css             # App component styles
│   ├── App.tsx             # Main App component (wrapper)
│   ├── index.css           # Global styles
│   ├── main.tsx            # React entry point
│   ├── members.json        # Member data (duplicate?)
│   ├── Todo.tsx            # Main Todo component with Kanban board
│   └── vite-env.d.ts       # Vite environment types
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript project references
├── tsconfig.app.json       # App-specific TypeScript config
├── tsconfig.node.json      # Node-specific TypeScript config
├── vite.config.ts          # Vite configuration
└── README.md              # Project documentation
```

## Key Components
- **App.tsx**: Simple wrapper that renders TodoApp
- **Todo.tsx**: Main component containing all todo logic and UI
- **main.tsx**: React application entry point
- **members.json**: Static data for member selection

## Data Flow
1. Members loaded from `/members.json` via fetch
2. Todos managed in TodoApp component state
3. Drag-and-drop updates todo status
4. No persistence - data resets on page refresh