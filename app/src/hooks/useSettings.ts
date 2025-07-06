import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '../services/settingsService';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];

interface SettingsState {
  profile: Profile | null;
  preferences: UserPreferences | null;
}

const fetchSettings = async (): Promise<SettingsState> => {
  const { profile, preferences } = await SettingsService.getAllSettings();
  if (!profile || !preferences) {
    return await SettingsService.initializeDefaultSettings();
  }
  return { profile, preferences };
};

export const useSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: settings, isLoading, error } = useQuery<SettingsState, Error>({
    queryKey: ['settings', user?.id],
    queryFn: fetchSettings,
    enabled: !!user,
  });

  const updateProfileMutation = useMutation<Profile, Error, Partial<Profile>>({
    mutationFn: (updates) => SettingsService.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] });
    },
  });

  const updatePreferencesMutation = useMutation<UserPreferences, Error, Partial<UserPreferences>>({
    mutationFn: (updates) => SettingsService.updatePreferences(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] });
    },
  });

  const saveSettings = async () => {
    if (!settings?.profile || !settings?.preferences) return;
    try {
      await Promise.all([
        updateProfileMutation.mutateAsync(settings.profile),
        updatePreferencesMutation.mutateAsync(settings.preferences),
      ]);
      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateProfileSetting = (key: keyof Profile, value: any) => {
    if (!settings?.profile) return;
    const newProfile = { ...settings.profile, [key]: value };
    queryClient.setQueryData(['settings', user?.id], { ...settings, profile: newProfile });
  };

  const updatePreferenceSetting = (key: keyof UserPreferences, value: any) => {
    if (!settings?.preferences) return;
    const newPreferences = { ...settings.preferences, [key]: value };
    queryClient.setQueryData(['settings', user?.id], { ...settings, preferences: newPreferences });
  };

  return {
    settings,
    isLoading,
    isSaving: updateProfileMutation.isPending || updatePreferencesMutation.isPending,
    error: error?.message || null,
    successMessage,
    updateProfileSetting,
    updatePreferenceSetting,
    saveSettings,
  };
};