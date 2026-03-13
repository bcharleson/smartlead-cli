import type { GlobalOptions } from './types.js';
import { formatError } from './errors.js';

export function output(data: unknown, options: GlobalOptions = {}): void {
  if (options.quiet) return;

  let result = data;

  // Select specific fields if --fields is set
  if (options.fields && typeof data === 'object' && data !== null) {
    const fields = options.fields.split(',').map((f) => f.trim());
    if (Array.isArray(data)) {
      result = data.map((item) => pickFields(item, fields));
    } else {
      const obj = data as Record<string, unknown>;
      // Unwrap common Smartlead list responses
      const listKey = [
        'campaigns',
        'leads',
        'email_accounts',
        'sequences',
        'webhooks',
        'clients',
        'data',
      ].find((k) => Array.isArray(obj[k]));
      if (listKey) {
        result = (obj[listKey] as Record<string, unknown>[]).map((item) =>
          pickFields(item, fields),
        );
      } else {
        result = pickFields(obj, fields);
      }
    }
  }

  if (options.output === 'pretty') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(JSON.stringify(result));
  }
}

export function outputError(error: unknown, options: GlobalOptions = {}): void {
  const formatted = formatError(error);
  if (options.quiet) {
    process.exitCode = 1;
    return;
  }

  if (options.output === 'pretty') {
    console.error(`Error: ${formatted.message}`);
  } else {
    console.error(JSON.stringify({ error: formatted.message, code: formatted.code }));
  }
  process.exitCode = 1;
}

function pickFields(
  obj: Record<string, unknown>,
  fields: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.includes('.')) {
      const parts = field.split('.');
      let value: unknown = obj;
      for (const part of parts) {
        if (value && typeof value === 'object' && part in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[part];
        } else {
          value = undefined;
          break;
        }
      }
      if (value !== undefined) {
        result[field] = value;
      }
    } else if (field in obj) {
      result[field] = obj[field];
    }
  }
  return result;
}
