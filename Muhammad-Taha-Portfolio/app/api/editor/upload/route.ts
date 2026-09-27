import { handled, upload } from '@/lib/server';
export const POST = (req:Request) => handled(()=>upload(req));
