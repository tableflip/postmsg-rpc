type MethodName = string
type Method<Args, Returning> = (...Args) => Returning | Promise<Returning>
type Args = any[]

type CallerOptions = {
  targetOrigin?: string
  postMessage(data: any, targetOrigin?: string): void | Promise<void>
}

type ExposeOptions = {
  isCallback?: boolean
  targetOrigin?: string
  postMessage(data: any, targetOrigin?: string): void | Promise<void>
}

// client.js
export function caller<Returning extends any, Args extends any[]>(
  methodName: MethodName,
  options: CallerOptions
): (...args: Args) => Promise<Returning>

export function call<Returning extends any, Args extends any[]>(
  methodName: MethodName,
  ...args: Args
): Promise<Returning>

// server.js
export function expose<Returning extends any, Args extends any[]>(
  methodName: MethodName,
  method: Method<Args, Returning>,
  options: CallerOptions
): (...args: Args) => Promise<Returning>
