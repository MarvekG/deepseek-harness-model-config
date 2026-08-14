/**
 * Host half of the advanced model-settings bundle. The client-module registry
 * discovers this Loader row and serves the package's browser half.
 */
export const name = 'models-config-plugin'

/** Register no Host service; all mutations use the existing settings RPC. */
export function apply() {}
