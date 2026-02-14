import { describe, expect, test, mock } from "bun:test";
import { withRetry } from "../src/lib/notion/retry";

describe("withRetry", () => {
    // Happy Path
    test("should return value immediately if operation succeeds", async () => {
        const operation = mock(() => Promise.resolve("success"));
        const result = await withRetry(operation);
        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(1);
    });

    // Retry on 429
    test("should retry on 429 error and eventually succeed", async () => {
        let callCount = 0;
        const operation = mock(() => {
            callCount++;
            if (callCount === 1) {
                const error: any = new Error("Rate Limited");
                error.status = 429;
                return Promise.reject(error);
            }
            return Promise.resolve("success");
        });

        // Use a small delay for testing
        const result = await withRetry(operation, 3, 1);

        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(2);
    });

    // Retry on 5xx
    test("should retry on 500 error and eventually succeed", async () => {
        let callCount = 0;
        const operation = mock(() => {
            callCount++;
            if (callCount === 1) {
                const error: any = new Error("Server Error");
                error.status = 500;
                return Promise.reject(error);
            }
            return Promise.resolve("success");
        });

        const result = await withRetry(operation, 3, 1);

        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(2);
    });

    // Max Retries Exceeded
    test("should throw last error after max retries exceeded", async () => {
        const operation = mock(() => {
            const error: any = new Error("Server Error");
            error.status = 502;
            return Promise.reject(error);
        });

        // 3 retries means 4 calls total
        try {
            await withRetry(operation, 3, 1);
            expect(true).toBe(false); // Should not reach here
        } catch (e: any) {
            expect(e.message).toBe("Server Error");
        }
        expect(operation).toHaveBeenCalledTimes(4);
    });

    // No Retry on 4xx (except 429)
    test("should throw immediately on non-retriable error (e.g., 400)", async () => {
        const operation = mock(() => {
            const error: any = new Error("Bad Request");
            error.status = 400;
            return Promise.reject(error);
        });

        try {
            await withRetry(operation, 3, 1);
            expect(true).toBe(false); // Should not reach here
        } catch (e: any) {
            expect(e.message).toBe("Bad Request");
        }
        expect(operation).toHaveBeenCalledTimes(1);
    });

    // Retry-After Header
    test("should respect Retry-After header taking precedence over default delay", async () => {
        let callCount = 0;
        const operation = mock(() => {
            callCount++;
            if (callCount === 1) {
                const error: any = new Error("Rate Limited");
                error.status = 429;
                // Retry-After: 0 seconds (0ms)
                // If it ignored this and used 'delay', it would wait 10000ms
                error.headers = { "retry-after": "0" };
                return Promise.reject(error);
            }
            return Promise.resolve("success");
        });

        const start = Date.now();
        // Pass a large delay (5000ms) that we definitely don't want to wait for
        await withRetry(operation, 3, 5000);
        const end = Date.now();

        // It should be much faster than 5000ms
        expect(end - start).toBeLessThan(1000);
        expect(operation).toHaveBeenCalledTimes(2);
    });
});
