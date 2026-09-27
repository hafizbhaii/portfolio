import { handled, media } from '@/lib/server';
export const GET = async (_req:Request,{params}:{params:Promise<{key:string}>}) => handled(async()=>media((await params).key));
