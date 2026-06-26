import path from 'path';
import fs from 'fs';
import { TOOLKIT_ROOT } from './paths';

const isWindows = process.platform === 'win32';

// Shared resolver used by both the cron worker and Next.js API routes
// so the Python interpreter is configured in exactly one place.
export const resolvePythonPath = (): string => {
  const candidates: string[] = [];
  const pushCandidate = (candidate?: string) => {
    if (!candidate) return;
    if (!candidates.includes(candidate)) {
      candidates.push(candidate);
    }
  };

  if (isWindows) {
    pushCandidate(path.join(TOOLKIT_ROOT, '.venv', 'Scripts', 'python.exe'));
    pushCandidate(path.join(TOOLKIT_ROOT, 'venv', 'Scripts', 'python.exe'));
    pushCandidate(process.env.VIRTUAL_ENV ? path.join(process.env.VIRTUAL_ENV, 'Scripts', 'python.exe') : undefined);
  } else {
    pushCandidate(path.join(TOOLKIT_ROOT, '.venv', 'bin', 'python'));
    pushCandidate(path.join(TOOLKIT_ROOT, 'venv', 'bin', 'python'));
    pushCandidate(process.env.VIRTUAL_ENV ? path.join(process.env.VIRTUAL_ENV, 'bin', 'python') : undefined);
    pushCandidate('/tmp/aitoolkit_env/bin/python');
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return isWindows ? 'python.exe' : 'python3';
};
