/**
 * Settings Service
 * Manages School Settings and Profile Data
 */
import api from './api';
import { localStore } from './localStore';

export const settingsService = {
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 60));
      return {
        success: true,
        data: localStore.getSettings(),
      };
    }
  },

  updateSettings: async (settingsData) => {
    try {
      const response = await api.put('/settings', settingsData);
      return response.data;
    } catch (err) {
      await new Promise((r) => setTimeout(r, 100));
      const current = localStore.getSettings();
      const updated = {
        ...current,
        ...settingsData,
      };
      localStore.saveSettings(updated);

      // Also update stored user session name if changed
      const rawUser = localStorage.getItem('schoolerp_user');
      if (rawUser) {
        try {
          const userObj = JSON.parse(rawUser);
          userObj.schoolName = updated.schoolName;
          if (updated.adminEmail) userObj.email = updated.adminEmail;
          if (updated.adminName) userObj.name = updated.adminName;
          localStorage.setItem('schoolerp_user', JSON.stringify(userObj));
        } catch (e) {}
      }

      return {
        success: true,
        data: updated,
        message: 'School settings saved successfully',
      };
    }
  },
};
