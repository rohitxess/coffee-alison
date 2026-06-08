import {z} from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .max(100, 'Password is too long'),
})

export type LoginInput = z.infer<typeof loginSchema>;