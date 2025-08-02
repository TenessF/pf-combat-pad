import React, { useState, useEffect } from 'react';
import { Save, Download, Trash2, Plus, Calendar, FileText } from 'lucide-react';
import { Character } from '../interfaces/Character.interface';
import { Monster } from '../interfaces/Monster.interface';
import { SaveFile } from '../interfaces/SaveFile.interface';

interface SaveManagerProps {
  characters: Character[];
  monsters: Monster[];
  onLoadGame: (characters: Character[], monsters: Monster[]) => void;
}

const SaveManager: React.FC<SaveManagerProps> = ({ characters, monsters, onLoadGame }) => {
  const [saveFiles, setSaveFiles] = useState<SaveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load save files on component mount
  useEffect(() => {
    loadSaveFiles();
  }, []);

  // Load available save files
  const loadSaveFiles = async () => {
    try {
      const result = await window.electronAPI.getSaveFiles();
      if (result.success) {
        setSaveFiles(result.files);
      } else {
        console.error('Error loading save files:', result.error);
      }
    } catch (error) {
      console.error('Error loading save files:', error);
    }
  };

  // Save current game state
  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await window.electronAPI.saveGameState({
        characters,
        monsters
      });

      if (result.success) {
        setMessage({ type: 'success', text: `Sauvegarde créée : ${result.filename}` });
        await loadSaveFiles(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: `Erreur lors de la sauvegarde : ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setIsLoading(false);
    }
  };

  // Load the most recent save
  const handleLoadLatest = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await window.electronAPI.loadGameState();

      if (result.success) {
        onLoadGame(result.data.characters, result.data.monsters);
        setMessage({ type: 'success', text: `Chargement réussi : ${result.filename}` });
      } else {
        setMessage({ type: 'error', text: `Erreur lors du chargement : ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
    } finally {
      setIsLoading(false);
    }
  };

  // Load specific save file
  const handleLoadSave = async (filename: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await window.electronAPI.loadSaveFile(filename);

      if (result.success) {
        onLoadGame(result.data.characters, result.data.monsters);
        setMessage({ type: 'success', text: `Chargement réussi : ${result.filename}` });
      } else {
        setMessage({ type: 'error', text: `Erreur lors du chargement : ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete save file
  const handleDeleteSave = async (filename: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la sauvegarde "${filename}" ?`)) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await window.electronAPI.deleteSaveFile(filename);

      if (result.success) {
        setMessage({ type: 'success', text: 'Sauvegarde supprimée' });
        await loadSaveFiles(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: `Erreur lors de la suppression : ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setIsLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Save className="h-5 w-5" />
          <span>Gestion des Sauvegardes</span>
        </h3>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Sauvegarder</span>
        </button>

        <button
          onClick={handleLoadLatest}
          disabled={isLoading || saveFiles.length === 0}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Charger le plus récent</span>
        </button>
      </div>

      {/* Message display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.type === 'success'
          ? 'bg-green-900 text-green-200 border border-green-700'
          : 'bg-red-900 text-red-200 border border-red-700'
          }`}>
          {message.text}
        </div>
      )}

      {/* Save files list */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-300 flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Sauvegardes disponibles ({saveFiles.length})</span>
        </h4>

        {saveFiles.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            Aucune sauvegarde disponible
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {saveFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-white font-medium">{file.name}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {formatDate(file.timestamp)} • {formatFileSize(file.size)}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoadSave(file.name)}
                    disabled={isLoading}
                    className="text-green-400 hover:text-green-300 disabled:text-gray-500 transition-colors"
                    title="Charger cette sauvegarde"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteSave(file.name)}
                    disabled={isLoading}
                    className="text-red-400 hover:text-red-300 disabled:text-gray-500 transition-colors"
                    title="Supprimer cette sauvegarde"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-gray-400">Chargement...</span>
        </div>
      )}
    </div>
  );
};

export default SaveManager; 