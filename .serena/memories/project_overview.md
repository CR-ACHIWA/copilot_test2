# Project Overview

## Purpose
This is a React Todo application (学習用 - for learning purposes) built with React + TypeScript + Vite. It features:
- A simple Todo management system with task assignment to members
- Kanban-style board with drag-and-drop functionality
- Member selection from JSON data (no backend required)
- Three status columns: TODO, IN_PROGRESS, DONE

## Tech Stack
- **Frontend Framework**: React 19.1.0
- **Language**: TypeScript (ES2022 target)
- **Build Tool**: Vite 7.0.4
- **Bundler**: Vite with React plugin
- **Styling**: Inline styles (CSS-in-JS approach)
- **Data Source**: Static JSON files in public folder

## Key Features
- Task creation with member assignment
- Drag-and-drop task status management
- Member selection from dropdown
- No data persistence (learning project)
- Responsive design with flex layout

## Data Structure
- Members are loaded from `/members.json` (static file)
- Todos contain: id, text, memberIds array, status
- Three todo statuses: 'TODO', 'IN_PROGRESS', 'DONE'