import { useState } from 'react';
import { Play, Square, ChevronLeft, ChevronRight, Plus, Minus, X, Zap } from 'lucide-react';
import { CombatEntity, CombatEntityType } from '../interfaces/CombatEntity.interface';
import { Character } from '../interfaces/Character.interface';
import { Monster } from '../interfaces/Monster.interface';
import { Effect } from '../interfaces/Effect.interface';
import React from 'react';

interface CombatPanelProps {
  characters: Character[];
  monsters: Monster[];
  activeCombat: CombatEntity[];
  currentTurn: number;
  onStartCombat: (charactersSelected: string[], monstersSelected: { id: string, nombre: number }[], characterInitiatives?: { [key: string]: number }) => void;
  onEndCombat: () => void;
  onModifyHp: (id: string, instanceId: string | undefined, newHp: number) => void;
  onNextTurn: () => void;
  onPreviousTurn: () => void;
  combatEnded: boolean;
  onAddEffect: (id: string, instanceId: string | undefined, effect: Omit<Effect, 'id'>) => void;
  onRemoveEffect: (id: string, instanceId: string | undefined, effectId: string) => void;
}

export default function CombatPanel({
  characters,
  monsters,
  activeCombat,
  currentTurn,
  onStartCombat,
  onEndCombat,
  onModifyHp,
  onNextTurn,
  onPreviousTurn,
  combatEnded,
  onAddEffect,
  onRemoveEffect
}: CombatPanelProps) {
  const [showSetup, setShowSetup] = useState(true);
  const [showInitiativeModal, setShowInitiativeModal] = useState(false);
  const [showEffectModal, setShowEffectModal] = useState(false);
  const [selectedEntityForEffect, setSelectedEntityForEffect] = useState<{ id: string; instanceId: string | undefined } | null>(null);
  const [effectFormData, setEffectFormData] = useState({ name: '', duration: 1 });
  const [charactersSelected, setCharactersSelected] = useState<string[]>([]);
  const [monstersSelected, setMonstersSelected] = useState<{ id: string, nombre: number }[]>([]);
  const [characterInitiatives, setCharacterInitiatives] = useState<{ [key: string]: number }>({});
  const [monsterInitiatives, setMonsterInitiatives] = useState<{ [key: string]: number }>({});

  // Roll a d20 die
  const rollD20 = () => {
    return Math.floor(Math.random() * 20) + 1;
  };

  // Calculate monster initiative (d20 + perception)
  const calculateMonsterInitiative = (monsterId: string) => {
    const monster = monsters.find(m => m.id === monsterId);
    if (!monster) return { roll: 0, initiative: 0 };

    const roll = rollD20();
    const initiative = roll + monster.perception;
    return { roll, initiative };
  };

  // Roll initiatives for all selected monsters
  const rollMonsterInitiatives = () => {
    const newMonsterInitiatives: { [key: string]: number } = {};

    monstersSelected.forEach(({ id }) => {
      const result = calculateMonsterInitiative(id);
      newMonsterInitiatives[id] = result.initiative;
    });

    setMonsterInitiatives(newMonsterInitiatives);
  };

  // Handle combat launch
  const handleLancerCombat = () => {
    if (charactersSelected.length === 0 && monstersSelected.length === 0) {
      alert('Veuillez sélectionner au moins un personnage ou un monstre pour lancer le combat.');
      return;
    }

    // Show initiative modal if characters or monsters are selected
    if (charactersSelected.length > 0 || monstersSelected.length > 0) {
      // Automatically roll monster initiatives
      rollMonsterInitiatives();
      setShowInitiativeModal(true);
    }
  };

  // Confirm initiative values and start combat
  const handleConfirmInitiative = () => {
    // Check that all character initiatives are entered
    const missingInitiative = charactersSelected.some(id =>
      characterInitiatives[id] === undefined || characterInitiatives[id] === null
    );

    if (missingInitiative) {
      alert('Veuillez saisir l\'initiative pour tous les personnages sélectionnés.');
      return;
    }

    // Combine character and monster initiatives
    const allInitiatives = { ...characterInitiatives, ...monsterInitiatives };

    // Start combat with all initiatives
    onStartCombat(charactersSelected, monstersSelected, allInitiatives);
    setShowSetup(false);
    setShowInitiativeModal(false);
    setCharacterInitiatives({});
    setMonsterInitiatives({});
  };

  // Cancel initiative modal
  const handleCancelInitiative = () => {
    setShowInitiativeModal(false);
    setCharacterInitiatives({});
    setMonsterInitiatives({});
  };

  // Reroll monster initiatives
  const handleRerollMonsters = () => {
    rollMonsterInitiatives();
  };

  // End combat manually
  const handleEndCombat = () => {
    onEndCombat();
    setShowSetup(true);
    setCharactersSelected([]);
    setMonstersSelected([]);
  };

  // Reset interface when combat ends automatically
  React.useEffect(() => {
    if (combatEnded && !showSetup) {
      // Reset interface after delay
      const timer = setTimeout(() => {
        setShowSetup(true);
        setCharactersSelected([]);
        setMonstersSelected([]);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [combatEnded, showSetup]);

  // Toggle character selection
  const toggleCharacter = (id: string) => {
    setCharactersSelected(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  // Toggle monster selection
  const toggleMonster = (id: string) => {
    setMonstersSelected(prev => {
      const existing = prev.find(m => m.id === id);
      if (existing) {
        return prev.filter(m => m.id !== id);
      } else {
        return [...prev, { id, nombre: 1 }];
      }
    });
  };

  // Modify monster count
  const modifyMonsterCount = (id: string, nombre: number) => {
    if (nombre <= 0) {
      setMonstersSelected(prev => prev.filter(m => m.id !== id));
    } else {
      setMonstersSelected(prev =>
        prev.map(m => m.id === id ? { ...m, nombre } : m)
      );
    }
  };

  // Handle add effect button click
  const handleAddEffectClick = (entityId: string, instanceId: string | undefined) => {
    setSelectedEntityForEffect({ id: entityId, instanceId });
    setEffectFormData({ name: '', duration: 1 });
    setShowEffectModal(true);
  };

  // Handle effect form submission
  const handleAddEffect = () => {
    if (!selectedEntityForEffect || !effectFormData.name.trim() || effectFormData.duration < 1) {
      return;
    }
    onAddEffect(selectedEntityForEffect.id, selectedEntityForEffect.instanceId, {
      name: effectFormData.name.trim(),
      duration: effectFormData.duration
    });
    setShowEffectModal(false);
    setSelectedEntityForEffect(null);
    setEffectFormData({ name: '', duration: 1 });
  };

  // Handle cancel effect modal
  const handleCancelEffectModal = () => {
    setShowEffectModal(false);
    setSelectedEntityForEffect(null);
    setEffectFormData({ name: '', duration: 1 });
  };

  const sortedEntities = [...activeCombat].sort((a, b) => b.initiative - a.initiative);
  const currentEntity = sortedEntities[currentTurn];

  // Effect modal
  if (showEffectModal && selectedEntityForEffect) {
    const entityForEffect = sortedEntities.find(e => e.id === selectedEntityForEffect.id && e.instanceId === selectedEntityForEffect.instanceId);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Ajouter un effet</h3>
            <button
              onClick={handleCancelEffectModal}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-gray-300 text-sm mb-2">
                Cible : <span className="font-medium text-white">{entityForEffect?.name}{entityForEffect?.instanceId && ` (${entityForEffect.instanceId.split('-')[1]})`}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom de l'effet
              </label>
              <input
                type="text"
                value={effectFormData.name}
                onChange={(e) => setEffectFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                placeholder="Ex: Haste, Bless, etc."
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Durée (en tours)
              </label>
              <input
                type="number"
                min="1"
                value={effectFormData.duration}
                onChange={(e) => setEffectFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                La durée diminue de 1 à chaque début de tour de cette entité. L'effet est automatiquement supprimé quand la durée atteint 0.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCancelEffectModal}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAddEffect}
              disabled={!effectFormData.name.trim() || effectFormData.duration < 1}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter l'effet</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Initiative modal
  if (showInitiativeModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Saisir les initiatives</h3>
            <button
              onClick={handleCancelInitiative}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Saisissez l'initiative pour chaque personnage sélectionné :
            </p>

            {charactersSelected.map(characterId => {
              const character = characters.find(c => c.id === characterId);
              if (!character) return null;

              return (
                <div key={characterId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{character.name}</span>
                    <p className="text-gray-400 text-sm">CA: {character.ac}</p>
                  </div>
                  <input
                    type="number"
                    value={characterInitiatives[characterId] || ''}
                    onChange={(e) => setCharacterInitiatives(prev => ({
                      ...prev,
                      [characterId]: parseInt(e.target.value) || 0
                    }))}
                    className="w-20 px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600 text-white text-center"
                    placeholder="0"
                  />
                </div>
              );
            })}

            <p className="text-gray-300 text-sm">
              Initiatives des monstres (jet dés automatique) :
            </p>
            {monstersSelected.map(monster => {
              const monsterEntity = monsters.find(m => m.id === monster.id);
              if (!monsterEntity) return null;

              const initiative = monsterInitiatives[monster.id];
              const roll = initiative ? initiative - monsterEntity.perception : 0;

              return (
                <div key={monster.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{monsterEntity.name}</span>
                    <p className="text-gray-400 text-sm">CA: {monsterEntity.ac} | Perception: {monsterEntity.perception > 0 ? `+${monsterEntity.perception}` : monsterEntity.perception}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm">Initiative: {initiative || 'Non lancé'} {initiative && `(Jet: ${roll})`}</span>
                    <button
                      onClick={() => handleRerollMonsters()}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCancelInitiative}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmInitiative}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Lancer le combat</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Combat</h2>
            <p className="text-gray-300">Sélectionnez les participants et lancez le combat</p>
          </div>
        </div>

        {/* Characters Selection */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Personnages</h3>
          {characters.length === 0 ? (
            <p className="text-gray-400">Aucun personnage disponible. Ajoutez des personnages dans l'onglet Personnages.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${charactersSelected.includes(character.id)
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                    }`}
                  onClick={() => toggleCharacter(character.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{character.name}</h4>
                      <p className="text-sm text-gray-300">
                        PV: {character.hp}/{character.maxHp} | CA: {character.ac}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${charactersSelected.includes(character.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-400'
                      }`}>
                      {charactersSelected.includes(character.id) && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monsters Selection */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Monstres</h3>
          {monsters.length === 0 ? (
            <p className="text-gray-400">Aucun monstre disponible. Ajoutez des monstres dans l'onglet Monstres.</p>
          ) : (
            <div className="space-y-4">
              {monsters.map((monster) => {
                const selected = monstersSelected.find(m => m.id === monster.id);
                return (
                  <div
                    key={monster.id}
                    className={`p-4 border rounded-lg transition-colors ${selected ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-700'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 cursor-pointer ${selected ? 'bg-red-500 border-red-500' : 'border-gray-400'
                            }`}
                          onClick={() => toggleMonster(monster.id)}
                        >
                          {selected && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{monster.name}</h4>
                          <p className="text-sm text-gray-300">
                            PV: {monster.maxHp} | CA: {monster.ac} | Perception: {monster.perception > 0 ? `+${monster.perception}` : monster.perception}
                          </p>
                        </div>
                      </div>
                      {selected && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => modifyMonsterCount(monster.id, selected.nombre - 1)}
                            className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-medium text-white">{selected.nombre}</span>
                          <button
                            onClick={() => modifyMonsterCount(monster.id, selected.nombre + 1)}
                            className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Start Combat Button */}
        <div className="flex justify-center">
          <button
            onClick={handleLancerCombat}
            disabled={charactersSelected.length === 0 && monstersSelected.length === 0}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Play className="h-5 w-5" />
            <span>Lancer le combat</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Combat en cours</h2>
          <p className="text-gray-300">
            {combatEnded ? (
              <span className="text-green-400 font-semibold">🎉 Victoire ! Combat terminé automatiquement</span>
            ) : (
              `Tour ${currentTurn + 1} sur ${sortedEntities.length}`
            )}
          </p>
        </div>
        <button
          onClick={handleEndCombat}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Square className="h-4 w-4" />
          <span>Terminer le combat</span>
        </button>
      </div>

      {/* Current Turn */}
      {currentEntity && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {currentEntity.name}
                {currentEntity.instanceId && ` (${currentEntity.instanceId.split('-')[1]})`}
              </h3>
              <p className="text-gray-300">
                {currentEntity.type === CombatEntityType.CHARACTER ? 'Personnage' : 'Monstre'} |
                Initiative: {currentEntity.initiative} |
                CA: {currentEntity.ac}
              </p>
              {/* Effects display */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">Effets actifs :</span>
                  <button
                    onClick={() => handleAddEffectClick(currentEntity.id, currentEntity.instanceId)}
                    className="flex items-center space-x-1 text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Ajouter</span>
                  </button>
                </div>
                {currentEntity.effects && currentEntity.effects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentEntity.effects.map((effect) => (
                      <div
                        key={effect.id}
                        className="flex items-center space-x-2 bg-purple-900/30 border border-purple-700 rounded px-2 py-1"
                      >
                        <span className="text-sm text-white">{effect.name}</span>
                        <span className="text-xs text-purple-300">({effect.duration} tour{effect.duration > 1 ? 's' : ''})</span>
                        <button
                          onClick={() => onRemoveEffect(currentEntity.id, currentEntity.instanceId, effect.id)}
                          className="text-purple-300 hover:text-red-400 transition-colors"
                          title="Supprimer l'effet"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Aucun effet actif</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {currentEntity.hp} / {currentEntity.maxHp}
                </div>
                <div className="w-32 bg-gray-600 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${currentEntity.hp <= 0 ? 'bg-red-500' :
                      currentEntity.hp < currentEntity.maxHp / 2 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${Math.max(0, (currentEntity.hp / currentEntity.maxHp) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onModifyHp(currentEntity.id, currentEntity.instanceId, currentEntity.hp - 1)}
                  className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onModifyHp(currentEntity.id, currentEntity.instanceId, currentEntity.hp + 1)}
                  className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onPreviousTurn}
          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Précédent</span>
        </button>
        <button
          onClick={onNextTurn}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span>Suivant</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Initiative List */}
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Ordre d'initiative</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Initiative
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  PV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  CA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Effets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {sortedEntities.map((entity, index) => (
                <tr
                  key={`${entity.id}-${entity.instanceId || 'main'}`}
                  className={`hover:bg-gray-700 ${index === currentTurn ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''
                    }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {entity.initiative}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {entity.name}
                      {entity.instanceId && ` (${entity.instanceId.split('-')[1]})`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${entity.type === CombatEntityType.CHARACTER
                      ? 'bg-blue-900 text-blue-200'
                      : 'bg-red-900 text-red-200'
                      }`}>
                      {entity.type === CombatEntityType.CHARACTER ? 'Personnage' : 'Monstre'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {entity.hp} / {entity.maxHp}
                    </div>
                    <div className="w-20 bg-gray-600 rounded-full h-1 mt-1">
                      <div
                        className={`h-1 rounded-full ${entity.hp <= 0 ? 'bg-red-500' :
                          entity.hp < entity.maxHp / 2 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${Math.max(0, (entity.hp / entity.maxHp) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {entity.ac}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 flex-wrap max-w-xs">
                      {entity.effects && entity.effects.length > 0 ? (
                        entity.effects.map((effect) => (
                          <div
                            key={effect.id}
                            className="flex items-center space-x-1 bg-purple-900/30 border border-purple-700 rounded px-2 py-1"
                          >
                            <span className="text-xs text-white">{effect.name}</span>
                            <span className="text-xs text-purple-300">({effect.duration})</span>
                            <button
                              onClick={() => onRemoveEffect(entity.id, entity.instanceId, effect.id)}
                              className="text-purple-300 hover:text-red-400 transition-colors ml-1"
                              title="Supprimer l'effet"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                          <span className="text-xs text-gray-500">Aucun</span>
                        )}
                      <button
                        onClick={() => handleAddEffectClick(entity.id, entity.instanceId)}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title="Ajouter un effet"
                      >
                        <Zap className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onModifyHp(entity.id, entity.instanceId, entity.hp - 1)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onModifyHp(entity.id, entity.instanceId, entity.hp + 1)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 