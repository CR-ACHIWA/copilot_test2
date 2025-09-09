# Suggested Commands

## Development Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality checks

## System Commands (Windows)
- `dir` - List directory contents (equivalent to `ls` on Unix)
- `cd <path>` - Change directory
- `type <file>` - Display file contents (equivalent to `cat` on Unix)
- `findstr <pattern> <files>` - Search for text in files (equivalent to `grep` on Unix)
- `git status` - Check git repository status
- `git add .` - Stage all changes
- `git commit -m "message"` - Commit changes
- `git push` - Push to remote repository

## Task Completion Commands
After making changes, always run:
1. `npm run lint` - Check for linting errors
2. `npm run build` - Ensure TypeScript compilation and build succeeds
3. `npm run dev` - Test the application locally

## File Structure Commands
- Navigate to `src/` for React components
- Navigate to `public/` for static assets (like members.json)
- Main components: `src/App.tsx`, `src/Todo.tsx`, `src/main.tsx`