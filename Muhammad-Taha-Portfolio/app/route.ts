import { handled, publicPage } from '@/lib/server';
export const dynamic = 'force-dynamic';
export const GET = () => handled(publicPage);
