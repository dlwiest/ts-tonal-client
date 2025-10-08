'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class TonalClientError extends Error {
    constructor(message, statusCode, originalError) {
        super(message);
        this.name = 'TonalClientError';
        this.statusCode = statusCode;
        this.originalError = originalError;
    }
}

class TonalClient {
    constructor({ username, password }) {
        this.baseUrl = 'https://api.tonal.com/v6';
        this.authUrl = 'https://tonal.auth0.com/oauth/token';
        this.clientId = 'ERCyexW-xoVG_Yy3RDe-eV4xsOnRHP6L';
        this.requestTimeout = 30000;
        this.maxRetries = 3;
        this.username = username;
        this.password = password;
        this.idToken = '';
        this.tokenExpiresAt = 0;
    }
    // TonalClient factory
    static async create({ username, password }) {
        const client = new TonalClient({ username, password });
        await client.refreshToken();
        return client;
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async makeRequest(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                }
                catch {
                    errorData = { error: errorText };
                }
                throw new TonalClientError(errorData.error_description || errorData.error || `HTTP ${response.status}`, response.status, errorData);
            }
            return await response.json();
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof TonalClientError) {
                throw error;
            }
            if (error instanceof Error && error.name === 'AbortError') {
                throw new TonalClientError('Request timeout', undefined, error);
            }
            throw new TonalClientError('Request failed', undefined, error);
        }
    }
    async makeRequestWithRetry(url, options = {}) {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await this.makeRequest(url, options);
            }
            catch (error) {
                lastError = error instanceof TonalClientError ? error : new TonalClientError('Unknown error', undefined, error);
                // Don't retry client errors (4xx) or on the last attempt
                if (attempt === this.maxRetries || (lastError.statusCode && lastError.statusCode < 500)) {
                    throw lastError;
                }
                // Exponential backoff: 1s, 2s, 4s (capped at 10s)
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                await this.sleep(delay);
            }
        }
        throw lastError;
    }
    // Request a new ID token from Auth0
    async refreshToken() {
        const data = {
            username: this.username,
            password: this.password,
            client_id: this.clientId,
            grant_type: 'password',
            scope: 'offline_access',
        };
        try {
            const response = await this.makeRequest(this.authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            this.idToken = response.id_token;
            this.tokenExpiresAt = Date.now() + response.expires_in * 1000;
        }
        catch (error) {
            if (error instanceof TonalClientError && error.statusCode === 403) {
                throw new TonalClientError('Invalid username or password', 403, error.originalError);
            }
            throw new TonalClientError('Failed to retrieve access token', undefined, error);
        }
    }
    async ensureValidToken() {
        // Refresh token if it expires within the next minute
        if (this.tokenExpiresAt < Date.now() + 60000) {
            await this.refreshToken();
        }
    }
    // Get all movements available on Tonal
    async getMovements() {
        await this.ensureValidToken();
        return this.makeRequestWithRetry(`${this.baseUrl}/movements`, {
            headers: {
                Authorization: `Bearer ${this.idToken}`,
            },
        });
    }
    // Get a workout by its ID
    async getWorkoutById(id) {
        if (!id || typeof id !== 'string') {
            throw new TonalClientError('Workout ID is required and must be a string');
        }
        await this.ensureValidToken();
        return this.makeRequestWithRetry(`${this.baseUrl}/workouts/${encodeURIComponent(id)}`, {
            headers: {
                Authorization: `Bearer ${this.idToken}`,
            },
        });
    }
    // Get a workout by its share URL
    async getWorkoutByShareUrl(shareUrl) {
        if (!shareUrl || typeof shareUrl !== 'string') {
            throw new TonalClientError('Share URL is required and must be a string');
        }
        const shareId = shareUrl.split('/').pop();
        if (!shareId) {
            throw new TonalClientError('Invalid share URL format');
        }
        await this.ensureValidToken();
        return this.makeRequestWithRetry(`${this.baseUrl}/user-workouts/sharing-records/${encodeURIComponent(shareId)}`, {
            headers: {
                Authorization: `Bearer ${this.idToken}`,
            },
        });
    }
}

exports.TonalClientError = TonalClientError;
exports.default = TonalClient;
