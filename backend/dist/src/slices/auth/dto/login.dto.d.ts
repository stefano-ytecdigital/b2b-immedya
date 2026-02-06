export declare class LoginDto {
    email: string;
    password: string;
}
export declare class LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
    };
}
