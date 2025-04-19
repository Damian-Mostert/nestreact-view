declare global {
    var nestReactBuild: {
        Client: Record<string, any>;
        Server: Record<string, any>;
        use: Record<string, any>;
    };
}
declare function Engine(filePath: string, options: any | undefined, callback: (err: any, response?: string) => void): Promise<void>;

declare function Component(type?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function Render(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function Client(): (constructor: Function) => void;
declare function Server(): (constructor: Function) => void;
declare function Use(modules: {
    [key: string]: string;
}): (constructor: Function) => void;

export { Client, Component, Render, Server, Use, Engine as default };
