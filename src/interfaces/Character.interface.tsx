export enum CharacterType {
    PLAYER = 'PLAYER',
    NPC = 'NPC',
}

export interface Character {
    id: string;
    name: string;
    type: CharacterType;
    ac: number;
    hp: number;
    maxHp: number;
}
