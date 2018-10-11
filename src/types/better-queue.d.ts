declare module "better-queue" {
    export default class Queue {
        constructor (process: (task:any, cb:(error: any, result: any) => void) => void, options?: any);
        push(task:any, cb?:any):void;
    }

}
