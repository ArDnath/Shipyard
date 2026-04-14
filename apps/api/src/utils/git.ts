import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as util from 'node:util';

const execAsync = util.promisify(exec);

export async function cloneRepo(repoUrl: string) {
  const id = Date.now().toString();
  const basePath = path.join('/tmp', 'shipyard');
  const projectPath = path.join(basePath, `repo-${id}`);

  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  try {
    await execAsync(`git clone ${repoUrl} ${projectPath}`);

    return {
      success: true,
      path: projectPath,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'git clone error',
    };
  }
}
