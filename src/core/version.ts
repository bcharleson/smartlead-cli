// Single source of truth for the package version.
// tsup inlines this JSON import at build time, so downstream bundles
// always match `package.json` without manual sync.
import pkg from '../../package.json' with { type: 'json' };

export const VERSION: string = pkg.version;
