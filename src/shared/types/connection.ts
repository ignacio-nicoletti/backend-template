export type DBConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  whiteList: string[];
};

export type AppConfig = {
  env: "development" | "production" | "test";
  port: number;
  db: DBConfig;
  encryptionKey: string;
};
