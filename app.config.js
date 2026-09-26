module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    privacyPolicyUrl: process.env.GUARDAURORA_PRIVACY_POLICY_URL || '',
    supportEmail: process.env.GUARDAURORA_SUPPORT_EMAIL || '',
    sentryDsn: process.env.SENTRY_DSN || '',
  },
});
