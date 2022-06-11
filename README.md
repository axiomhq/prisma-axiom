# URL Shortener
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?repository-url=https%3A%2F%2Fgithub.com%2Fseiflotfy%2Fhelloprisma&env=DATABASE_URL,DATABASE_MIGRATE_URL,PRISMA_CLIENT_ENGINE_TYPE&envDescription=Database%20connection%20strings%20your%20app%20depends%20on.%20You%20should%20switch%20back%20to%20the%20Prisma%20Data%20Platform%20to%20figure%20out%20what%20values%20to%20input%20here.)<br />

![Database diagram](https://raw.githubusercontent.com/prisma/prisma-schema-examples/main/URL%20Shortener/diagram.png)

(Generated via https://github.com/notiz-dev/prisma-dbml-generator + https://dbdiagram.io)

### Setting this project up locally

Once you clone your repo, you'll want to set up this repo for local development. In order to start using Prisma locally, you need to make Prisma aware of your database. The most portable way to do this is to use environment variables via a `.env` file.

1. You'll see that your Prisma Schema file (at `prisma/schema.prisma`) is already configured to use an environment variable called `DATABASE_URL`. [Read more about environment variables in Prisma](https://www.prisma.io/docs/concepts/more/environment-variables)
2. You'll need a database to connect to. You may use the same one you used while setting this project up on the Prisma Data Platform, but we recommend setting up a local database and use that during development. If you're new to databases, we recommend [reading up](https://www.prisma.io/dataguide/) on them. This guide also has instructions on how to set up a local database.
3. Once you have a locally accessible database connection string, create a new file called `.env` in the `prisma` directory, and populate it with: `DATABASE_URL="<replace-me-with-your-connection-string>"`. Prisma will automatically pick up the environment variable used in the schema and use its value to connect to your database.
4. Now you can run `npm run init` to set up your local database. This will create tables corresponding to models in your Prisma Schema and populate them with fake data for you to play around with.
   - [Read more about the Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
   - [Read more about database seeding](https://www.prisma.io/docs/guides/database/seed-database)

To learn more about Prisma, we recommend reading through our [Getting Started guide](https://www.prisma.io/docs/getting-started)