#!/usr/bin/env node
import fs from "fs";
import path from "path";
import chalk from "chalk";
import chokidar from "chokidar";

import { validateFolderStructure, defineFolders } from "../functions/folder";

const CONFIG_FILES = ["folder.config.json", "folder.config.js"];

async function findConfigFile(directory: string): Promise<string | null> {
  for (const configFile of CONFIG_FILES) {
    const configPath = path.join(directory, configFile);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
  return null;
}

async function loadConfig(configPath: string) {
  try {
    const ext = path.extname(configPath);

    if (ext === ".json") {
      const configContent = await fs.promises.readFile(configPath, "utf-8");
      const config = JSON.parse(configContent);
      return defineFolders(config.folders);
    } else {
      // For .js or .ts files, import them as ES modules
      const absolutePath = path.resolve(configPath);
      const config = await import(absolutePath);
      return defineFolders(config.default?.folders || config.folders);
    }
  } catch (error) {
    console.error(chalk.red(`Error loading config: ${error}`));
    process.exit(1);
  }
}

async function validateAndPrint(rootPath: string, configPath: string) {
  try {
    const config = await loadConfig(configPath);
    const result = await validateFolderStructure(rootPath, config, {
      strict: true,
      ignoreCase: true,
    });

    if (result.isValid) {
      console.log(
        chalk.green("[Success]") + " - All folders match the expected structure"
      );
    } else {
      console.log(
        chalk.red("[Error]") + " - Folder structure validation failed"
      );
      result.errors.forEach((error) => {
        console.log(chalk.red("[Error]") + ` ${error}`);
      });
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach((warning) => {
        console.log(chalk.yellow("[Warning]") + ` ${warning}`);
      });
    }

    return result.isValid;
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error}\n`));
    return false;
  }
}

async function watchMode(rootPath: string, configPath: string) {
  console.log(
    chalk.blue("info") +
      " - Watching for folder structure changes. Press Ctrl+C to stop"
  );

  const watcher = chokidar.watch(rootPath, {
    ignored: [/(^|[\/\\])\../, "node_modules", "dist"],
    persistent: true,
    ignoreInitial: false,
    depth: 5,
    awaitWriteFinish: true,
  });

  watcher
    .on("addDir", async (path) => {
      console.log(chalk.blue("[Info]") + ` - New folder detected: ${path}`);
      await validateAndPrint(rootPath, configPath);
    })
    .on("unlinkDir", async (path) => {
      console.log(chalk.blue("[Info]") + ` - Folder removed: ${path}`);
      await validateAndPrint(rootPath, configPath);
    });
}

async function main() {
  const args = process.argv.slice(2);
  const watchFlag = args.includes("--watch") || args.includes("-w");

  const rootPath = process.cwd();
  const configPath = await findConfigFile(rootPath);

  if (!configPath) {
    console.error(
      chalk.red("[Error]") +
        " - No configuration file found. Create one of: folder.config.ts, folder.config.js, or folder.config.json"
    );
    process.exit(1);
  }

  if (watchFlag) {
    await watchMode(rootPath, configPath);
  } else {
    const isValid = await validateAndPrint(rootPath, configPath);
    process.exit(isValid ? 0 : 1);
  }
}

main().catch((error) => {
  console.error(chalk.red("[Error]") + ` - Fatal error occurred: ${error}`);
  process.exit(1);
});
