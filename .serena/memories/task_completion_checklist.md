# Task Completion Checklist

## Required Steps After Code Changes

### 1. Code Quality Check
- Run `npm run lint` to check for ESLint violations
- Fix any linting errors before proceeding
- Ensure TypeScript strict mode compliance

### 2. Build Verification
- Run `npm run build` to verify TypeScript compilation
- Ensure no build errors or type checking failures
- Check that Vite build completes successfully

### 3. Local Testing
- Run `npm run dev` to start development server
- Test functionality in browser at http://localhost:5173
- Verify all features work as expected
- Test drag-and-drop functionality if relevant
- Test member selection and todo creation

### 4. File Structure Validation
- Ensure static files in `public/` directory are accessible
- Verify `members.json` is properly formatted
- Check that all imports resolve correctly

### 5. Git Operations (if requested)
- Stage changes with appropriate files
- Create meaningful commit messages
- Follow existing commit message patterns from git log

## Common Issues to Check
- TypeScript compilation errors
- ESLint rule violations
- Missing dependencies in package.json
- Incorrect file paths or imports
- CSS styling conflicts or layout issues
- React hook dependency warnings