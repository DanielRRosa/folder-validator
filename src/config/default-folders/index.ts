import { FolderDefinition } from "../../types/folder";

// Default folders commonly found in Node.js projects
export const defaultFolders: FolderDefinition[] = [
  { name: "node_modules", required: false },
  { name: ".next", required: false },
  { name: ".git", required: false },
  { name: "dist", required: false },
  { name: "build", required: false },
  { name: "coverage", required: false },
  { name: ".husky", required: false },
  { name: ".vscode", required: false },
];
