export interface User {
    user_id: number;
    name?: string;     // 👈 Changed to optional to match DB (String?)
    username?: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name?: string;     // 👈 Changed to optional so registration can skip it
    email: string;
    password: string;
    username?: string; // 👈 Add this if your registration form also collects it
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface PublicProfileUser {
    user_id: number;
    username: string | null;
    name: string;
}

export interface MeProfileResponse {
    username: string | null;
    name: string;
    bio: string | null;
    link_url?: string | null;
    sex?: string | null;
    birthday?: string | null;
    profile_pic_url?: string | null;
    followers: PublicProfileUser[];
    following: PublicProfileUser[];
    _count: {
        followers: number;
        following: number;
        workouts: number;
    };
}
