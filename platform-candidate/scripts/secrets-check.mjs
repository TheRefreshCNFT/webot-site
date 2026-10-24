import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const trackedFiles = execFileSync('git', ['ls-files', '-z'], {
  encoding: 'utf8'
})
  .split('\0')
  .filter(Boolean);

const patterns = [
  new RegExp(['sk', 'live', ''].join('_')),
  new RegExp(['rk', 'live', ''].join('_')),
  new RegExp(['whsec', '[A-Za-z0-9]'].join('_')),
  new RegExp(['SUPABASE_SERVICE_ROLE_KEY', 'eyJ'].join('=')),
  new RegExp(['STRIPE_SECRET_KEY', ['sk', ''].join('_')].join('='))
];

const findings = [];

for (const file of trackedFiles) {
  if (!existsSync(file)) {
    continue;
  }

  const content = readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (patterns.some((pattern) => pattern.test(line))) {
      findings.push(`${file}:${index + 1}:${line}`);
    }
  });
}

if (findings.length > 0) {
  console.error(findings.join('\n'));
  process.exit(1);
}

console.log('No committed secret patterns found.');
