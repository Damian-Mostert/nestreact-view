declare global {
    var nestReactBuild: {
        Client: Record<string, any>;
        Server: Record<string, any>;
        use: Record<string, any>;
    };
}
declare function NestReactEngine(app: any): void;
declare function Context(): MethodDecorator;
declare function Component(type?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function Render(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function Client(): (constructor: Function) => void;
declare function Server(): (constructor: Function) => void;
declare function Use(modules: {
    [key: string]: string;
}): (constructor: Function) => void;

export { Client, Component, Context, Render, Server, Use, NestReactEngine as default };
