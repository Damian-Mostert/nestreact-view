declare function extractClientComponentsAndModules(source: string): {
    components: Record<string, {
        type: string;
        component: string;
        componentType: string;
    }>;
    imports: string;
};
declare function extractClientAndServer(filePath: string): {
    client: string;
    server: string;
};

export { extractClientAndServer, extractClientComponentsAndModules };
