import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Character, CharacterType } from '../interfaces/Character.interface';

interface CharactersPanelProps {
  characters: Character[];
  onAdd: (character: Omit<Character, 'id'>) => void;
  onEdit: (id: string, character: Partial<Character>) => void;
  onDelete: (id: string) => void;
}

export default function CharactersPanel({
  characters,
  onAdd,
  onEdit,
  onDelete
}: CharactersPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: CharacterType.PLAYER,
    maxHp: 0,
    hp: 0,
    ac: 0,
  });

  // Handle form submission (add or edit character)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      onEdit(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }

    setFormData({ name: '', type: CharacterType.PLAYER, maxHp: 0, hp: 0, ac: 0 });
    setShowForm(false);
  };

  // Start editing a character
  const handleEdit = (character: Character) => {
    setEditingId(character.id);
    setFormData({
      name: character.name,
      type: character.type,
      maxHp: character.maxHp,
      hp: character.hp,
      ac: character.ac,
    });
    setShowForm(true);
  };

  // Cancel form editing
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', type: CharacterType.PLAYER, maxHp: 0, hp: 0, ac: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Personnages</h2>
          <p className="text-gray-300">Gérez vos personnages joueurs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un personnage</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingId ? 'Modifier le personnage' : 'Ajouter un personnage'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Classe d'armure
                </label>
                <input
                  type="number"
                  value={formData.ac}
                  onChange={(e) => setFormData(prev => ({ ...prev, ac: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Points de vie maximum
                </label>
                <input
                  type="number"
                  value={formData.maxHp}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxHp: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Points de vie actuels
                </label>
                <input
                  type="number"
                  value={formData.hp}
                  onChange={(e) => setFormData(prev => ({ ...prev, hp: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{editingId ? 'Modifier' : 'Ajouter'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Characters List */}
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
        {characters.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>Aucun personnage ajouté</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Points de vie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Classe d'armure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {characters.map((character) => (
                  <tr key={character.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {character.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {character.hp} / {character.maxHp}
                      </div>
                      <div className="w-32 bg-gray-600 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${character.hp <= 0 ? 'bg-red-500' :
                              character.hp < character.maxHp / 2 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${Math.max(0, (character.hp / character.maxHp) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {character.ac}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(character)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(character.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 