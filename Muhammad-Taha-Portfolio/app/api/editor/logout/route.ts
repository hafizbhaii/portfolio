import { handled, logout } from '@/lib/server';
export const POST = (req:Request) => handled(()=>logout(req));
