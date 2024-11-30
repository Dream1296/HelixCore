import { myEvent } from "./evenTs";



//修改数据发布订阅的装饰器
export function PublishAfterExecution(eventName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, ...args: any[]) {
            try {
                const result = await originalMethod.apply(this, [req, res, ...args]); // 执行原始方法
                myEvent.emit('upDtList',eventName);
                return result;
            } catch (error) {
                // 错误处理，确保错误时也能做一些事情
                console.error(`Error in method ${propertyKey}:`, error);
                throw error; // 继续抛出错误以便正常处理
            }
        };

        return descriptor;
    };
}