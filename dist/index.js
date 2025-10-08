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

class AuthManager {
    constructor(username, password) {
        this.idToken = '';
        this.tokenExpiresAt = 0;
        this.authUrl = 'https://tonal.auth0.com/oauth/token';
        this.clientId = 'ERCyexW-xoVG_Yy3RDe-eV4xsOnRHP6L';
        this.username = username;
        this.password = password;
    }
    async authenticate() {
        if (this.isTokenValid()) {
            return this.idToken;
        }
        const response = await fetch(this.authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: this.username,
                password: this.password,
                client_id: this.clientId,
                grant_type: 'password',
                scope: 'offline_access',
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            }
            catch {
                errorData = { error: errorText };
            }
            throw new TonalClientError(errorData.error_description || errorData.error || 'Authentication failed', response.status, errorData);
        }
        const tokenData = await response.json();
        this.idToken = tokenData.id_token;
        this.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000);
        return this.idToken;
    }
    getValidToken() {
        if (!this.isTokenValid()) {
            throw new TonalClientError('Token expired. Call authenticate() first.');
        }
        return this.idToken;
    }
    isTokenValid() {
        return !!this.idToken && Date.now() < this.tokenExpiresAt - 60000; // 1 minute buffer
    }
}

class HttpClient {
    constructor(authManager) {
        this.authManager = authManager;
        this.baseUrl = 'https://api.tonal.com/v6';
        this.requestTimeout = 30000;
        this.maxRetries = 3;
    }
    async request(endpoint, options = {}, expectsBody = true) {
        const url = `${this.baseUrl}${endpoint}`;
        return this.makeRequestWithRetry(url, options, expectsBody);
    }
    async makeRequest(url, options = {}, expectsBody = true) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
        try {
            const token = this.authManager.getValidToken();
            const response = await fetch(url, {
                ...options,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
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
            if (expectsBody) {
                return await response.json();
            }
            else {
                return undefined;
            }
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
    async makeRequestWithRetry(url, options = {}, expectsBody = true) {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await this.makeRequest(url, options, expectsBody);
            }
            catch (error) {
                lastError = error instanceof TonalClientError ? error : new TonalClientError('Unknown error', undefined, error);
                if (attempt === this.maxRetries || (lastError.statusCode && lastError.statusCode < 500)) {
                    throw lastError;
                }
                const delay = Math.pow(2, attempt - 1) * 1000;
                await this.sleep(delay);
            }
        }
        throw lastError;
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class WorkoutService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async getUserWorkouts(offset = 0, limit = 50) {
        return this.httpClient.request('/user-workouts', {
            method: 'GET',
            headers: {
                'x-paginate-offset': offset.toString(),
                'x-paginate-limit': limit.toString(),
            },
        });
    }
    async getWorkoutById(workoutId) {
        if (!workoutId?.trim()) {
            throw new TonalClientError('Workout ID is required');
        }
        return this.httpClient.request(`/workouts/${workoutId}`);
    }
    async getWorkoutByShareUrl(shareUrl) {
        if (!shareUrl?.trim()) {
            throw new TonalClientError('Share URL is required');
        }
        const urlPattern = /https:\/\/share\.tonal\.com\/workout\/([a-f0-9-]+)/;
        const match = shareUrl.match(urlPattern);
        if (!match) {
            throw new TonalClientError('Invalid share URL format. Expected: https://share.tonal.com/workout/{id}');
        }
        const shareId = match[1];
        return this.httpClient.request(`/user-workouts/sharing-records/${encodeURIComponent(shareId)}`);
    }
    async estimateWorkoutDuration(sets) {
        if (!sets?.length) {
            throw new TonalClientError('At least one set is required for estimation');
        }
        return this.httpClient.request('/user-workouts/estimate', {
            method: 'POST',
            body: JSON.stringify({ sets }),
        });
    }
    async createWorkout(workoutData) {
        if (!workoutData.title?.trim()) {
            throw new TonalClientError('Workout title is required');
        }
        if (!workoutData.sets?.length) {
            throw new TonalClientError('At least one set is required');
        }
        const requestBody = {
            title: workoutData.title,
            sets: workoutData.sets,
            createdSource: workoutData.createdSource || 'WorkoutBuilder',
            shortDescription: workoutData.shortDescription || '',
            description: workoutData.description || '',
        };
        return this.httpClient.request('/user-workouts', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });
    }
    async updateWorkout(workoutData) {
        if (!workoutData.id) {
            throw new TonalClientError('Workout ID is required for updates');
        }
        if (!workoutData.title?.trim()) {
            throw new TonalClientError('Workout title is required');
        }
        if (!workoutData.sets?.length) {
            throw new TonalClientError('At least one set is required');
        }
        const requestBody = {
            id: workoutData.id,
            title: workoutData.title,
            description: workoutData.description || '',
            coachId: workoutData.coachId || '00000000-0000-0000-0000-000000000000',
            sets: workoutData.sets,
            level: workoutData.level || '',
            assetId: workoutData.assetId,
            createdSource: workoutData.createdSource || 'WorkoutBuilder'
        };
        return this.httpClient.request(`/user-workouts/${workoutData.id}`, {
            method: 'PUT',
            body: JSON.stringify(requestBody),
        });
    }
    async deleteWorkout(workoutId) {
        if (!workoutId?.trim()) {
            throw new TonalClientError('Workout ID is required');
        }
        await this.httpClient.request(`/user-workouts/${workoutId}`, {
            method: 'DELETE',
        }, false);
    }
}

class MovementService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async getMovements() {
        return this.httpClient.request('/movements');
    }
}

class UserService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async getUserInfo() {
        return this.httpClient.request('/users/userinfo');
    }
    async getGoals() {
        return this.httpClient.request('/goals');
    }
}

class TonalClient {
    constructor(username, password) {
        this.authManager = new AuthManager(username, password);
        this.httpClient = new HttpClient(this.authManager);
        this.workoutService = new WorkoutService(this.httpClient);
        this.movementService = new MovementService(this.httpClient);
        this.userService = new UserService(this.httpClient);
    }
    static async create(credentials) {
        const client = new TonalClient(credentials.username, credentials.password);
        await client.authManager.authenticate();
        return client;
    }
    // Movement operations
    async getMovements() {
        return this.movementService.getMovements();
    }
    // User operations
    async getUserInfo() {
        return this.userService.getUserInfo();
    }
    async getGoals() {
        return this.userService.getGoals();
    }
    // Workout operations
    async getUserWorkouts(offset = 0, limit = 50) {
        return this.workoutService.getUserWorkouts(offset, limit);
    }
    async getWorkoutById(workoutId) {
        return this.workoutService.getWorkoutById(workoutId);
    }
    async getWorkoutByShareUrl(shareUrl) {
        return this.workoutService.getWorkoutByShareUrl(shareUrl);
    }
    async estimateWorkoutDuration(sets) {
        return this.workoutService.estimateWorkoutDuration(sets);
    }
    async createWorkout(workoutData) {
        return this.workoutService.createWorkout(workoutData);
    }
    async updateWorkout(workoutData) {
        return this.workoutService.updateWorkout(workoutData);
    }
    async deleteWorkout(workoutId) {
        return this.workoutService.deleteWorkout(workoutId);
    }
}

exports.TonalClient = TonalClient;
exports.TonalClientError = TonalClientError;
exports.default = TonalClient;
