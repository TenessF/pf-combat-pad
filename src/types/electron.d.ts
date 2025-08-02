declare global {
  interface Window {
    electronAPI: {
      saveGameState: (data: any) => Promise<any>;
      loadGameState: () => Promise<any>;
      getSaveFiles: () => Promise<any>;
      loadSaveFile: (filename: string) => Promise<any>;
      deleteSaveFile: (filename: string) => Promise<any>;
      sendMessage: (message: any) => void;
      onMessage: (callback: (event: any, ...args: any[]) => void) => void;
      invoke: (channel: string, data?: any) => Promise<any>;
      removeAllListeners: (channel: string) => void;
    };
  }
}

export {}; 