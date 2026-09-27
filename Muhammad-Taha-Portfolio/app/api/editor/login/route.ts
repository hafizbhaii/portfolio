import { handled, login } from '@/lib/server';
export const POST = (req:Request) => handled(()=>login(req));
