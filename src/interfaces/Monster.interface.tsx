export enum MonsterType {
    MONSTER = 'MONSTER',
    ENVIRONMENT = 'ENVIRONMENT',
}

export interface Monster {
    id: string;
    name: string;
    type: MonsterType;
    maxHp: number;
    ac: number;
    perception: number;
}