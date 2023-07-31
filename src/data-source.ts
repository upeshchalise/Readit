import "reflect-metadata";
import { DataSource } from "typeorm";


const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "upesh",
  password: "my_pass",
  database: "readit",
  synchronize: true,
  logging: true,
  entities: ["src/entity/**/*{.js,.ts}"],
  migrations: ["src/migration/**/*{.js,.ts}"],
  subscribers: ["src/subscriber/**/*{.js,.ts}"],


  // cli: {
  //   entitiesDir: "src/entities",
  //   migrationsDir: "src/migrations",
  //   subscribersDir: "src/subscribers",
  // },
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

export default AppDataSource;
