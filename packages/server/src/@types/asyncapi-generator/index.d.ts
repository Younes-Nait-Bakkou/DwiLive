declare module "@asyncapi/generator" {
    interface GeneratorOptions {
        forceWrite?: boolean;
        install?: boolean;
        [key: string]: unknown; // Allow other properties
    }

    class Generator {
        constructor(
            template: string,
            outputDir: string,
            options?: GeneratorOptions,
        );
        generateFromFile(filepath: string): Promise<void>;
        // Add other methods if they are used and need to be typed
    }

    export default Generator;
}
