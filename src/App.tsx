import React, { useState, useEffect } from 'react';
import { Sword, Users, Skull, Zap, Save } from 'lucide-react';
import CharactersPanel from './components/CharactersPanel';
import MonstresPanel from './components/MonstresPanel';
import CombatPanel from './components/CombatPanel';
import SaveManager from './components/SaveManager';
import { Character } from './interfaces/Character.interface';
import { Monster } from './interfaces/Monster.interface';
import { CombatEntity, CombatEntityType } from './interfaces/CombatEntity.interface';
import { Effect } from './interfaces/Effect.interface';

type TabType = 'personnages' | 'monstres' | 'combat' | 'sauvegardes';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('personnages');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [activeCombat, setActiveCombat] = useState<CombatEntity[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);

  // Load game state on app startup
  useEffect(() => {
    loadGameStateOnStartup();
  }, []);

  // Load the most recent save file on startup
  const loadGameStateOnStartup = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.loadGameState();
        if (result.success) {
          setCharacters(result.data.characters || []);
          setMonsters(result.data.monsters || []);
          console.log('Game state loaded on startup:', result.filename);
        } else {
          console.log('No save file found, starting with empty state');
        }
      }
    } catch (error) {
      console.error('Error loading game state on startup:', error);
    }
  };

  // Load game state from save manager
  const handleLoadGame = (loadedCharacters: Character[], loadedMonsters: Monster[]) => {
    setCharacters(loadedCharacters);
    setMonsters(loadedMonsters);
  };

  // Add a new character to the list
  const addCharacter = (character: Omit<Character, 'id'>) => {
    const nouveauPersonnage: Character = {
      ...character,
      id: Date.now().toString()
    };
    setCharacters(prev => [...prev, nouveauPersonnage]);
  };

  // Edit an existing character
  const editCharacter = (id: string, character: Partial<Character>) => {
    setCharacters(prev => prev.map(p => p.id === id ? { ...p, ...character } : p));
  };

  // Delete a character from the list
  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(p => p.id !== id));
  };

  // Add a new monster to the list
  const addMonster = (monster: Omit<Monster, 'id'>) => {
    const nouveauMonstre: Monster = {
      ...monster,
      id: Date.now().toString()
    };
    setMonsters(prev => [...prev, nouveauMonstre]);
  };

  // Edit an existing monster
  const editMonster = (id: string, monster: Partial<Monster>) => {
    setMonsters(prev => prev.map(m => m.id === id ? { ...m, ...monster } : m));
  };

  // Delete a monster from the list
  const deleteMonster = (id: string) => {
    setMonsters(prev => prev.filter(m => m.id !== id));
  };

  // Start combat with selected characters and monsters
  const startCombat = (charactersSelected: string[], monstersSelected: { id: string, nombre: number }[], characterInitiatives?: { [key: string]: number }) => {
    const entites: CombatEntity[] = [];

    // Add selected characters
    charactersSelected.forEach(id => {
      const character = characters.find(p => p.id === id);
      if (character) {
        entites.push({
          ...character,
          initiative: characterInitiatives?.[id] || 0, // Use provided initiative or default to 0
          type: CombatEntityType.CHARACTER,
          instanceId: undefined,
          effects: []
        });
      }
    });

    // Add selected monsters
    monstersSelected.forEach(({ id, nombre }) => {
      const monster = monsters.find(m => m.id === id);
      if (monster) {
        const monsterInitiative = characterInitiatives?.[id] || 0; // Use calculated initiative or default to 0
        for (let i = 0; i < nombre; i++) {
          entites.push({
            ...monster,
            hp: monster.maxHp,
            initiative: monsterInitiative, // All instances share the same initiative
            type: CombatEntityType.MONSTER,
            instanceId: `${id}-${i}`,
            effects: []
          });
        }
      }
    });

    setActiveCombat(entites);
    setCurrentTurn(0);
  };

  // Check if combat is ended (all monsters dead)
  const combatEnded = activeCombat.length > 0 && 
    activeCombat.filter(entity => entity.type === CombatEntityType.MONSTER).every(entity => entity.hp <= 0);

  // Reset combat and save character HP
  const handleCombatEnd = () => {
    // Save character HP
    activeCombat.forEach(entity => {
      if (entity.type === CombatEntityType.CHARACTER) {
        editCharacter(entity.id, { hp: entity.hp });
      }
    });

    // Reset combat state
    setActiveCombat([]);
    setCurrentTurn(0);
  };

  // Auto-detect combat end and reset after delay
  React.useEffect(() => {
    if (combatEnded && activeCombat.length > 0) {
      // Wait before resetting so user can see the result
      const timer = setTimeout(() => {
        handleCombatEnd();
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [combatEnded, activeCombat]);

  // Manual combat end
  const endCombat = () => {
    handleCombatEnd();
  };

  // Modify HP of combat entity
  const modifyHp = (id: string, instanceId: string | undefined, newHp: number) => {
    setActiveCombat(prev => prev.map(entite => {
      if (entite.id === id && entite.instanceId === instanceId) {
        return { ...entite, hp: Math.max(0, newHp) };
      }
      return entite;
    }));
  };

  // Add effect to combat entity
  const addEffect = (id: string, instanceId: string | undefined, effect: Omit<Effect, 'id'>) => {
    setActiveCombat(prev => prev.map(entite => {
      if (entite.id === id && entite.instanceId === instanceId) {
        const newEffect: Effect = {
          ...effect,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        };
        return { ...entite, effects: [...entite.effects, newEffect] };
      }
      return entite;
    }));
  };

  // Remove effect from combat entity
  const removeEffect = (id: string, instanceId: string | undefined, effectId: string) => {
    setActiveCombat(prev => prev.map(entite => {
      if (entite.id === id && entite.instanceId === instanceId) {
        return { ...entite, effects: entite.effects.filter(e => e.id !== effectId) };
      }
      return entite;
    }));
  };

  // Decrement effects duration and remove expired ones at the start of a turn
  const processEffectsAtTurnStart = (entityId: string, entityInstanceId: string | undefined) => {
    setActiveCombat(prev => prev.map(entite => {
      if (entite.id === entityId && entite.instanceId === entityInstanceId) {
        // Decrement duration and remove expired effects
        const updatedEffects = entite.effects
          .map(effect => ({ ...effect, duration: effect.duration - 1 }))
          .filter(effect => effect.duration > 0);
        return { ...entite, effects: updatedEffects };
      }
      return entite;
    }));
  };

  // Move to next turn
  const nextTurn = () => {
    const sortedEntities = [...activeCombat].sort((a, b) => b.initiative - a.initiative);
    const nextIndex = (currentTurn + 1) % activeCombat.length;
    const nextEntity = sortedEntities[nextIndex];
    
    // Move to next turn
    setCurrentTurn(nextIndex);
    
    // Process effects for the new entity at the start of its turn
    if (nextEntity) {
      processEffectsAtTurnStart(nextEntity.id, nextEntity.instanceId);
    }
  };

  // Move to previous turn
  const previousTurn = () => {
    setCurrentTurn(prev => prev === 0 ? activeCombat.length - 1 : prev - 1);
  };

  const tabs = [
    { id: 'personnages', label: 'Personnages', icon: Users },
    { id: 'monstres', label: 'Monstres', icon: Skull },
    { id: 'combat', label: 'Combat', icon: Sword },
    { id: 'sauvegardes', label: 'Sauvegardes', icon: Save }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 text-white shadow-lg border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold">Combat Pad</h1>
            </div>
            <div className="text-sm text-gray-300">
              Gestionnaire de combat Pathfinder
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {activeTab === 'personnages' && (
          <CharactersPanel
            characters={characters}
            onAdd={addCharacter}
            onEdit={editCharacter}
            onDelete={deleteCharacter}
          />
        )}

        {activeTab === 'monstres' && (
          <MonstresPanel
            monsters={monsters}
            onAdd={addMonster}
            onEdit={editMonster}
            onDelete={deleteMonster}
          />
        )}

        {activeTab === 'combat' && (
          <CombatPanel
            characters={characters}
            monsters={monsters}
            activeCombat={activeCombat}
            currentTurn={currentTurn}
            onStartCombat={startCombat}
            onEndCombat={endCombat}
            onModifyHp={modifyHp}
            onNextTurn={nextTurn}
            onPreviousTurn={previousTurn}
            combatEnded={combatEnded}
            onAddEffect={addEffect}
            onRemoveEffect={removeEffect}
          />
        )}

        {activeTab === 'sauvegardes' && (
          <SaveManager
            characters={characters}
            monsters={monsters}
            onLoadGame={handleLoadGame}
          />
        )}
      </main>
    </div>
  );
}

export default App; 