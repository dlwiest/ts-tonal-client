/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class TonalClient {
    constructor({ username, password }) {
        this.username = username;
        this.password = password;
        this.idToken = '';
        this.tokenExpiresAt = 0;
    }
    // TonalClient factory
    static create(_a) {
        return __awaiter(this, arguments, void 0, function* ({ username, password }) {
            const client = new TonalClient({ username, password });
            yield client.refreshToken();
            return client;
        });
    }
    // Request a new ID token from Auth0
    refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                username: this.username,
                password: this.password,
                client_id: 'ERCyexW-xoVG_Yy3RDe-eV4xsOnRHP6L',
                grant_type: 'password',
                scope: 'offline_access',
            };
            try {
                const response = yield fetch('https://tonal.auth0.com/oauth/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                if (response.status === 403) {
                    throw new Error('Invalid username or password');
                }
                const json = (yield response.json());
                this.idToken = json.id_token;
                this.tokenExpiresAt = Date.now() + json.expires_in * 1000;
            }
            catch (e) {
                console.error(e);
                throw new Error('Failed to retrieve access token');
            }
        });
    }
    // Get all movements available on Tonal
    getMovements() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.tokenExpiresAt < Date.now()) {
                    yield this.refreshToken();
                }
                const response = yield fetch('https://api.tonal.com/v6/movements', {
                    headers: {
                        Authorization: `Bearer ${this.idToken}`,
                    },
                });
                return (yield response.json());
            }
            catch (e) {
                console.error(e);
                throw new Error('Failed to retrieve movements');
            }
        });
    }
    // Get a workout by its ID
    getWorkoutById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.tokenExpiresAt < Date.now()) {
                    yield this.refreshToken();
                }
                const response = yield fetch(`https://api.tonal.com/v6/workouts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.idToken}`,
                    },
                });
                const json = (yield response.json());
                return json;
            }
            catch (e) {
                console.error(e);
                throw new Error('Failed to retrieve workout');
            }
        });
    }
    // Get a workout by its share URL
    getWorkoutByShareUrl(shareUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!shareUrl) {
                throw new Error('Share URL is required');
            }
            const shareId = shareUrl.split('/').pop();
            try {
                if (this.tokenExpiresAt < Date.now()) {
                    yield this.refreshToken();
                }
                const response = yield fetch(`https://api.tonal.com/v6/user-workouts/sharing-records/${shareId}`, {
                    headers: {
                        Authorization: `Bearer ${this.idToken}`,
                    },
                });
                const json = (yield response.json());
                return json;
            }
            catch (e) {
                console.error(e);
                throw new Error('Failed to retrieve workout');
            }
        });
    }
}

export { TonalClient as default };
