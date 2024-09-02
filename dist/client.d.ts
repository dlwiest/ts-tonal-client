import { TonalMovement, TonalSharedWorkout, TonalWorkout } from './types';
export declare class TonalClient {
    private username;
    private password;
    private idToken;
    private tokenExpiresAt;
    private constructor();
    static create({ username, password }: {
        username: string;
        password: string;
    }): Promise<TonalClient>;
    private refreshToken;
    getMovements(): Promise<TonalMovement[]>;
    getWorkoutById(id: string): Promise<TonalWorkout>;
    getWorkoutByShareUrl(shareUrl: string): Promise<TonalSharedWorkout>;
}
