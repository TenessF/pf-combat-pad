import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Monster, MonsterType } from '../interfaces/Monster.interface';

interface MonstresPanelProps {
  monsters: Monster[];
  onAdd: (monster: Omit<Monster, 'id'>) => void;
  onEdit: (id: string, monster: Partial<Monster>) => void;
  onDelete: (id: string) => void;
}

export default function MonstresPanel({
  monsters,
  onAdd,
  onEdit,
  onDelete
}: MonstresPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: MonsterType.MONSTER,
    maxHp: 0,
    ac: 0,
    perception: 0,
  });

  // Handle form submission (add or edit monster)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      onEdit(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }
    
    setFormData({ name: '', maxHp: 0, ac: 0, perception: 0, type: MonsterType.MONSTER });
    setShowForm(false);
  };

  // Start editing a monster
  const handleEdit = (monster: Monster) => {
    setEditingId(monster.id);
    setFormData({
      name: monster.name,
      maxHp: monster.maxHp,
      ac: monster.ac,
      perception: monster.perception,
      type: monster.type
    });
    setShowForm(true);
  };

  // Cancel form editing
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', maxHp: 0, ac: 0, perception: 0, type: MonsterType.MONSTER });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Monstres</h2>
          <p className="text-gray-300">Gérez vos monstres et créatures</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un monstre</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingId ? 'Modifier le monstre' : 'Ajouter un monstre'}
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
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-700 text-white"
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
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-700 text-white"
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
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Perception (bonus d'initiative)
                </label>
                <input
                  type="number"
                  value={formData.perception}
                  onChange={(e) => setFormData(prev => ({ ...prev, perception: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-700 text-white"
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
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{editingId ? 'Modifier' : 'Ajouter'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Monsters List */}
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
        {monsters.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>Aucun monstre ajouté</p>
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
                    Perception
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {monsters.map((monster) => (
                  <tr key={monster.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {monster.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {monster.maxHp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {monster.ac}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {monster.perception > 0 ? `+${monster.perception}` : monster.perception}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(monster)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(monster.id)}
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