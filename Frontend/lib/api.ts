export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

/**
 * A wrapper around fetch that handles:
 * 1. Default credentials: "include"
 * 2. Automatic JSON parsing for success and error responses.
 * 3. Safe error handling when the server returns non-JSON (e.g. HTML 500 pages).
 */
export async function apiFetch<T = any>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const defaultOptions: RequestInit = {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    };

    // Merge headers safely
    const headers = {
        ...(defaultOptions.headers as Record<string, string>),
        ...(options.headers as Record<string, string>),
    };

    const config = {
        ...defaultOptions,
        ...options,
        headers,
    };

    // Special handling for FormData: Let the browser set the Content-Type header with the boundary
    if (config.body instanceof FormData) {
        if (
            config.headers &&
            typeof config.headers === "object" &&
            "Content-Type" in config.headers
        ) {
            delete (config.headers as any)["Content-Type"];
        }
    }

    try {
        const response = await fetch(url, config);

        // Handle Non-OK responses
        if (!response.ok) {
            let errorMessage = `Request failed with status ${response.status}`;
            let errorData: any = null;

            const contentType = response.headers.get("content-type");

            // Try to parse as JSON first
            if (contentType && contentType.includes("application/json")) {
                try {
                    errorData = await response.json();
                    errorMessage =
                        errorData.detail || errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    // If JSON parsing fails, fall back to text
                    errorMessage = await response.text();
                }
            } else {
                // If not JSON (e.g. HTML error page), read as text
                try {
                    const textHTML = await response.text();
                    // If it's a huge HTML page, truncate it for the alert/error message
                    errorMessage = textHTML.length > 200
                        ? textHTML.substring(0, 200) + "..."
                        : textHTML;
                } catch (e) {
                    errorMessage = "Unknown network error (could not read response body)";
                }
            }

            throw new ApiError(errorMessage, response.status, errorData);
        }

        // Handle Success (204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        // Handle Success with JSON
        // We assume most success responses are JSON. 
        // If you have endpoints returning just text/blob, we might need a flag.
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }

        // Fallback: try json, if fail return text? 
        // For safety in this specific app which expects JSON:
        try {
            return await response.json();
        } catch (e) {
            // If it was a 200 OK but not JSON (and not empty), maybe return null or text?
            // Returning null for safety here to prevent crash
            console.warn("Response was OK but could not parse JSON", e);
            return {} as T;
        }

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Convert network errors to Error
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}
