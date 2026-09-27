module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    privacyPolicyUrl: process.env.GUARDAURORA_PRIVACY_POLICY_URL || 'https://guard-aurora.vercel.app/privacy',
    supportUrl: process.env.GUARDAURORA_SUPPORT_URL || 'https://guard-aurora.vercel.app/support',
    supportEmail: process.env.GUARDAURORA_SUPPORT_EMAIL || 'romiisromie@gmail.com',
    sentryDsn: process.env.SENTRY_DSN || '',
  },
});
