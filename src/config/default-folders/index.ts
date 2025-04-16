import { FolderDefinition } from "../../types/folder";

// Default folders commonly found in Node.js projects
export const defaultFolders: FolderDefinition[] = [
  // Application related folders
  { name: "dist", required: false },
  { name: "build", required: false },

  // Node.js related folders
  { name: "node_modules", required: false },

  // Git related folders
  { name: ".git", required: false },

  // Development tools folders
  { name: ".next", required: false },
  { name: ".husky", required: false },
  { name: ".vscode", required: false },
  { name: "coverage", required: false },
  { name: ".nixpacks", required: false },
];
