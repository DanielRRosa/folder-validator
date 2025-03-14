export interface FolderDefinition {
  name: string;
  required?: boolean;
  children?: FolderDefinition[];
  description?: string;
}
