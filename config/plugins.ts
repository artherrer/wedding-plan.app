import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
  email: {
    config: {
      provider: 'sendgrid', // For community providers pass the full package name (e.g. provider: 'strapi-provider-email-mandrill')
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
        // region: 'eu', // Optional: set to 'eu' for EU data residency (default: 'global')
      },
      settings: {
        defaultFrom: 'noreply@brendayarturo.com',
        defaultReplyTo: 'noreply@brendayarturo.com',
        testAddress: 'noreply@brendayarturo.com',
      },
    },
  },
});

export default config;
