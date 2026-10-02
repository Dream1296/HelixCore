import dotenv from 'dotenv';
dotenv.config();

export const envStart = process.env.sockerPath!;


export function envInit() {
    let a = envStart;
    return a;
}