type MethodName = string
type Method<Args, Returning> = (...Args) => Returning | Promise<Returning>
type Args = any[]

type Listener = (event: any) => void

type BidirectionalMessagingOptions = {
  addListener?: (eventName: string, handler: Listener) => void
  removeListener?: (eventName: string, handler: Listener) => void
  getMessageData?: (event: any) => any
  postMessage(data: any, targetOrigin?: string): void | Promise<void>
  targetOrigin?: string
}

type CallerOptions = BidirectionalMessagingOptions
type ExposeOptions = BidirectionalMessagingOptions & {
  isCallback?: boolean
}

export function caller<Returning extends any, Args extends any[]>(
  methodName: MethodName,
  options: CallerOptions
): (...args: Args) => Promise<Returning>

export function call<Returning extends any, Args extends any[]>(
  methodName: MethodName,
  ...args: Args
): Promise<Returning>

export function expose<Returning extends any, Args extends any[]>(
  methodName: MethodName,
  method: Method<Args, Returning>,
  options: CallerOptions
): (...args: Args) => Promise<Returning>
