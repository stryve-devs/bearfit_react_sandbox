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

export interface GoogleAuthRequest {
    idToken?: string;
    accessToken?: string;
}
