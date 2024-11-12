export const resolvers = {
  Query: {
    me: (_parent: any, _args: any, _context: any) => {
      // TODO: Implement me resolver
      return null;
    },
  },
  Mutation: {
    login: (_parent: any, _args: any, _context: any) => {
      // TODO: Implement login resolver
      throw new Error("Not implemented");
    },
    logout: (_parent: any, _args: any, _context: any) => {
      // TODO: Implement logout resolver
      return true;
    },
  },
};
