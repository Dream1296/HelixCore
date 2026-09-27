const RUN_LEVEL = process.env.LOG_LEVEL ?? 'debug';





export const logger = {
    log(...args: unknown[]) {
        console.log( ...args);
    },

    mes(...args: unknown[]) {
        console.log( ...args);
    },

    err(...args: unknown[]) {
        console.error( ...args);
    }
};

if( RUN_LEVEL == 'debug') {

}else if(RUN_LEVEL == 'error') {
    logger.log = () => {};
}