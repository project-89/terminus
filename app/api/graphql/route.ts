import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "fs";
import { join } from "path";
import { resolvers } from "@/app/graphql/resolvers";

const typeDefs = readFileSync(
  join(process.cwd(), "app/graphql/schema.graphql"),
  "utf-8"
);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const server = new ApolloServer({
  schema,
});

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
