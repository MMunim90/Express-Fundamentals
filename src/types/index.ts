export type Role = "admin" | "agent" | "user";

export const USER_ROLE = {
    admin: "admin",
    agent: "agent",
    user: "user",
} as const;

export type TResponse <T> = {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
    error?: any;
};