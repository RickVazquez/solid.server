// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const newResult = context.result.data.map((item) => {
      return {
        ...item,
        abi: JSON.parse(item.abi)
      }
    })
    context.result.data = newResult
    return context;
  };
}
