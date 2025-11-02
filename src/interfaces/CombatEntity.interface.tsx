import { Effect } from './Effect.interface';

export enum CombatEntityType {
    CHARACTER = 'CHARACTER',
    MONSTER = 'MONSTER',
}

export interface CombatEntity {
    id: string;
    name: string;
    type: CombatEntityType;
    instanceId: string | undefined;
    initiative: number;
    hp: number;
    maxHp: number;
    ac: number;
    effects: Effect[];
}