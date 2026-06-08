import path from 'path';

export default ({ env }: any) => {
  const dbUrl = env('DATABASE_URL');
  let urlConfig: any = {};

  if (dbUrl) {
    try {
      const parsed = new URL(dbUrl);
      urlConfig = {
        host: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : 5432,
        database: parsed.pathname.startsWith('/') ? parsed.pathname.substring(1) : parsed.pathname,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
      };
    } catch (err: any) {
      console.warn('[Database Config] Failed to parse DATABASE_URL:', err.message);
    }
  }

  return {
    connection: {
      client: env('DATABASE_CLIENT', 'sqlite'),
      connection: {
        host: urlConfig.host || env('DATABASE_HOST', 'localhost'),
        port: urlConfig.port || env.int('DATABASE_PORT', 5432),
        database: urlConfig.database || env('DATABASE_NAME', 'strapi'),
        user: urlConfig.user || env('DATABASE_USERNAME', 'strapi'),
        password: urlConfig.password || env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
      useNullAsDefault: true,
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};

