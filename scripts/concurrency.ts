export const pLimit = (limit: number) => {
    if (!Number.isInteger(limit) || limit < 1) {
        throw new Error('pLimit requires a positive integer limit.');
    }

    const queue: (() => void)[] = [];
    let activeCount = 0;

    const next = () => {
        activeCount--;
        if (queue.length > 0) {
            queue.shift()!();
        }
    };

    const run = async <T>(fn: () => Promise<T>): Promise<T> => {
        const execute = async (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => {
            activeCount++;
            try {
                const result = await fn();
                resolve(result);
            } catch (err) {
                reject(err);
            } finally {
                next();
            }
        };

        if (activeCount < limit) {
            return new Promise(execute);
        } else {
            return new Promise((resolve, reject) => {
                queue.push(() => execute(resolve, reject));
            });
        }
    };
    return run;
};
