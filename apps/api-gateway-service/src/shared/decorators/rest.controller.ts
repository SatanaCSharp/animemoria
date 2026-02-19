import { Controller, type ControllerOptions } from '@nestjs/common';

const REST_API_PREFIX = 'api/v1';

function mapPath(
  prefix: string,
  path?: string | string[],
): string | string[] | undefined {
  if (path === undefined || path === null) {
    return path;
  }
  if (Array.isArray(path)) {
    return path.map((item) => `${prefix}/${item}`);
  }
  return `${prefix}/${path}`;
}

/** REST controller decorator: same interface as Controller, with path(s) prefixed by api/v1. */
export function RestController(): ReturnType<typeof Controller>;

export function RestController(
  path: string | string[],
): ReturnType<typeof Controller>;

export function RestController(
  options: ControllerOptions,
): ReturnType<typeof Controller>;

export function RestController(
  pathOrOptions?: string | string[] | ControllerOptions,
): ReturnType<typeof Controller> {
  if (pathOrOptions === undefined) {
    return Controller();
  }
  if (typeof pathOrOptions === 'string' || Array.isArray(pathOrOptions)) {
    return Controller(
      mapPath(REST_API_PREFIX, pathOrOptions) as string | string[],
    );
  }
  const { path, ...rest } = pathOrOptions;
  return Controller({
    ...rest,
    path: mapPath(REST_API_PREFIX, path),
  });
}
