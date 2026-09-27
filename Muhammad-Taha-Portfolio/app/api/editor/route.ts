import { handled, editorData, publish } from '@/lib/server';
export const dynamic = 'force-dynamic';
export const GET = (req:Request) => handled(()=>editorData(req));
export const PUT = (req:Request) => handled(()=>publish(req));
