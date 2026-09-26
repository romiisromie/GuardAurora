import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  privacyPolicyUrl?: string;
  termsUrl?: string;
  supportEmail?: string;
  sentryDsn?: string;
  chatApiUrl?: string;
};

export const Config = {
  privacyPolicyUrl: extra.privacyPolicyUrl || '',
  termsUrl: extra.termsUrl || '',
  supportEmail: extra.supportEmail || '',
  sentryDsn: extra.sentryDsn || '',
  chatApiUrl: extra.chatApiUrl || '',
};
