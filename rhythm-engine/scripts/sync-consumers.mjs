import { cp, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(repoRoot, 'src');

const targets = [
    {
        name: 'dag',
        targetDir: path.resolve(repoRoot, '..', 'dag', 'src', 'vendor', 'rhythm-engine'),
        afterSync: async (targetDir) => {
            await writeFile(
                path.join(targetDir, 'package.json'),
                `${JSON.stringify({ type: 'module' }, null, 2)}\n`,
                'utf8'
            );
        }
    },
    {
        name: 'tap-repeater',
        targetDir: path.resolve(repoRoot, '..', 'tap-repeater', 'wwwroot', 'vendor', 'rhythm-engine')
    }
];

async function exists(targetPath) {
    try {
        await stat(targetPath);
        return true;
    } catch {
        return false;
    }
}

async function syncTarget(target) {
    const parentDir = path.dirname(target.targetDir);
    if (!(await exists(parentDir))) {
        console.log(`Skipping ${target.name}: missing parent ${parentDir}`);
        return;
    }

    await rm(target.targetDir, { recursive: true, force: true });
    await mkdir(target.targetDir, { recursive: true });
    await cp(sourceDir, target.targetDir, { recursive: true });

    if (target.afterSync) {
        await target.afterSync(target.targetDir);
    }

    console.log(`Synced ${target.name} -> ${target.targetDir}`);
}

async function main() {
    for (const target of targets) {
        await syncTarget(target);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
