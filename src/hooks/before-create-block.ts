// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const newData = {
      ...context.data,
      transactions: JSON.stringify(context.data.transactions),
      uncles: JSON.stringify(context.data.uncles)
    }
    context.data = newData
    return context;
  };
}
