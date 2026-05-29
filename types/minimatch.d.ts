declare module "minimatch" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function minimatch(target: string, pattern: string, options?: any): boolean;
  namespace minimatch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function filter(pattern: string, options?: any): (target: string) => boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function match(list: string[], pattern: string, options?: any): string[];
  }
  export = minimatch;
}
