export async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        if (retries <= 0) throw error;

        // Check for rate limit (429) or temporary server errors (5xx)
        if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
            const waitTime = error.headers?.["retry-after"]
                ? parseInt(error.headers["retry-after"]) * 1000
                : delay;

            console.log(`Rate limited or server error. Retrying in ${waitTime}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return withRetry(operation, retries - 1, delay * 2); // Exponential backoff
        }

        throw error;
    }
}
