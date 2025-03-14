import fs from "fs";
import path from "path";
import {
  FolderDefinition,
  ValidationOptions,
  ValidationResult,
} from "../types";
import { defaultFolders } from "../config/default-folders";

// Default folders commonly found in Node.js projects

/**
 * Define a folder structure configuration
 * @param folders Array of folder definitions
 * @returns Processed folder configuration
 */
export const defineFolders = (
  folders: FolderDefinition[]
): FolderDefinition[] => {
  return folders.map((folder) => ({
    ...folder,
    required: folder.required ?? false,
    children: folder.children ? defineFolders(folder.children) : undefined,
  }));
};

/**
 * Dynamically imports the folder config file (TS or JS)
 */
const loadUserConfig = async (
  configPath: string
): Promise<FolderDefinition[]> => {
  if (!fs.existsSync(configPath)) {
    console.warn(
      `Config file not found: ${configPath}. Using default folders only.`
    );
    return [];
  }

  const ext = path.extname(configPath);

  try {
    if (ext === ".ts" || ext === ".js") {
      const { default: config } = await import(
        `file://${path.resolve(configPath)}`
      );
      return defineFolders(config);
    } else {
      throw new Error("Unsupported config file format. Use .ts or .js");
    }
  } catch (error) {
    console.error("Error loading config:", error);
    return [];
  }
};

/**
 * Reads directory and returns folder names
 */
const getFolderStructure = async (dir: string): Promise<string[]> => {
  try {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    return files.filter((file) => file.isDirectory()).map((file) => file.name);
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
};

/**
 * Check if a folder matches any of the allowed folders or their aliases
 */
const isFolderAllowed = (
  folder: string,
  allowedFolders: FolderDefinition[],
  options: ValidationOptions
): boolean => {
  const compareFn = options.ignoreCase
    ? (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
    : (a: string, b: string) => a === b;

  return allowedFolders.some((allowed) => compareFn(folder, allowed.name));
};

/**
 * Recursively validates a folder structure against allowed folders
 */
async function validateFolderRecursive(
  currentPath: string,
  allowedFolders: FolderDefinition[],
  options: ValidationOptions,
  result: ValidationResult,
  parentPath: string = "",
  userFoldersMap?: Set<string>
): Promise<void> {
  const actualFolders = await getFolderStructure(currentPath);

  // Check for disallowed folders at current level
  const disallowed = actualFolders.filter(
    (folder) => !isFolderAllowed(folder, allowedFolders, options)
  );

  if (disallowed.length > 0) {
    if (options.strict) {
      result.isValid = false;
      const fullPath = parentPath ? `${parentPath}/` : "";
      result.errors.push(
        `Disallowed folders found in ${fullPath}: ${disallowed.join(", ")}`
      );
    } else if (!options.allowUnknown) {
      const fullPath = parentPath ? `${parentPath}/` : "";
      result.warnings.push(
        `Unknown folders found in ${fullPath}: ${disallowed.join(", ")}`
      );
    }
  }

  // Check for required folders at current level
  const missingRequired = allowedFolders
    .filter((folder) => folder.required)
    .filter(
      (folder) =>
        !actualFolders.some((actual) =>
          isFolderAllowed(actual, [folder], options)
        )
    );

  if (missingRequired.length > 0) {
    result.isValid = false;
    const fullPath = parentPath ? `${parentPath}/` : "";
    result.errors.push(
      `Missing required folders in ${fullPath}: ${missingRequired
        .map((f) => f.name)
        .join(", ")}`
    );
  }

  // Check for optional folders that don't exist and add them as reminders
  const missingOptional = allowedFolders
    .filter((folder) => !folder.required)
    .filter((folder) => {
      if (!userFoldersMap) return true;
      const fullPath = parentPath
        ? `${parentPath}/${folder.name}`
        : folder.name;
      return userFoldersMap.has(fullPath);
    })
    .filter(
      (folder) =>
        !actualFolders.some((actual) =>
          isFolderAllowed(actual, [folder], options)
        )
    );

  if (missingOptional.length > 0) {
    const fullPath = parentPath ? `${parentPath}/` : "";
    const optionalInfo = missingOptional
      .map((f) => {
        const parts = [];
        parts.push(f.name);
        if (f.description) {
          parts.push(f.description);
        }
        return parts.join(" - ");
      })
      .join("\n  • ");
    result.warnings.push(
      `Optional folders that could be added in ${fullPath}:\n  • ${optionalInfo}`
    );
  }

  // Recursively check child folders
  for (const folder of actualFolders) {
    const matchingConfig = allowedFolders.find((allowed) =>
      isFolderAllowed(folder, [allowed], options)
    );

    if (matchingConfig?.children) {
      const folderPath = path.join(currentPath, folder);
      const newParentPath = parentPath ? `${parentPath}/${folder}` : folder;
      await validateFolderRecursive(
        folderPath,
        matchingConfig.children,
        options,
        result,
        newParentPath,
        userFoldersMap
      );
    }
  }
}

/**
 * Validates the folder structure against allowed folders
 */
export const validateFolderStructure = async (
  rootPath: string,
  configOrPath: string | FolderDefinition[],
  options: ValidationOptions = {}
): Promise<ValidationResult> => {
  const defaultOptions: ValidationOptions = {
    strict: false,
    allowUnknown: true,
    ignoreCase: false,
  };

  const finalOptions = { ...defaultOptions, ...options };
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    const userFolders =
      typeof configOrPath === "string"
        ? await loadUserConfig(configOrPath)
        : configOrPath;
    const allowedFolders = [...userFolders, ...defaultFolders];

    // Store user folders separately for showing optional folders
    const userFoldersMap = new Set<string>();
    const addToMap = (folders: FolderDefinition[], parentPath = "") => {
      for (const folder of folders) {
        const fullPath = parentPath
          ? `${parentPath}/${folder.name}`
          : folder.name;
        userFoldersMap.add(fullPath);
        if (folder.children) {
          addToMap(folder.children, fullPath);
        }
      }
    };
    addToMap(userFolders);

    await validateFolderRecursive(
      rootPath,
      allowedFolders,
      finalOptions,
      result,
      "",
      userFoldersMap
    );

    return result;
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Error checking folder structure: ${error}`);
    return result;
  }
};
