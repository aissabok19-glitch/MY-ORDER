import type { Dept, Profile } from './types';
// Stage 0..5: client, sales, factory, warehouse, accounting, delivery
export const STAGE_COUNT = 6;
export const OWNER: Dept[] = ['sales', 'sales', 'factory', 'warehouse', 'accountant', 'logistics'];
export const canMove = (p: Pick<Profile, 'role' | 'department'>, stage: number) => p.role === 'admin' || p.department === OWNER[stage];
