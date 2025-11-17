
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Session
 * 
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>
/**
 * Model Thread
 * 
 */
export type Thread = $Result.DefaultSelection<Prisma.$ThreadPayload>
/**
 * Model Message
 * 
 */
export type Message = $Result.DefaultSelection<Prisma.$MessagePayload>
/**
 * Model AgentNote
 * 
 */
export type AgentNote = $Result.DefaultSelection<Prisma.$AgentNotePayload>
/**
 * Model Experiment
 * 
 */
export type Experiment = $Result.DefaultSelection<Prisma.$ExperimentPayload>
/**
 * Model ExperimentEvent
 * 
 */
export type ExperimentEvent = $Result.DefaultSelection<Prisma.$ExperimentEventPayload>
/**
 * Model GameSession
 * 
 */
export type GameSession = $Result.DefaultSelection<Prisma.$GameSessionPayload>
/**
 * Model GameMessage
 * 
 */
export type GameMessage = $Result.DefaultSelection<Prisma.$GameMessagePayload>
/**
 * Model MemoryEvent
 * 
 */
export type MemoryEvent = $Result.DefaultSelection<Prisma.$MemoryEventPayload>
/**
 * Model MemoryEmbedding
 * 
 */
export type MemoryEmbedding = $Result.DefaultSelection<Prisma.$MemoryEmbeddingPayload>
/**
 * Model PlayerProfile
 * 
 */
export type PlayerProfile = $Result.DefaultSelection<Prisma.$PlayerProfilePayload>
/**
 * Model MissionDefinition
 * 
 */
export type MissionDefinition = $Result.DefaultSelection<Prisma.$MissionDefinitionPayload>
/**
 * Model MissionRun
 * 
 */
export type MissionRun = $Result.DefaultSelection<Prisma.$MissionRunPayload>
/**
 * Model Reward
 * 
 */
export type Reward = $Result.DefaultSelection<Prisma.$RewardPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  AGENT: 'AGENT',
  ADMIN: 'ADMIN'
};

export type Role = (typeof Role)[keyof typeof Role]


export const ThreadKind: {
  ADVENTURE: 'ADVENTURE',
  OPS: 'OPS'
};

export type ThreadKind = (typeof ThreadKind)[keyof typeof ThreadKind]


export const SessionStatus: {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED'
};

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus]


export const MemoryEventType: {
  OBSERVATION: 'OBSERVATION',
  REFLECTION: 'REFLECTION',
  MISSION: 'MISSION',
  REPORT: 'REPORT',
  SYSTEM: 'SYSTEM',
  TOOL: 'TOOL'
};

export type MemoryEventType = (typeof MemoryEventType)[keyof typeof MemoryEventType]


export const MissionRunStatus: {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  SUBMITTED: 'SUBMITTED',
  REVIEWING: 'REVIEWING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export type MissionRunStatus = (typeof MissionRunStatus)[keyof typeof MissionRunStatus]


export const RewardType: {
  CREDIT: 'CREDIT',
  TOKEN: 'TOKEN',
  BADGE: 'BADGE'
};

export type RewardType = (typeof RewardType)[keyof typeof RewardType]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type ThreadKind = $Enums.ThreadKind

export const ThreadKind: typeof $Enums.ThreadKind

export type SessionStatus = $Enums.SessionStatus

export const SessionStatus: typeof $Enums.SessionStatus

export type MemoryEventType = $Enums.MemoryEventType

export const MemoryEventType: typeof $Enums.MemoryEventType

export type MissionRunStatus = $Enums.MissionRunStatus

export const MissionRunStatus: typeof $Enums.MissionRunStatus

export type RewardType = $Enums.RewardType

export const RewardType: typeof $Enums.RewardType

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<ExtArgs>;

  /**
   * `prisma.thread`: Exposes CRUD operations for the **Thread** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Threads
    * const threads = await prisma.thread.findMany()
    * ```
    */
  get thread(): Prisma.ThreadDelegate<ExtArgs>;

  /**
   * `prisma.message`: Exposes CRUD operations for the **Message** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Messages
    * const messages = await prisma.message.findMany()
    * ```
    */
  get message(): Prisma.MessageDelegate<ExtArgs>;

  /**
   * `prisma.agentNote`: Exposes CRUD operations for the **AgentNote** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AgentNotes
    * const agentNotes = await prisma.agentNote.findMany()
    * ```
    */
  get agentNote(): Prisma.AgentNoteDelegate<ExtArgs>;

  /**
   * `prisma.experiment`: Exposes CRUD operations for the **Experiment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Experiments
    * const experiments = await prisma.experiment.findMany()
    * ```
    */
  get experiment(): Prisma.ExperimentDelegate<ExtArgs>;

  /**
   * `prisma.experimentEvent`: Exposes CRUD operations for the **ExperimentEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ExperimentEvents
    * const experimentEvents = await prisma.experimentEvent.findMany()
    * ```
    */
  get experimentEvent(): Prisma.ExperimentEventDelegate<ExtArgs>;

  /**
   * `prisma.gameSession`: Exposes CRUD operations for the **GameSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GameSessions
    * const gameSessions = await prisma.gameSession.findMany()
    * ```
    */
  get gameSession(): Prisma.GameSessionDelegate<ExtArgs>;

  /**
   * `prisma.gameMessage`: Exposes CRUD operations for the **GameMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GameMessages
    * const gameMessages = await prisma.gameMessage.findMany()
    * ```
    */
  get gameMessage(): Prisma.GameMessageDelegate<ExtArgs>;

  /**
   * `prisma.memoryEvent`: Exposes CRUD operations for the **MemoryEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemoryEvents
    * const memoryEvents = await prisma.memoryEvent.findMany()
    * ```
    */
  get memoryEvent(): Prisma.MemoryEventDelegate<ExtArgs>;

  /**
   * `prisma.memoryEmbedding`: Exposes CRUD operations for the **MemoryEmbedding** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemoryEmbeddings
    * const memoryEmbeddings = await prisma.memoryEmbedding.findMany()
    * ```
    */
  get memoryEmbedding(): Prisma.MemoryEmbeddingDelegate<ExtArgs>;

  /**
   * `prisma.playerProfile`: Exposes CRUD operations for the **PlayerProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlayerProfiles
    * const playerProfiles = await prisma.playerProfile.findMany()
    * ```
    */
  get playerProfile(): Prisma.PlayerProfileDelegate<ExtArgs>;

  /**
   * `prisma.missionDefinition`: Exposes CRUD operations for the **MissionDefinition** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MissionDefinitions
    * const missionDefinitions = await prisma.missionDefinition.findMany()
    * ```
    */
  get missionDefinition(): Prisma.MissionDefinitionDelegate<ExtArgs>;

  /**
   * `prisma.missionRun`: Exposes CRUD operations for the **MissionRun** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MissionRuns
    * const missionRuns = await prisma.missionRun.findMany()
    * ```
    */
  get missionRun(): Prisma.MissionRunDelegate<ExtArgs>;

  /**
   * `prisma.reward`: Exposes CRUD operations for the **Reward** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rewards
    * const rewards = await prisma.reward.findMany()
    * ```
    */
  get reward(): Prisma.RewardDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Session: 'Session',
    Thread: 'Thread',
    Message: 'Message',
    AgentNote: 'AgentNote',
    Experiment: 'Experiment',
    ExperimentEvent: 'ExperimentEvent',
    GameSession: 'GameSession',
    GameMessage: 'GameMessage',
    MemoryEvent: 'MemoryEvent',
    MemoryEmbedding: 'MemoryEmbedding',
    PlayerProfile: 'PlayerProfile',
    MissionDefinition: 'MissionDefinition',
    MissionRun: 'MissionRun',
    Reward: 'Reward'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "session" | "thread" | "message" | "agentNote" | "experiment" | "experimentEvent" | "gameSession" | "gameMessage" | "memoryEvent" | "memoryEmbedding" | "playerProfile" | "missionDefinition" | "missionRun" | "reward"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>
        fields: Prisma.SessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      Thread: {
        payload: Prisma.$ThreadPayload<ExtArgs>
        fields: Prisma.ThreadFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ThreadFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThreadPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ThreadFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThreadPayload>
          }
          findFirst: {
            args: Prisma.ThreadFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThreadPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ThreadFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThreadPayload>
          }
          findMany: {
            args: Prisma.ThreadFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThreadPayload>[]
          }
          create: {
            args: Prisma.ThreadCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThreadPayload>
          }
          createMany: {
            args: Prisma.ThreadCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ThreadCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThreadPayload>[]
          }
          delete: {
            args: Prisma.ThreadDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThreadPayload>
          }
          update: {
            args: Prisma.ThreadUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThreadPayload>
          }
          deleteMany: {
            args: Prisma.ThreadDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ThreadUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ThreadUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThreadPayload>
          }
          aggregate: {
            args: Prisma.ThreadAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateThread>
          }
          groupBy: {
            args: Prisma.ThreadGroupByArgs<ExtArgs>
            result: $Utils.Optional<ThreadGroupByOutputType>[]
          }
          count: {
            args: Prisma.ThreadCountArgs<ExtArgs>
            result: $Utils.Optional<ThreadCountAggregateOutputType> | number
          }
        }
      }
      Message: {
        payload: Prisma.$MessagePayload<ExtArgs>
        fields: Prisma.MessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          findFirst: {
            args: Prisma.MessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          findMany: {
            args: Prisma.MessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          create: {
            args: Prisma.MessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          createMany: {
            args: Prisma.MessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          delete: {
            args: Prisma.MessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          update: {
            args: Prisma.MessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          deleteMany: {
            args: Prisma.MessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          aggregate: {
            args: Prisma.MessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMessage>
          }
          groupBy: {
            args: Prisma.MessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<MessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.MessageCountArgs<ExtArgs>
            result: $Utils.Optional<MessageCountAggregateOutputType> | number
          }
        }
      }
      AgentNote: {
        payload: Prisma.$AgentNotePayload<ExtArgs>
        fields: Prisma.AgentNoteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentNoteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentNotePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentNoteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentNotePayload>
          }
          findFirst: {
            args: Prisma.AgentNoteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentNotePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentNoteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentNotePayload>
          }
          findMany: {
            args: Prisma.AgentNoteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentNotePayload>[]
          }
          create: {
            args: Prisma.AgentNoteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentNotePayload>
          }
          createMany: {
            args: Prisma.AgentNoteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgentNoteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentNotePayload>[]
          }
          delete: {
            args: Prisma.AgentNoteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentNotePayload>
          }
          update: {
            args: Prisma.AgentNoteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentNotePayload>
          }
          deleteMany: {
            args: Prisma.AgentNoteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentNoteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AgentNoteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentNotePayload>
          }
          aggregate: {
            args: Prisma.AgentNoteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgentNote>
          }
          groupBy: {
            args: Prisma.AgentNoteGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentNoteGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgentNoteCountArgs<ExtArgs>
            result: $Utils.Optional<AgentNoteCountAggregateOutputType> | number
          }
        }
      }
      Experiment: {
        payload: Prisma.$ExperimentPayload<ExtArgs>
        fields: Prisma.ExperimentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExperimentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExperimentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentPayload>
          }
          findFirst: {
            args: Prisma.ExperimentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExperimentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentPayload>
          }
          findMany: {
            args: Prisma.ExperimentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentPayload>[]
          }
          create: {
            args: Prisma.ExperimentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentPayload>
          }
          createMany: {
            args: Prisma.ExperimentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExperimentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentPayload>[]
          }
          delete: {
            args: Prisma.ExperimentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentPayload>
          }
          update: {
            args: Prisma.ExperimentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentPayload>
          }
          deleteMany: {
            args: Prisma.ExperimentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExperimentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExperimentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentPayload>
          }
          aggregate: {
            args: Prisma.ExperimentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExperiment>
          }
          groupBy: {
            args: Prisma.ExperimentGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExperimentGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExperimentCountArgs<ExtArgs>
            result: $Utils.Optional<ExperimentCountAggregateOutputType> | number
          }
        }
      }
      ExperimentEvent: {
        payload: Prisma.$ExperimentEventPayload<ExtArgs>
        fields: Prisma.ExperimentEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExperimentEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExperimentEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentEventPayload>
          }
          findFirst: {
            args: Prisma.ExperimentEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExperimentEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentEventPayload>
          }
          findMany: {
            args: Prisma.ExperimentEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentEventPayload>[]
          }
          create: {
            args: Prisma.ExperimentEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentEventPayload>
          }
          createMany: {
            args: Prisma.ExperimentEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExperimentEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentEventPayload>[]
          }
          delete: {
            args: Prisma.ExperimentEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentEventPayload>
          }
          update: {
            args: Prisma.ExperimentEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentEventPayload>
          }
          deleteMany: {
            args: Prisma.ExperimentEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExperimentEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExperimentEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExperimentEventPayload>
          }
          aggregate: {
            args: Prisma.ExperimentEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExperimentEvent>
          }
          groupBy: {
            args: Prisma.ExperimentEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExperimentEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExperimentEventCountArgs<ExtArgs>
            result: $Utils.Optional<ExperimentEventCountAggregateOutputType> | number
          }
        }
      }
      GameSession: {
        payload: Prisma.$GameSessionPayload<ExtArgs>
        fields: Prisma.GameSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GameSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GameSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          findFirst: {
            args: Prisma.GameSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GameSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          findMany: {
            args: Prisma.GameSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>[]
          }
          create: {
            args: Prisma.GameSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          createMany: {
            args: Prisma.GameSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GameSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>[]
          }
          delete: {
            args: Prisma.GameSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          update: {
            args: Prisma.GameSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          deleteMany: {
            args: Prisma.GameSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GameSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GameSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          aggregate: {
            args: Prisma.GameSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGameSession>
          }
          groupBy: {
            args: Prisma.GameSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<GameSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.GameSessionCountArgs<ExtArgs>
            result: $Utils.Optional<GameSessionCountAggregateOutputType> | number
          }
        }
      }
      GameMessage: {
        payload: Prisma.$GameMessagePayload<ExtArgs>
        fields: Prisma.GameMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GameMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GameMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameMessagePayload>
          }
          findFirst: {
            args: Prisma.GameMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GameMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameMessagePayload>
          }
          findMany: {
            args: Prisma.GameMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameMessagePayload>[]
          }
          create: {
            args: Prisma.GameMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameMessagePayload>
          }
          createMany: {
            args: Prisma.GameMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GameMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameMessagePayload>[]
          }
          delete: {
            args: Prisma.GameMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameMessagePayload>
          }
          update: {
            args: Prisma.GameMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameMessagePayload>
          }
          deleteMany: {
            args: Prisma.GameMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GameMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GameMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameMessagePayload>
          }
          aggregate: {
            args: Prisma.GameMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGameMessage>
          }
          groupBy: {
            args: Prisma.GameMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<GameMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.GameMessageCountArgs<ExtArgs>
            result: $Utils.Optional<GameMessageCountAggregateOutputType> | number
          }
        }
      }
      MemoryEvent: {
        payload: Prisma.$MemoryEventPayload<ExtArgs>
        fields: Prisma.MemoryEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEventPayload>
          }
          findFirst: {
            args: Prisma.MemoryEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEventPayload>
          }
          findMany: {
            args: Prisma.MemoryEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEventPayload>[]
          }
          create: {
            args: Prisma.MemoryEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEventPayload>
          }
          createMany: {
            args: Prisma.MemoryEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEventPayload>[]
          }
          delete: {
            args: Prisma.MemoryEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEventPayload>
          }
          update: {
            args: Prisma.MemoryEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEventPayload>
          }
          deleteMany: {
            args: Prisma.MemoryEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MemoryEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEventPayload>
          }
          aggregate: {
            args: Prisma.MemoryEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemoryEvent>
          }
          groupBy: {
            args: Prisma.MemoryEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryEventCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryEventCountAggregateOutputType> | number
          }
        }
      }
      MemoryEmbedding: {
        payload: Prisma.$MemoryEmbeddingPayload<ExtArgs>
        fields: Prisma.MemoryEmbeddingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemoryEmbeddingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEmbeddingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemoryEmbeddingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEmbeddingPayload>
          }
          findFirst: {
            args: Prisma.MemoryEmbeddingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEmbeddingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemoryEmbeddingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEmbeddingPayload>
          }
          findMany: {
            args: Prisma.MemoryEmbeddingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEmbeddingPayload>[]
          }
          create: {
            args: Prisma.MemoryEmbeddingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEmbeddingPayload>
          }
          createMany: {
            args: Prisma.MemoryEmbeddingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemoryEmbeddingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEmbeddingPayload>[]
          }
          delete: {
            args: Prisma.MemoryEmbeddingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEmbeddingPayload>
          }
          update: {
            args: Prisma.MemoryEmbeddingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEmbeddingPayload>
          }
          deleteMany: {
            args: Prisma.MemoryEmbeddingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemoryEmbeddingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MemoryEmbeddingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemoryEmbeddingPayload>
          }
          aggregate: {
            args: Prisma.MemoryEmbeddingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemoryEmbedding>
          }
          groupBy: {
            args: Prisma.MemoryEmbeddingGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemoryEmbeddingGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemoryEmbeddingCountArgs<ExtArgs>
            result: $Utils.Optional<MemoryEmbeddingCountAggregateOutputType> | number
          }
        }
      }
      PlayerProfile: {
        payload: Prisma.$PlayerProfilePayload<ExtArgs>
        fields: Prisma.PlayerProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlayerProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlayerProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerProfilePayload>
          }
          findFirst: {
            args: Prisma.PlayerProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlayerProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerProfilePayload>
          }
          findMany: {
            args: Prisma.PlayerProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerProfilePayload>[]
          }
          create: {
            args: Prisma.PlayerProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerProfilePayload>
          }
          createMany: {
            args: Prisma.PlayerProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlayerProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerProfilePayload>[]
          }
          delete: {
            args: Prisma.PlayerProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerProfilePayload>
          }
          update: {
            args: Prisma.PlayerProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerProfilePayload>
          }
          deleteMany: {
            args: Prisma.PlayerProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlayerProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PlayerProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlayerProfilePayload>
          }
          aggregate: {
            args: Prisma.PlayerProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlayerProfile>
          }
          groupBy: {
            args: Prisma.PlayerProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlayerProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlayerProfileCountArgs<ExtArgs>
            result: $Utils.Optional<PlayerProfileCountAggregateOutputType> | number
          }
        }
      }
      MissionDefinition: {
        payload: Prisma.$MissionDefinitionPayload<ExtArgs>
        fields: Prisma.MissionDefinitionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MissionDefinitionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionDefinitionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MissionDefinitionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionDefinitionPayload>
          }
          findFirst: {
            args: Prisma.MissionDefinitionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionDefinitionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MissionDefinitionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionDefinitionPayload>
          }
          findMany: {
            args: Prisma.MissionDefinitionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionDefinitionPayload>[]
          }
          create: {
            args: Prisma.MissionDefinitionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionDefinitionPayload>
          }
          createMany: {
            args: Prisma.MissionDefinitionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MissionDefinitionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionDefinitionPayload>[]
          }
          delete: {
            args: Prisma.MissionDefinitionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionDefinitionPayload>
          }
          update: {
            args: Prisma.MissionDefinitionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionDefinitionPayload>
          }
          deleteMany: {
            args: Prisma.MissionDefinitionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MissionDefinitionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MissionDefinitionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionDefinitionPayload>
          }
          aggregate: {
            args: Prisma.MissionDefinitionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMissionDefinition>
          }
          groupBy: {
            args: Prisma.MissionDefinitionGroupByArgs<ExtArgs>
            result: $Utils.Optional<MissionDefinitionGroupByOutputType>[]
          }
          count: {
            args: Prisma.MissionDefinitionCountArgs<ExtArgs>
            result: $Utils.Optional<MissionDefinitionCountAggregateOutputType> | number
          }
        }
      }
      MissionRun: {
        payload: Prisma.$MissionRunPayload<ExtArgs>
        fields: Prisma.MissionRunFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MissionRunFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionRunPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MissionRunFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionRunPayload>
          }
          findFirst: {
            args: Prisma.MissionRunFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionRunPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MissionRunFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionRunPayload>
          }
          findMany: {
            args: Prisma.MissionRunFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionRunPayload>[]
          }
          create: {
            args: Prisma.MissionRunCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionRunPayload>
          }
          createMany: {
            args: Prisma.MissionRunCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MissionRunCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionRunPayload>[]
          }
          delete: {
            args: Prisma.MissionRunDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionRunPayload>
          }
          update: {
            args: Prisma.MissionRunUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionRunPayload>
          }
          deleteMany: {
            args: Prisma.MissionRunDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MissionRunUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MissionRunUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MissionRunPayload>
          }
          aggregate: {
            args: Prisma.MissionRunAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMissionRun>
          }
          groupBy: {
            args: Prisma.MissionRunGroupByArgs<ExtArgs>
            result: $Utils.Optional<MissionRunGroupByOutputType>[]
          }
          count: {
            args: Prisma.MissionRunCountArgs<ExtArgs>
            result: $Utils.Optional<MissionRunCountAggregateOutputType> | number
          }
        }
      }
      Reward: {
        payload: Prisma.$RewardPayload<ExtArgs>
        fields: Prisma.RewardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RewardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RewardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          findFirst: {
            args: Prisma.RewardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RewardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          findMany: {
            args: Prisma.RewardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>[]
          }
          create: {
            args: Prisma.RewardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          createMany: {
            args: Prisma.RewardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RewardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>[]
          }
          delete: {
            args: Prisma.RewardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          update: {
            args: Prisma.RewardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          deleteMany: {
            args: Prisma.RewardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RewardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RewardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RewardPayload>
          }
          aggregate: {
            args: Prisma.RewardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReward>
          }
          groupBy: {
            args: Prisma.RewardGroupByArgs<ExtArgs>
            result: $Utils.Optional<RewardGroupByOutputType>[]
          }
          count: {
            args: Prisma.RewardCountArgs<ExtArgs>
            result: $Utils.Optional<RewardCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    sessions: number
    threads: number
    notes: number
    gameSessions: number
    memoryEvents: number
    missionRuns: number
    rewards: number
    experiments: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | UserCountOutputTypeCountSessionsArgs
    threads?: boolean | UserCountOutputTypeCountThreadsArgs
    notes?: boolean | UserCountOutputTypeCountNotesArgs
    gameSessions?: boolean | UserCountOutputTypeCountGameSessionsArgs
    memoryEvents?: boolean | UserCountOutputTypeCountMemoryEventsArgs
    missionRuns?: boolean | UserCountOutputTypeCountMissionRunsArgs
    rewards?: boolean | UserCountOutputTypeCountRewardsArgs
    experiments?: boolean | UserCountOutputTypeCountExperimentsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountThreadsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ThreadWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountNotesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentNoteWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountGameSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameSessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMemoryEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryEventWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMissionRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MissionRunWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountRewardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RewardWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountExperimentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExperimentWhereInput
  }


  /**
   * Count Type ThreadCountOutputType
   */

  export type ThreadCountOutputType = {
    messages: number
    notes: number
    experiments: number
  }

  export type ThreadCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | ThreadCountOutputTypeCountMessagesArgs
    notes?: boolean | ThreadCountOutputTypeCountNotesArgs
    experiments?: boolean | ThreadCountOutputTypeCountExperimentsArgs
  }

  // Custom InputTypes
  /**
   * ThreadCountOutputType without action
   */
  export type ThreadCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ThreadCountOutputType
     */
    select?: ThreadCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ThreadCountOutputType without action
   */
  export type ThreadCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
  }

  /**
   * ThreadCountOutputType without action
   */
  export type ThreadCountOutputTypeCountNotesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentNoteWhereInput
  }

  /**
   * ThreadCountOutputType without action
   */
  export type ThreadCountOutputTypeCountExperimentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExperimentWhereInput
  }


  /**
   * Count Type ExperimentCountOutputType
   */

  export type ExperimentCountOutputType = {
    events: number
  }

  export type ExperimentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    events?: boolean | ExperimentCountOutputTypeCountEventsArgs
  }

  // Custom InputTypes
  /**
   * ExperimentCountOutputType without action
   */
  export type ExperimentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentCountOutputType
     */
    select?: ExperimentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ExperimentCountOutputType without action
   */
  export type ExperimentCountOutputTypeCountEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExperimentEventWhereInput
  }


  /**
   * Count Type GameSessionCountOutputType
   */

  export type GameSessionCountOutputType = {
    messages: number
    missionRuns: number
    memoryEvents: number
  }

  export type GameSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | GameSessionCountOutputTypeCountMessagesArgs
    missionRuns?: boolean | GameSessionCountOutputTypeCountMissionRunsArgs
    memoryEvents?: boolean | GameSessionCountOutputTypeCountMemoryEventsArgs
  }

  // Custom InputTypes
  /**
   * GameSessionCountOutputType without action
   */
  export type GameSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSessionCountOutputType
     */
    select?: GameSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GameSessionCountOutputType without action
   */
  export type GameSessionCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameMessageWhereInput
  }

  /**
   * GameSessionCountOutputType without action
   */
  export type GameSessionCountOutputTypeCountMissionRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MissionRunWhereInput
  }

  /**
   * GameSessionCountOutputType without action
   */
  export type GameSessionCountOutputTypeCountMemoryEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryEventWhereInput
  }


  /**
   * Count Type MemoryEventCountOutputType
   */

  export type MemoryEventCountOutputType = {
    embeddings: number
  }

  export type MemoryEventCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    embeddings?: boolean | MemoryEventCountOutputTypeCountEmbeddingsArgs
  }

  // Custom InputTypes
  /**
   * MemoryEventCountOutputType without action
   */
  export type MemoryEventCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEventCountOutputType
     */
    select?: MemoryEventCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MemoryEventCountOutputType without action
   */
  export type MemoryEventCountOutputTypeCountEmbeddingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryEmbeddingWhereInput
  }


  /**
   * Count Type MissionDefinitionCountOutputType
   */

  export type MissionDefinitionCountOutputType = {
    missionRuns: number
  }

  export type MissionDefinitionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    missionRuns?: boolean | MissionDefinitionCountOutputTypeCountMissionRunsArgs
  }

  // Custom InputTypes
  /**
   * MissionDefinitionCountOutputType without action
   */
  export type MissionDefinitionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinitionCountOutputType
     */
    select?: MissionDefinitionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MissionDefinitionCountOutputType without action
   */
  export type MissionDefinitionCountOutputTypeCountMissionRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MissionRunWhereInput
  }


  /**
   * Count Type MissionRunCountOutputType
   */

  export type MissionRunCountOutputType = {
    rewards: number
  }

  export type MissionRunCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rewards?: boolean | MissionRunCountOutputTypeCountRewardsArgs
  }

  // Custom InputTypes
  /**
   * MissionRunCountOutputType without action
   */
  export type MissionRunCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRunCountOutputType
     */
    select?: MissionRunCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MissionRunCountOutputType without action
   */
  export type MissionRunCountOutputTypeCountRewardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RewardWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    email: string | null
    handle: string | null
    role: $Enums.Role | null
    consentedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    email: string | null
    handle: string | null
    role: $Enums.Role | null
    consentedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    email: number
    handle: number
    role: number
    consentedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    email?: true
    handle?: true
    role?: true
    consentedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    email?: true
    handle?: true
    role?: true
    consentedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    email?: true
    handle?: true
    role?: true
    consentedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    email: string | null
    handle: string | null
    role: $Enums.Role
    consentedAt: Date | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    email?: boolean
    handle?: boolean
    role?: boolean
    consentedAt?: boolean
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    threads?: boolean | User$threadsArgs<ExtArgs>
    notes?: boolean | User$notesArgs<ExtArgs>
    gameSessions?: boolean | User$gameSessionsArgs<ExtArgs>
    memoryEvents?: boolean | User$memoryEventsArgs<ExtArgs>
    missionRuns?: boolean | User$missionRunsArgs<ExtArgs>
    rewards?: boolean | User$rewardsArgs<ExtArgs>
    profile?: boolean | User$profileArgs<ExtArgs>
    experiments?: boolean | User$experimentsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    email?: boolean
    handle?: boolean
    role?: boolean
    consentedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    email?: boolean
    handle?: boolean
    role?: boolean
    consentedAt?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    threads?: boolean | User$threadsArgs<ExtArgs>
    notes?: boolean | User$notesArgs<ExtArgs>
    gameSessions?: boolean | User$gameSessionsArgs<ExtArgs>
    memoryEvents?: boolean | User$memoryEventsArgs<ExtArgs>
    missionRuns?: boolean | User$missionRunsArgs<ExtArgs>
    rewards?: boolean | User$rewardsArgs<ExtArgs>
    profile?: boolean | User$profileArgs<ExtArgs>
    experiments?: boolean | User$experimentsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      sessions: Prisma.$SessionPayload<ExtArgs>[]
      threads: Prisma.$ThreadPayload<ExtArgs>[]
      notes: Prisma.$AgentNotePayload<ExtArgs>[]
      gameSessions: Prisma.$GameSessionPayload<ExtArgs>[]
      memoryEvents: Prisma.$MemoryEventPayload<ExtArgs>[]
      missionRuns: Prisma.$MissionRunPayload<ExtArgs>[]
      rewards: Prisma.$RewardPayload<ExtArgs>[]
      profile: Prisma.$PlayerProfilePayload<ExtArgs> | null
      experiments: Prisma.$ExperimentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      email: string | null
      handle: string | null
      role: $Enums.Role
      consentedAt: Date | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sessions<T extends User$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany"> | Null>
    threads<T extends User$threadsArgs<ExtArgs> = {}>(args?: Subset<T, User$threadsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "findMany"> | Null>
    notes<T extends User$notesArgs<ExtArgs> = {}>(args?: Subset<T, User$notesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "findMany"> | Null>
    gameSessions<T extends User$gameSessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$gameSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findMany"> | Null>
    memoryEvents<T extends User$memoryEventsArgs<ExtArgs> = {}>(args?: Subset<T, User$memoryEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "findMany"> | Null>
    missionRuns<T extends User$missionRunsArgs<ExtArgs> = {}>(args?: Subset<T, User$missionRunsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "findMany"> | Null>
    rewards<T extends User$rewardsArgs<ExtArgs> = {}>(args?: Subset<T, User$rewardsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findMany"> | Null>
    profile<T extends User$profileArgs<ExtArgs> = {}>(args?: Subset<T, User$profileArgs<ExtArgs>>): Prisma__PlayerProfileClient<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    experiments<T extends User$experimentsArgs<ExtArgs> = {}>(args?: Subset<T, User$experimentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly email: FieldRef<"User", 'String'>
    readonly handle: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly consentedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.sessions
   */
  export type User$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    cursor?: SessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * User.threads
   */
  export type User$threadsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    where?: ThreadWhereInput
    orderBy?: ThreadOrderByWithRelationInput | ThreadOrderByWithRelationInput[]
    cursor?: ThreadWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ThreadScalarFieldEnum | ThreadScalarFieldEnum[]
  }

  /**
   * User.notes
   */
  export type User$notesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    where?: AgentNoteWhereInput
    orderBy?: AgentNoteOrderByWithRelationInput | AgentNoteOrderByWithRelationInput[]
    cursor?: AgentNoteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentNoteScalarFieldEnum | AgentNoteScalarFieldEnum[]
  }

  /**
   * User.gameSessions
   */
  export type User$gameSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    where?: GameSessionWhereInput
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    cursor?: GameSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * User.memoryEvents
   */
  export type User$memoryEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    where?: MemoryEventWhereInput
    orderBy?: MemoryEventOrderByWithRelationInput | MemoryEventOrderByWithRelationInput[]
    cursor?: MemoryEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryEventScalarFieldEnum | MemoryEventScalarFieldEnum[]
  }

  /**
   * User.missionRuns
   */
  export type User$missionRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    where?: MissionRunWhereInput
    orderBy?: MissionRunOrderByWithRelationInput | MissionRunOrderByWithRelationInput[]
    cursor?: MissionRunWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MissionRunScalarFieldEnum | MissionRunScalarFieldEnum[]
  }

  /**
   * User.rewards
   */
  export type User$rewardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    where?: RewardWhereInput
    orderBy?: RewardOrderByWithRelationInput | RewardOrderByWithRelationInput[]
    cursor?: RewardWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RewardScalarFieldEnum | RewardScalarFieldEnum[]
  }

  /**
   * User.profile
   */
  export type User$profileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
    where?: PlayerProfileWhereInput
  }

  /**
   * User.experiments
   */
  export type User$experimentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    where?: ExperimentWhereInput
    orderBy?: ExperimentOrderByWithRelationInput | ExperimentOrderByWithRelationInput[]
    cursor?: ExperimentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExperimentScalarFieldEnum | ExperimentScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    token: string | null
  }

  export type SessionMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    token: string | null
  }

  export type SessionCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    token: number
    _all: number
  }


  export type SessionMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    token?: true
  }

  export type SessionMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    token?: true
  }

  export type SessionCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    token?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[]
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }

  export type SessionGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    token: string
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    token?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    token?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    token?: boolean
  }

  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Session"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      token: string
    }, ExtArgs["result"]["session"]>
    composites: {}
  }

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = $Result.GetResult<Prisma.$SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Session that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Session that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     * 
     */
    create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Sessions.
     * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     * 
     */
    delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
     */
    upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Session model
   */
  readonly fields: SessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Session model
   */ 
  interface SessionFieldRefs {
    readonly id: FieldRef<"Session", 'String'>
    readonly createdAt: FieldRef<"Session", 'DateTime'>
    readonly updatedAt: FieldRef<"Session", 'DateTime'>
    readonly userId: FieldRef<"Session", 'String'>
    readonly token: FieldRef<"Session", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
  }

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }

  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
  }

  /**
   * Session without action
   */
  export type SessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
  }


  /**
   * Model Thread
   */

  export type AggregateThread = {
    _count: ThreadCountAggregateOutputType | null
    _avg: ThreadAvgAggregateOutputType | null
    _sum: ThreadSumAggregateOutputType | null
    _min: ThreadMinAggregateOutputType | null
    _max: ThreadMaxAggregateOutputType | null
  }

  export type ThreadAvgAggregateOutputType = {
    accessTier: number | null
  }

  export type ThreadSumAggregateOutputType = {
    accessTier: number | null
  }

  export type ThreadMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    archivedAt: Date | null
    kind: $Enums.ThreadKind | null
    userId: string | null
    accessTier: number | null
  }

  export type ThreadMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    archivedAt: Date | null
    kind: $Enums.ThreadKind | null
    userId: string | null
    accessTier: number | null
  }

  export type ThreadCountAggregateOutputType = {
    id: number
    createdAt: number
    archivedAt: number
    kind: number
    userId: number
    accessTier: number
    _all: number
  }


  export type ThreadAvgAggregateInputType = {
    accessTier?: true
  }

  export type ThreadSumAggregateInputType = {
    accessTier?: true
  }

  export type ThreadMinAggregateInputType = {
    id?: true
    createdAt?: true
    archivedAt?: true
    kind?: true
    userId?: true
    accessTier?: true
  }

  export type ThreadMaxAggregateInputType = {
    id?: true
    createdAt?: true
    archivedAt?: true
    kind?: true
    userId?: true
    accessTier?: true
  }

  export type ThreadCountAggregateInputType = {
    id?: true
    createdAt?: true
    archivedAt?: true
    kind?: true
    userId?: true
    accessTier?: true
    _all?: true
  }

  export type ThreadAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Thread to aggregate.
     */
    where?: ThreadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Threads to fetch.
     */
    orderBy?: ThreadOrderByWithRelationInput | ThreadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ThreadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Threads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Threads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Threads
    **/
    _count?: true | ThreadCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ThreadAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ThreadSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ThreadMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ThreadMaxAggregateInputType
  }

  export type GetThreadAggregateType<T extends ThreadAggregateArgs> = {
        [P in keyof T & keyof AggregateThread]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateThread[P]>
      : GetScalarType<T[P], AggregateThread[P]>
  }




  export type ThreadGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ThreadWhereInput
    orderBy?: ThreadOrderByWithAggregationInput | ThreadOrderByWithAggregationInput[]
    by: ThreadScalarFieldEnum[] | ThreadScalarFieldEnum
    having?: ThreadScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ThreadCountAggregateInputType | true
    _avg?: ThreadAvgAggregateInputType
    _sum?: ThreadSumAggregateInputType
    _min?: ThreadMinAggregateInputType
    _max?: ThreadMaxAggregateInputType
  }

  export type ThreadGroupByOutputType = {
    id: string
    createdAt: Date
    archivedAt: Date | null
    kind: $Enums.ThreadKind
    userId: string
    accessTier: number
    _count: ThreadCountAggregateOutputType | null
    _avg: ThreadAvgAggregateOutputType | null
    _sum: ThreadSumAggregateOutputType | null
    _min: ThreadMinAggregateOutputType | null
    _max: ThreadMaxAggregateOutputType | null
  }

  type GetThreadGroupByPayload<T extends ThreadGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ThreadGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ThreadGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ThreadGroupByOutputType[P]>
            : GetScalarType<T[P], ThreadGroupByOutputType[P]>
        }
      >
    >


  export type ThreadSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    archivedAt?: boolean
    kind?: boolean
    userId?: boolean
    accessTier?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    messages?: boolean | Thread$messagesArgs<ExtArgs>
    notes?: boolean | Thread$notesArgs<ExtArgs>
    experiments?: boolean | Thread$experimentsArgs<ExtArgs>
    _count?: boolean | ThreadCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["thread"]>

  export type ThreadSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    archivedAt?: boolean
    kind?: boolean
    userId?: boolean
    accessTier?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["thread"]>

  export type ThreadSelectScalar = {
    id?: boolean
    createdAt?: boolean
    archivedAt?: boolean
    kind?: boolean
    userId?: boolean
    accessTier?: boolean
  }

  export type ThreadInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    messages?: boolean | Thread$messagesArgs<ExtArgs>
    notes?: boolean | Thread$notesArgs<ExtArgs>
    experiments?: boolean | Thread$experimentsArgs<ExtArgs>
    _count?: boolean | ThreadCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ThreadIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ThreadPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Thread"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      messages: Prisma.$MessagePayload<ExtArgs>[]
      notes: Prisma.$AgentNotePayload<ExtArgs>[]
      experiments: Prisma.$ExperimentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      archivedAt: Date | null
      kind: $Enums.ThreadKind
      userId: string
      accessTier: number
    }, ExtArgs["result"]["thread"]>
    composites: {}
  }

  type ThreadGetPayload<S extends boolean | null | undefined | ThreadDefaultArgs> = $Result.GetResult<Prisma.$ThreadPayload, S>

  type ThreadCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ThreadFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ThreadCountAggregateInputType | true
    }

  export interface ThreadDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Thread'], meta: { name: 'Thread' } }
    /**
     * Find zero or one Thread that matches the filter.
     * @param {ThreadFindUniqueArgs} args - Arguments to find a Thread
     * @example
     * // Get one Thread
     * const thread = await prisma.thread.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ThreadFindUniqueArgs>(args: SelectSubset<T, ThreadFindUniqueArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Thread that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ThreadFindUniqueOrThrowArgs} args - Arguments to find a Thread
     * @example
     * // Get one Thread
     * const thread = await prisma.thread.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ThreadFindUniqueOrThrowArgs>(args: SelectSubset<T, ThreadFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Thread that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThreadFindFirstArgs} args - Arguments to find a Thread
     * @example
     * // Get one Thread
     * const thread = await prisma.thread.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ThreadFindFirstArgs>(args?: SelectSubset<T, ThreadFindFirstArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Thread that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThreadFindFirstOrThrowArgs} args - Arguments to find a Thread
     * @example
     * // Get one Thread
     * const thread = await prisma.thread.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ThreadFindFirstOrThrowArgs>(args?: SelectSubset<T, ThreadFindFirstOrThrowArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Threads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThreadFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Threads
     * const threads = await prisma.thread.findMany()
     * 
     * // Get first 10 Threads
     * const threads = await prisma.thread.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const threadWithIdOnly = await prisma.thread.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ThreadFindManyArgs>(args?: SelectSubset<T, ThreadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Thread.
     * @param {ThreadCreateArgs} args - Arguments to create a Thread.
     * @example
     * // Create one Thread
     * const Thread = await prisma.thread.create({
     *   data: {
     *     // ... data to create a Thread
     *   }
     * })
     * 
     */
    create<T extends ThreadCreateArgs>(args: SelectSubset<T, ThreadCreateArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Threads.
     * @param {ThreadCreateManyArgs} args - Arguments to create many Threads.
     * @example
     * // Create many Threads
     * const thread = await prisma.thread.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ThreadCreateManyArgs>(args?: SelectSubset<T, ThreadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Threads and returns the data saved in the database.
     * @param {ThreadCreateManyAndReturnArgs} args - Arguments to create many Threads.
     * @example
     * // Create many Threads
     * const thread = await prisma.thread.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Threads and only return the `id`
     * const threadWithIdOnly = await prisma.thread.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ThreadCreateManyAndReturnArgs>(args?: SelectSubset<T, ThreadCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Thread.
     * @param {ThreadDeleteArgs} args - Arguments to delete one Thread.
     * @example
     * // Delete one Thread
     * const Thread = await prisma.thread.delete({
     *   where: {
     *     // ... filter to delete one Thread
     *   }
     * })
     * 
     */
    delete<T extends ThreadDeleteArgs>(args: SelectSubset<T, ThreadDeleteArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Thread.
     * @param {ThreadUpdateArgs} args - Arguments to update one Thread.
     * @example
     * // Update one Thread
     * const thread = await prisma.thread.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ThreadUpdateArgs>(args: SelectSubset<T, ThreadUpdateArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Threads.
     * @param {ThreadDeleteManyArgs} args - Arguments to filter Threads to delete.
     * @example
     * // Delete a few Threads
     * const { count } = await prisma.thread.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ThreadDeleteManyArgs>(args?: SelectSubset<T, ThreadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Threads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThreadUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Threads
     * const thread = await prisma.thread.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ThreadUpdateManyArgs>(args: SelectSubset<T, ThreadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Thread.
     * @param {ThreadUpsertArgs} args - Arguments to update or create a Thread.
     * @example
     * // Update or create a Thread
     * const thread = await prisma.thread.upsert({
     *   create: {
     *     // ... data to create a Thread
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Thread we want to update
     *   }
     * })
     */
    upsert<T extends ThreadUpsertArgs>(args: SelectSubset<T, ThreadUpsertArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Threads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThreadCountArgs} args - Arguments to filter Threads to count.
     * @example
     * // Count the number of Threads
     * const count = await prisma.thread.count({
     *   where: {
     *     // ... the filter for the Threads we want to count
     *   }
     * })
    **/
    count<T extends ThreadCountArgs>(
      args?: Subset<T, ThreadCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ThreadCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Thread.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThreadAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ThreadAggregateArgs>(args: Subset<T, ThreadAggregateArgs>): Prisma.PrismaPromise<GetThreadAggregateType<T>>

    /**
     * Group by Thread.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThreadGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ThreadGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ThreadGroupByArgs['orderBy'] }
        : { orderBy?: ThreadGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ThreadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetThreadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Thread model
   */
  readonly fields: ThreadFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Thread.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ThreadClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    messages<T extends Thread$messagesArgs<ExtArgs> = {}>(args?: Subset<T, Thread$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany"> | Null>
    notes<T extends Thread$notesArgs<ExtArgs> = {}>(args?: Subset<T, Thread$notesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "findMany"> | Null>
    experiments<T extends Thread$experimentsArgs<ExtArgs> = {}>(args?: Subset<T, Thread$experimentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Thread model
   */ 
  interface ThreadFieldRefs {
    readonly id: FieldRef<"Thread", 'String'>
    readonly createdAt: FieldRef<"Thread", 'DateTime'>
    readonly archivedAt: FieldRef<"Thread", 'DateTime'>
    readonly kind: FieldRef<"Thread", 'ThreadKind'>
    readonly userId: FieldRef<"Thread", 'String'>
    readonly accessTier: FieldRef<"Thread", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Thread findUnique
   */
  export type ThreadFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    /**
     * Filter, which Thread to fetch.
     */
    where: ThreadWhereUniqueInput
  }

  /**
   * Thread findUniqueOrThrow
   */
  export type ThreadFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    /**
     * Filter, which Thread to fetch.
     */
    where: ThreadWhereUniqueInput
  }

  /**
   * Thread findFirst
   */
  export type ThreadFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    /**
     * Filter, which Thread to fetch.
     */
    where?: ThreadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Threads to fetch.
     */
    orderBy?: ThreadOrderByWithRelationInput | ThreadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Threads.
     */
    cursor?: ThreadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Threads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Threads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Threads.
     */
    distinct?: ThreadScalarFieldEnum | ThreadScalarFieldEnum[]
  }

  /**
   * Thread findFirstOrThrow
   */
  export type ThreadFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    /**
     * Filter, which Thread to fetch.
     */
    where?: ThreadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Threads to fetch.
     */
    orderBy?: ThreadOrderByWithRelationInput | ThreadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Threads.
     */
    cursor?: ThreadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Threads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Threads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Threads.
     */
    distinct?: ThreadScalarFieldEnum | ThreadScalarFieldEnum[]
  }

  /**
   * Thread findMany
   */
  export type ThreadFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    /**
     * Filter, which Threads to fetch.
     */
    where?: ThreadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Threads to fetch.
     */
    orderBy?: ThreadOrderByWithRelationInput | ThreadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Threads.
     */
    cursor?: ThreadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Threads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Threads.
     */
    skip?: number
    distinct?: ThreadScalarFieldEnum | ThreadScalarFieldEnum[]
  }

  /**
   * Thread create
   */
  export type ThreadCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    /**
     * The data needed to create a Thread.
     */
    data: XOR<ThreadCreateInput, ThreadUncheckedCreateInput>
  }

  /**
   * Thread createMany
   */
  export type ThreadCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Threads.
     */
    data: ThreadCreateManyInput | ThreadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Thread createManyAndReturn
   */
  export type ThreadCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Threads.
     */
    data: ThreadCreateManyInput | ThreadCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Thread update
   */
  export type ThreadUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    /**
     * The data needed to update a Thread.
     */
    data: XOR<ThreadUpdateInput, ThreadUncheckedUpdateInput>
    /**
     * Choose, which Thread to update.
     */
    where: ThreadWhereUniqueInput
  }

  /**
   * Thread updateMany
   */
  export type ThreadUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Threads.
     */
    data: XOR<ThreadUpdateManyMutationInput, ThreadUncheckedUpdateManyInput>
    /**
     * Filter which Threads to update
     */
    where?: ThreadWhereInput
  }

  /**
   * Thread upsert
   */
  export type ThreadUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    /**
     * The filter to search for the Thread to update in case it exists.
     */
    where: ThreadWhereUniqueInput
    /**
     * In case the Thread found by the `where` argument doesn't exist, create a new Thread with this data.
     */
    create: XOR<ThreadCreateInput, ThreadUncheckedCreateInput>
    /**
     * In case the Thread was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ThreadUpdateInput, ThreadUncheckedUpdateInput>
  }

  /**
   * Thread delete
   */
  export type ThreadDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    /**
     * Filter which Thread to delete.
     */
    where: ThreadWhereUniqueInput
  }

  /**
   * Thread deleteMany
   */
  export type ThreadDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Threads to delete
     */
    where?: ThreadWhereInput
  }

  /**
   * Thread.messages
   */
  export type Thread$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    cursor?: MessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Thread.notes
   */
  export type Thread$notesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    where?: AgentNoteWhereInput
    orderBy?: AgentNoteOrderByWithRelationInput | AgentNoteOrderByWithRelationInput[]
    cursor?: AgentNoteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentNoteScalarFieldEnum | AgentNoteScalarFieldEnum[]
  }

  /**
   * Thread.experiments
   */
  export type Thread$experimentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    where?: ExperimentWhereInput
    orderBy?: ExperimentOrderByWithRelationInput | ExperimentOrderByWithRelationInput[]
    cursor?: ExperimentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExperimentScalarFieldEnum | ExperimentScalarFieldEnum[]
  }

  /**
   * Thread without action
   */
  export type ThreadDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
  }


  /**
   * Model Message
   */

  export type AggregateMessage = {
    _count: MessageCountAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  export type MessageMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    role: string | null
    content: string | null
    threadId: string | null
  }

  export type MessageMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    role: string | null
    content: string | null
    threadId: string | null
  }

  export type MessageCountAggregateOutputType = {
    id: number
    createdAt: number
    role: number
    content: number
    threadId: number
    _all: number
  }


  export type MessageMinAggregateInputType = {
    id?: true
    createdAt?: true
    role?: true
    content?: true
    threadId?: true
  }

  export type MessageMaxAggregateInputType = {
    id?: true
    createdAt?: true
    role?: true
    content?: true
    threadId?: true
  }

  export type MessageCountAggregateInputType = {
    id?: true
    createdAt?: true
    role?: true
    content?: true
    threadId?: true
    _all?: true
  }

  export type MessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Message to aggregate.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Messages
    **/
    _count?: true | MessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MessageMaxAggregateInputType
  }

  export type GetMessageAggregateType<T extends MessageAggregateArgs> = {
        [P in keyof T & keyof AggregateMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMessage[P]>
      : GetScalarType<T[P], AggregateMessage[P]>
  }




  export type MessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithAggregationInput | MessageOrderByWithAggregationInput[]
    by: MessageScalarFieldEnum[] | MessageScalarFieldEnum
    having?: MessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MessageCountAggregateInputType | true
    _min?: MessageMinAggregateInputType
    _max?: MessageMaxAggregateInputType
  }

  export type MessageGroupByOutputType = {
    id: string
    createdAt: Date
    role: string
    content: string
    threadId: string
    _count: MessageCountAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  type GetMessageGroupByPayload<T extends MessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MessageGroupByOutputType[P]>
            : GetScalarType<T[P], MessageGroupByOutputType[P]>
        }
      >
    >


  export type MessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    role?: boolean
    content?: boolean
    threadId?: boolean
    thread?: boolean | ThreadDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    role?: boolean
    content?: boolean
    threadId?: boolean
    thread?: boolean | ThreadDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectScalar = {
    id?: boolean
    createdAt?: boolean
    role?: boolean
    content?: boolean
    threadId?: boolean
  }

  export type MessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    thread?: boolean | ThreadDefaultArgs<ExtArgs>
  }
  export type MessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    thread?: boolean | ThreadDefaultArgs<ExtArgs>
  }

  export type $MessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Message"
    objects: {
      thread: Prisma.$ThreadPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      role: string
      content: string
      threadId: string
    }, ExtArgs["result"]["message"]>
    composites: {}
  }

  type MessageGetPayload<S extends boolean | null | undefined | MessageDefaultArgs> = $Result.GetResult<Prisma.$MessagePayload, S>

  type MessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MessageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MessageCountAggregateInputType | true
    }

  export interface MessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Message'], meta: { name: 'Message' } }
    /**
     * Find zero or one Message that matches the filter.
     * @param {MessageFindUniqueArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MessageFindUniqueArgs>(args: SelectSubset<T, MessageFindUniqueArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Message that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MessageFindUniqueOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MessageFindUniqueOrThrowArgs>(args: SelectSubset<T, MessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Message that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MessageFindFirstArgs>(args?: SelectSubset<T, MessageFindFirstArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Message that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MessageFindFirstOrThrowArgs>(args?: SelectSubset<T, MessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Messages
     * const messages = await prisma.message.findMany()
     * 
     * // Get first 10 Messages
     * const messages = await prisma.message.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const messageWithIdOnly = await prisma.message.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MessageFindManyArgs>(args?: SelectSubset<T, MessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Message.
     * @param {MessageCreateArgs} args - Arguments to create a Message.
     * @example
     * // Create one Message
     * const Message = await prisma.message.create({
     *   data: {
     *     // ... data to create a Message
     *   }
     * })
     * 
     */
    create<T extends MessageCreateArgs>(args: SelectSubset<T, MessageCreateArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Messages.
     * @param {MessageCreateManyArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const message = await prisma.message.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MessageCreateManyArgs>(args?: SelectSubset<T, MessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Messages and returns the data saved in the database.
     * @param {MessageCreateManyAndReturnArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const message = await prisma.message.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Messages and only return the `id`
     * const messageWithIdOnly = await prisma.message.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MessageCreateManyAndReturnArgs>(args?: SelectSubset<T, MessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Message.
     * @param {MessageDeleteArgs} args - Arguments to delete one Message.
     * @example
     * // Delete one Message
     * const Message = await prisma.message.delete({
     *   where: {
     *     // ... filter to delete one Message
     *   }
     * })
     * 
     */
    delete<T extends MessageDeleteArgs>(args: SelectSubset<T, MessageDeleteArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Message.
     * @param {MessageUpdateArgs} args - Arguments to update one Message.
     * @example
     * // Update one Message
     * const message = await prisma.message.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MessageUpdateArgs>(args: SelectSubset<T, MessageUpdateArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Messages.
     * @param {MessageDeleteManyArgs} args - Arguments to filter Messages to delete.
     * @example
     * // Delete a few Messages
     * const { count } = await prisma.message.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MessageDeleteManyArgs>(args?: SelectSubset<T, MessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Messages
     * const message = await prisma.message.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MessageUpdateManyArgs>(args: SelectSubset<T, MessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Message.
     * @param {MessageUpsertArgs} args - Arguments to update or create a Message.
     * @example
     * // Update or create a Message
     * const message = await prisma.message.upsert({
     *   create: {
     *     // ... data to create a Message
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Message we want to update
     *   }
     * })
     */
    upsert<T extends MessageUpsertArgs>(args: SelectSubset<T, MessageUpsertArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageCountArgs} args - Arguments to filter Messages to count.
     * @example
     * // Count the number of Messages
     * const count = await prisma.message.count({
     *   where: {
     *     // ... the filter for the Messages we want to count
     *   }
     * })
    **/
    count<T extends MessageCountArgs>(
      args?: Subset<T, MessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MessageAggregateArgs>(args: Subset<T, MessageAggregateArgs>): Prisma.PrismaPromise<GetMessageAggregateType<T>>

    /**
     * Group by Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MessageGroupByArgs['orderBy'] }
        : { orderBy?: MessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Message model
   */
  readonly fields: MessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Message.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    thread<T extends ThreadDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ThreadDefaultArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Message model
   */ 
  interface MessageFieldRefs {
    readonly id: FieldRef<"Message", 'String'>
    readonly createdAt: FieldRef<"Message", 'DateTime'>
    readonly role: FieldRef<"Message", 'String'>
    readonly content: FieldRef<"Message", 'String'>
    readonly threadId: FieldRef<"Message", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Message findUnique
   */
  export type MessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message findUniqueOrThrow
   */
  export type MessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message findFirst
   */
  export type MessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message findFirstOrThrow
   */
  export type MessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message findMany
   */
  export type MessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Messages to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message create
   */
  export type MessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The data needed to create a Message.
     */
    data: XOR<MessageCreateInput, MessageUncheckedCreateInput>
  }

  /**
   * Message createMany
   */
  export type MessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Messages.
     */
    data: MessageCreateManyInput | MessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Message createManyAndReturn
   */
  export type MessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Messages.
     */
    data: MessageCreateManyInput | MessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Message update
   */
  export type MessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The data needed to update a Message.
     */
    data: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
    /**
     * Choose, which Message to update.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message updateMany
   */
  export type MessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Messages.
     */
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyInput>
    /**
     * Filter which Messages to update
     */
    where?: MessageWhereInput
  }

  /**
   * Message upsert
   */
  export type MessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The filter to search for the Message to update in case it exists.
     */
    where: MessageWhereUniqueInput
    /**
     * In case the Message found by the `where` argument doesn't exist, create a new Message with this data.
     */
    create: XOR<MessageCreateInput, MessageUncheckedCreateInput>
    /**
     * In case the Message was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
  }

  /**
   * Message delete
   */
  export type MessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter which Message to delete.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message deleteMany
   */
  export type MessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Messages to delete
     */
    where?: MessageWhereInput
  }

  /**
   * Message without action
   */
  export type MessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
  }


  /**
   * Model AgentNote
   */

  export type AggregateAgentNote = {
    _count: AgentNoteCountAggregateOutputType | null
    _min: AgentNoteMinAggregateOutputType | null
    _max: AgentNoteMaxAggregateOutputType | null
  }

  export type AgentNoteMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    userId: string | null
    threadId: string | null
    key: string | null
    value: string | null
  }

  export type AgentNoteMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    userId: string | null
    threadId: string | null
    key: string | null
    value: string | null
  }

  export type AgentNoteCountAggregateOutputType = {
    id: number
    createdAt: number
    userId: number
    threadId: number
    key: number
    value: number
    _all: number
  }


  export type AgentNoteMinAggregateInputType = {
    id?: true
    createdAt?: true
    userId?: true
    threadId?: true
    key?: true
    value?: true
  }

  export type AgentNoteMaxAggregateInputType = {
    id?: true
    createdAt?: true
    userId?: true
    threadId?: true
    key?: true
    value?: true
  }

  export type AgentNoteCountAggregateInputType = {
    id?: true
    createdAt?: true
    userId?: true
    threadId?: true
    key?: true
    value?: true
    _all?: true
  }

  export type AgentNoteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentNote to aggregate.
     */
    where?: AgentNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentNotes to fetch.
     */
    orderBy?: AgentNoteOrderByWithRelationInput | AgentNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AgentNotes
    **/
    _count?: true | AgentNoteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentNoteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentNoteMaxAggregateInputType
  }

  export type GetAgentNoteAggregateType<T extends AgentNoteAggregateArgs> = {
        [P in keyof T & keyof AggregateAgentNote]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgentNote[P]>
      : GetScalarType<T[P], AggregateAgentNote[P]>
  }




  export type AgentNoteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentNoteWhereInput
    orderBy?: AgentNoteOrderByWithAggregationInput | AgentNoteOrderByWithAggregationInput[]
    by: AgentNoteScalarFieldEnum[] | AgentNoteScalarFieldEnum
    having?: AgentNoteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentNoteCountAggregateInputType | true
    _min?: AgentNoteMinAggregateInputType
    _max?: AgentNoteMaxAggregateInputType
  }

  export type AgentNoteGroupByOutputType = {
    id: string
    createdAt: Date
    userId: string
    threadId: string | null
    key: string
    value: string
    _count: AgentNoteCountAggregateOutputType | null
    _min: AgentNoteMinAggregateOutputType | null
    _max: AgentNoteMaxAggregateOutputType | null
  }

  type GetAgentNoteGroupByPayload<T extends AgentNoteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentNoteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentNoteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentNoteGroupByOutputType[P]>
            : GetScalarType<T[P], AgentNoteGroupByOutputType[P]>
        }
      >
    >


  export type AgentNoteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    userId?: boolean
    threadId?: boolean
    key?: boolean
    value?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    thread?: boolean | AgentNote$threadArgs<ExtArgs>
  }, ExtArgs["result"]["agentNote"]>

  export type AgentNoteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    userId?: boolean
    threadId?: boolean
    key?: boolean
    value?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    thread?: boolean | AgentNote$threadArgs<ExtArgs>
  }, ExtArgs["result"]["agentNote"]>

  export type AgentNoteSelectScalar = {
    id?: boolean
    createdAt?: boolean
    userId?: boolean
    threadId?: boolean
    key?: boolean
    value?: boolean
  }

  export type AgentNoteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    thread?: boolean | AgentNote$threadArgs<ExtArgs>
  }
  export type AgentNoteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    thread?: boolean | AgentNote$threadArgs<ExtArgs>
  }

  export type $AgentNotePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AgentNote"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      thread: Prisma.$ThreadPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      userId: string
      threadId: string | null
      key: string
      value: string
    }, ExtArgs["result"]["agentNote"]>
    composites: {}
  }

  type AgentNoteGetPayload<S extends boolean | null | undefined | AgentNoteDefaultArgs> = $Result.GetResult<Prisma.$AgentNotePayload, S>

  type AgentNoteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AgentNoteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AgentNoteCountAggregateInputType | true
    }

  export interface AgentNoteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AgentNote'], meta: { name: 'AgentNote' } }
    /**
     * Find zero or one AgentNote that matches the filter.
     * @param {AgentNoteFindUniqueArgs} args - Arguments to find a AgentNote
     * @example
     * // Get one AgentNote
     * const agentNote = await prisma.agentNote.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentNoteFindUniqueArgs>(args: SelectSubset<T, AgentNoteFindUniqueArgs<ExtArgs>>): Prisma__AgentNoteClient<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AgentNote that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AgentNoteFindUniqueOrThrowArgs} args - Arguments to find a AgentNote
     * @example
     * // Get one AgentNote
     * const agentNote = await prisma.agentNote.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentNoteFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentNoteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentNoteClient<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AgentNote that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentNoteFindFirstArgs} args - Arguments to find a AgentNote
     * @example
     * // Get one AgentNote
     * const agentNote = await prisma.agentNote.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentNoteFindFirstArgs>(args?: SelectSubset<T, AgentNoteFindFirstArgs<ExtArgs>>): Prisma__AgentNoteClient<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AgentNote that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentNoteFindFirstOrThrowArgs} args - Arguments to find a AgentNote
     * @example
     * // Get one AgentNote
     * const agentNote = await prisma.agentNote.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentNoteFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentNoteFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentNoteClient<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AgentNotes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentNoteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AgentNotes
     * const agentNotes = await prisma.agentNote.findMany()
     * 
     * // Get first 10 AgentNotes
     * const agentNotes = await prisma.agentNote.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentNoteWithIdOnly = await prisma.agentNote.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentNoteFindManyArgs>(args?: SelectSubset<T, AgentNoteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AgentNote.
     * @param {AgentNoteCreateArgs} args - Arguments to create a AgentNote.
     * @example
     * // Create one AgentNote
     * const AgentNote = await prisma.agentNote.create({
     *   data: {
     *     // ... data to create a AgentNote
     *   }
     * })
     * 
     */
    create<T extends AgentNoteCreateArgs>(args: SelectSubset<T, AgentNoteCreateArgs<ExtArgs>>): Prisma__AgentNoteClient<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AgentNotes.
     * @param {AgentNoteCreateManyArgs} args - Arguments to create many AgentNotes.
     * @example
     * // Create many AgentNotes
     * const agentNote = await prisma.agentNote.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentNoteCreateManyArgs>(args?: SelectSubset<T, AgentNoteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AgentNotes and returns the data saved in the database.
     * @param {AgentNoteCreateManyAndReturnArgs} args - Arguments to create many AgentNotes.
     * @example
     * // Create many AgentNotes
     * const agentNote = await prisma.agentNote.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AgentNotes and only return the `id`
     * const agentNoteWithIdOnly = await prisma.agentNote.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgentNoteCreateManyAndReturnArgs>(args?: SelectSubset<T, AgentNoteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AgentNote.
     * @param {AgentNoteDeleteArgs} args - Arguments to delete one AgentNote.
     * @example
     * // Delete one AgentNote
     * const AgentNote = await prisma.agentNote.delete({
     *   where: {
     *     // ... filter to delete one AgentNote
     *   }
     * })
     * 
     */
    delete<T extends AgentNoteDeleteArgs>(args: SelectSubset<T, AgentNoteDeleteArgs<ExtArgs>>): Prisma__AgentNoteClient<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AgentNote.
     * @param {AgentNoteUpdateArgs} args - Arguments to update one AgentNote.
     * @example
     * // Update one AgentNote
     * const agentNote = await prisma.agentNote.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentNoteUpdateArgs>(args: SelectSubset<T, AgentNoteUpdateArgs<ExtArgs>>): Prisma__AgentNoteClient<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AgentNotes.
     * @param {AgentNoteDeleteManyArgs} args - Arguments to filter AgentNotes to delete.
     * @example
     * // Delete a few AgentNotes
     * const { count } = await prisma.agentNote.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentNoteDeleteManyArgs>(args?: SelectSubset<T, AgentNoteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgentNotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentNoteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AgentNotes
     * const agentNote = await prisma.agentNote.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentNoteUpdateManyArgs>(args: SelectSubset<T, AgentNoteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AgentNote.
     * @param {AgentNoteUpsertArgs} args - Arguments to update or create a AgentNote.
     * @example
     * // Update or create a AgentNote
     * const agentNote = await prisma.agentNote.upsert({
     *   create: {
     *     // ... data to create a AgentNote
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AgentNote we want to update
     *   }
     * })
     */
    upsert<T extends AgentNoteUpsertArgs>(args: SelectSubset<T, AgentNoteUpsertArgs<ExtArgs>>): Prisma__AgentNoteClient<$Result.GetResult<Prisma.$AgentNotePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AgentNotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentNoteCountArgs} args - Arguments to filter AgentNotes to count.
     * @example
     * // Count the number of AgentNotes
     * const count = await prisma.agentNote.count({
     *   where: {
     *     // ... the filter for the AgentNotes we want to count
     *   }
     * })
    **/
    count<T extends AgentNoteCountArgs>(
      args?: Subset<T, AgentNoteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentNoteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AgentNote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentNoteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgentNoteAggregateArgs>(args: Subset<T, AgentNoteAggregateArgs>): Prisma.PrismaPromise<GetAgentNoteAggregateType<T>>

    /**
     * Group by AgentNote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentNoteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgentNoteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentNoteGroupByArgs['orderBy'] }
        : { orderBy?: AgentNoteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgentNoteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentNoteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AgentNote model
   */
  readonly fields: AgentNoteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AgentNote.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentNoteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    thread<T extends AgentNote$threadArgs<ExtArgs> = {}>(args?: Subset<T, AgentNote$threadArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AgentNote model
   */ 
  interface AgentNoteFieldRefs {
    readonly id: FieldRef<"AgentNote", 'String'>
    readonly createdAt: FieldRef<"AgentNote", 'DateTime'>
    readonly userId: FieldRef<"AgentNote", 'String'>
    readonly threadId: FieldRef<"AgentNote", 'String'>
    readonly key: FieldRef<"AgentNote", 'String'>
    readonly value: FieldRef<"AgentNote", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AgentNote findUnique
   */
  export type AgentNoteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    /**
     * Filter, which AgentNote to fetch.
     */
    where: AgentNoteWhereUniqueInput
  }

  /**
   * AgentNote findUniqueOrThrow
   */
  export type AgentNoteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    /**
     * Filter, which AgentNote to fetch.
     */
    where: AgentNoteWhereUniqueInput
  }

  /**
   * AgentNote findFirst
   */
  export type AgentNoteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    /**
     * Filter, which AgentNote to fetch.
     */
    where?: AgentNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentNotes to fetch.
     */
    orderBy?: AgentNoteOrderByWithRelationInput | AgentNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentNotes.
     */
    cursor?: AgentNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentNotes.
     */
    distinct?: AgentNoteScalarFieldEnum | AgentNoteScalarFieldEnum[]
  }

  /**
   * AgentNote findFirstOrThrow
   */
  export type AgentNoteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    /**
     * Filter, which AgentNote to fetch.
     */
    where?: AgentNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentNotes to fetch.
     */
    orderBy?: AgentNoteOrderByWithRelationInput | AgentNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgentNotes.
     */
    cursor?: AgentNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgentNotes.
     */
    distinct?: AgentNoteScalarFieldEnum | AgentNoteScalarFieldEnum[]
  }

  /**
   * AgentNote findMany
   */
  export type AgentNoteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    /**
     * Filter, which AgentNotes to fetch.
     */
    where?: AgentNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgentNotes to fetch.
     */
    orderBy?: AgentNoteOrderByWithRelationInput | AgentNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AgentNotes.
     */
    cursor?: AgentNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgentNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgentNotes.
     */
    skip?: number
    distinct?: AgentNoteScalarFieldEnum | AgentNoteScalarFieldEnum[]
  }

  /**
   * AgentNote create
   */
  export type AgentNoteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    /**
     * The data needed to create a AgentNote.
     */
    data: XOR<AgentNoteCreateInput, AgentNoteUncheckedCreateInput>
  }

  /**
   * AgentNote createMany
   */
  export type AgentNoteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AgentNotes.
     */
    data: AgentNoteCreateManyInput | AgentNoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgentNote createManyAndReturn
   */
  export type AgentNoteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AgentNotes.
     */
    data: AgentNoteCreateManyInput | AgentNoteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AgentNote update
   */
  export type AgentNoteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    /**
     * The data needed to update a AgentNote.
     */
    data: XOR<AgentNoteUpdateInput, AgentNoteUncheckedUpdateInput>
    /**
     * Choose, which AgentNote to update.
     */
    where: AgentNoteWhereUniqueInput
  }

  /**
   * AgentNote updateMany
   */
  export type AgentNoteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AgentNotes.
     */
    data: XOR<AgentNoteUpdateManyMutationInput, AgentNoteUncheckedUpdateManyInput>
    /**
     * Filter which AgentNotes to update
     */
    where?: AgentNoteWhereInput
  }

  /**
   * AgentNote upsert
   */
  export type AgentNoteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    /**
     * The filter to search for the AgentNote to update in case it exists.
     */
    where: AgentNoteWhereUniqueInput
    /**
     * In case the AgentNote found by the `where` argument doesn't exist, create a new AgentNote with this data.
     */
    create: XOR<AgentNoteCreateInput, AgentNoteUncheckedCreateInput>
    /**
     * In case the AgentNote was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentNoteUpdateInput, AgentNoteUncheckedUpdateInput>
  }

  /**
   * AgentNote delete
   */
  export type AgentNoteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
    /**
     * Filter which AgentNote to delete.
     */
    where: AgentNoteWhereUniqueInput
  }

  /**
   * AgentNote deleteMany
   */
  export type AgentNoteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgentNotes to delete
     */
    where?: AgentNoteWhereInput
  }

  /**
   * AgentNote.thread
   */
  export type AgentNote$threadArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    where?: ThreadWhereInput
  }

  /**
   * AgentNote without action
   */
  export type AgentNoteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentNote
     */
    select?: AgentNoteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentNoteInclude<ExtArgs> | null
  }


  /**
   * Model Experiment
   */

  export type AggregateExperiment = {
    _count: ExperimentCountAggregateOutputType | null
    _avg: ExperimentAvgAggregateOutputType | null
    _sum: ExperimentSumAggregateOutputType | null
    _min: ExperimentMinAggregateOutputType | null
    _max: ExperimentMaxAggregateOutputType | null
  }

  export type ExperimentAvgAggregateOutputType = {
    timeoutS: number | null
  }

  export type ExperimentSumAggregateOutputType = {
    timeoutS: number | null
  }

  export type ExperimentMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    userId: string | null
    threadId: string | null
    hypothesis: string | null
    task: string | null
    successCriteria: string | null
    timeoutS: number | null
    title: string | null
  }

  export type ExperimentMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    userId: string | null
    threadId: string | null
    hypothesis: string | null
    task: string | null
    successCriteria: string | null
    timeoutS: number | null
    title: string | null
  }

  export type ExperimentCountAggregateOutputType = {
    id: number
    createdAt: number
    userId: number
    threadId: number
    hypothesis: number
    task: number
    successCriteria: number
    timeoutS: number
    title: number
    _all: number
  }


  export type ExperimentAvgAggregateInputType = {
    timeoutS?: true
  }

  export type ExperimentSumAggregateInputType = {
    timeoutS?: true
  }

  export type ExperimentMinAggregateInputType = {
    id?: true
    createdAt?: true
    userId?: true
    threadId?: true
    hypothesis?: true
    task?: true
    successCriteria?: true
    timeoutS?: true
    title?: true
  }

  export type ExperimentMaxAggregateInputType = {
    id?: true
    createdAt?: true
    userId?: true
    threadId?: true
    hypothesis?: true
    task?: true
    successCriteria?: true
    timeoutS?: true
    title?: true
  }

  export type ExperimentCountAggregateInputType = {
    id?: true
    createdAt?: true
    userId?: true
    threadId?: true
    hypothesis?: true
    task?: true
    successCriteria?: true
    timeoutS?: true
    title?: true
    _all?: true
  }

  export type ExperimentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Experiment to aggregate.
     */
    where?: ExperimentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Experiments to fetch.
     */
    orderBy?: ExperimentOrderByWithRelationInput | ExperimentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExperimentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Experiments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Experiments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Experiments
    **/
    _count?: true | ExperimentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExperimentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExperimentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExperimentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExperimentMaxAggregateInputType
  }

  export type GetExperimentAggregateType<T extends ExperimentAggregateArgs> = {
        [P in keyof T & keyof AggregateExperiment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExperiment[P]>
      : GetScalarType<T[P], AggregateExperiment[P]>
  }




  export type ExperimentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExperimentWhereInput
    orderBy?: ExperimentOrderByWithAggregationInput | ExperimentOrderByWithAggregationInput[]
    by: ExperimentScalarFieldEnum[] | ExperimentScalarFieldEnum
    having?: ExperimentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExperimentCountAggregateInputType | true
    _avg?: ExperimentAvgAggregateInputType
    _sum?: ExperimentSumAggregateInputType
    _min?: ExperimentMinAggregateInputType
    _max?: ExperimentMaxAggregateInputType
  }

  export type ExperimentGroupByOutputType = {
    id: string
    createdAt: Date
    userId: string
    threadId: string | null
    hypothesis: string
    task: string
    successCriteria: string | null
    timeoutS: number | null
    title: string | null
    _count: ExperimentCountAggregateOutputType | null
    _avg: ExperimentAvgAggregateOutputType | null
    _sum: ExperimentSumAggregateOutputType | null
    _min: ExperimentMinAggregateOutputType | null
    _max: ExperimentMaxAggregateOutputType | null
  }

  type GetExperimentGroupByPayload<T extends ExperimentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExperimentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExperimentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExperimentGroupByOutputType[P]>
            : GetScalarType<T[P], ExperimentGroupByOutputType[P]>
        }
      >
    >


  export type ExperimentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    userId?: boolean
    threadId?: boolean
    hypothesis?: boolean
    task?: boolean
    successCriteria?: boolean
    timeoutS?: boolean
    title?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    thread?: boolean | Experiment$threadArgs<ExtArgs>
    events?: boolean | Experiment$eventsArgs<ExtArgs>
    _count?: boolean | ExperimentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["experiment"]>

  export type ExperimentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    userId?: boolean
    threadId?: boolean
    hypothesis?: boolean
    task?: boolean
    successCriteria?: boolean
    timeoutS?: boolean
    title?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    thread?: boolean | Experiment$threadArgs<ExtArgs>
  }, ExtArgs["result"]["experiment"]>

  export type ExperimentSelectScalar = {
    id?: boolean
    createdAt?: boolean
    userId?: boolean
    threadId?: boolean
    hypothesis?: boolean
    task?: boolean
    successCriteria?: boolean
    timeoutS?: boolean
    title?: boolean
  }

  export type ExperimentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    thread?: boolean | Experiment$threadArgs<ExtArgs>
    events?: boolean | Experiment$eventsArgs<ExtArgs>
    _count?: boolean | ExperimentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ExperimentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    thread?: boolean | Experiment$threadArgs<ExtArgs>
  }

  export type $ExperimentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Experiment"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      thread: Prisma.$ThreadPayload<ExtArgs> | null
      events: Prisma.$ExperimentEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      userId: string
      threadId: string | null
      hypothesis: string
      task: string
      successCriteria: string | null
      timeoutS: number | null
      title: string | null
    }, ExtArgs["result"]["experiment"]>
    composites: {}
  }

  type ExperimentGetPayload<S extends boolean | null | undefined | ExperimentDefaultArgs> = $Result.GetResult<Prisma.$ExperimentPayload, S>

  type ExperimentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ExperimentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ExperimentCountAggregateInputType | true
    }

  export interface ExperimentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Experiment'], meta: { name: 'Experiment' } }
    /**
     * Find zero or one Experiment that matches the filter.
     * @param {ExperimentFindUniqueArgs} args - Arguments to find a Experiment
     * @example
     * // Get one Experiment
     * const experiment = await prisma.experiment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExperimentFindUniqueArgs>(args: SelectSubset<T, ExperimentFindUniqueArgs<ExtArgs>>): Prisma__ExperimentClient<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Experiment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ExperimentFindUniqueOrThrowArgs} args - Arguments to find a Experiment
     * @example
     * // Get one Experiment
     * const experiment = await prisma.experiment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExperimentFindUniqueOrThrowArgs>(args: SelectSubset<T, ExperimentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExperimentClient<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Experiment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentFindFirstArgs} args - Arguments to find a Experiment
     * @example
     * // Get one Experiment
     * const experiment = await prisma.experiment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExperimentFindFirstArgs>(args?: SelectSubset<T, ExperimentFindFirstArgs<ExtArgs>>): Prisma__ExperimentClient<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Experiment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentFindFirstOrThrowArgs} args - Arguments to find a Experiment
     * @example
     * // Get one Experiment
     * const experiment = await prisma.experiment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExperimentFindFirstOrThrowArgs>(args?: SelectSubset<T, ExperimentFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExperimentClient<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Experiments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Experiments
     * const experiments = await prisma.experiment.findMany()
     * 
     * // Get first 10 Experiments
     * const experiments = await prisma.experiment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const experimentWithIdOnly = await prisma.experiment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExperimentFindManyArgs>(args?: SelectSubset<T, ExperimentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Experiment.
     * @param {ExperimentCreateArgs} args - Arguments to create a Experiment.
     * @example
     * // Create one Experiment
     * const Experiment = await prisma.experiment.create({
     *   data: {
     *     // ... data to create a Experiment
     *   }
     * })
     * 
     */
    create<T extends ExperimentCreateArgs>(args: SelectSubset<T, ExperimentCreateArgs<ExtArgs>>): Prisma__ExperimentClient<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Experiments.
     * @param {ExperimentCreateManyArgs} args - Arguments to create many Experiments.
     * @example
     * // Create many Experiments
     * const experiment = await prisma.experiment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExperimentCreateManyArgs>(args?: SelectSubset<T, ExperimentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Experiments and returns the data saved in the database.
     * @param {ExperimentCreateManyAndReturnArgs} args - Arguments to create many Experiments.
     * @example
     * // Create many Experiments
     * const experiment = await prisma.experiment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Experiments and only return the `id`
     * const experimentWithIdOnly = await prisma.experiment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExperimentCreateManyAndReturnArgs>(args?: SelectSubset<T, ExperimentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Experiment.
     * @param {ExperimentDeleteArgs} args - Arguments to delete one Experiment.
     * @example
     * // Delete one Experiment
     * const Experiment = await prisma.experiment.delete({
     *   where: {
     *     // ... filter to delete one Experiment
     *   }
     * })
     * 
     */
    delete<T extends ExperimentDeleteArgs>(args: SelectSubset<T, ExperimentDeleteArgs<ExtArgs>>): Prisma__ExperimentClient<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Experiment.
     * @param {ExperimentUpdateArgs} args - Arguments to update one Experiment.
     * @example
     * // Update one Experiment
     * const experiment = await prisma.experiment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExperimentUpdateArgs>(args: SelectSubset<T, ExperimentUpdateArgs<ExtArgs>>): Prisma__ExperimentClient<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Experiments.
     * @param {ExperimentDeleteManyArgs} args - Arguments to filter Experiments to delete.
     * @example
     * // Delete a few Experiments
     * const { count } = await prisma.experiment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExperimentDeleteManyArgs>(args?: SelectSubset<T, ExperimentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Experiments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Experiments
     * const experiment = await prisma.experiment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExperimentUpdateManyArgs>(args: SelectSubset<T, ExperimentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Experiment.
     * @param {ExperimentUpsertArgs} args - Arguments to update or create a Experiment.
     * @example
     * // Update or create a Experiment
     * const experiment = await prisma.experiment.upsert({
     *   create: {
     *     // ... data to create a Experiment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Experiment we want to update
     *   }
     * })
     */
    upsert<T extends ExperimentUpsertArgs>(args: SelectSubset<T, ExperimentUpsertArgs<ExtArgs>>): Prisma__ExperimentClient<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Experiments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentCountArgs} args - Arguments to filter Experiments to count.
     * @example
     * // Count the number of Experiments
     * const count = await prisma.experiment.count({
     *   where: {
     *     // ... the filter for the Experiments we want to count
     *   }
     * })
    **/
    count<T extends ExperimentCountArgs>(
      args?: Subset<T, ExperimentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExperimentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Experiment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExperimentAggregateArgs>(args: Subset<T, ExperimentAggregateArgs>): Prisma.PrismaPromise<GetExperimentAggregateType<T>>

    /**
     * Group by Experiment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExperimentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExperimentGroupByArgs['orderBy'] }
        : { orderBy?: ExperimentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExperimentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExperimentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Experiment model
   */
  readonly fields: ExperimentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Experiment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExperimentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    thread<T extends Experiment$threadArgs<ExtArgs> = {}>(args?: Subset<T, Experiment$threadArgs<ExtArgs>>): Prisma__ThreadClient<$Result.GetResult<Prisma.$ThreadPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    events<T extends Experiment$eventsArgs<ExtArgs> = {}>(args?: Subset<T, Experiment$eventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Experiment model
   */ 
  interface ExperimentFieldRefs {
    readonly id: FieldRef<"Experiment", 'String'>
    readonly createdAt: FieldRef<"Experiment", 'DateTime'>
    readonly userId: FieldRef<"Experiment", 'String'>
    readonly threadId: FieldRef<"Experiment", 'String'>
    readonly hypothesis: FieldRef<"Experiment", 'String'>
    readonly task: FieldRef<"Experiment", 'String'>
    readonly successCriteria: FieldRef<"Experiment", 'String'>
    readonly timeoutS: FieldRef<"Experiment", 'Int'>
    readonly title: FieldRef<"Experiment", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Experiment findUnique
   */
  export type ExperimentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    /**
     * Filter, which Experiment to fetch.
     */
    where: ExperimentWhereUniqueInput
  }

  /**
   * Experiment findUniqueOrThrow
   */
  export type ExperimentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    /**
     * Filter, which Experiment to fetch.
     */
    where: ExperimentWhereUniqueInput
  }

  /**
   * Experiment findFirst
   */
  export type ExperimentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    /**
     * Filter, which Experiment to fetch.
     */
    where?: ExperimentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Experiments to fetch.
     */
    orderBy?: ExperimentOrderByWithRelationInput | ExperimentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Experiments.
     */
    cursor?: ExperimentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Experiments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Experiments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Experiments.
     */
    distinct?: ExperimentScalarFieldEnum | ExperimentScalarFieldEnum[]
  }

  /**
   * Experiment findFirstOrThrow
   */
  export type ExperimentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    /**
     * Filter, which Experiment to fetch.
     */
    where?: ExperimentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Experiments to fetch.
     */
    orderBy?: ExperimentOrderByWithRelationInput | ExperimentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Experiments.
     */
    cursor?: ExperimentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Experiments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Experiments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Experiments.
     */
    distinct?: ExperimentScalarFieldEnum | ExperimentScalarFieldEnum[]
  }

  /**
   * Experiment findMany
   */
  export type ExperimentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    /**
     * Filter, which Experiments to fetch.
     */
    where?: ExperimentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Experiments to fetch.
     */
    orderBy?: ExperimentOrderByWithRelationInput | ExperimentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Experiments.
     */
    cursor?: ExperimentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Experiments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Experiments.
     */
    skip?: number
    distinct?: ExperimentScalarFieldEnum | ExperimentScalarFieldEnum[]
  }

  /**
   * Experiment create
   */
  export type ExperimentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    /**
     * The data needed to create a Experiment.
     */
    data: XOR<ExperimentCreateInput, ExperimentUncheckedCreateInput>
  }

  /**
   * Experiment createMany
   */
  export type ExperimentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Experiments.
     */
    data: ExperimentCreateManyInput | ExperimentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Experiment createManyAndReturn
   */
  export type ExperimentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Experiments.
     */
    data: ExperimentCreateManyInput | ExperimentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Experiment update
   */
  export type ExperimentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    /**
     * The data needed to update a Experiment.
     */
    data: XOR<ExperimentUpdateInput, ExperimentUncheckedUpdateInput>
    /**
     * Choose, which Experiment to update.
     */
    where: ExperimentWhereUniqueInput
  }

  /**
   * Experiment updateMany
   */
  export type ExperimentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Experiments.
     */
    data: XOR<ExperimentUpdateManyMutationInput, ExperimentUncheckedUpdateManyInput>
    /**
     * Filter which Experiments to update
     */
    where?: ExperimentWhereInput
  }

  /**
   * Experiment upsert
   */
  export type ExperimentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    /**
     * The filter to search for the Experiment to update in case it exists.
     */
    where: ExperimentWhereUniqueInput
    /**
     * In case the Experiment found by the `where` argument doesn't exist, create a new Experiment with this data.
     */
    create: XOR<ExperimentCreateInput, ExperimentUncheckedCreateInput>
    /**
     * In case the Experiment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExperimentUpdateInput, ExperimentUncheckedUpdateInput>
  }

  /**
   * Experiment delete
   */
  export type ExperimentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
    /**
     * Filter which Experiment to delete.
     */
    where: ExperimentWhereUniqueInput
  }

  /**
   * Experiment deleteMany
   */
  export type ExperimentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Experiments to delete
     */
    where?: ExperimentWhereInput
  }

  /**
   * Experiment.thread
   */
  export type Experiment$threadArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Thread
     */
    select?: ThreadSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThreadInclude<ExtArgs> | null
    where?: ThreadWhereInput
  }

  /**
   * Experiment.events
   */
  export type Experiment$eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
    where?: ExperimentEventWhereInput
    orderBy?: ExperimentEventOrderByWithRelationInput | ExperimentEventOrderByWithRelationInput[]
    cursor?: ExperimentEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExperimentEventScalarFieldEnum | ExperimentEventScalarFieldEnum[]
  }

  /**
   * Experiment without action
   */
  export type ExperimentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Experiment
     */
    select?: ExperimentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentInclude<ExtArgs> | null
  }


  /**
   * Model ExperimentEvent
   */

  export type AggregateExperimentEvent = {
    _count: ExperimentEventCountAggregateOutputType | null
    _avg: ExperimentEventAvgAggregateOutputType | null
    _sum: ExperimentEventSumAggregateOutputType | null
    _min: ExperimentEventMinAggregateOutputType | null
    _max: ExperimentEventMaxAggregateOutputType | null
  }

  export type ExperimentEventAvgAggregateOutputType = {
    score: number | null
  }

  export type ExperimentEventSumAggregateOutputType = {
    score: number | null
  }

  export type ExperimentEventMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    experimentId: string | null
    observation: string | null
    result: string | null
    score: number | null
  }

  export type ExperimentEventMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    experimentId: string | null
    observation: string | null
    result: string | null
    score: number | null
  }

  export type ExperimentEventCountAggregateOutputType = {
    id: number
    createdAt: number
    experimentId: number
    observation: number
    result: number
    score: number
    _all: number
  }


  export type ExperimentEventAvgAggregateInputType = {
    score?: true
  }

  export type ExperimentEventSumAggregateInputType = {
    score?: true
  }

  export type ExperimentEventMinAggregateInputType = {
    id?: true
    createdAt?: true
    experimentId?: true
    observation?: true
    result?: true
    score?: true
  }

  export type ExperimentEventMaxAggregateInputType = {
    id?: true
    createdAt?: true
    experimentId?: true
    observation?: true
    result?: true
    score?: true
  }

  export type ExperimentEventCountAggregateInputType = {
    id?: true
    createdAt?: true
    experimentId?: true
    observation?: true
    result?: true
    score?: true
    _all?: true
  }

  export type ExperimentEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExperimentEvent to aggregate.
     */
    where?: ExperimentEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExperimentEvents to fetch.
     */
    orderBy?: ExperimentEventOrderByWithRelationInput | ExperimentEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExperimentEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExperimentEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExperimentEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ExperimentEvents
    **/
    _count?: true | ExperimentEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExperimentEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExperimentEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExperimentEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExperimentEventMaxAggregateInputType
  }

  export type GetExperimentEventAggregateType<T extends ExperimentEventAggregateArgs> = {
        [P in keyof T & keyof AggregateExperimentEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExperimentEvent[P]>
      : GetScalarType<T[P], AggregateExperimentEvent[P]>
  }




  export type ExperimentEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExperimentEventWhereInput
    orderBy?: ExperimentEventOrderByWithAggregationInput | ExperimentEventOrderByWithAggregationInput[]
    by: ExperimentEventScalarFieldEnum[] | ExperimentEventScalarFieldEnum
    having?: ExperimentEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExperimentEventCountAggregateInputType | true
    _avg?: ExperimentEventAvgAggregateInputType
    _sum?: ExperimentEventSumAggregateInputType
    _min?: ExperimentEventMinAggregateInputType
    _max?: ExperimentEventMaxAggregateInputType
  }

  export type ExperimentEventGroupByOutputType = {
    id: string
    createdAt: Date
    experimentId: string
    observation: string | null
    result: string | null
    score: number | null
    _count: ExperimentEventCountAggregateOutputType | null
    _avg: ExperimentEventAvgAggregateOutputType | null
    _sum: ExperimentEventSumAggregateOutputType | null
    _min: ExperimentEventMinAggregateOutputType | null
    _max: ExperimentEventMaxAggregateOutputType | null
  }

  type GetExperimentEventGroupByPayload<T extends ExperimentEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExperimentEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExperimentEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExperimentEventGroupByOutputType[P]>
            : GetScalarType<T[P], ExperimentEventGroupByOutputType[P]>
        }
      >
    >


  export type ExperimentEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    experimentId?: boolean
    observation?: boolean
    result?: boolean
    score?: boolean
    experiment?: boolean | ExperimentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["experimentEvent"]>

  export type ExperimentEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    experimentId?: boolean
    observation?: boolean
    result?: boolean
    score?: boolean
    experiment?: boolean | ExperimentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["experimentEvent"]>

  export type ExperimentEventSelectScalar = {
    id?: boolean
    createdAt?: boolean
    experimentId?: boolean
    observation?: boolean
    result?: boolean
    score?: boolean
  }

  export type ExperimentEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    experiment?: boolean | ExperimentDefaultArgs<ExtArgs>
  }
  export type ExperimentEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    experiment?: boolean | ExperimentDefaultArgs<ExtArgs>
  }

  export type $ExperimentEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ExperimentEvent"
    objects: {
      experiment: Prisma.$ExperimentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      experimentId: string
      observation: string | null
      result: string | null
      score: number | null
    }, ExtArgs["result"]["experimentEvent"]>
    composites: {}
  }

  type ExperimentEventGetPayload<S extends boolean | null | undefined | ExperimentEventDefaultArgs> = $Result.GetResult<Prisma.$ExperimentEventPayload, S>

  type ExperimentEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ExperimentEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ExperimentEventCountAggregateInputType | true
    }

  export interface ExperimentEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ExperimentEvent'], meta: { name: 'ExperimentEvent' } }
    /**
     * Find zero or one ExperimentEvent that matches the filter.
     * @param {ExperimentEventFindUniqueArgs} args - Arguments to find a ExperimentEvent
     * @example
     * // Get one ExperimentEvent
     * const experimentEvent = await prisma.experimentEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExperimentEventFindUniqueArgs>(args: SelectSubset<T, ExperimentEventFindUniqueArgs<ExtArgs>>): Prisma__ExperimentEventClient<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ExperimentEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ExperimentEventFindUniqueOrThrowArgs} args - Arguments to find a ExperimentEvent
     * @example
     * // Get one ExperimentEvent
     * const experimentEvent = await prisma.experimentEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExperimentEventFindUniqueOrThrowArgs>(args: SelectSubset<T, ExperimentEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExperimentEventClient<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ExperimentEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentEventFindFirstArgs} args - Arguments to find a ExperimentEvent
     * @example
     * // Get one ExperimentEvent
     * const experimentEvent = await prisma.experimentEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExperimentEventFindFirstArgs>(args?: SelectSubset<T, ExperimentEventFindFirstArgs<ExtArgs>>): Prisma__ExperimentEventClient<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ExperimentEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentEventFindFirstOrThrowArgs} args - Arguments to find a ExperimentEvent
     * @example
     * // Get one ExperimentEvent
     * const experimentEvent = await prisma.experimentEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExperimentEventFindFirstOrThrowArgs>(args?: SelectSubset<T, ExperimentEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExperimentEventClient<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ExperimentEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ExperimentEvents
     * const experimentEvents = await prisma.experimentEvent.findMany()
     * 
     * // Get first 10 ExperimentEvents
     * const experimentEvents = await prisma.experimentEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const experimentEventWithIdOnly = await prisma.experimentEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExperimentEventFindManyArgs>(args?: SelectSubset<T, ExperimentEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ExperimentEvent.
     * @param {ExperimentEventCreateArgs} args - Arguments to create a ExperimentEvent.
     * @example
     * // Create one ExperimentEvent
     * const ExperimentEvent = await prisma.experimentEvent.create({
     *   data: {
     *     // ... data to create a ExperimentEvent
     *   }
     * })
     * 
     */
    create<T extends ExperimentEventCreateArgs>(args: SelectSubset<T, ExperimentEventCreateArgs<ExtArgs>>): Prisma__ExperimentEventClient<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ExperimentEvents.
     * @param {ExperimentEventCreateManyArgs} args - Arguments to create many ExperimentEvents.
     * @example
     * // Create many ExperimentEvents
     * const experimentEvent = await prisma.experimentEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExperimentEventCreateManyArgs>(args?: SelectSubset<T, ExperimentEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ExperimentEvents and returns the data saved in the database.
     * @param {ExperimentEventCreateManyAndReturnArgs} args - Arguments to create many ExperimentEvents.
     * @example
     * // Create many ExperimentEvents
     * const experimentEvent = await prisma.experimentEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ExperimentEvents and only return the `id`
     * const experimentEventWithIdOnly = await prisma.experimentEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExperimentEventCreateManyAndReturnArgs>(args?: SelectSubset<T, ExperimentEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ExperimentEvent.
     * @param {ExperimentEventDeleteArgs} args - Arguments to delete one ExperimentEvent.
     * @example
     * // Delete one ExperimentEvent
     * const ExperimentEvent = await prisma.experimentEvent.delete({
     *   where: {
     *     // ... filter to delete one ExperimentEvent
     *   }
     * })
     * 
     */
    delete<T extends ExperimentEventDeleteArgs>(args: SelectSubset<T, ExperimentEventDeleteArgs<ExtArgs>>): Prisma__ExperimentEventClient<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ExperimentEvent.
     * @param {ExperimentEventUpdateArgs} args - Arguments to update one ExperimentEvent.
     * @example
     * // Update one ExperimentEvent
     * const experimentEvent = await prisma.experimentEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExperimentEventUpdateArgs>(args: SelectSubset<T, ExperimentEventUpdateArgs<ExtArgs>>): Prisma__ExperimentEventClient<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ExperimentEvents.
     * @param {ExperimentEventDeleteManyArgs} args - Arguments to filter ExperimentEvents to delete.
     * @example
     * // Delete a few ExperimentEvents
     * const { count } = await prisma.experimentEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExperimentEventDeleteManyArgs>(args?: SelectSubset<T, ExperimentEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ExperimentEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ExperimentEvents
     * const experimentEvent = await prisma.experimentEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExperimentEventUpdateManyArgs>(args: SelectSubset<T, ExperimentEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ExperimentEvent.
     * @param {ExperimentEventUpsertArgs} args - Arguments to update or create a ExperimentEvent.
     * @example
     * // Update or create a ExperimentEvent
     * const experimentEvent = await prisma.experimentEvent.upsert({
     *   create: {
     *     // ... data to create a ExperimentEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ExperimentEvent we want to update
     *   }
     * })
     */
    upsert<T extends ExperimentEventUpsertArgs>(args: SelectSubset<T, ExperimentEventUpsertArgs<ExtArgs>>): Prisma__ExperimentEventClient<$Result.GetResult<Prisma.$ExperimentEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ExperimentEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentEventCountArgs} args - Arguments to filter ExperimentEvents to count.
     * @example
     * // Count the number of ExperimentEvents
     * const count = await prisma.experimentEvent.count({
     *   where: {
     *     // ... the filter for the ExperimentEvents we want to count
     *   }
     * })
    **/
    count<T extends ExperimentEventCountArgs>(
      args?: Subset<T, ExperimentEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExperimentEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ExperimentEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExperimentEventAggregateArgs>(args: Subset<T, ExperimentEventAggregateArgs>): Prisma.PrismaPromise<GetExperimentEventAggregateType<T>>

    /**
     * Group by ExperimentEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExperimentEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExperimentEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExperimentEventGroupByArgs['orderBy'] }
        : { orderBy?: ExperimentEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExperimentEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExperimentEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ExperimentEvent model
   */
  readonly fields: ExperimentEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ExperimentEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExperimentEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    experiment<T extends ExperimentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ExperimentDefaultArgs<ExtArgs>>): Prisma__ExperimentClient<$Result.GetResult<Prisma.$ExperimentPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ExperimentEvent model
   */ 
  interface ExperimentEventFieldRefs {
    readonly id: FieldRef<"ExperimentEvent", 'String'>
    readonly createdAt: FieldRef<"ExperimentEvent", 'DateTime'>
    readonly experimentId: FieldRef<"ExperimentEvent", 'String'>
    readonly observation: FieldRef<"ExperimentEvent", 'String'>
    readonly result: FieldRef<"ExperimentEvent", 'String'>
    readonly score: FieldRef<"ExperimentEvent", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * ExperimentEvent findUnique
   */
  export type ExperimentEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
    /**
     * Filter, which ExperimentEvent to fetch.
     */
    where: ExperimentEventWhereUniqueInput
  }

  /**
   * ExperimentEvent findUniqueOrThrow
   */
  export type ExperimentEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
    /**
     * Filter, which ExperimentEvent to fetch.
     */
    where: ExperimentEventWhereUniqueInput
  }

  /**
   * ExperimentEvent findFirst
   */
  export type ExperimentEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
    /**
     * Filter, which ExperimentEvent to fetch.
     */
    where?: ExperimentEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExperimentEvents to fetch.
     */
    orderBy?: ExperimentEventOrderByWithRelationInput | ExperimentEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExperimentEvents.
     */
    cursor?: ExperimentEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExperimentEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExperimentEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExperimentEvents.
     */
    distinct?: ExperimentEventScalarFieldEnum | ExperimentEventScalarFieldEnum[]
  }

  /**
   * ExperimentEvent findFirstOrThrow
   */
  export type ExperimentEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
    /**
     * Filter, which ExperimentEvent to fetch.
     */
    where?: ExperimentEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExperimentEvents to fetch.
     */
    orderBy?: ExperimentEventOrderByWithRelationInput | ExperimentEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExperimentEvents.
     */
    cursor?: ExperimentEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExperimentEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExperimentEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExperimentEvents.
     */
    distinct?: ExperimentEventScalarFieldEnum | ExperimentEventScalarFieldEnum[]
  }

  /**
   * ExperimentEvent findMany
   */
  export type ExperimentEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
    /**
     * Filter, which ExperimentEvents to fetch.
     */
    where?: ExperimentEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExperimentEvents to fetch.
     */
    orderBy?: ExperimentEventOrderByWithRelationInput | ExperimentEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ExperimentEvents.
     */
    cursor?: ExperimentEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExperimentEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExperimentEvents.
     */
    skip?: number
    distinct?: ExperimentEventScalarFieldEnum | ExperimentEventScalarFieldEnum[]
  }

  /**
   * ExperimentEvent create
   */
  export type ExperimentEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
    /**
     * The data needed to create a ExperimentEvent.
     */
    data: XOR<ExperimentEventCreateInput, ExperimentEventUncheckedCreateInput>
  }

  /**
   * ExperimentEvent createMany
   */
  export type ExperimentEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ExperimentEvents.
     */
    data: ExperimentEventCreateManyInput | ExperimentEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ExperimentEvent createManyAndReturn
   */
  export type ExperimentEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ExperimentEvents.
     */
    data: ExperimentEventCreateManyInput | ExperimentEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ExperimentEvent update
   */
  export type ExperimentEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
    /**
     * The data needed to update a ExperimentEvent.
     */
    data: XOR<ExperimentEventUpdateInput, ExperimentEventUncheckedUpdateInput>
    /**
     * Choose, which ExperimentEvent to update.
     */
    where: ExperimentEventWhereUniqueInput
  }

  /**
   * ExperimentEvent updateMany
   */
  export type ExperimentEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ExperimentEvents.
     */
    data: XOR<ExperimentEventUpdateManyMutationInput, ExperimentEventUncheckedUpdateManyInput>
    /**
     * Filter which ExperimentEvents to update
     */
    where?: ExperimentEventWhereInput
  }

  /**
   * ExperimentEvent upsert
   */
  export type ExperimentEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
    /**
     * The filter to search for the ExperimentEvent to update in case it exists.
     */
    where: ExperimentEventWhereUniqueInput
    /**
     * In case the ExperimentEvent found by the `where` argument doesn't exist, create a new ExperimentEvent with this data.
     */
    create: XOR<ExperimentEventCreateInput, ExperimentEventUncheckedCreateInput>
    /**
     * In case the ExperimentEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExperimentEventUpdateInput, ExperimentEventUncheckedUpdateInput>
  }

  /**
   * ExperimentEvent delete
   */
  export type ExperimentEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
    /**
     * Filter which ExperimentEvent to delete.
     */
    where: ExperimentEventWhereUniqueInput
  }

  /**
   * ExperimentEvent deleteMany
   */
  export type ExperimentEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExperimentEvents to delete
     */
    where?: ExperimentEventWhereInput
  }

  /**
   * ExperimentEvent without action
   */
  export type ExperimentEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExperimentEvent
     */
    select?: ExperimentEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExperimentEventInclude<ExtArgs> | null
  }


  /**
   * Model GameSession
   */

  export type AggregateGameSession = {
    _count: GameSessionCountAggregateOutputType | null
    _min: GameSessionMinAggregateOutputType | null
    _max: GameSessionMaxAggregateOutputType | null
  }

  export type GameSessionMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    status: $Enums.SessionStatus | null
    summary: string | null
    userId: string | null
  }

  export type GameSessionMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    status: $Enums.SessionStatus | null
    summary: string | null
    userId: string | null
  }

  export type GameSessionCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    status: number
    summary: number
    userId: number
    _all: number
  }


  export type GameSessionMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    status?: true
    summary?: true
    userId?: true
  }

  export type GameSessionMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    status?: true
    summary?: true
    userId?: true
  }

  export type GameSessionCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    status?: true
    summary?: true
    userId?: true
    _all?: true
  }

  export type GameSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameSession to aggregate.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GameSessions
    **/
    _count?: true | GameSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GameSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GameSessionMaxAggregateInputType
  }

  export type GetGameSessionAggregateType<T extends GameSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateGameSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGameSession[P]>
      : GetScalarType<T[P], AggregateGameSession[P]>
  }




  export type GameSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameSessionWhereInput
    orderBy?: GameSessionOrderByWithAggregationInput | GameSessionOrderByWithAggregationInput[]
    by: GameSessionScalarFieldEnum[] | GameSessionScalarFieldEnum
    having?: GameSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GameSessionCountAggregateInputType | true
    _min?: GameSessionMinAggregateInputType
    _max?: GameSessionMaxAggregateInputType
  }

  export type GameSessionGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    status: $Enums.SessionStatus
    summary: string | null
    userId: string
    _count: GameSessionCountAggregateOutputType | null
    _min: GameSessionMinAggregateOutputType | null
    _max: GameSessionMaxAggregateOutputType | null
  }

  type GetGameSessionGroupByPayload<T extends GameSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GameSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GameSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GameSessionGroupByOutputType[P]>
            : GetScalarType<T[P], GameSessionGroupByOutputType[P]>
        }
      >
    >


  export type GameSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    status?: boolean
    summary?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    messages?: boolean | GameSession$messagesArgs<ExtArgs>
    missionRuns?: boolean | GameSession$missionRunsArgs<ExtArgs>
    memoryEvents?: boolean | GameSession$memoryEventsArgs<ExtArgs>
    _count?: boolean | GameSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gameSession"]>

  export type GameSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    status?: boolean
    summary?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gameSession"]>

  export type GameSessionSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    status?: boolean
    summary?: boolean
    userId?: boolean
  }

  export type GameSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    messages?: boolean | GameSession$messagesArgs<ExtArgs>
    missionRuns?: boolean | GameSession$missionRunsArgs<ExtArgs>
    memoryEvents?: boolean | GameSession$memoryEventsArgs<ExtArgs>
    _count?: boolean | GameSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type GameSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $GameSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GameSession"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      messages: Prisma.$GameMessagePayload<ExtArgs>[]
      missionRuns: Prisma.$MissionRunPayload<ExtArgs>[]
      memoryEvents: Prisma.$MemoryEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      status: $Enums.SessionStatus
      summary: string | null
      userId: string
    }, ExtArgs["result"]["gameSession"]>
    composites: {}
  }

  type GameSessionGetPayload<S extends boolean | null | undefined | GameSessionDefaultArgs> = $Result.GetResult<Prisma.$GameSessionPayload, S>

  type GameSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GameSessionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GameSessionCountAggregateInputType | true
    }

  export interface GameSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GameSession'], meta: { name: 'GameSession' } }
    /**
     * Find zero or one GameSession that matches the filter.
     * @param {GameSessionFindUniqueArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GameSessionFindUniqueArgs>(args: SelectSubset<T, GameSessionFindUniqueArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GameSession that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GameSessionFindUniqueOrThrowArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GameSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, GameSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GameSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionFindFirstArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GameSessionFindFirstArgs>(args?: SelectSubset<T, GameSessionFindFirstArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GameSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionFindFirstOrThrowArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GameSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, GameSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GameSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GameSessions
     * const gameSessions = await prisma.gameSession.findMany()
     * 
     * // Get first 10 GameSessions
     * const gameSessions = await prisma.gameSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gameSessionWithIdOnly = await prisma.gameSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GameSessionFindManyArgs>(args?: SelectSubset<T, GameSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GameSession.
     * @param {GameSessionCreateArgs} args - Arguments to create a GameSession.
     * @example
     * // Create one GameSession
     * const GameSession = await prisma.gameSession.create({
     *   data: {
     *     // ... data to create a GameSession
     *   }
     * })
     * 
     */
    create<T extends GameSessionCreateArgs>(args: SelectSubset<T, GameSessionCreateArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GameSessions.
     * @param {GameSessionCreateManyArgs} args - Arguments to create many GameSessions.
     * @example
     * // Create many GameSessions
     * const gameSession = await prisma.gameSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GameSessionCreateManyArgs>(args?: SelectSubset<T, GameSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GameSessions and returns the data saved in the database.
     * @param {GameSessionCreateManyAndReturnArgs} args - Arguments to create many GameSessions.
     * @example
     * // Create many GameSessions
     * const gameSession = await prisma.gameSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GameSessions and only return the `id`
     * const gameSessionWithIdOnly = await prisma.gameSession.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GameSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, GameSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GameSession.
     * @param {GameSessionDeleteArgs} args - Arguments to delete one GameSession.
     * @example
     * // Delete one GameSession
     * const GameSession = await prisma.gameSession.delete({
     *   where: {
     *     // ... filter to delete one GameSession
     *   }
     * })
     * 
     */
    delete<T extends GameSessionDeleteArgs>(args: SelectSubset<T, GameSessionDeleteArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GameSession.
     * @param {GameSessionUpdateArgs} args - Arguments to update one GameSession.
     * @example
     * // Update one GameSession
     * const gameSession = await prisma.gameSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GameSessionUpdateArgs>(args: SelectSubset<T, GameSessionUpdateArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GameSessions.
     * @param {GameSessionDeleteManyArgs} args - Arguments to filter GameSessions to delete.
     * @example
     * // Delete a few GameSessions
     * const { count } = await prisma.gameSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GameSessionDeleteManyArgs>(args?: SelectSubset<T, GameSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GameSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GameSessions
     * const gameSession = await prisma.gameSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GameSessionUpdateManyArgs>(args: SelectSubset<T, GameSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GameSession.
     * @param {GameSessionUpsertArgs} args - Arguments to update or create a GameSession.
     * @example
     * // Update or create a GameSession
     * const gameSession = await prisma.gameSession.upsert({
     *   create: {
     *     // ... data to create a GameSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GameSession we want to update
     *   }
     * })
     */
    upsert<T extends GameSessionUpsertArgs>(args: SelectSubset<T, GameSessionUpsertArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GameSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionCountArgs} args - Arguments to filter GameSessions to count.
     * @example
     * // Count the number of GameSessions
     * const count = await prisma.gameSession.count({
     *   where: {
     *     // ... the filter for the GameSessions we want to count
     *   }
     * })
    **/
    count<T extends GameSessionCountArgs>(
      args?: Subset<T, GameSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GameSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GameSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GameSessionAggregateArgs>(args: Subset<T, GameSessionAggregateArgs>): Prisma.PrismaPromise<GetGameSessionAggregateType<T>>

    /**
     * Group by GameSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GameSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GameSessionGroupByArgs['orderBy'] }
        : { orderBy?: GameSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GameSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGameSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GameSession model
   */
  readonly fields: GameSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GameSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GameSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    messages<T extends GameSession$messagesArgs<ExtArgs> = {}>(args?: Subset<T, GameSession$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "findMany"> | Null>
    missionRuns<T extends GameSession$missionRunsArgs<ExtArgs> = {}>(args?: Subset<T, GameSession$missionRunsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "findMany"> | Null>
    memoryEvents<T extends GameSession$memoryEventsArgs<ExtArgs> = {}>(args?: Subset<T, GameSession$memoryEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GameSession model
   */ 
  interface GameSessionFieldRefs {
    readonly id: FieldRef<"GameSession", 'String'>
    readonly createdAt: FieldRef<"GameSession", 'DateTime'>
    readonly updatedAt: FieldRef<"GameSession", 'DateTime'>
    readonly status: FieldRef<"GameSession", 'SessionStatus'>
    readonly summary: FieldRef<"GameSession", 'String'>
    readonly userId: FieldRef<"GameSession", 'String'>
  }
    

  // Custom InputTypes
  /**
   * GameSession findUnique
   */
  export type GameSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession findUniqueOrThrow
   */
  export type GameSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession findFirst
   */
  export type GameSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameSessions.
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameSessions.
     */
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * GameSession findFirstOrThrow
   */
  export type GameSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameSessions.
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameSessions.
     */
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * GameSession findMany
   */
  export type GameSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSessions to fetch.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GameSessions.
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * GameSession create
   */
  export type GameSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a GameSession.
     */
    data: XOR<GameSessionCreateInput, GameSessionUncheckedCreateInput>
  }

  /**
   * GameSession createMany
   */
  export type GameSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GameSessions.
     */
    data: GameSessionCreateManyInput | GameSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GameSession createManyAndReturn
   */
  export type GameSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GameSessions.
     */
    data: GameSessionCreateManyInput | GameSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GameSession update
   */
  export type GameSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a GameSession.
     */
    data: XOR<GameSessionUpdateInput, GameSessionUncheckedUpdateInput>
    /**
     * Choose, which GameSession to update.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession updateMany
   */
  export type GameSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GameSessions.
     */
    data: XOR<GameSessionUpdateManyMutationInput, GameSessionUncheckedUpdateManyInput>
    /**
     * Filter which GameSessions to update
     */
    where?: GameSessionWhereInput
  }

  /**
   * GameSession upsert
   */
  export type GameSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the GameSession to update in case it exists.
     */
    where: GameSessionWhereUniqueInput
    /**
     * In case the GameSession found by the `where` argument doesn't exist, create a new GameSession with this data.
     */
    create: XOR<GameSessionCreateInput, GameSessionUncheckedCreateInput>
    /**
     * In case the GameSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GameSessionUpdateInput, GameSessionUncheckedUpdateInput>
  }

  /**
   * GameSession delete
   */
  export type GameSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter which GameSession to delete.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession deleteMany
   */
  export type GameSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameSessions to delete
     */
    where?: GameSessionWhereInput
  }

  /**
   * GameSession.messages
   */
  export type GameSession$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
    where?: GameMessageWhereInput
    orderBy?: GameMessageOrderByWithRelationInput | GameMessageOrderByWithRelationInput[]
    cursor?: GameMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GameMessageScalarFieldEnum | GameMessageScalarFieldEnum[]
  }

  /**
   * GameSession.missionRuns
   */
  export type GameSession$missionRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    where?: MissionRunWhereInput
    orderBy?: MissionRunOrderByWithRelationInput | MissionRunOrderByWithRelationInput[]
    cursor?: MissionRunWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MissionRunScalarFieldEnum | MissionRunScalarFieldEnum[]
  }

  /**
   * GameSession.memoryEvents
   */
  export type GameSession$memoryEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    where?: MemoryEventWhereInput
    orderBy?: MemoryEventOrderByWithRelationInput | MemoryEventOrderByWithRelationInput[]
    cursor?: MemoryEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryEventScalarFieldEnum | MemoryEventScalarFieldEnum[]
  }

  /**
   * GameSession without action
   */
  export type GameSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
  }


  /**
   * Model GameMessage
   */

  export type AggregateGameMessage = {
    _count: GameMessageCountAggregateOutputType | null
    _min: GameMessageMinAggregateOutputType | null
    _max: GameMessageMaxAggregateOutputType | null
  }

  export type GameMessageMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    role: string | null
    content: string | null
    gameSessionId: string | null
  }

  export type GameMessageMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    role: string | null
    content: string | null
    gameSessionId: string | null
  }

  export type GameMessageCountAggregateOutputType = {
    id: number
    createdAt: number
    role: number
    content: number
    gameSessionId: number
    _all: number
  }


  export type GameMessageMinAggregateInputType = {
    id?: true
    createdAt?: true
    role?: true
    content?: true
    gameSessionId?: true
  }

  export type GameMessageMaxAggregateInputType = {
    id?: true
    createdAt?: true
    role?: true
    content?: true
    gameSessionId?: true
  }

  export type GameMessageCountAggregateInputType = {
    id?: true
    createdAt?: true
    role?: true
    content?: true
    gameSessionId?: true
    _all?: true
  }

  export type GameMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameMessage to aggregate.
     */
    where?: GameMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameMessages to fetch.
     */
    orderBy?: GameMessageOrderByWithRelationInput | GameMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GameMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GameMessages
    **/
    _count?: true | GameMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GameMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GameMessageMaxAggregateInputType
  }

  export type GetGameMessageAggregateType<T extends GameMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateGameMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGameMessage[P]>
      : GetScalarType<T[P], AggregateGameMessage[P]>
  }




  export type GameMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameMessageWhereInput
    orderBy?: GameMessageOrderByWithAggregationInput | GameMessageOrderByWithAggregationInput[]
    by: GameMessageScalarFieldEnum[] | GameMessageScalarFieldEnum
    having?: GameMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GameMessageCountAggregateInputType | true
    _min?: GameMessageMinAggregateInputType
    _max?: GameMessageMaxAggregateInputType
  }

  export type GameMessageGroupByOutputType = {
    id: string
    createdAt: Date
    role: string
    content: string
    gameSessionId: string
    _count: GameMessageCountAggregateOutputType | null
    _min: GameMessageMinAggregateOutputType | null
    _max: GameMessageMaxAggregateOutputType | null
  }

  type GetGameMessageGroupByPayload<T extends GameMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GameMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GameMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GameMessageGroupByOutputType[P]>
            : GetScalarType<T[P], GameMessageGroupByOutputType[P]>
        }
      >
    >


  export type GameMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    role?: boolean
    content?: boolean
    gameSessionId?: boolean
    gameSession?: boolean | GameSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gameMessage"]>

  export type GameMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    role?: boolean
    content?: boolean
    gameSessionId?: boolean
    gameSession?: boolean | GameSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gameMessage"]>

  export type GameMessageSelectScalar = {
    id?: boolean
    createdAt?: boolean
    role?: boolean
    content?: boolean
    gameSessionId?: boolean
  }

  export type GameMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gameSession?: boolean | GameSessionDefaultArgs<ExtArgs>
  }
  export type GameMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gameSession?: boolean | GameSessionDefaultArgs<ExtArgs>
  }

  export type $GameMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GameMessage"
    objects: {
      gameSession: Prisma.$GameSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      role: string
      content: string
      gameSessionId: string
    }, ExtArgs["result"]["gameMessage"]>
    composites: {}
  }

  type GameMessageGetPayload<S extends boolean | null | undefined | GameMessageDefaultArgs> = $Result.GetResult<Prisma.$GameMessagePayload, S>

  type GameMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GameMessageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GameMessageCountAggregateInputType | true
    }

  export interface GameMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GameMessage'], meta: { name: 'GameMessage' } }
    /**
     * Find zero or one GameMessage that matches the filter.
     * @param {GameMessageFindUniqueArgs} args - Arguments to find a GameMessage
     * @example
     * // Get one GameMessage
     * const gameMessage = await prisma.gameMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GameMessageFindUniqueArgs>(args: SelectSubset<T, GameMessageFindUniqueArgs<ExtArgs>>): Prisma__GameMessageClient<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GameMessage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GameMessageFindUniqueOrThrowArgs} args - Arguments to find a GameMessage
     * @example
     * // Get one GameMessage
     * const gameMessage = await prisma.gameMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GameMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, GameMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GameMessageClient<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GameMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameMessageFindFirstArgs} args - Arguments to find a GameMessage
     * @example
     * // Get one GameMessage
     * const gameMessage = await prisma.gameMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GameMessageFindFirstArgs>(args?: SelectSubset<T, GameMessageFindFirstArgs<ExtArgs>>): Prisma__GameMessageClient<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GameMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameMessageFindFirstOrThrowArgs} args - Arguments to find a GameMessage
     * @example
     * // Get one GameMessage
     * const gameMessage = await prisma.gameMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GameMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, GameMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__GameMessageClient<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GameMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GameMessages
     * const gameMessages = await prisma.gameMessage.findMany()
     * 
     * // Get first 10 GameMessages
     * const gameMessages = await prisma.gameMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gameMessageWithIdOnly = await prisma.gameMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GameMessageFindManyArgs>(args?: SelectSubset<T, GameMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GameMessage.
     * @param {GameMessageCreateArgs} args - Arguments to create a GameMessage.
     * @example
     * // Create one GameMessage
     * const GameMessage = await prisma.gameMessage.create({
     *   data: {
     *     // ... data to create a GameMessage
     *   }
     * })
     * 
     */
    create<T extends GameMessageCreateArgs>(args: SelectSubset<T, GameMessageCreateArgs<ExtArgs>>): Prisma__GameMessageClient<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GameMessages.
     * @param {GameMessageCreateManyArgs} args - Arguments to create many GameMessages.
     * @example
     * // Create many GameMessages
     * const gameMessage = await prisma.gameMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GameMessageCreateManyArgs>(args?: SelectSubset<T, GameMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GameMessages and returns the data saved in the database.
     * @param {GameMessageCreateManyAndReturnArgs} args - Arguments to create many GameMessages.
     * @example
     * // Create many GameMessages
     * const gameMessage = await prisma.gameMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GameMessages and only return the `id`
     * const gameMessageWithIdOnly = await prisma.gameMessage.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GameMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, GameMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GameMessage.
     * @param {GameMessageDeleteArgs} args - Arguments to delete one GameMessage.
     * @example
     * // Delete one GameMessage
     * const GameMessage = await prisma.gameMessage.delete({
     *   where: {
     *     // ... filter to delete one GameMessage
     *   }
     * })
     * 
     */
    delete<T extends GameMessageDeleteArgs>(args: SelectSubset<T, GameMessageDeleteArgs<ExtArgs>>): Prisma__GameMessageClient<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GameMessage.
     * @param {GameMessageUpdateArgs} args - Arguments to update one GameMessage.
     * @example
     * // Update one GameMessage
     * const gameMessage = await prisma.gameMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GameMessageUpdateArgs>(args: SelectSubset<T, GameMessageUpdateArgs<ExtArgs>>): Prisma__GameMessageClient<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GameMessages.
     * @param {GameMessageDeleteManyArgs} args - Arguments to filter GameMessages to delete.
     * @example
     * // Delete a few GameMessages
     * const { count } = await prisma.gameMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GameMessageDeleteManyArgs>(args?: SelectSubset<T, GameMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GameMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GameMessages
     * const gameMessage = await prisma.gameMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GameMessageUpdateManyArgs>(args: SelectSubset<T, GameMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GameMessage.
     * @param {GameMessageUpsertArgs} args - Arguments to update or create a GameMessage.
     * @example
     * // Update or create a GameMessage
     * const gameMessage = await prisma.gameMessage.upsert({
     *   create: {
     *     // ... data to create a GameMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GameMessage we want to update
     *   }
     * })
     */
    upsert<T extends GameMessageUpsertArgs>(args: SelectSubset<T, GameMessageUpsertArgs<ExtArgs>>): Prisma__GameMessageClient<$Result.GetResult<Prisma.$GameMessagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GameMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameMessageCountArgs} args - Arguments to filter GameMessages to count.
     * @example
     * // Count the number of GameMessages
     * const count = await prisma.gameMessage.count({
     *   where: {
     *     // ... the filter for the GameMessages we want to count
     *   }
     * })
    **/
    count<T extends GameMessageCountArgs>(
      args?: Subset<T, GameMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GameMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GameMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GameMessageAggregateArgs>(args: Subset<T, GameMessageAggregateArgs>): Prisma.PrismaPromise<GetGameMessageAggregateType<T>>

    /**
     * Group by GameMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GameMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GameMessageGroupByArgs['orderBy'] }
        : { orderBy?: GameMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GameMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGameMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GameMessage model
   */
  readonly fields: GameMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GameMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GameMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    gameSession<T extends GameSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GameSessionDefaultArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GameMessage model
   */ 
  interface GameMessageFieldRefs {
    readonly id: FieldRef<"GameMessage", 'String'>
    readonly createdAt: FieldRef<"GameMessage", 'DateTime'>
    readonly role: FieldRef<"GameMessage", 'String'>
    readonly content: FieldRef<"GameMessage", 'String'>
    readonly gameSessionId: FieldRef<"GameMessage", 'String'>
  }
    

  // Custom InputTypes
  /**
   * GameMessage findUnique
   */
  export type GameMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
    /**
     * Filter, which GameMessage to fetch.
     */
    where: GameMessageWhereUniqueInput
  }

  /**
   * GameMessage findUniqueOrThrow
   */
  export type GameMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
    /**
     * Filter, which GameMessage to fetch.
     */
    where: GameMessageWhereUniqueInput
  }

  /**
   * GameMessage findFirst
   */
  export type GameMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
    /**
     * Filter, which GameMessage to fetch.
     */
    where?: GameMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameMessages to fetch.
     */
    orderBy?: GameMessageOrderByWithRelationInput | GameMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameMessages.
     */
    cursor?: GameMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameMessages.
     */
    distinct?: GameMessageScalarFieldEnum | GameMessageScalarFieldEnum[]
  }

  /**
   * GameMessage findFirstOrThrow
   */
  export type GameMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
    /**
     * Filter, which GameMessage to fetch.
     */
    where?: GameMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameMessages to fetch.
     */
    orderBy?: GameMessageOrderByWithRelationInput | GameMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameMessages.
     */
    cursor?: GameMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameMessages.
     */
    distinct?: GameMessageScalarFieldEnum | GameMessageScalarFieldEnum[]
  }

  /**
   * GameMessage findMany
   */
  export type GameMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
    /**
     * Filter, which GameMessages to fetch.
     */
    where?: GameMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameMessages to fetch.
     */
    orderBy?: GameMessageOrderByWithRelationInput | GameMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GameMessages.
     */
    cursor?: GameMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameMessages.
     */
    skip?: number
    distinct?: GameMessageScalarFieldEnum | GameMessageScalarFieldEnum[]
  }

  /**
   * GameMessage create
   */
  export type GameMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a GameMessage.
     */
    data: XOR<GameMessageCreateInput, GameMessageUncheckedCreateInput>
  }

  /**
   * GameMessage createMany
   */
  export type GameMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GameMessages.
     */
    data: GameMessageCreateManyInput | GameMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GameMessage createManyAndReturn
   */
  export type GameMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GameMessages.
     */
    data: GameMessageCreateManyInput | GameMessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GameMessage update
   */
  export type GameMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a GameMessage.
     */
    data: XOR<GameMessageUpdateInput, GameMessageUncheckedUpdateInput>
    /**
     * Choose, which GameMessage to update.
     */
    where: GameMessageWhereUniqueInput
  }

  /**
   * GameMessage updateMany
   */
  export type GameMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GameMessages.
     */
    data: XOR<GameMessageUpdateManyMutationInput, GameMessageUncheckedUpdateManyInput>
    /**
     * Filter which GameMessages to update
     */
    where?: GameMessageWhereInput
  }

  /**
   * GameMessage upsert
   */
  export type GameMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the GameMessage to update in case it exists.
     */
    where: GameMessageWhereUniqueInput
    /**
     * In case the GameMessage found by the `where` argument doesn't exist, create a new GameMessage with this data.
     */
    create: XOR<GameMessageCreateInput, GameMessageUncheckedCreateInput>
    /**
     * In case the GameMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GameMessageUpdateInput, GameMessageUncheckedUpdateInput>
  }

  /**
   * GameMessage delete
   */
  export type GameMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
    /**
     * Filter which GameMessage to delete.
     */
    where: GameMessageWhereUniqueInput
  }

  /**
   * GameMessage deleteMany
   */
  export type GameMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameMessages to delete
     */
    where?: GameMessageWhereInput
  }

  /**
   * GameMessage without action
   */
  export type GameMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameMessage
     */
    select?: GameMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameMessageInclude<ExtArgs> | null
  }


  /**
   * Model MemoryEvent
   */

  export type AggregateMemoryEvent = {
    _count: MemoryEventCountAggregateOutputType | null
    _min: MemoryEventMinAggregateOutputType | null
    _max: MemoryEventMaxAggregateOutputType | null
  }

  export type MemoryEventMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    type: $Enums.MemoryEventType | null
    content: string | null
    userId: string | null
    sessionId: string | null
  }

  export type MemoryEventMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    type: $Enums.MemoryEventType | null
    content: string | null
    userId: string | null
    sessionId: string | null
  }

  export type MemoryEventCountAggregateOutputType = {
    id: number
    createdAt: number
    type: number
    content: number
    tags: number
    userId: number
    sessionId: number
    _all: number
  }


  export type MemoryEventMinAggregateInputType = {
    id?: true
    createdAt?: true
    type?: true
    content?: true
    userId?: true
    sessionId?: true
  }

  export type MemoryEventMaxAggregateInputType = {
    id?: true
    createdAt?: true
    type?: true
    content?: true
    userId?: true
    sessionId?: true
  }

  export type MemoryEventCountAggregateInputType = {
    id?: true
    createdAt?: true
    type?: true
    content?: true
    tags?: true
    userId?: true
    sessionId?: true
    _all?: true
  }

  export type MemoryEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryEvent to aggregate.
     */
    where?: MemoryEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryEvents to fetch.
     */
    orderBy?: MemoryEventOrderByWithRelationInput | MemoryEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemoryEvents
    **/
    _count?: true | MemoryEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryEventMaxAggregateInputType
  }

  export type GetMemoryEventAggregateType<T extends MemoryEventAggregateArgs> = {
        [P in keyof T & keyof AggregateMemoryEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemoryEvent[P]>
      : GetScalarType<T[P], AggregateMemoryEvent[P]>
  }




  export type MemoryEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryEventWhereInput
    orderBy?: MemoryEventOrderByWithAggregationInput | MemoryEventOrderByWithAggregationInput[]
    by: MemoryEventScalarFieldEnum[] | MemoryEventScalarFieldEnum
    having?: MemoryEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryEventCountAggregateInputType | true
    _min?: MemoryEventMinAggregateInputType
    _max?: MemoryEventMaxAggregateInputType
  }

  export type MemoryEventGroupByOutputType = {
    id: string
    createdAt: Date
    type: $Enums.MemoryEventType
    content: string
    tags: string[]
    userId: string
    sessionId: string | null
    _count: MemoryEventCountAggregateOutputType | null
    _min: MemoryEventMinAggregateOutputType | null
    _max: MemoryEventMaxAggregateOutputType | null
  }

  type GetMemoryEventGroupByPayload<T extends MemoryEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryEventGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryEventGroupByOutputType[P]>
        }
      >
    >


  export type MemoryEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    type?: boolean
    content?: boolean
    tags?: boolean
    userId?: boolean
    sessionId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    session?: boolean | MemoryEvent$sessionArgs<ExtArgs>
    embeddings?: boolean | MemoryEvent$embeddingsArgs<ExtArgs>
    _count?: boolean | MemoryEventCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryEvent"]>

  export type MemoryEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    type?: boolean
    content?: boolean
    tags?: boolean
    userId?: boolean
    sessionId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    session?: boolean | MemoryEvent$sessionArgs<ExtArgs>
  }, ExtArgs["result"]["memoryEvent"]>

  export type MemoryEventSelectScalar = {
    id?: boolean
    createdAt?: boolean
    type?: boolean
    content?: boolean
    tags?: boolean
    userId?: boolean
    sessionId?: boolean
  }

  export type MemoryEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    session?: boolean | MemoryEvent$sessionArgs<ExtArgs>
    embeddings?: boolean | MemoryEvent$embeddingsArgs<ExtArgs>
    _count?: boolean | MemoryEventCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MemoryEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    session?: boolean | MemoryEvent$sessionArgs<ExtArgs>
  }

  export type $MemoryEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemoryEvent"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      session: Prisma.$GameSessionPayload<ExtArgs> | null
      embeddings: Prisma.$MemoryEmbeddingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      type: $Enums.MemoryEventType
      content: string
      tags: string[]
      userId: string
      sessionId: string | null
    }, ExtArgs["result"]["memoryEvent"]>
    composites: {}
  }

  type MemoryEventGetPayload<S extends boolean | null | undefined | MemoryEventDefaultArgs> = $Result.GetResult<Prisma.$MemoryEventPayload, S>

  type MemoryEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MemoryEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MemoryEventCountAggregateInputType | true
    }

  export interface MemoryEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemoryEvent'], meta: { name: 'MemoryEvent' } }
    /**
     * Find zero or one MemoryEvent that matches the filter.
     * @param {MemoryEventFindUniqueArgs} args - Arguments to find a MemoryEvent
     * @example
     * // Get one MemoryEvent
     * const memoryEvent = await prisma.memoryEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryEventFindUniqueArgs>(args: SelectSubset<T, MemoryEventFindUniqueArgs<ExtArgs>>): Prisma__MemoryEventClient<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MemoryEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MemoryEventFindUniqueOrThrowArgs} args - Arguments to find a MemoryEvent
     * @example
     * // Get one MemoryEvent
     * const memoryEvent = await prisma.memoryEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryEventFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryEventClient<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MemoryEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEventFindFirstArgs} args - Arguments to find a MemoryEvent
     * @example
     * // Get one MemoryEvent
     * const memoryEvent = await prisma.memoryEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryEventFindFirstArgs>(args?: SelectSubset<T, MemoryEventFindFirstArgs<ExtArgs>>): Prisma__MemoryEventClient<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MemoryEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEventFindFirstOrThrowArgs} args - Arguments to find a MemoryEvent
     * @example
     * // Get one MemoryEvent
     * const memoryEvent = await prisma.memoryEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryEventFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryEventClient<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MemoryEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemoryEvents
     * const memoryEvents = await prisma.memoryEvent.findMany()
     * 
     * // Get first 10 MemoryEvents
     * const memoryEvents = await prisma.memoryEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryEventWithIdOnly = await prisma.memoryEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryEventFindManyArgs>(args?: SelectSubset<T, MemoryEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MemoryEvent.
     * @param {MemoryEventCreateArgs} args - Arguments to create a MemoryEvent.
     * @example
     * // Create one MemoryEvent
     * const MemoryEvent = await prisma.memoryEvent.create({
     *   data: {
     *     // ... data to create a MemoryEvent
     *   }
     * })
     * 
     */
    create<T extends MemoryEventCreateArgs>(args: SelectSubset<T, MemoryEventCreateArgs<ExtArgs>>): Prisma__MemoryEventClient<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MemoryEvents.
     * @param {MemoryEventCreateManyArgs} args - Arguments to create many MemoryEvents.
     * @example
     * // Create many MemoryEvents
     * const memoryEvent = await prisma.memoryEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryEventCreateManyArgs>(args?: SelectSubset<T, MemoryEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemoryEvents and returns the data saved in the database.
     * @param {MemoryEventCreateManyAndReturnArgs} args - Arguments to create many MemoryEvents.
     * @example
     * // Create many MemoryEvents
     * const memoryEvent = await prisma.memoryEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemoryEvents and only return the `id`
     * const memoryEventWithIdOnly = await prisma.memoryEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryEventCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MemoryEvent.
     * @param {MemoryEventDeleteArgs} args - Arguments to delete one MemoryEvent.
     * @example
     * // Delete one MemoryEvent
     * const MemoryEvent = await prisma.memoryEvent.delete({
     *   where: {
     *     // ... filter to delete one MemoryEvent
     *   }
     * })
     * 
     */
    delete<T extends MemoryEventDeleteArgs>(args: SelectSubset<T, MemoryEventDeleteArgs<ExtArgs>>): Prisma__MemoryEventClient<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MemoryEvent.
     * @param {MemoryEventUpdateArgs} args - Arguments to update one MemoryEvent.
     * @example
     * // Update one MemoryEvent
     * const memoryEvent = await prisma.memoryEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryEventUpdateArgs>(args: SelectSubset<T, MemoryEventUpdateArgs<ExtArgs>>): Prisma__MemoryEventClient<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MemoryEvents.
     * @param {MemoryEventDeleteManyArgs} args - Arguments to filter MemoryEvents to delete.
     * @example
     * // Delete a few MemoryEvents
     * const { count } = await prisma.memoryEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryEventDeleteManyArgs>(args?: SelectSubset<T, MemoryEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemoryEvents
     * const memoryEvent = await prisma.memoryEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryEventUpdateManyArgs>(args: SelectSubset<T, MemoryEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MemoryEvent.
     * @param {MemoryEventUpsertArgs} args - Arguments to update or create a MemoryEvent.
     * @example
     * // Update or create a MemoryEvent
     * const memoryEvent = await prisma.memoryEvent.upsert({
     *   create: {
     *     // ... data to create a MemoryEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemoryEvent we want to update
     *   }
     * })
     */
    upsert<T extends MemoryEventUpsertArgs>(args: SelectSubset<T, MemoryEventUpsertArgs<ExtArgs>>): Prisma__MemoryEventClient<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MemoryEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEventCountArgs} args - Arguments to filter MemoryEvents to count.
     * @example
     * // Count the number of MemoryEvents
     * const count = await prisma.memoryEvent.count({
     *   where: {
     *     // ... the filter for the MemoryEvents we want to count
     *   }
     * })
    **/
    count<T extends MemoryEventCountArgs>(
      args?: Subset<T, MemoryEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemoryEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryEventAggregateArgs>(args: Subset<T, MemoryEventAggregateArgs>): Prisma.PrismaPromise<GetMemoryEventAggregateType<T>>

    /**
     * Group by MemoryEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryEventGroupByArgs['orderBy'] }
        : { orderBy?: MemoryEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemoryEvent model
   */
  readonly fields: MemoryEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemoryEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    session<T extends MemoryEvent$sessionArgs<ExtArgs> = {}>(args?: Subset<T, MemoryEvent$sessionArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    embeddings<T extends MemoryEvent$embeddingsArgs<ExtArgs> = {}>(args?: Subset<T, MemoryEvent$embeddingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MemoryEvent model
   */ 
  interface MemoryEventFieldRefs {
    readonly id: FieldRef<"MemoryEvent", 'String'>
    readonly createdAt: FieldRef<"MemoryEvent", 'DateTime'>
    readonly type: FieldRef<"MemoryEvent", 'MemoryEventType'>
    readonly content: FieldRef<"MemoryEvent", 'String'>
    readonly tags: FieldRef<"MemoryEvent", 'String[]'>
    readonly userId: FieldRef<"MemoryEvent", 'String'>
    readonly sessionId: FieldRef<"MemoryEvent", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MemoryEvent findUnique
   */
  export type MemoryEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    /**
     * Filter, which MemoryEvent to fetch.
     */
    where: MemoryEventWhereUniqueInput
  }

  /**
   * MemoryEvent findUniqueOrThrow
   */
  export type MemoryEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    /**
     * Filter, which MemoryEvent to fetch.
     */
    where: MemoryEventWhereUniqueInput
  }

  /**
   * MemoryEvent findFirst
   */
  export type MemoryEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    /**
     * Filter, which MemoryEvent to fetch.
     */
    where?: MemoryEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryEvents to fetch.
     */
    orderBy?: MemoryEventOrderByWithRelationInput | MemoryEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryEvents.
     */
    cursor?: MemoryEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryEvents.
     */
    distinct?: MemoryEventScalarFieldEnum | MemoryEventScalarFieldEnum[]
  }

  /**
   * MemoryEvent findFirstOrThrow
   */
  export type MemoryEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    /**
     * Filter, which MemoryEvent to fetch.
     */
    where?: MemoryEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryEvents to fetch.
     */
    orderBy?: MemoryEventOrderByWithRelationInput | MemoryEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryEvents.
     */
    cursor?: MemoryEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryEvents.
     */
    distinct?: MemoryEventScalarFieldEnum | MemoryEventScalarFieldEnum[]
  }

  /**
   * MemoryEvent findMany
   */
  export type MemoryEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    /**
     * Filter, which MemoryEvents to fetch.
     */
    where?: MemoryEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryEvents to fetch.
     */
    orderBy?: MemoryEventOrderByWithRelationInput | MemoryEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemoryEvents.
     */
    cursor?: MemoryEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryEvents.
     */
    skip?: number
    distinct?: MemoryEventScalarFieldEnum | MemoryEventScalarFieldEnum[]
  }

  /**
   * MemoryEvent create
   */
  export type MemoryEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    /**
     * The data needed to create a MemoryEvent.
     */
    data: XOR<MemoryEventCreateInput, MemoryEventUncheckedCreateInput>
  }

  /**
   * MemoryEvent createMany
   */
  export type MemoryEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemoryEvents.
     */
    data: MemoryEventCreateManyInput | MemoryEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MemoryEvent createManyAndReturn
   */
  export type MemoryEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MemoryEvents.
     */
    data: MemoryEventCreateManyInput | MemoryEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryEvent update
   */
  export type MemoryEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    /**
     * The data needed to update a MemoryEvent.
     */
    data: XOR<MemoryEventUpdateInput, MemoryEventUncheckedUpdateInput>
    /**
     * Choose, which MemoryEvent to update.
     */
    where: MemoryEventWhereUniqueInput
  }

  /**
   * MemoryEvent updateMany
   */
  export type MemoryEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemoryEvents.
     */
    data: XOR<MemoryEventUpdateManyMutationInput, MemoryEventUncheckedUpdateManyInput>
    /**
     * Filter which MemoryEvents to update
     */
    where?: MemoryEventWhereInput
  }

  /**
   * MemoryEvent upsert
   */
  export type MemoryEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    /**
     * The filter to search for the MemoryEvent to update in case it exists.
     */
    where: MemoryEventWhereUniqueInput
    /**
     * In case the MemoryEvent found by the `where` argument doesn't exist, create a new MemoryEvent with this data.
     */
    create: XOR<MemoryEventCreateInput, MemoryEventUncheckedCreateInput>
    /**
     * In case the MemoryEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryEventUpdateInput, MemoryEventUncheckedUpdateInput>
  }

  /**
   * MemoryEvent delete
   */
  export type MemoryEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
    /**
     * Filter which MemoryEvent to delete.
     */
    where: MemoryEventWhereUniqueInput
  }

  /**
   * MemoryEvent deleteMany
   */
  export type MemoryEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryEvents to delete
     */
    where?: MemoryEventWhereInput
  }

  /**
   * MemoryEvent.session
   */
  export type MemoryEvent$sessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    where?: GameSessionWhereInput
  }

  /**
   * MemoryEvent.embeddings
   */
  export type MemoryEvent$embeddingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
    where?: MemoryEmbeddingWhereInput
    orderBy?: MemoryEmbeddingOrderByWithRelationInput | MemoryEmbeddingOrderByWithRelationInput[]
    cursor?: MemoryEmbeddingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemoryEmbeddingScalarFieldEnum | MemoryEmbeddingScalarFieldEnum[]
  }

  /**
   * MemoryEvent without action
   */
  export type MemoryEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEvent
     */
    select?: MemoryEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEventInclude<ExtArgs> | null
  }


  /**
   * Model MemoryEmbedding
   */

  export type AggregateMemoryEmbedding = {
    _count: MemoryEmbeddingCountAggregateOutputType | null
    _avg: MemoryEmbeddingAvgAggregateOutputType | null
    _sum: MemoryEmbeddingSumAggregateOutputType | null
    _min: MemoryEmbeddingMinAggregateOutputType | null
    _max: MemoryEmbeddingMaxAggregateOutputType | null
  }

  export type MemoryEmbeddingAvgAggregateOutputType = {
    dimensions: number | null
  }

  export type MemoryEmbeddingSumAggregateOutputType = {
    dimensions: number | null
  }

  export type MemoryEmbeddingMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    provider: string | null
    dimensions: number | null
    memoryEventId: string | null
  }

  export type MemoryEmbeddingMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    provider: string | null
    dimensions: number | null
    memoryEventId: string | null
  }

  export type MemoryEmbeddingCountAggregateOutputType = {
    id: number
    createdAt: number
    provider: number
    dimensions: number
    vector: number
    memoryEventId: number
    _all: number
  }


  export type MemoryEmbeddingAvgAggregateInputType = {
    dimensions?: true
  }

  export type MemoryEmbeddingSumAggregateInputType = {
    dimensions?: true
  }

  export type MemoryEmbeddingMinAggregateInputType = {
    id?: true
    createdAt?: true
    provider?: true
    dimensions?: true
    memoryEventId?: true
  }

  export type MemoryEmbeddingMaxAggregateInputType = {
    id?: true
    createdAt?: true
    provider?: true
    dimensions?: true
    memoryEventId?: true
  }

  export type MemoryEmbeddingCountAggregateInputType = {
    id?: true
    createdAt?: true
    provider?: true
    dimensions?: true
    vector?: true
    memoryEventId?: true
    _all?: true
  }

  export type MemoryEmbeddingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryEmbedding to aggregate.
     */
    where?: MemoryEmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryEmbeddings to fetch.
     */
    orderBy?: MemoryEmbeddingOrderByWithRelationInput | MemoryEmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemoryEmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryEmbeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryEmbeddings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemoryEmbeddings
    **/
    _count?: true | MemoryEmbeddingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MemoryEmbeddingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MemoryEmbeddingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemoryEmbeddingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemoryEmbeddingMaxAggregateInputType
  }

  export type GetMemoryEmbeddingAggregateType<T extends MemoryEmbeddingAggregateArgs> = {
        [P in keyof T & keyof AggregateMemoryEmbedding]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemoryEmbedding[P]>
      : GetScalarType<T[P], AggregateMemoryEmbedding[P]>
  }




  export type MemoryEmbeddingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemoryEmbeddingWhereInput
    orderBy?: MemoryEmbeddingOrderByWithAggregationInput | MemoryEmbeddingOrderByWithAggregationInput[]
    by: MemoryEmbeddingScalarFieldEnum[] | MemoryEmbeddingScalarFieldEnum
    having?: MemoryEmbeddingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemoryEmbeddingCountAggregateInputType | true
    _avg?: MemoryEmbeddingAvgAggregateInputType
    _sum?: MemoryEmbeddingSumAggregateInputType
    _min?: MemoryEmbeddingMinAggregateInputType
    _max?: MemoryEmbeddingMaxAggregateInputType
  }

  export type MemoryEmbeddingGroupByOutputType = {
    id: string
    createdAt: Date
    provider: string | null
    dimensions: number | null
    vector: JsonValue
    memoryEventId: string
    _count: MemoryEmbeddingCountAggregateOutputType | null
    _avg: MemoryEmbeddingAvgAggregateOutputType | null
    _sum: MemoryEmbeddingSumAggregateOutputType | null
    _min: MemoryEmbeddingMinAggregateOutputType | null
    _max: MemoryEmbeddingMaxAggregateOutputType | null
  }

  type GetMemoryEmbeddingGroupByPayload<T extends MemoryEmbeddingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemoryEmbeddingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemoryEmbeddingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemoryEmbeddingGroupByOutputType[P]>
            : GetScalarType<T[P], MemoryEmbeddingGroupByOutputType[P]>
        }
      >
    >


  export type MemoryEmbeddingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    provider?: boolean
    dimensions?: boolean
    vector?: boolean
    memoryEventId?: boolean
    memory?: boolean | MemoryEventDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryEmbedding"]>

  export type MemoryEmbeddingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    provider?: boolean
    dimensions?: boolean
    vector?: boolean
    memoryEventId?: boolean
    memory?: boolean | MemoryEventDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memoryEmbedding"]>

  export type MemoryEmbeddingSelectScalar = {
    id?: boolean
    createdAt?: boolean
    provider?: boolean
    dimensions?: boolean
    vector?: boolean
    memoryEventId?: boolean
  }

  export type MemoryEmbeddingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memory?: boolean | MemoryEventDefaultArgs<ExtArgs>
  }
  export type MemoryEmbeddingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memory?: boolean | MemoryEventDefaultArgs<ExtArgs>
  }

  export type $MemoryEmbeddingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemoryEmbedding"
    objects: {
      memory: Prisma.$MemoryEventPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      provider: string | null
      dimensions: number | null
      vector: Prisma.JsonValue
      memoryEventId: string
    }, ExtArgs["result"]["memoryEmbedding"]>
    composites: {}
  }

  type MemoryEmbeddingGetPayload<S extends boolean | null | undefined | MemoryEmbeddingDefaultArgs> = $Result.GetResult<Prisma.$MemoryEmbeddingPayload, S>

  type MemoryEmbeddingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MemoryEmbeddingFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MemoryEmbeddingCountAggregateInputType | true
    }

  export interface MemoryEmbeddingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemoryEmbedding'], meta: { name: 'MemoryEmbedding' } }
    /**
     * Find zero or one MemoryEmbedding that matches the filter.
     * @param {MemoryEmbeddingFindUniqueArgs} args - Arguments to find a MemoryEmbedding
     * @example
     * // Get one MemoryEmbedding
     * const memoryEmbedding = await prisma.memoryEmbedding.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemoryEmbeddingFindUniqueArgs>(args: SelectSubset<T, MemoryEmbeddingFindUniqueArgs<ExtArgs>>): Prisma__MemoryEmbeddingClient<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MemoryEmbedding that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MemoryEmbeddingFindUniqueOrThrowArgs} args - Arguments to find a MemoryEmbedding
     * @example
     * // Get one MemoryEmbedding
     * const memoryEmbedding = await prisma.memoryEmbedding.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemoryEmbeddingFindUniqueOrThrowArgs>(args: SelectSubset<T, MemoryEmbeddingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemoryEmbeddingClient<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MemoryEmbedding that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEmbeddingFindFirstArgs} args - Arguments to find a MemoryEmbedding
     * @example
     * // Get one MemoryEmbedding
     * const memoryEmbedding = await prisma.memoryEmbedding.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemoryEmbeddingFindFirstArgs>(args?: SelectSubset<T, MemoryEmbeddingFindFirstArgs<ExtArgs>>): Prisma__MemoryEmbeddingClient<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MemoryEmbedding that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEmbeddingFindFirstOrThrowArgs} args - Arguments to find a MemoryEmbedding
     * @example
     * // Get one MemoryEmbedding
     * const memoryEmbedding = await prisma.memoryEmbedding.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemoryEmbeddingFindFirstOrThrowArgs>(args?: SelectSubset<T, MemoryEmbeddingFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemoryEmbeddingClient<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MemoryEmbeddings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEmbeddingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemoryEmbeddings
     * const memoryEmbeddings = await prisma.memoryEmbedding.findMany()
     * 
     * // Get first 10 MemoryEmbeddings
     * const memoryEmbeddings = await prisma.memoryEmbedding.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memoryEmbeddingWithIdOnly = await prisma.memoryEmbedding.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemoryEmbeddingFindManyArgs>(args?: SelectSubset<T, MemoryEmbeddingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MemoryEmbedding.
     * @param {MemoryEmbeddingCreateArgs} args - Arguments to create a MemoryEmbedding.
     * @example
     * // Create one MemoryEmbedding
     * const MemoryEmbedding = await prisma.memoryEmbedding.create({
     *   data: {
     *     // ... data to create a MemoryEmbedding
     *   }
     * })
     * 
     */
    create<T extends MemoryEmbeddingCreateArgs>(args: SelectSubset<T, MemoryEmbeddingCreateArgs<ExtArgs>>): Prisma__MemoryEmbeddingClient<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MemoryEmbeddings.
     * @param {MemoryEmbeddingCreateManyArgs} args - Arguments to create many MemoryEmbeddings.
     * @example
     * // Create many MemoryEmbeddings
     * const memoryEmbedding = await prisma.memoryEmbedding.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemoryEmbeddingCreateManyArgs>(args?: SelectSubset<T, MemoryEmbeddingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemoryEmbeddings and returns the data saved in the database.
     * @param {MemoryEmbeddingCreateManyAndReturnArgs} args - Arguments to create many MemoryEmbeddings.
     * @example
     * // Create many MemoryEmbeddings
     * const memoryEmbedding = await prisma.memoryEmbedding.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemoryEmbeddings and only return the `id`
     * const memoryEmbeddingWithIdOnly = await prisma.memoryEmbedding.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemoryEmbeddingCreateManyAndReturnArgs>(args?: SelectSubset<T, MemoryEmbeddingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MemoryEmbedding.
     * @param {MemoryEmbeddingDeleteArgs} args - Arguments to delete one MemoryEmbedding.
     * @example
     * // Delete one MemoryEmbedding
     * const MemoryEmbedding = await prisma.memoryEmbedding.delete({
     *   where: {
     *     // ... filter to delete one MemoryEmbedding
     *   }
     * })
     * 
     */
    delete<T extends MemoryEmbeddingDeleteArgs>(args: SelectSubset<T, MemoryEmbeddingDeleteArgs<ExtArgs>>): Prisma__MemoryEmbeddingClient<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MemoryEmbedding.
     * @param {MemoryEmbeddingUpdateArgs} args - Arguments to update one MemoryEmbedding.
     * @example
     * // Update one MemoryEmbedding
     * const memoryEmbedding = await prisma.memoryEmbedding.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemoryEmbeddingUpdateArgs>(args: SelectSubset<T, MemoryEmbeddingUpdateArgs<ExtArgs>>): Prisma__MemoryEmbeddingClient<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MemoryEmbeddings.
     * @param {MemoryEmbeddingDeleteManyArgs} args - Arguments to filter MemoryEmbeddings to delete.
     * @example
     * // Delete a few MemoryEmbeddings
     * const { count } = await prisma.memoryEmbedding.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemoryEmbeddingDeleteManyArgs>(args?: SelectSubset<T, MemoryEmbeddingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemoryEmbeddings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEmbeddingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemoryEmbeddings
     * const memoryEmbedding = await prisma.memoryEmbedding.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemoryEmbeddingUpdateManyArgs>(args: SelectSubset<T, MemoryEmbeddingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MemoryEmbedding.
     * @param {MemoryEmbeddingUpsertArgs} args - Arguments to update or create a MemoryEmbedding.
     * @example
     * // Update or create a MemoryEmbedding
     * const memoryEmbedding = await prisma.memoryEmbedding.upsert({
     *   create: {
     *     // ... data to create a MemoryEmbedding
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemoryEmbedding we want to update
     *   }
     * })
     */
    upsert<T extends MemoryEmbeddingUpsertArgs>(args: SelectSubset<T, MemoryEmbeddingUpsertArgs<ExtArgs>>): Prisma__MemoryEmbeddingClient<$Result.GetResult<Prisma.$MemoryEmbeddingPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MemoryEmbeddings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEmbeddingCountArgs} args - Arguments to filter MemoryEmbeddings to count.
     * @example
     * // Count the number of MemoryEmbeddings
     * const count = await prisma.memoryEmbedding.count({
     *   where: {
     *     // ... the filter for the MemoryEmbeddings we want to count
     *   }
     * })
    **/
    count<T extends MemoryEmbeddingCountArgs>(
      args?: Subset<T, MemoryEmbeddingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemoryEmbeddingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemoryEmbedding.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEmbeddingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemoryEmbeddingAggregateArgs>(args: Subset<T, MemoryEmbeddingAggregateArgs>): Prisma.PrismaPromise<GetMemoryEmbeddingAggregateType<T>>

    /**
     * Group by MemoryEmbedding.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemoryEmbeddingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemoryEmbeddingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemoryEmbeddingGroupByArgs['orderBy'] }
        : { orderBy?: MemoryEmbeddingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemoryEmbeddingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemoryEmbeddingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemoryEmbedding model
   */
  readonly fields: MemoryEmbeddingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemoryEmbedding.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemoryEmbeddingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    memory<T extends MemoryEventDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemoryEventDefaultArgs<ExtArgs>>): Prisma__MemoryEventClient<$Result.GetResult<Prisma.$MemoryEventPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MemoryEmbedding model
   */ 
  interface MemoryEmbeddingFieldRefs {
    readonly id: FieldRef<"MemoryEmbedding", 'String'>
    readonly createdAt: FieldRef<"MemoryEmbedding", 'DateTime'>
    readonly provider: FieldRef<"MemoryEmbedding", 'String'>
    readonly dimensions: FieldRef<"MemoryEmbedding", 'Int'>
    readonly vector: FieldRef<"MemoryEmbedding", 'Json'>
    readonly memoryEventId: FieldRef<"MemoryEmbedding", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MemoryEmbedding findUnique
   */
  export type MemoryEmbeddingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
    /**
     * Filter, which MemoryEmbedding to fetch.
     */
    where: MemoryEmbeddingWhereUniqueInput
  }

  /**
   * MemoryEmbedding findUniqueOrThrow
   */
  export type MemoryEmbeddingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
    /**
     * Filter, which MemoryEmbedding to fetch.
     */
    where: MemoryEmbeddingWhereUniqueInput
  }

  /**
   * MemoryEmbedding findFirst
   */
  export type MemoryEmbeddingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
    /**
     * Filter, which MemoryEmbedding to fetch.
     */
    where?: MemoryEmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryEmbeddings to fetch.
     */
    orderBy?: MemoryEmbeddingOrderByWithRelationInput | MemoryEmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryEmbeddings.
     */
    cursor?: MemoryEmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryEmbeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryEmbeddings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryEmbeddings.
     */
    distinct?: MemoryEmbeddingScalarFieldEnum | MemoryEmbeddingScalarFieldEnum[]
  }

  /**
   * MemoryEmbedding findFirstOrThrow
   */
  export type MemoryEmbeddingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
    /**
     * Filter, which MemoryEmbedding to fetch.
     */
    where?: MemoryEmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryEmbeddings to fetch.
     */
    orderBy?: MemoryEmbeddingOrderByWithRelationInput | MemoryEmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemoryEmbeddings.
     */
    cursor?: MemoryEmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryEmbeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryEmbeddings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemoryEmbeddings.
     */
    distinct?: MemoryEmbeddingScalarFieldEnum | MemoryEmbeddingScalarFieldEnum[]
  }

  /**
   * MemoryEmbedding findMany
   */
  export type MemoryEmbeddingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
    /**
     * Filter, which MemoryEmbeddings to fetch.
     */
    where?: MemoryEmbeddingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemoryEmbeddings to fetch.
     */
    orderBy?: MemoryEmbeddingOrderByWithRelationInput | MemoryEmbeddingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemoryEmbeddings.
     */
    cursor?: MemoryEmbeddingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemoryEmbeddings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemoryEmbeddings.
     */
    skip?: number
    distinct?: MemoryEmbeddingScalarFieldEnum | MemoryEmbeddingScalarFieldEnum[]
  }

  /**
   * MemoryEmbedding create
   */
  export type MemoryEmbeddingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
    /**
     * The data needed to create a MemoryEmbedding.
     */
    data: XOR<MemoryEmbeddingCreateInput, MemoryEmbeddingUncheckedCreateInput>
  }

  /**
   * MemoryEmbedding createMany
   */
  export type MemoryEmbeddingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemoryEmbeddings.
     */
    data: MemoryEmbeddingCreateManyInput | MemoryEmbeddingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MemoryEmbedding createManyAndReturn
   */
  export type MemoryEmbeddingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MemoryEmbeddings.
     */
    data: MemoryEmbeddingCreateManyInput | MemoryEmbeddingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemoryEmbedding update
   */
  export type MemoryEmbeddingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
    /**
     * The data needed to update a MemoryEmbedding.
     */
    data: XOR<MemoryEmbeddingUpdateInput, MemoryEmbeddingUncheckedUpdateInput>
    /**
     * Choose, which MemoryEmbedding to update.
     */
    where: MemoryEmbeddingWhereUniqueInput
  }

  /**
   * MemoryEmbedding updateMany
   */
  export type MemoryEmbeddingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemoryEmbeddings.
     */
    data: XOR<MemoryEmbeddingUpdateManyMutationInput, MemoryEmbeddingUncheckedUpdateManyInput>
    /**
     * Filter which MemoryEmbeddings to update
     */
    where?: MemoryEmbeddingWhereInput
  }

  /**
   * MemoryEmbedding upsert
   */
  export type MemoryEmbeddingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
    /**
     * The filter to search for the MemoryEmbedding to update in case it exists.
     */
    where: MemoryEmbeddingWhereUniqueInput
    /**
     * In case the MemoryEmbedding found by the `where` argument doesn't exist, create a new MemoryEmbedding with this data.
     */
    create: XOR<MemoryEmbeddingCreateInput, MemoryEmbeddingUncheckedCreateInput>
    /**
     * In case the MemoryEmbedding was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemoryEmbeddingUpdateInput, MemoryEmbeddingUncheckedUpdateInput>
  }

  /**
   * MemoryEmbedding delete
   */
  export type MemoryEmbeddingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
    /**
     * Filter which MemoryEmbedding to delete.
     */
    where: MemoryEmbeddingWhereUniqueInput
  }

  /**
   * MemoryEmbedding deleteMany
   */
  export type MemoryEmbeddingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemoryEmbeddings to delete
     */
    where?: MemoryEmbeddingWhereInput
  }

  /**
   * MemoryEmbedding without action
   */
  export type MemoryEmbeddingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemoryEmbedding
     */
    select?: MemoryEmbeddingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemoryEmbeddingInclude<ExtArgs> | null
  }


  /**
   * Model PlayerProfile
   */

  export type AggregatePlayerProfile = {
    _count: PlayerProfileCountAggregateOutputType | null
    _min: PlayerProfileMinAggregateOutputType | null
    _max: PlayerProfileMaxAggregateOutputType | null
  }

  export type PlayerProfileMinAggregateOutputType = {
    id: string | null
    userId: string | null
    updatedAt: Date | null
  }

  export type PlayerProfileMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    updatedAt: Date | null
  }

  export type PlayerProfileCountAggregateOutputType = {
    id: number
    userId: number
    traits: number
    skills: number
    preferences: number
    updatedAt: number
    _all: number
  }


  export type PlayerProfileMinAggregateInputType = {
    id?: true
    userId?: true
    updatedAt?: true
  }

  export type PlayerProfileMaxAggregateInputType = {
    id?: true
    userId?: true
    updatedAt?: true
  }

  export type PlayerProfileCountAggregateInputType = {
    id?: true
    userId?: true
    traits?: true
    skills?: true
    preferences?: true
    updatedAt?: true
    _all?: true
  }

  export type PlayerProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlayerProfile to aggregate.
     */
    where?: PlayerProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlayerProfiles to fetch.
     */
    orderBy?: PlayerProfileOrderByWithRelationInput | PlayerProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlayerProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlayerProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlayerProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlayerProfiles
    **/
    _count?: true | PlayerProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlayerProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlayerProfileMaxAggregateInputType
  }

  export type GetPlayerProfileAggregateType<T extends PlayerProfileAggregateArgs> = {
        [P in keyof T & keyof AggregatePlayerProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlayerProfile[P]>
      : GetScalarType<T[P], AggregatePlayerProfile[P]>
  }




  export type PlayerProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlayerProfileWhereInput
    orderBy?: PlayerProfileOrderByWithAggregationInput | PlayerProfileOrderByWithAggregationInput[]
    by: PlayerProfileScalarFieldEnum[] | PlayerProfileScalarFieldEnum
    having?: PlayerProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlayerProfileCountAggregateInputType | true
    _min?: PlayerProfileMinAggregateInputType
    _max?: PlayerProfileMaxAggregateInputType
  }

  export type PlayerProfileGroupByOutputType = {
    id: string
    userId: string
    traits: JsonValue | null
    skills: JsonValue | null
    preferences: JsonValue | null
    updatedAt: Date
    _count: PlayerProfileCountAggregateOutputType | null
    _min: PlayerProfileMinAggregateOutputType | null
    _max: PlayerProfileMaxAggregateOutputType | null
  }

  type GetPlayerProfileGroupByPayload<T extends PlayerProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlayerProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlayerProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlayerProfileGroupByOutputType[P]>
            : GetScalarType<T[P], PlayerProfileGroupByOutputType[P]>
        }
      >
    >


  export type PlayerProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    traits?: boolean
    skills?: boolean
    preferences?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playerProfile"]>

  export type PlayerProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    traits?: boolean
    skills?: boolean
    preferences?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["playerProfile"]>

  export type PlayerProfileSelectScalar = {
    id?: boolean
    userId?: boolean
    traits?: boolean
    skills?: boolean
    preferences?: boolean
    updatedAt?: boolean
  }

  export type PlayerProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PlayerProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PlayerProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlayerProfile"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      traits: Prisma.JsonValue | null
      skills: Prisma.JsonValue | null
      preferences: Prisma.JsonValue | null
      updatedAt: Date
    }, ExtArgs["result"]["playerProfile"]>
    composites: {}
  }

  type PlayerProfileGetPayload<S extends boolean | null | undefined | PlayerProfileDefaultArgs> = $Result.GetResult<Prisma.$PlayerProfilePayload, S>

  type PlayerProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PlayerProfileFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PlayerProfileCountAggregateInputType | true
    }

  export interface PlayerProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlayerProfile'], meta: { name: 'PlayerProfile' } }
    /**
     * Find zero or one PlayerProfile that matches the filter.
     * @param {PlayerProfileFindUniqueArgs} args - Arguments to find a PlayerProfile
     * @example
     * // Get one PlayerProfile
     * const playerProfile = await prisma.playerProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlayerProfileFindUniqueArgs>(args: SelectSubset<T, PlayerProfileFindUniqueArgs<ExtArgs>>): Prisma__PlayerProfileClient<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PlayerProfile that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PlayerProfileFindUniqueOrThrowArgs} args - Arguments to find a PlayerProfile
     * @example
     * // Get one PlayerProfile
     * const playerProfile = await prisma.playerProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlayerProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, PlayerProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlayerProfileClient<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PlayerProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerProfileFindFirstArgs} args - Arguments to find a PlayerProfile
     * @example
     * // Get one PlayerProfile
     * const playerProfile = await prisma.playerProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlayerProfileFindFirstArgs>(args?: SelectSubset<T, PlayerProfileFindFirstArgs<ExtArgs>>): Prisma__PlayerProfileClient<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PlayerProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerProfileFindFirstOrThrowArgs} args - Arguments to find a PlayerProfile
     * @example
     * // Get one PlayerProfile
     * const playerProfile = await prisma.playerProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlayerProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, PlayerProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlayerProfileClient<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PlayerProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlayerProfiles
     * const playerProfiles = await prisma.playerProfile.findMany()
     * 
     * // Get first 10 PlayerProfiles
     * const playerProfiles = await prisma.playerProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const playerProfileWithIdOnly = await prisma.playerProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PlayerProfileFindManyArgs>(args?: SelectSubset<T, PlayerProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PlayerProfile.
     * @param {PlayerProfileCreateArgs} args - Arguments to create a PlayerProfile.
     * @example
     * // Create one PlayerProfile
     * const PlayerProfile = await prisma.playerProfile.create({
     *   data: {
     *     // ... data to create a PlayerProfile
     *   }
     * })
     * 
     */
    create<T extends PlayerProfileCreateArgs>(args: SelectSubset<T, PlayerProfileCreateArgs<ExtArgs>>): Prisma__PlayerProfileClient<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PlayerProfiles.
     * @param {PlayerProfileCreateManyArgs} args - Arguments to create many PlayerProfiles.
     * @example
     * // Create many PlayerProfiles
     * const playerProfile = await prisma.playerProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlayerProfileCreateManyArgs>(args?: SelectSubset<T, PlayerProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlayerProfiles and returns the data saved in the database.
     * @param {PlayerProfileCreateManyAndReturnArgs} args - Arguments to create many PlayerProfiles.
     * @example
     * // Create many PlayerProfiles
     * const playerProfile = await prisma.playerProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlayerProfiles and only return the `id`
     * const playerProfileWithIdOnly = await prisma.playerProfile.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlayerProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, PlayerProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PlayerProfile.
     * @param {PlayerProfileDeleteArgs} args - Arguments to delete one PlayerProfile.
     * @example
     * // Delete one PlayerProfile
     * const PlayerProfile = await prisma.playerProfile.delete({
     *   where: {
     *     // ... filter to delete one PlayerProfile
     *   }
     * })
     * 
     */
    delete<T extends PlayerProfileDeleteArgs>(args: SelectSubset<T, PlayerProfileDeleteArgs<ExtArgs>>): Prisma__PlayerProfileClient<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PlayerProfile.
     * @param {PlayerProfileUpdateArgs} args - Arguments to update one PlayerProfile.
     * @example
     * // Update one PlayerProfile
     * const playerProfile = await prisma.playerProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlayerProfileUpdateArgs>(args: SelectSubset<T, PlayerProfileUpdateArgs<ExtArgs>>): Prisma__PlayerProfileClient<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PlayerProfiles.
     * @param {PlayerProfileDeleteManyArgs} args - Arguments to filter PlayerProfiles to delete.
     * @example
     * // Delete a few PlayerProfiles
     * const { count } = await prisma.playerProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlayerProfileDeleteManyArgs>(args?: SelectSubset<T, PlayerProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlayerProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlayerProfiles
     * const playerProfile = await prisma.playerProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlayerProfileUpdateManyArgs>(args: SelectSubset<T, PlayerProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PlayerProfile.
     * @param {PlayerProfileUpsertArgs} args - Arguments to update or create a PlayerProfile.
     * @example
     * // Update or create a PlayerProfile
     * const playerProfile = await prisma.playerProfile.upsert({
     *   create: {
     *     // ... data to create a PlayerProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlayerProfile we want to update
     *   }
     * })
     */
    upsert<T extends PlayerProfileUpsertArgs>(args: SelectSubset<T, PlayerProfileUpsertArgs<ExtArgs>>): Prisma__PlayerProfileClient<$Result.GetResult<Prisma.$PlayerProfilePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PlayerProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerProfileCountArgs} args - Arguments to filter PlayerProfiles to count.
     * @example
     * // Count the number of PlayerProfiles
     * const count = await prisma.playerProfile.count({
     *   where: {
     *     // ... the filter for the PlayerProfiles we want to count
     *   }
     * })
    **/
    count<T extends PlayerProfileCountArgs>(
      args?: Subset<T, PlayerProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlayerProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlayerProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlayerProfileAggregateArgs>(args: Subset<T, PlayerProfileAggregateArgs>): Prisma.PrismaPromise<GetPlayerProfileAggregateType<T>>

    /**
     * Group by PlayerProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlayerProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlayerProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlayerProfileGroupByArgs['orderBy'] }
        : { orderBy?: PlayerProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlayerProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlayerProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlayerProfile model
   */
  readonly fields: PlayerProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlayerProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlayerProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PlayerProfile model
   */ 
  interface PlayerProfileFieldRefs {
    readonly id: FieldRef<"PlayerProfile", 'String'>
    readonly userId: FieldRef<"PlayerProfile", 'String'>
    readonly traits: FieldRef<"PlayerProfile", 'Json'>
    readonly skills: FieldRef<"PlayerProfile", 'Json'>
    readonly preferences: FieldRef<"PlayerProfile", 'Json'>
    readonly updatedAt: FieldRef<"PlayerProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PlayerProfile findUnique
   */
  export type PlayerProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
    /**
     * Filter, which PlayerProfile to fetch.
     */
    where: PlayerProfileWhereUniqueInput
  }

  /**
   * PlayerProfile findUniqueOrThrow
   */
  export type PlayerProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
    /**
     * Filter, which PlayerProfile to fetch.
     */
    where: PlayerProfileWhereUniqueInput
  }

  /**
   * PlayerProfile findFirst
   */
  export type PlayerProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
    /**
     * Filter, which PlayerProfile to fetch.
     */
    where?: PlayerProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlayerProfiles to fetch.
     */
    orderBy?: PlayerProfileOrderByWithRelationInput | PlayerProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlayerProfiles.
     */
    cursor?: PlayerProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlayerProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlayerProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlayerProfiles.
     */
    distinct?: PlayerProfileScalarFieldEnum | PlayerProfileScalarFieldEnum[]
  }

  /**
   * PlayerProfile findFirstOrThrow
   */
  export type PlayerProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
    /**
     * Filter, which PlayerProfile to fetch.
     */
    where?: PlayerProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlayerProfiles to fetch.
     */
    orderBy?: PlayerProfileOrderByWithRelationInput | PlayerProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlayerProfiles.
     */
    cursor?: PlayerProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlayerProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlayerProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlayerProfiles.
     */
    distinct?: PlayerProfileScalarFieldEnum | PlayerProfileScalarFieldEnum[]
  }

  /**
   * PlayerProfile findMany
   */
  export type PlayerProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
    /**
     * Filter, which PlayerProfiles to fetch.
     */
    where?: PlayerProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlayerProfiles to fetch.
     */
    orderBy?: PlayerProfileOrderByWithRelationInput | PlayerProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlayerProfiles.
     */
    cursor?: PlayerProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlayerProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlayerProfiles.
     */
    skip?: number
    distinct?: PlayerProfileScalarFieldEnum | PlayerProfileScalarFieldEnum[]
  }

  /**
   * PlayerProfile create
   */
  export type PlayerProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a PlayerProfile.
     */
    data: XOR<PlayerProfileCreateInput, PlayerProfileUncheckedCreateInput>
  }

  /**
   * PlayerProfile createMany
   */
  export type PlayerProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlayerProfiles.
     */
    data: PlayerProfileCreateManyInput | PlayerProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PlayerProfile createManyAndReturn
   */
  export type PlayerProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PlayerProfiles.
     */
    data: PlayerProfileCreateManyInput | PlayerProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlayerProfile update
   */
  export type PlayerProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a PlayerProfile.
     */
    data: XOR<PlayerProfileUpdateInput, PlayerProfileUncheckedUpdateInput>
    /**
     * Choose, which PlayerProfile to update.
     */
    where: PlayerProfileWhereUniqueInput
  }

  /**
   * PlayerProfile updateMany
   */
  export type PlayerProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlayerProfiles.
     */
    data: XOR<PlayerProfileUpdateManyMutationInput, PlayerProfileUncheckedUpdateManyInput>
    /**
     * Filter which PlayerProfiles to update
     */
    where?: PlayerProfileWhereInput
  }

  /**
   * PlayerProfile upsert
   */
  export type PlayerProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the PlayerProfile to update in case it exists.
     */
    where: PlayerProfileWhereUniqueInput
    /**
     * In case the PlayerProfile found by the `where` argument doesn't exist, create a new PlayerProfile with this data.
     */
    create: XOR<PlayerProfileCreateInput, PlayerProfileUncheckedCreateInput>
    /**
     * In case the PlayerProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlayerProfileUpdateInput, PlayerProfileUncheckedUpdateInput>
  }

  /**
   * PlayerProfile delete
   */
  export type PlayerProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
    /**
     * Filter which PlayerProfile to delete.
     */
    where: PlayerProfileWhereUniqueInput
  }

  /**
   * PlayerProfile deleteMany
   */
  export type PlayerProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlayerProfiles to delete
     */
    where?: PlayerProfileWhereInput
  }

  /**
   * PlayerProfile without action
   */
  export type PlayerProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerProfile
     */
    select?: PlayerProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlayerProfileInclude<ExtArgs> | null
  }


  /**
   * Model MissionDefinition
   */

  export type AggregateMissionDefinition = {
    _count: MissionDefinitionCountAggregateOutputType | null
    _avg: MissionDefinitionAvgAggregateOutputType | null
    _sum: MissionDefinitionSumAggregateOutputType | null
    _min: MissionDefinitionMinAggregateOutputType | null
    _max: MissionDefinitionMaxAggregateOutputType | null
  }

  export type MissionDefinitionAvgAggregateOutputType = {
    minEvidence: number | null
  }

  export type MissionDefinitionSumAggregateOutputType = {
    minEvidence: number | null
  }

  export type MissionDefinitionMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    title: string | null
    prompt: string | null
    type: string | null
    minEvidence: number | null
    active: boolean | null
  }

  export type MissionDefinitionMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    title: string | null
    prompt: string | null
    type: string | null
    minEvidence: number | null
    active: boolean | null
  }

  export type MissionDefinitionCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    title: number
    prompt: number
    type: number
    minEvidence: number
    tags: number
    active: number
    _all: number
  }


  export type MissionDefinitionAvgAggregateInputType = {
    minEvidence?: true
  }

  export type MissionDefinitionSumAggregateInputType = {
    minEvidence?: true
  }

  export type MissionDefinitionMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    prompt?: true
    type?: true
    minEvidence?: true
    active?: true
  }

  export type MissionDefinitionMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    prompt?: true
    type?: true
    minEvidence?: true
    active?: true
  }

  export type MissionDefinitionCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    title?: true
    prompt?: true
    type?: true
    minEvidence?: true
    tags?: true
    active?: true
    _all?: true
  }

  export type MissionDefinitionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MissionDefinition to aggregate.
     */
    where?: MissionDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MissionDefinitions to fetch.
     */
    orderBy?: MissionDefinitionOrderByWithRelationInput | MissionDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MissionDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MissionDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MissionDefinitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MissionDefinitions
    **/
    _count?: true | MissionDefinitionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MissionDefinitionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MissionDefinitionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MissionDefinitionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MissionDefinitionMaxAggregateInputType
  }

  export type GetMissionDefinitionAggregateType<T extends MissionDefinitionAggregateArgs> = {
        [P in keyof T & keyof AggregateMissionDefinition]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMissionDefinition[P]>
      : GetScalarType<T[P], AggregateMissionDefinition[P]>
  }




  export type MissionDefinitionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MissionDefinitionWhereInput
    orderBy?: MissionDefinitionOrderByWithAggregationInput | MissionDefinitionOrderByWithAggregationInput[]
    by: MissionDefinitionScalarFieldEnum[] | MissionDefinitionScalarFieldEnum
    having?: MissionDefinitionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MissionDefinitionCountAggregateInputType | true
    _avg?: MissionDefinitionAvgAggregateInputType
    _sum?: MissionDefinitionSumAggregateInputType
    _min?: MissionDefinitionMinAggregateInputType
    _max?: MissionDefinitionMaxAggregateInputType
  }

  export type MissionDefinitionGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    title: string
    prompt: string
    type: string
    minEvidence: number
    tags: string[]
    active: boolean
    _count: MissionDefinitionCountAggregateOutputType | null
    _avg: MissionDefinitionAvgAggregateOutputType | null
    _sum: MissionDefinitionSumAggregateOutputType | null
    _min: MissionDefinitionMinAggregateOutputType | null
    _max: MissionDefinitionMaxAggregateOutputType | null
  }

  type GetMissionDefinitionGroupByPayload<T extends MissionDefinitionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MissionDefinitionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MissionDefinitionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MissionDefinitionGroupByOutputType[P]>
            : GetScalarType<T[P], MissionDefinitionGroupByOutputType[P]>
        }
      >
    >


  export type MissionDefinitionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    prompt?: boolean
    type?: boolean
    minEvidence?: boolean
    tags?: boolean
    active?: boolean
    missionRuns?: boolean | MissionDefinition$missionRunsArgs<ExtArgs>
    _count?: boolean | MissionDefinitionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["missionDefinition"]>

  export type MissionDefinitionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    prompt?: boolean
    type?: boolean
    minEvidence?: boolean
    tags?: boolean
    active?: boolean
  }, ExtArgs["result"]["missionDefinition"]>

  export type MissionDefinitionSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    title?: boolean
    prompt?: boolean
    type?: boolean
    minEvidence?: boolean
    tags?: boolean
    active?: boolean
  }

  export type MissionDefinitionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    missionRuns?: boolean | MissionDefinition$missionRunsArgs<ExtArgs>
    _count?: boolean | MissionDefinitionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MissionDefinitionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MissionDefinitionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MissionDefinition"
    objects: {
      missionRuns: Prisma.$MissionRunPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      title: string
      prompt: string
      type: string
      minEvidence: number
      tags: string[]
      active: boolean
    }, ExtArgs["result"]["missionDefinition"]>
    composites: {}
  }

  type MissionDefinitionGetPayload<S extends boolean | null | undefined | MissionDefinitionDefaultArgs> = $Result.GetResult<Prisma.$MissionDefinitionPayload, S>

  type MissionDefinitionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MissionDefinitionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MissionDefinitionCountAggregateInputType | true
    }

  export interface MissionDefinitionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MissionDefinition'], meta: { name: 'MissionDefinition' } }
    /**
     * Find zero or one MissionDefinition that matches the filter.
     * @param {MissionDefinitionFindUniqueArgs} args - Arguments to find a MissionDefinition
     * @example
     * // Get one MissionDefinition
     * const missionDefinition = await prisma.missionDefinition.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MissionDefinitionFindUniqueArgs>(args: SelectSubset<T, MissionDefinitionFindUniqueArgs<ExtArgs>>): Prisma__MissionDefinitionClient<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MissionDefinition that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MissionDefinitionFindUniqueOrThrowArgs} args - Arguments to find a MissionDefinition
     * @example
     * // Get one MissionDefinition
     * const missionDefinition = await prisma.missionDefinition.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MissionDefinitionFindUniqueOrThrowArgs>(args: SelectSubset<T, MissionDefinitionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MissionDefinitionClient<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MissionDefinition that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionDefinitionFindFirstArgs} args - Arguments to find a MissionDefinition
     * @example
     * // Get one MissionDefinition
     * const missionDefinition = await prisma.missionDefinition.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MissionDefinitionFindFirstArgs>(args?: SelectSubset<T, MissionDefinitionFindFirstArgs<ExtArgs>>): Prisma__MissionDefinitionClient<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MissionDefinition that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionDefinitionFindFirstOrThrowArgs} args - Arguments to find a MissionDefinition
     * @example
     * // Get one MissionDefinition
     * const missionDefinition = await prisma.missionDefinition.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MissionDefinitionFindFirstOrThrowArgs>(args?: SelectSubset<T, MissionDefinitionFindFirstOrThrowArgs<ExtArgs>>): Prisma__MissionDefinitionClient<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MissionDefinitions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionDefinitionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MissionDefinitions
     * const missionDefinitions = await prisma.missionDefinition.findMany()
     * 
     * // Get first 10 MissionDefinitions
     * const missionDefinitions = await prisma.missionDefinition.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const missionDefinitionWithIdOnly = await prisma.missionDefinition.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MissionDefinitionFindManyArgs>(args?: SelectSubset<T, MissionDefinitionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MissionDefinition.
     * @param {MissionDefinitionCreateArgs} args - Arguments to create a MissionDefinition.
     * @example
     * // Create one MissionDefinition
     * const MissionDefinition = await prisma.missionDefinition.create({
     *   data: {
     *     // ... data to create a MissionDefinition
     *   }
     * })
     * 
     */
    create<T extends MissionDefinitionCreateArgs>(args: SelectSubset<T, MissionDefinitionCreateArgs<ExtArgs>>): Prisma__MissionDefinitionClient<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MissionDefinitions.
     * @param {MissionDefinitionCreateManyArgs} args - Arguments to create many MissionDefinitions.
     * @example
     * // Create many MissionDefinitions
     * const missionDefinition = await prisma.missionDefinition.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MissionDefinitionCreateManyArgs>(args?: SelectSubset<T, MissionDefinitionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MissionDefinitions and returns the data saved in the database.
     * @param {MissionDefinitionCreateManyAndReturnArgs} args - Arguments to create many MissionDefinitions.
     * @example
     * // Create many MissionDefinitions
     * const missionDefinition = await prisma.missionDefinition.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MissionDefinitions and only return the `id`
     * const missionDefinitionWithIdOnly = await prisma.missionDefinition.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MissionDefinitionCreateManyAndReturnArgs>(args?: SelectSubset<T, MissionDefinitionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MissionDefinition.
     * @param {MissionDefinitionDeleteArgs} args - Arguments to delete one MissionDefinition.
     * @example
     * // Delete one MissionDefinition
     * const MissionDefinition = await prisma.missionDefinition.delete({
     *   where: {
     *     // ... filter to delete one MissionDefinition
     *   }
     * })
     * 
     */
    delete<T extends MissionDefinitionDeleteArgs>(args: SelectSubset<T, MissionDefinitionDeleteArgs<ExtArgs>>): Prisma__MissionDefinitionClient<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MissionDefinition.
     * @param {MissionDefinitionUpdateArgs} args - Arguments to update one MissionDefinition.
     * @example
     * // Update one MissionDefinition
     * const missionDefinition = await prisma.missionDefinition.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MissionDefinitionUpdateArgs>(args: SelectSubset<T, MissionDefinitionUpdateArgs<ExtArgs>>): Prisma__MissionDefinitionClient<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MissionDefinitions.
     * @param {MissionDefinitionDeleteManyArgs} args - Arguments to filter MissionDefinitions to delete.
     * @example
     * // Delete a few MissionDefinitions
     * const { count } = await prisma.missionDefinition.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MissionDefinitionDeleteManyArgs>(args?: SelectSubset<T, MissionDefinitionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MissionDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionDefinitionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MissionDefinitions
     * const missionDefinition = await prisma.missionDefinition.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MissionDefinitionUpdateManyArgs>(args: SelectSubset<T, MissionDefinitionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MissionDefinition.
     * @param {MissionDefinitionUpsertArgs} args - Arguments to update or create a MissionDefinition.
     * @example
     * // Update or create a MissionDefinition
     * const missionDefinition = await prisma.missionDefinition.upsert({
     *   create: {
     *     // ... data to create a MissionDefinition
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MissionDefinition we want to update
     *   }
     * })
     */
    upsert<T extends MissionDefinitionUpsertArgs>(args: SelectSubset<T, MissionDefinitionUpsertArgs<ExtArgs>>): Prisma__MissionDefinitionClient<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MissionDefinitions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionDefinitionCountArgs} args - Arguments to filter MissionDefinitions to count.
     * @example
     * // Count the number of MissionDefinitions
     * const count = await prisma.missionDefinition.count({
     *   where: {
     *     // ... the filter for the MissionDefinitions we want to count
     *   }
     * })
    **/
    count<T extends MissionDefinitionCountArgs>(
      args?: Subset<T, MissionDefinitionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MissionDefinitionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MissionDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionDefinitionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MissionDefinitionAggregateArgs>(args: Subset<T, MissionDefinitionAggregateArgs>): Prisma.PrismaPromise<GetMissionDefinitionAggregateType<T>>

    /**
     * Group by MissionDefinition.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionDefinitionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MissionDefinitionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MissionDefinitionGroupByArgs['orderBy'] }
        : { orderBy?: MissionDefinitionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MissionDefinitionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMissionDefinitionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MissionDefinition model
   */
  readonly fields: MissionDefinitionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MissionDefinition.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MissionDefinitionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    missionRuns<T extends MissionDefinition$missionRunsArgs<ExtArgs> = {}>(args?: Subset<T, MissionDefinition$missionRunsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MissionDefinition model
   */ 
  interface MissionDefinitionFieldRefs {
    readonly id: FieldRef<"MissionDefinition", 'String'>
    readonly createdAt: FieldRef<"MissionDefinition", 'DateTime'>
    readonly updatedAt: FieldRef<"MissionDefinition", 'DateTime'>
    readonly title: FieldRef<"MissionDefinition", 'String'>
    readonly prompt: FieldRef<"MissionDefinition", 'String'>
    readonly type: FieldRef<"MissionDefinition", 'String'>
    readonly minEvidence: FieldRef<"MissionDefinition", 'Int'>
    readonly tags: FieldRef<"MissionDefinition", 'String[]'>
    readonly active: FieldRef<"MissionDefinition", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * MissionDefinition findUnique
   */
  export type MissionDefinitionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionDefinitionInclude<ExtArgs> | null
    /**
     * Filter, which MissionDefinition to fetch.
     */
    where: MissionDefinitionWhereUniqueInput
  }

  /**
   * MissionDefinition findUniqueOrThrow
   */
  export type MissionDefinitionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionDefinitionInclude<ExtArgs> | null
    /**
     * Filter, which MissionDefinition to fetch.
     */
    where: MissionDefinitionWhereUniqueInput
  }

  /**
   * MissionDefinition findFirst
   */
  export type MissionDefinitionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionDefinitionInclude<ExtArgs> | null
    /**
     * Filter, which MissionDefinition to fetch.
     */
    where?: MissionDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MissionDefinitions to fetch.
     */
    orderBy?: MissionDefinitionOrderByWithRelationInput | MissionDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MissionDefinitions.
     */
    cursor?: MissionDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MissionDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MissionDefinitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MissionDefinitions.
     */
    distinct?: MissionDefinitionScalarFieldEnum | MissionDefinitionScalarFieldEnum[]
  }

  /**
   * MissionDefinition findFirstOrThrow
   */
  export type MissionDefinitionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionDefinitionInclude<ExtArgs> | null
    /**
     * Filter, which MissionDefinition to fetch.
     */
    where?: MissionDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MissionDefinitions to fetch.
     */
    orderBy?: MissionDefinitionOrderByWithRelationInput | MissionDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MissionDefinitions.
     */
    cursor?: MissionDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MissionDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MissionDefinitions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MissionDefinitions.
     */
    distinct?: MissionDefinitionScalarFieldEnum | MissionDefinitionScalarFieldEnum[]
  }

  /**
   * MissionDefinition findMany
   */
  export type MissionDefinitionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionDefinitionInclude<ExtArgs> | null
    /**
     * Filter, which MissionDefinitions to fetch.
     */
    where?: MissionDefinitionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MissionDefinitions to fetch.
     */
    orderBy?: MissionDefinitionOrderByWithRelationInput | MissionDefinitionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MissionDefinitions.
     */
    cursor?: MissionDefinitionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MissionDefinitions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MissionDefinitions.
     */
    skip?: number
    distinct?: MissionDefinitionScalarFieldEnum | MissionDefinitionScalarFieldEnum[]
  }

  /**
   * MissionDefinition create
   */
  export type MissionDefinitionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionDefinitionInclude<ExtArgs> | null
    /**
     * The data needed to create a MissionDefinition.
     */
    data: XOR<MissionDefinitionCreateInput, MissionDefinitionUncheckedCreateInput>
  }

  /**
   * MissionDefinition createMany
   */
  export type MissionDefinitionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MissionDefinitions.
     */
    data: MissionDefinitionCreateManyInput | MissionDefinitionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MissionDefinition createManyAndReturn
   */
  export type MissionDefinitionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MissionDefinitions.
     */
    data: MissionDefinitionCreateManyInput | MissionDefinitionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MissionDefinition update
   */
  export type MissionDefinitionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionDefinitionInclude<ExtArgs> | null
    /**
     * The data needed to update a MissionDefinition.
     */
    data: XOR<MissionDefinitionUpdateInput, MissionDefinitionUncheckedUpdateInput>
    /**
     * Choose, which MissionDefinition to update.
     */
    where: MissionDefinitionWhereUniqueInput
  }

  /**
   * MissionDefinition updateMany
   */
  export type MissionDefinitionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MissionDefinitions.
     */
    data: XOR<MissionDefinitionUpdateManyMutationInput, MissionDefinitionUncheckedUpdateManyInput>
    /**
     * Filter which MissionDefinitions to update
     */
    where?: MissionDefinitionWhereInput
  }

  /**
   * MissionDefinition upsert
   */
  export type MissionDefinitionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionDefinitionInclude<ExtArgs> | null
    /**
     * The filter to search for the MissionDefinition to update in case it exists.
     */
    where: MissionDefinitionWhereUniqueInput
    /**
     * In case the MissionDefinition found by the `where` argument doesn't exist, create a new MissionDefinition with this data.
     */
    create: XOR<MissionDefinitionCreateInput, MissionDefinitionUncheckedCreateInput>
    /**
     * In case the MissionDefinition was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MissionDefinitionUpdateInput, MissionDefinitionUncheckedUpdateInput>
  }

  /**
   * MissionDefinition delete
   */
  export type MissionDefinitionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionDefinitionInclude<ExtArgs> | null
    /**
     * Filter which MissionDefinition to delete.
     */
    where: MissionDefinitionWhereUniqueInput
  }

  /**
   * MissionDefinition deleteMany
   */
  export type MissionDefinitionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MissionDefinitions to delete
     */
    where?: MissionDefinitionWhereInput
  }

  /**
   * MissionDefinition.missionRuns
   */
  export type MissionDefinition$missionRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    where?: MissionRunWhereInput
    orderBy?: MissionRunOrderByWithRelationInput | MissionRunOrderByWithRelationInput[]
    cursor?: MissionRunWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MissionRunScalarFieldEnum | MissionRunScalarFieldEnum[]
  }

  /**
   * MissionDefinition without action
   */
  export type MissionDefinitionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionDefinition
     */
    select?: MissionDefinitionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionDefinitionInclude<ExtArgs> | null
  }


  /**
   * Model MissionRun
   */

  export type AggregateMissionRun = {
    _count: MissionRunCountAggregateOutputType | null
    _avg: MissionRunAvgAggregateOutputType | null
    _sum: MissionRunSumAggregateOutputType | null
    _min: MissionRunMinAggregateOutputType | null
    _max: MissionRunMaxAggregateOutputType | null
  }

  export type MissionRunAvgAggregateOutputType = {
    score: number | null
  }

  export type MissionRunSumAggregateOutputType = {
    score: number | null
  }

  export type MissionRunMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    status: $Enums.MissionRunStatus | null
    score: number | null
    feedback: string | null
    missionId: string | null
    userId: string | null
    sessionId: string | null
  }

  export type MissionRunMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    status: $Enums.MissionRunStatus | null
    score: number | null
    feedback: string | null
    missionId: string | null
    userId: string | null
    sessionId: string | null
  }

  export type MissionRunCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    status: number
    score: number
    feedback: number
    payload: number
    missionId: number
    userId: number
    sessionId: number
    _all: number
  }


  export type MissionRunAvgAggregateInputType = {
    score?: true
  }

  export type MissionRunSumAggregateInputType = {
    score?: true
  }

  export type MissionRunMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    status?: true
    score?: true
    feedback?: true
    missionId?: true
    userId?: true
    sessionId?: true
  }

  export type MissionRunMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    status?: true
    score?: true
    feedback?: true
    missionId?: true
    userId?: true
    sessionId?: true
  }

  export type MissionRunCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    status?: true
    score?: true
    feedback?: true
    payload?: true
    missionId?: true
    userId?: true
    sessionId?: true
    _all?: true
  }

  export type MissionRunAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MissionRun to aggregate.
     */
    where?: MissionRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MissionRuns to fetch.
     */
    orderBy?: MissionRunOrderByWithRelationInput | MissionRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MissionRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MissionRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MissionRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MissionRuns
    **/
    _count?: true | MissionRunCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MissionRunAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MissionRunSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MissionRunMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MissionRunMaxAggregateInputType
  }

  export type GetMissionRunAggregateType<T extends MissionRunAggregateArgs> = {
        [P in keyof T & keyof AggregateMissionRun]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMissionRun[P]>
      : GetScalarType<T[P], AggregateMissionRun[P]>
  }




  export type MissionRunGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MissionRunWhereInput
    orderBy?: MissionRunOrderByWithAggregationInput | MissionRunOrderByWithAggregationInput[]
    by: MissionRunScalarFieldEnum[] | MissionRunScalarFieldEnum
    having?: MissionRunScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MissionRunCountAggregateInputType | true
    _avg?: MissionRunAvgAggregateInputType
    _sum?: MissionRunSumAggregateInputType
    _min?: MissionRunMinAggregateInputType
    _max?: MissionRunMaxAggregateInputType
  }

  export type MissionRunGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    status: $Enums.MissionRunStatus
    score: number | null
    feedback: string | null
    payload: JsonValue | null
    missionId: string
    userId: string
    sessionId: string | null
    _count: MissionRunCountAggregateOutputType | null
    _avg: MissionRunAvgAggregateOutputType | null
    _sum: MissionRunSumAggregateOutputType | null
    _min: MissionRunMinAggregateOutputType | null
    _max: MissionRunMaxAggregateOutputType | null
  }

  type GetMissionRunGroupByPayload<T extends MissionRunGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MissionRunGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MissionRunGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MissionRunGroupByOutputType[P]>
            : GetScalarType<T[P], MissionRunGroupByOutputType[P]>
        }
      >
    >


  export type MissionRunSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    status?: boolean
    score?: boolean
    feedback?: boolean
    payload?: boolean
    missionId?: boolean
    userId?: boolean
    sessionId?: boolean
    mission?: boolean | MissionDefinitionDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    session?: boolean | MissionRun$sessionArgs<ExtArgs>
    rewards?: boolean | MissionRun$rewardsArgs<ExtArgs>
    _count?: boolean | MissionRunCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["missionRun"]>

  export type MissionRunSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    status?: boolean
    score?: boolean
    feedback?: boolean
    payload?: boolean
    missionId?: boolean
    userId?: boolean
    sessionId?: boolean
    mission?: boolean | MissionDefinitionDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    session?: boolean | MissionRun$sessionArgs<ExtArgs>
  }, ExtArgs["result"]["missionRun"]>

  export type MissionRunSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    status?: boolean
    score?: boolean
    feedback?: boolean
    payload?: boolean
    missionId?: boolean
    userId?: boolean
    sessionId?: boolean
  }

  export type MissionRunInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    mission?: boolean | MissionDefinitionDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    session?: boolean | MissionRun$sessionArgs<ExtArgs>
    rewards?: boolean | MissionRun$rewardsArgs<ExtArgs>
    _count?: boolean | MissionRunCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MissionRunIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    mission?: boolean | MissionDefinitionDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    session?: boolean | MissionRun$sessionArgs<ExtArgs>
  }

  export type $MissionRunPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MissionRun"
    objects: {
      mission: Prisma.$MissionDefinitionPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
      session: Prisma.$GameSessionPayload<ExtArgs> | null
      rewards: Prisma.$RewardPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      status: $Enums.MissionRunStatus
      score: number | null
      feedback: string | null
      payload: Prisma.JsonValue | null
      missionId: string
      userId: string
      sessionId: string | null
    }, ExtArgs["result"]["missionRun"]>
    composites: {}
  }

  type MissionRunGetPayload<S extends boolean | null | undefined | MissionRunDefaultArgs> = $Result.GetResult<Prisma.$MissionRunPayload, S>

  type MissionRunCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MissionRunFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MissionRunCountAggregateInputType | true
    }

  export interface MissionRunDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MissionRun'], meta: { name: 'MissionRun' } }
    /**
     * Find zero or one MissionRun that matches the filter.
     * @param {MissionRunFindUniqueArgs} args - Arguments to find a MissionRun
     * @example
     * // Get one MissionRun
     * const missionRun = await prisma.missionRun.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MissionRunFindUniqueArgs>(args: SelectSubset<T, MissionRunFindUniqueArgs<ExtArgs>>): Prisma__MissionRunClient<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MissionRun that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MissionRunFindUniqueOrThrowArgs} args - Arguments to find a MissionRun
     * @example
     * // Get one MissionRun
     * const missionRun = await prisma.missionRun.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MissionRunFindUniqueOrThrowArgs>(args: SelectSubset<T, MissionRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MissionRunClient<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MissionRun that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionRunFindFirstArgs} args - Arguments to find a MissionRun
     * @example
     * // Get one MissionRun
     * const missionRun = await prisma.missionRun.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MissionRunFindFirstArgs>(args?: SelectSubset<T, MissionRunFindFirstArgs<ExtArgs>>): Prisma__MissionRunClient<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MissionRun that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionRunFindFirstOrThrowArgs} args - Arguments to find a MissionRun
     * @example
     * // Get one MissionRun
     * const missionRun = await prisma.missionRun.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MissionRunFindFirstOrThrowArgs>(args?: SelectSubset<T, MissionRunFindFirstOrThrowArgs<ExtArgs>>): Prisma__MissionRunClient<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MissionRuns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionRunFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MissionRuns
     * const missionRuns = await prisma.missionRun.findMany()
     * 
     * // Get first 10 MissionRuns
     * const missionRuns = await prisma.missionRun.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const missionRunWithIdOnly = await prisma.missionRun.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MissionRunFindManyArgs>(args?: SelectSubset<T, MissionRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MissionRun.
     * @param {MissionRunCreateArgs} args - Arguments to create a MissionRun.
     * @example
     * // Create one MissionRun
     * const MissionRun = await prisma.missionRun.create({
     *   data: {
     *     // ... data to create a MissionRun
     *   }
     * })
     * 
     */
    create<T extends MissionRunCreateArgs>(args: SelectSubset<T, MissionRunCreateArgs<ExtArgs>>): Prisma__MissionRunClient<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MissionRuns.
     * @param {MissionRunCreateManyArgs} args - Arguments to create many MissionRuns.
     * @example
     * // Create many MissionRuns
     * const missionRun = await prisma.missionRun.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MissionRunCreateManyArgs>(args?: SelectSubset<T, MissionRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MissionRuns and returns the data saved in the database.
     * @param {MissionRunCreateManyAndReturnArgs} args - Arguments to create many MissionRuns.
     * @example
     * // Create many MissionRuns
     * const missionRun = await prisma.missionRun.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MissionRuns and only return the `id`
     * const missionRunWithIdOnly = await prisma.missionRun.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MissionRunCreateManyAndReturnArgs>(args?: SelectSubset<T, MissionRunCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MissionRun.
     * @param {MissionRunDeleteArgs} args - Arguments to delete one MissionRun.
     * @example
     * // Delete one MissionRun
     * const MissionRun = await prisma.missionRun.delete({
     *   where: {
     *     // ... filter to delete one MissionRun
     *   }
     * })
     * 
     */
    delete<T extends MissionRunDeleteArgs>(args: SelectSubset<T, MissionRunDeleteArgs<ExtArgs>>): Prisma__MissionRunClient<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MissionRun.
     * @param {MissionRunUpdateArgs} args - Arguments to update one MissionRun.
     * @example
     * // Update one MissionRun
     * const missionRun = await prisma.missionRun.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MissionRunUpdateArgs>(args: SelectSubset<T, MissionRunUpdateArgs<ExtArgs>>): Prisma__MissionRunClient<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MissionRuns.
     * @param {MissionRunDeleteManyArgs} args - Arguments to filter MissionRuns to delete.
     * @example
     * // Delete a few MissionRuns
     * const { count } = await prisma.missionRun.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MissionRunDeleteManyArgs>(args?: SelectSubset<T, MissionRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MissionRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionRunUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MissionRuns
     * const missionRun = await prisma.missionRun.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MissionRunUpdateManyArgs>(args: SelectSubset<T, MissionRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MissionRun.
     * @param {MissionRunUpsertArgs} args - Arguments to update or create a MissionRun.
     * @example
     * // Update or create a MissionRun
     * const missionRun = await prisma.missionRun.upsert({
     *   create: {
     *     // ... data to create a MissionRun
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MissionRun we want to update
     *   }
     * })
     */
    upsert<T extends MissionRunUpsertArgs>(args: SelectSubset<T, MissionRunUpsertArgs<ExtArgs>>): Prisma__MissionRunClient<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MissionRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionRunCountArgs} args - Arguments to filter MissionRuns to count.
     * @example
     * // Count the number of MissionRuns
     * const count = await prisma.missionRun.count({
     *   where: {
     *     // ... the filter for the MissionRuns we want to count
     *   }
     * })
    **/
    count<T extends MissionRunCountArgs>(
      args?: Subset<T, MissionRunCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MissionRunCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MissionRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionRunAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MissionRunAggregateArgs>(args: Subset<T, MissionRunAggregateArgs>): Prisma.PrismaPromise<GetMissionRunAggregateType<T>>

    /**
     * Group by MissionRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissionRunGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MissionRunGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MissionRunGroupByArgs['orderBy'] }
        : { orderBy?: MissionRunGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MissionRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMissionRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MissionRun model
   */
  readonly fields: MissionRunFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MissionRun.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MissionRunClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    mission<T extends MissionDefinitionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MissionDefinitionDefaultArgs<ExtArgs>>): Prisma__MissionDefinitionClient<$Result.GetResult<Prisma.$MissionDefinitionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    session<T extends MissionRun$sessionArgs<ExtArgs> = {}>(args?: Subset<T, MissionRun$sessionArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    rewards<T extends MissionRun$rewardsArgs<ExtArgs> = {}>(args?: Subset<T, MissionRun$rewardsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MissionRun model
   */ 
  interface MissionRunFieldRefs {
    readonly id: FieldRef<"MissionRun", 'String'>
    readonly createdAt: FieldRef<"MissionRun", 'DateTime'>
    readonly updatedAt: FieldRef<"MissionRun", 'DateTime'>
    readonly status: FieldRef<"MissionRun", 'MissionRunStatus'>
    readonly score: FieldRef<"MissionRun", 'Float'>
    readonly feedback: FieldRef<"MissionRun", 'String'>
    readonly payload: FieldRef<"MissionRun", 'Json'>
    readonly missionId: FieldRef<"MissionRun", 'String'>
    readonly userId: FieldRef<"MissionRun", 'String'>
    readonly sessionId: FieldRef<"MissionRun", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MissionRun findUnique
   */
  export type MissionRunFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    /**
     * Filter, which MissionRun to fetch.
     */
    where: MissionRunWhereUniqueInput
  }

  /**
   * MissionRun findUniqueOrThrow
   */
  export type MissionRunFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    /**
     * Filter, which MissionRun to fetch.
     */
    where: MissionRunWhereUniqueInput
  }

  /**
   * MissionRun findFirst
   */
  export type MissionRunFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    /**
     * Filter, which MissionRun to fetch.
     */
    where?: MissionRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MissionRuns to fetch.
     */
    orderBy?: MissionRunOrderByWithRelationInput | MissionRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MissionRuns.
     */
    cursor?: MissionRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MissionRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MissionRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MissionRuns.
     */
    distinct?: MissionRunScalarFieldEnum | MissionRunScalarFieldEnum[]
  }

  /**
   * MissionRun findFirstOrThrow
   */
  export type MissionRunFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    /**
     * Filter, which MissionRun to fetch.
     */
    where?: MissionRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MissionRuns to fetch.
     */
    orderBy?: MissionRunOrderByWithRelationInput | MissionRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MissionRuns.
     */
    cursor?: MissionRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MissionRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MissionRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MissionRuns.
     */
    distinct?: MissionRunScalarFieldEnum | MissionRunScalarFieldEnum[]
  }

  /**
   * MissionRun findMany
   */
  export type MissionRunFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    /**
     * Filter, which MissionRuns to fetch.
     */
    where?: MissionRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MissionRuns to fetch.
     */
    orderBy?: MissionRunOrderByWithRelationInput | MissionRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MissionRuns.
     */
    cursor?: MissionRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MissionRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MissionRuns.
     */
    skip?: number
    distinct?: MissionRunScalarFieldEnum | MissionRunScalarFieldEnum[]
  }

  /**
   * MissionRun create
   */
  export type MissionRunCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    /**
     * The data needed to create a MissionRun.
     */
    data: XOR<MissionRunCreateInput, MissionRunUncheckedCreateInput>
  }

  /**
   * MissionRun createMany
   */
  export type MissionRunCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MissionRuns.
     */
    data: MissionRunCreateManyInput | MissionRunCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MissionRun createManyAndReturn
   */
  export type MissionRunCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MissionRuns.
     */
    data: MissionRunCreateManyInput | MissionRunCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MissionRun update
   */
  export type MissionRunUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    /**
     * The data needed to update a MissionRun.
     */
    data: XOR<MissionRunUpdateInput, MissionRunUncheckedUpdateInput>
    /**
     * Choose, which MissionRun to update.
     */
    where: MissionRunWhereUniqueInput
  }

  /**
   * MissionRun updateMany
   */
  export type MissionRunUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MissionRuns.
     */
    data: XOR<MissionRunUpdateManyMutationInput, MissionRunUncheckedUpdateManyInput>
    /**
     * Filter which MissionRuns to update
     */
    where?: MissionRunWhereInput
  }

  /**
   * MissionRun upsert
   */
  export type MissionRunUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    /**
     * The filter to search for the MissionRun to update in case it exists.
     */
    where: MissionRunWhereUniqueInput
    /**
     * In case the MissionRun found by the `where` argument doesn't exist, create a new MissionRun with this data.
     */
    create: XOR<MissionRunCreateInput, MissionRunUncheckedCreateInput>
    /**
     * In case the MissionRun was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MissionRunUpdateInput, MissionRunUncheckedUpdateInput>
  }

  /**
   * MissionRun delete
   */
  export type MissionRunDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    /**
     * Filter which MissionRun to delete.
     */
    where: MissionRunWhereUniqueInput
  }

  /**
   * MissionRun deleteMany
   */
  export type MissionRunDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MissionRuns to delete
     */
    where?: MissionRunWhereInput
  }

  /**
   * MissionRun.session
   */
  export type MissionRun$sessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    where?: GameSessionWhereInput
  }

  /**
   * MissionRun.rewards
   */
  export type MissionRun$rewardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    where?: RewardWhereInput
    orderBy?: RewardOrderByWithRelationInput | RewardOrderByWithRelationInput[]
    cursor?: RewardWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RewardScalarFieldEnum | RewardScalarFieldEnum[]
  }

  /**
   * MissionRun without action
   */
  export type MissionRunDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
  }


  /**
   * Model Reward
   */

  export type AggregateReward = {
    _count: RewardCountAggregateOutputType | null
    _avg: RewardAvgAggregateOutputType | null
    _sum: RewardSumAggregateOutputType | null
    _min: RewardMinAggregateOutputType | null
    _max: RewardMaxAggregateOutputType | null
  }

  export type RewardAvgAggregateOutputType = {
    amount: number | null
  }

  export type RewardSumAggregateOutputType = {
    amount: number | null
  }

  export type RewardMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    type: $Enums.RewardType | null
    amount: number | null
    userId: string | null
    missionRunId: string | null
  }

  export type RewardMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    type: $Enums.RewardType | null
    amount: number | null
    userId: string | null
    missionRunId: string | null
  }

  export type RewardCountAggregateOutputType = {
    id: number
    createdAt: number
    type: number
    amount: number
    metadata: number
    userId: number
    missionRunId: number
    _all: number
  }


  export type RewardAvgAggregateInputType = {
    amount?: true
  }

  export type RewardSumAggregateInputType = {
    amount?: true
  }

  export type RewardMinAggregateInputType = {
    id?: true
    createdAt?: true
    type?: true
    amount?: true
    userId?: true
    missionRunId?: true
  }

  export type RewardMaxAggregateInputType = {
    id?: true
    createdAt?: true
    type?: true
    amount?: true
    userId?: true
    missionRunId?: true
  }

  export type RewardCountAggregateInputType = {
    id?: true
    createdAt?: true
    type?: true
    amount?: true
    metadata?: true
    userId?: true
    missionRunId?: true
    _all?: true
  }

  export type RewardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Reward to aggregate.
     */
    where?: RewardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rewards to fetch.
     */
    orderBy?: RewardOrderByWithRelationInput | RewardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RewardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rewards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Rewards
    **/
    _count?: true | RewardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RewardAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RewardSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RewardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RewardMaxAggregateInputType
  }

  export type GetRewardAggregateType<T extends RewardAggregateArgs> = {
        [P in keyof T & keyof AggregateReward]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReward[P]>
      : GetScalarType<T[P], AggregateReward[P]>
  }




  export type RewardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RewardWhereInput
    orderBy?: RewardOrderByWithAggregationInput | RewardOrderByWithAggregationInput[]
    by: RewardScalarFieldEnum[] | RewardScalarFieldEnum
    having?: RewardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RewardCountAggregateInputType | true
    _avg?: RewardAvgAggregateInputType
    _sum?: RewardSumAggregateInputType
    _min?: RewardMinAggregateInputType
    _max?: RewardMaxAggregateInputType
  }

  export type RewardGroupByOutputType = {
    id: string
    createdAt: Date
    type: $Enums.RewardType
    amount: number
    metadata: JsonValue | null
    userId: string
    missionRunId: string | null
    _count: RewardCountAggregateOutputType | null
    _avg: RewardAvgAggregateOutputType | null
    _sum: RewardSumAggregateOutputType | null
    _min: RewardMinAggregateOutputType | null
    _max: RewardMaxAggregateOutputType | null
  }

  type GetRewardGroupByPayload<T extends RewardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RewardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RewardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RewardGroupByOutputType[P]>
            : GetScalarType<T[P], RewardGroupByOutputType[P]>
        }
      >
    >


  export type RewardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    type?: boolean
    amount?: boolean
    metadata?: boolean
    userId?: boolean
    missionRunId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    missionRun?: boolean | Reward$missionRunArgs<ExtArgs>
  }, ExtArgs["result"]["reward"]>

  export type RewardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    type?: boolean
    amount?: boolean
    metadata?: boolean
    userId?: boolean
    missionRunId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    missionRun?: boolean | Reward$missionRunArgs<ExtArgs>
  }, ExtArgs["result"]["reward"]>

  export type RewardSelectScalar = {
    id?: boolean
    createdAt?: boolean
    type?: boolean
    amount?: boolean
    metadata?: boolean
    userId?: boolean
    missionRunId?: boolean
  }

  export type RewardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    missionRun?: boolean | Reward$missionRunArgs<ExtArgs>
  }
  export type RewardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    missionRun?: boolean | Reward$missionRunArgs<ExtArgs>
  }

  export type $RewardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Reward"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      missionRun: Prisma.$MissionRunPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      type: $Enums.RewardType
      amount: number
      metadata: Prisma.JsonValue | null
      userId: string
      missionRunId: string | null
    }, ExtArgs["result"]["reward"]>
    composites: {}
  }

  type RewardGetPayload<S extends boolean | null | undefined | RewardDefaultArgs> = $Result.GetResult<Prisma.$RewardPayload, S>

  type RewardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RewardFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RewardCountAggregateInputType | true
    }

  export interface RewardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Reward'], meta: { name: 'Reward' } }
    /**
     * Find zero or one Reward that matches the filter.
     * @param {RewardFindUniqueArgs} args - Arguments to find a Reward
     * @example
     * // Get one Reward
     * const reward = await prisma.reward.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RewardFindUniqueArgs>(args: SelectSubset<T, RewardFindUniqueArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Reward that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RewardFindUniqueOrThrowArgs} args - Arguments to find a Reward
     * @example
     * // Get one Reward
     * const reward = await prisma.reward.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RewardFindUniqueOrThrowArgs>(args: SelectSubset<T, RewardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Reward that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardFindFirstArgs} args - Arguments to find a Reward
     * @example
     * // Get one Reward
     * const reward = await prisma.reward.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RewardFindFirstArgs>(args?: SelectSubset<T, RewardFindFirstArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Reward that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardFindFirstOrThrowArgs} args - Arguments to find a Reward
     * @example
     * // Get one Reward
     * const reward = await prisma.reward.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RewardFindFirstOrThrowArgs>(args?: SelectSubset<T, RewardFindFirstOrThrowArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Rewards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rewards
     * const rewards = await prisma.reward.findMany()
     * 
     * // Get first 10 Rewards
     * const rewards = await prisma.reward.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rewardWithIdOnly = await prisma.reward.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RewardFindManyArgs>(args?: SelectSubset<T, RewardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Reward.
     * @param {RewardCreateArgs} args - Arguments to create a Reward.
     * @example
     * // Create one Reward
     * const Reward = await prisma.reward.create({
     *   data: {
     *     // ... data to create a Reward
     *   }
     * })
     * 
     */
    create<T extends RewardCreateArgs>(args: SelectSubset<T, RewardCreateArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Rewards.
     * @param {RewardCreateManyArgs} args - Arguments to create many Rewards.
     * @example
     * // Create many Rewards
     * const reward = await prisma.reward.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RewardCreateManyArgs>(args?: SelectSubset<T, RewardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Rewards and returns the data saved in the database.
     * @param {RewardCreateManyAndReturnArgs} args - Arguments to create many Rewards.
     * @example
     * // Create many Rewards
     * const reward = await prisma.reward.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Rewards and only return the `id`
     * const rewardWithIdOnly = await prisma.reward.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RewardCreateManyAndReturnArgs>(args?: SelectSubset<T, RewardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Reward.
     * @param {RewardDeleteArgs} args - Arguments to delete one Reward.
     * @example
     * // Delete one Reward
     * const Reward = await prisma.reward.delete({
     *   where: {
     *     // ... filter to delete one Reward
     *   }
     * })
     * 
     */
    delete<T extends RewardDeleteArgs>(args: SelectSubset<T, RewardDeleteArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Reward.
     * @param {RewardUpdateArgs} args - Arguments to update one Reward.
     * @example
     * // Update one Reward
     * const reward = await prisma.reward.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RewardUpdateArgs>(args: SelectSubset<T, RewardUpdateArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Rewards.
     * @param {RewardDeleteManyArgs} args - Arguments to filter Rewards to delete.
     * @example
     * // Delete a few Rewards
     * const { count } = await prisma.reward.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RewardDeleteManyArgs>(args?: SelectSubset<T, RewardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rewards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rewards
     * const reward = await prisma.reward.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RewardUpdateManyArgs>(args: SelectSubset<T, RewardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Reward.
     * @param {RewardUpsertArgs} args - Arguments to update or create a Reward.
     * @example
     * // Update or create a Reward
     * const reward = await prisma.reward.upsert({
     *   create: {
     *     // ... data to create a Reward
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Reward we want to update
     *   }
     * })
     */
    upsert<T extends RewardUpsertArgs>(args: SelectSubset<T, RewardUpsertArgs<ExtArgs>>): Prisma__RewardClient<$Result.GetResult<Prisma.$RewardPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Rewards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardCountArgs} args - Arguments to filter Rewards to count.
     * @example
     * // Count the number of Rewards
     * const count = await prisma.reward.count({
     *   where: {
     *     // ... the filter for the Rewards we want to count
     *   }
     * })
    **/
    count<T extends RewardCountArgs>(
      args?: Subset<T, RewardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RewardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Reward.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RewardAggregateArgs>(args: Subset<T, RewardAggregateArgs>): Prisma.PrismaPromise<GetRewardAggregateType<T>>

    /**
     * Group by Reward.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RewardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RewardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RewardGroupByArgs['orderBy'] }
        : { orderBy?: RewardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RewardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRewardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Reward model
   */
  readonly fields: RewardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Reward.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RewardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    missionRun<T extends Reward$missionRunArgs<ExtArgs> = {}>(args?: Subset<T, Reward$missionRunArgs<ExtArgs>>): Prisma__MissionRunClient<$Result.GetResult<Prisma.$MissionRunPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Reward model
   */ 
  interface RewardFieldRefs {
    readonly id: FieldRef<"Reward", 'String'>
    readonly createdAt: FieldRef<"Reward", 'DateTime'>
    readonly type: FieldRef<"Reward", 'RewardType'>
    readonly amount: FieldRef<"Reward", 'Float'>
    readonly metadata: FieldRef<"Reward", 'Json'>
    readonly userId: FieldRef<"Reward", 'String'>
    readonly missionRunId: FieldRef<"Reward", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Reward findUnique
   */
  export type RewardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter, which Reward to fetch.
     */
    where: RewardWhereUniqueInput
  }

  /**
   * Reward findUniqueOrThrow
   */
  export type RewardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter, which Reward to fetch.
     */
    where: RewardWhereUniqueInput
  }

  /**
   * Reward findFirst
   */
  export type RewardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter, which Reward to fetch.
     */
    where?: RewardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rewards to fetch.
     */
    orderBy?: RewardOrderByWithRelationInput | RewardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rewards.
     */
    cursor?: RewardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rewards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rewards.
     */
    distinct?: RewardScalarFieldEnum | RewardScalarFieldEnum[]
  }

  /**
   * Reward findFirstOrThrow
   */
  export type RewardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter, which Reward to fetch.
     */
    where?: RewardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rewards to fetch.
     */
    orderBy?: RewardOrderByWithRelationInput | RewardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rewards.
     */
    cursor?: RewardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rewards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rewards.
     */
    distinct?: RewardScalarFieldEnum | RewardScalarFieldEnum[]
  }

  /**
   * Reward findMany
   */
  export type RewardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter, which Rewards to fetch.
     */
    where?: RewardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rewards to fetch.
     */
    orderBy?: RewardOrderByWithRelationInput | RewardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Rewards.
     */
    cursor?: RewardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rewards.
     */
    skip?: number
    distinct?: RewardScalarFieldEnum | RewardScalarFieldEnum[]
  }

  /**
   * Reward create
   */
  export type RewardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * The data needed to create a Reward.
     */
    data: XOR<RewardCreateInput, RewardUncheckedCreateInput>
  }

  /**
   * Reward createMany
   */
  export type RewardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Rewards.
     */
    data: RewardCreateManyInput | RewardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Reward createManyAndReturn
   */
  export type RewardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Rewards.
     */
    data: RewardCreateManyInput | RewardCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Reward update
   */
  export type RewardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * The data needed to update a Reward.
     */
    data: XOR<RewardUpdateInput, RewardUncheckedUpdateInput>
    /**
     * Choose, which Reward to update.
     */
    where: RewardWhereUniqueInput
  }

  /**
   * Reward updateMany
   */
  export type RewardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Rewards.
     */
    data: XOR<RewardUpdateManyMutationInput, RewardUncheckedUpdateManyInput>
    /**
     * Filter which Rewards to update
     */
    where?: RewardWhereInput
  }

  /**
   * Reward upsert
   */
  export type RewardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * The filter to search for the Reward to update in case it exists.
     */
    where: RewardWhereUniqueInput
    /**
     * In case the Reward found by the `where` argument doesn't exist, create a new Reward with this data.
     */
    create: XOR<RewardCreateInput, RewardUncheckedCreateInput>
    /**
     * In case the Reward was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RewardUpdateInput, RewardUncheckedUpdateInput>
  }

  /**
   * Reward delete
   */
  export type RewardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
    /**
     * Filter which Reward to delete.
     */
    where: RewardWhereUniqueInput
  }

  /**
   * Reward deleteMany
   */
  export type RewardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rewards to delete
     */
    where?: RewardWhereInput
  }

  /**
   * Reward.missionRun
   */
  export type Reward$missionRunArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MissionRun
     */
    select?: MissionRunSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MissionRunInclude<ExtArgs> | null
    where?: MissionRunWhereInput
  }

  /**
   * Reward without action
   */
  export type RewardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reward
     */
    select?: RewardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RewardInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    email: 'email',
    handle: 'handle',
    role: 'role',
    consentedAt: 'consentedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    token: 'token'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const ThreadScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    archivedAt: 'archivedAt',
    kind: 'kind',
    userId: 'userId',
    accessTier: 'accessTier'
  };

  export type ThreadScalarFieldEnum = (typeof ThreadScalarFieldEnum)[keyof typeof ThreadScalarFieldEnum]


  export const MessageScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    role: 'role',
    content: 'content',
    threadId: 'threadId'
  };

  export type MessageScalarFieldEnum = (typeof MessageScalarFieldEnum)[keyof typeof MessageScalarFieldEnum]


  export const AgentNoteScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    userId: 'userId',
    threadId: 'threadId',
    key: 'key',
    value: 'value'
  };

  export type AgentNoteScalarFieldEnum = (typeof AgentNoteScalarFieldEnum)[keyof typeof AgentNoteScalarFieldEnum]


  export const ExperimentScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    userId: 'userId',
    threadId: 'threadId',
    hypothesis: 'hypothesis',
    task: 'task',
    successCriteria: 'successCriteria',
    timeoutS: 'timeoutS',
    title: 'title'
  };

  export type ExperimentScalarFieldEnum = (typeof ExperimentScalarFieldEnum)[keyof typeof ExperimentScalarFieldEnum]


  export const ExperimentEventScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    experimentId: 'experimentId',
    observation: 'observation',
    result: 'result',
    score: 'score'
  };

  export type ExperimentEventScalarFieldEnum = (typeof ExperimentEventScalarFieldEnum)[keyof typeof ExperimentEventScalarFieldEnum]


  export const GameSessionScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    status: 'status',
    summary: 'summary',
    userId: 'userId'
  };

  export type GameSessionScalarFieldEnum = (typeof GameSessionScalarFieldEnum)[keyof typeof GameSessionScalarFieldEnum]


  export const GameMessageScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    role: 'role',
    content: 'content',
    gameSessionId: 'gameSessionId'
  };

  export type GameMessageScalarFieldEnum = (typeof GameMessageScalarFieldEnum)[keyof typeof GameMessageScalarFieldEnum]


  export const MemoryEventScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    type: 'type',
    content: 'content',
    tags: 'tags',
    userId: 'userId',
    sessionId: 'sessionId'
  };

  export type MemoryEventScalarFieldEnum = (typeof MemoryEventScalarFieldEnum)[keyof typeof MemoryEventScalarFieldEnum]


  export const MemoryEmbeddingScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    provider: 'provider',
    dimensions: 'dimensions',
    vector: 'vector',
    memoryEventId: 'memoryEventId'
  };

  export type MemoryEmbeddingScalarFieldEnum = (typeof MemoryEmbeddingScalarFieldEnum)[keyof typeof MemoryEmbeddingScalarFieldEnum]


  export const PlayerProfileScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    traits: 'traits',
    skills: 'skills',
    preferences: 'preferences',
    updatedAt: 'updatedAt'
  };

  export type PlayerProfileScalarFieldEnum = (typeof PlayerProfileScalarFieldEnum)[keyof typeof PlayerProfileScalarFieldEnum]


  export const MissionDefinitionScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    title: 'title',
    prompt: 'prompt',
    type: 'type',
    minEvidence: 'minEvidence',
    tags: 'tags',
    active: 'active'
  };

  export type MissionDefinitionScalarFieldEnum = (typeof MissionDefinitionScalarFieldEnum)[keyof typeof MissionDefinitionScalarFieldEnum]


  export const MissionRunScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    status: 'status',
    score: 'score',
    feedback: 'feedback',
    payload: 'payload',
    missionId: 'missionId',
    userId: 'userId',
    sessionId: 'sessionId'
  };

  export type MissionRunScalarFieldEnum = (typeof MissionRunScalarFieldEnum)[keyof typeof MissionRunScalarFieldEnum]


  export const RewardScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    type: 'type',
    amount: 'amount',
    metadata: 'metadata',
    userId: 'userId',
    missionRunId: 'missionRunId'
  };

  export type RewardScalarFieldEnum = (typeof RewardScalarFieldEnum)[keyof typeof RewardScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'ThreadKind'
   */
  export type EnumThreadKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ThreadKind'>
    


  /**
   * Reference to a field of type 'ThreadKind[]'
   */
  export type ListEnumThreadKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ThreadKind[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'SessionStatus'
   */
  export type EnumSessionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SessionStatus'>
    


  /**
   * Reference to a field of type 'SessionStatus[]'
   */
  export type ListEnumSessionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SessionStatus[]'>
    


  /**
   * Reference to a field of type 'MemoryEventType'
   */
  export type EnumMemoryEventTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MemoryEventType'>
    


  /**
   * Reference to a field of type 'MemoryEventType[]'
   */
  export type ListEnumMemoryEventTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MemoryEventType[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'MissionRunStatus'
   */
  export type EnumMissionRunStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MissionRunStatus'>
    


  /**
   * Reference to a field of type 'MissionRunStatus[]'
   */
  export type ListEnumMissionRunStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MissionRunStatus[]'>
    


  /**
   * Reference to a field of type 'RewardType'
   */
  export type EnumRewardTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RewardType'>
    


  /**
   * Reference to a field of type 'RewardType[]'
   */
  export type ListEnumRewardTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RewardType[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    email?: StringNullableFilter<"User"> | string | null
    handle?: StringNullableFilter<"User"> | string | null
    role?: EnumRoleFilter<"User"> | $Enums.Role
    consentedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    sessions?: SessionListRelationFilter
    threads?: ThreadListRelationFilter
    notes?: AgentNoteListRelationFilter
    gameSessions?: GameSessionListRelationFilter
    memoryEvents?: MemoryEventListRelationFilter
    missionRuns?: MissionRunListRelationFilter
    rewards?: RewardListRelationFilter
    profile?: XOR<PlayerProfileNullableRelationFilter, PlayerProfileWhereInput> | null
    experiments?: ExperimentListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    email?: SortOrderInput | SortOrder
    handle?: SortOrderInput | SortOrder
    role?: SortOrder
    consentedAt?: SortOrderInput | SortOrder
    sessions?: SessionOrderByRelationAggregateInput
    threads?: ThreadOrderByRelationAggregateInput
    notes?: AgentNoteOrderByRelationAggregateInput
    gameSessions?: GameSessionOrderByRelationAggregateInput
    memoryEvents?: MemoryEventOrderByRelationAggregateInput
    missionRuns?: MissionRunOrderByRelationAggregateInput
    rewards?: RewardOrderByRelationAggregateInput
    profile?: PlayerProfileOrderByWithRelationInput
    experiments?: ExperimentOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    handle?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    consentedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    sessions?: SessionListRelationFilter
    threads?: ThreadListRelationFilter
    notes?: AgentNoteListRelationFilter
    gameSessions?: GameSessionListRelationFilter
    memoryEvents?: MemoryEventListRelationFilter
    missionRuns?: MissionRunListRelationFilter
    rewards?: RewardListRelationFilter
    profile?: XOR<PlayerProfileNullableRelationFilter, PlayerProfileWhereInput> | null
    experiments?: ExperimentListRelationFilter
  }, "id" | "email" | "handle">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    email?: SortOrderInput | SortOrder
    handle?: SortOrderInput | SortOrder
    role?: SortOrder
    consentedAt?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
    handle?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    consentedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
  }

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    id?: StringFilter<"Session"> | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    userId?: StringFilter<"Session"> | string
    token?: StringFilter<"Session"> | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    userId?: StringFilter<"Session"> | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    OR?: SessionScalarWhereWithAggregatesInput[]
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Session"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    userId?: StringWithAggregatesFilter<"Session"> | string
    token?: StringWithAggregatesFilter<"Session"> | string
  }

  export type ThreadWhereInput = {
    AND?: ThreadWhereInput | ThreadWhereInput[]
    OR?: ThreadWhereInput[]
    NOT?: ThreadWhereInput | ThreadWhereInput[]
    id?: StringFilter<"Thread"> | string
    createdAt?: DateTimeFilter<"Thread"> | Date | string
    archivedAt?: DateTimeNullableFilter<"Thread"> | Date | string | null
    kind?: EnumThreadKindFilter<"Thread"> | $Enums.ThreadKind
    userId?: StringFilter<"Thread"> | string
    accessTier?: IntFilter<"Thread"> | number
    user?: XOR<UserRelationFilter, UserWhereInput>
    messages?: MessageListRelationFilter
    notes?: AgentNoteListRelationFilter
    experiments?: ExperimentListRelationFilter
  }

  export type ThreadOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    archivedAt?: SortOrderInput | SortOrder
    kind?: SortOrder
    userId?: SortOrder
    accessTier?: SortOrder
    user?: UserOrderByWithRelationInput
    messages?: MessageOrderByRelationAggregateInput
    notes?: AgentNoteOrderByRelationAggregateInput
    experiments?: ExperimentOrderByRelationAggregateInput
  }

  export type ThreadWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ThreadWhereInput | ThreadWhereInput[]
    OR?: ThreadWhereInput[]
    NOT?: ThreadWhereInput | ThreadWhereInput[]
    createdAt?: DateTimeFilter<"Thread"> | Date | string
    archivedAt?: DateTimeNullableFilter<"Thread"> | Date | string | null
    kind?: EnumThreadKindFilter<"Thread"> | $Enums.ThreadKind
    userId?: StringFilter<"Thread"> | string
    accessTier?: IntFilter<"Thread"> | number
    user?: XOR<UserRelationFilter, UserWhereInput>
    messages?: MessageListRelationFilter
    notes?: AgentNoteListRelationFilter
    experiments?: ExperimentListRelationFilter
  }, "id">

  export type ThreadOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    archivedAt?: SortOrderInput | SortOrder
    kind?: SortOrder
    userId?: SortOrder
    accessTier?: SortOrder
    _count?: ThreadCountOrderByAggregateInput
    _avg?: ThreadAvgOrderByAggregateInput
    _max?: ThreadMaxOrderByAggregateInput
    _min?: ThreadMinOrderByAggregateInput
    _sum?: ThreadSumOrderByAggregateInput
  }

  export type ThreadScalarWhereWithAggregatesInput = {
    AND?: ThreadScalarWhereWithAggregatesInput | ThreadScalarWhereWithAggregatesInput[]
    OR?: ThreadScalarWhereWithAggregatesInput[]
    NOT?: ThreadScalarWhereWithAggregatesInput | ThreadScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Thread"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Thread"> | Date | string
    archivedAt?: DateTimeNullableWithAggregatesFilter<"Thread"> | Date | string | null
    kind?: EnumThreadKindWithAggregatesFilter<"Thread"> | $Enums.ThreadKind
    userId?: StringWithAggregatesFilter<"Thread"> | string
    accessTier?: IntWithAggregatesFilter<"Thread"> | number
  }

  export type MessageWhereInput = {
    AND?: MessageWhereInput | MessageWhereInput[]
    OR?: MessageWhereInput[]
    NOT?: MessageWhereInput | MessageWhereInput[]
    id?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    role?: StringFilter<"Message"> | string
    content?: StringFilter<"Message"> | string
    threadId?: StringFilter<"Message"> | string
    thread?: XOR<ThreadRelationFilter, ThreadWhereInput>
  }

  export type MessageOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    role?: SortOrder
    content?: SortOrder
    threadId?: SortOrder
    thread?: ThreadOrderByWithRelationInput
  }

  export type MessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MessageWhereInput | MessageWhereInput[]
    OR?: MessageWhereInput[]
    NOT?: MessageWhereInput | MessageWhereInput[]
    createdAt?: DateTimeFilter<"Message"> | Date | string
    role?: StringFilter<"Message"> | string
    content?: StringFilter<"Message"> | string
    threadId?: StringFilter<"Message"> | string
    thread?: XOR<ThreadRelationFilter, ThreadWhereInput>
  }, "id">

  export type MessageOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    role?: SortOrder
    content?: SortOrder
    threadId?: SortOrder
    _count?: MessageCountOrderByAggregateInput
    _max?: MessageMaxOrderByAggregateInput
    _min?: MessageMinOrderByAggregateInput
  }

  export type MessageScalarWhereWithAggregatesInput = {
    AND?: MessageScalarWhereWithAggregatesInput | MessageScalarWhereWithAggregatesInput[]
    OR?: MessageScalarWhereWithAggregatesInput[]
    NOT?: MessageScalarWhereWithAggregatesInput | MessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Message"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Message"> | Date | string
    role?: StringWithAggregatesFilter<"Message"> | string
    content?: StringWithAggregatesFilter<"Message"> | string
    threadId?: StringWithAggregatesFilter<"Message"> | string
  }

  export type AgentNoteWhereInput = {
    AND?: AgentNoteWhereInput | AgentNoteWhereInput[]
    OR?: AgentNoteWhereInput[]
    NOT?: AgentNoteWhereInput | AgentNoteWhereInput[]
    id?: StringFilter<"AgentNote"> | string
    createdAt?: DateTimeFilter<"AgentNote"> | Date | string
    userId?: StringFilter<"AgentNote"> | string
    threadId?: StringNullableFilter<"AgentNote"> | string | null
    key?: StringFilter<"AgentNote"> | string
    value?: StringFilter<"AgentNote"> | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    thread?: XOR<ThreadNullableRelationFilter, ThreadWhereInput> | null
  }

  export type AgentNoteOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    threadId?: SortOrderInput | SortOrder
    key?: SortOrder
    value?: SortOrder
    user?: UserOrderByWithRelationInput
    thread?: ThreadOrderByWithRelationInput
  }

  export type AgentNoteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AgentNoteWhereInput | AgentNoteWhereInput[]
    OR?: AgentNoteWhereInput[]
    NOT?: AgentNoteWhereInput | AgentNoteWhereInput[]
    createdAt?: DateTimeFilter<"AgentNote"> | Date | string
    userId?: StringFilter<"AgentNote"> | string
    threadId?: StringNullableFilter<"AgentNote"> | string | null
    key?: StringFilter<"AgentNote"> | string
    value?: StringFilter<"AgentNote"> | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    thread?: XOR<ThreadNullableRelationFilter, ThreadWhereInput> | null
  }, "id">

  export type AgentNoteOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    threadId?: SortOrderInput | SortOrder
    key?: SortOrder
    value?: SortOrder
    _count?: AgentNoteCountOrderByAggregateInput
    _max?: AgentNoteMaxOrderByAggregateInput
    _min?: AgentNoteMinOrderByAggregateInput
  }

  export type AgentNoteScalarWhereWithAggregatesInput = {
    AND?: AgentNoteScalarWhereWithAggregatesInput | AgentNoteScalarWhereWithAggregatesInput[]
    OR?: AgentNoteScalarWhereWithAggregatesInput[]
    NOT?: AgentNoteScalarWhereWithAggregatesInput | AgentNoteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AgentNote"> | string
    createdAt?: DateTimeWithAggregatesFilter<"AgentNote"> | Date | string
    userId?: StringWithAggregatesFilter<"AgentNote"> | string
    threadId?: StringNullableWithAggregatesFilter<"AgentNote"> | string | null
    key?: StringWithAggregatesFilter<"AgentNote"> | string
    value?: StringWithAggregatesFilter<"AgentNote"> | string
  }

  export type ExperimentWhereInput = {
    AND?: ExperimentWhereInput | ExperimentWhereInput[]
    OR?: ExperimentWhereInput[]
    NOT?: ExperimentWhereInput | ExperimentWhereInput[]
    id?: StringFilter<"Experiment"> | string
    createdAt?: DateTimeFilter<"Experiment"> | Date | string
    userId?: StringFilter<"Experiment"> | string
    threadId?: StringNullableFilter<"Experiment"> | string | null
    hypothesis?: StringFilter<"Experiment"> | string
    task?: StringFilter<"Experiment"> | string
    successCriteria?: StringNullableFilter<"Experiment"> | string | null
    timeoutS?: IntNullableFilter<"Experiment"> | number | null
    title?: StringNullableFilter<"Experiment"> | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    thread?: XOR<ThreadNullableRelationFilter, ThreadWhereInput> | null
    events?: ExperimentEventListRelationFilter
  }

  export type ExperimentOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    threadId?: SortOrderInput | SortOrder
    hypothesis?: SortOrder
    task?: SortOrder
    successCriteria?: SortOrderInput | SortOrder
    timeoutS?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    thread?: ThreadOrderByWithRelationInput
    events?: ExperimentEventOrderByRelationAggregateInput
  }

  export type ExperimentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ExperimentWhereInput | ExperimentWhereInput[]
    OR?: ExperimentWhereInput[]
    NOT?: ExperimentWhereInput | ExperimentWhereInput[]
    createdAt?: DateTimeFilter<"Experiment"> | Date | string
    userId?: StringFilter<"Experiment"> | string
    threadId?: StringNullableFilter<"Experiment"> | string | null
    hypothesis?: StringFilter<"Experiment"> | string
    task?: StringFilter<"Experiment"> | string
    successCriteria?: StringNullableFilter<"Experiment"> | string | null
    timeoutS?: IntNullableFilter<"Experiment"> | number | null
    title?: StringNullableFilter<"Experiment"> | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    thread?: XOR<ThreadNullableRelationFilter, ThreadWhereInput> | null
    events?: ExperimentEventListRelationFilter
  }, "id">

  export type ExperimentOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    threadId?: SortOrderInput | SortOrder
    hypothesis?: SortOrder
    task?: SortOrder
    successCriteria?: SortOrderInput | SortOrder
    timeoutS?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    _count?: ExperimentCountOrderByAggregateInput
    _avg?: ExperimentAvgOrderByAggregateInput
    _max?: ExperimentMaxOrderByAggregateInput
    _min?: ExperimentMinOrderByAggregateInput
    _sum?: ExperimentSumOrderByAggregateInput
  }

  export type ExperimentScalarWhereWithAggregatesInput = {
    AND?: ExperimentScalarWhereWithAggregatesInput | ExperimentScalarWhereWithAggregatesInput[]
    OR?: ExperimentScalarWhereWithAggregatesInput[]
    NOT?: ExperimentScalarWhereWithAggregatesInput | ExperimentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Experiment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Experiment"> | Date | string
    userId?: StringWithAggregatesFilter<"Experiment"> | string
    threadId?: StringNullableWithAggregatesFilter<"Experiment"> | string | null
    hypothesis?: StringWithAggregatesFilter<"Experiment"> | string
    task?: StringWithAggregatesFilter<"Experiment"> | string
    successCriteria?: StringNullableWithAggregatesFilter<"Experiment"> | string | null
    timeoutS?: IntNullableWithAggregatesFilter<"Experiment"> | number | null
    title?: StringNullableWithAggregatesFilter<"Experiment"> | string | null
  }

  export type ExperimentEventWhereInput = {
    AND?: ExperimentEventWhereInput | ExperimentEventWhereInput[]
    OR?: ExperimentEventWhereInput[]
    NOT?: ExperimentEventWhereInput | ExperimentEventWhereInput[]
    id?: StringFilter<"ExperimentEvent"> | string
    createdAt?: DateTimeFilter<"ExperimentEvent"> | Date | string
    experimentId?: StringFilter<"ExperimentEvent"> | string
    observation?: StringNullableFilter<"ExperimentEvent"> | string | null
    result?: StringNullableFilter<"ExperimentEvent"> | string | null
    score?: FloatNullableFilter<"ExperimentEvent"> | number | null
    experiment?: XOR<ExperimentRelationFilter, ExperimentWhereInput>
  }

  export type ExperimentEventOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    experimentId?: SortOrder
    observation?: SortOrderInput | SortOrder
    result?: SortOrderInput | SortOrder
    score?: SortOrderInput | SortOrder
    experiment?: ExperimentOrderByWithRelationInput
  }

  export type ExperimentEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ExperimentEventWhereInput | ExperimentEventWhereInput[]
    OR?: ExperimentEventWhereInput[]
    NOT?: ExperimentEventWhereInput | ExperimentEventWhereInput[]
    createdAt?: DateTimeFilter<"ExperimentEvent"> | Date | string
    experimentId?: StringFilter<"ExperimentEvent"> | string
    observation?: StringNullableFilter<"ExperimentEvent"> | string | null
    result?: StringNullableFilter<"ExperimentEvent"> | string | null
    score?: FloatNullableFilter<"ExperimentEvent"> | number | null
    experiment?: XOR<ExperimentRelationFilter, ExperimentWhereInput>
  }, "id">

  export type ExperimentEventOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    experimentId?: SortOrder
    observation?: SortOrderInput | SortOrder
    result?: SortOrderInput | SortOrder
    score?: SortOrderInput | SortOrder
    _count?: ExperimentEventCountOrderByAggregateInput
    _avg?: ExperimentEventAvgOrderByAggregateInput
    _max?: ExperimentEventMaxOrderByAggregateInput
    _min?: ExperimentEventMinOrderByAggregateInput
    _sum?: ExperimentEventSumOrderByAggregateInput
  }

  export type ExperimentEventScalarWhereWithAggregatesInput = {
    AND?: ExperimentEventScalarWhereWithAggregatesInput | ExperimentEventScalarWhereWithAggregatesInput[]
    OR?: ExperimentEventScalarWhereWithAggregatesInput[]
    NOT?: ExperimentEventScalarWhereWithAggregatesInput | ExperimentEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ExperimentEvent"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ExperimentEvent"> | Date | string
    experimentId?: StringWithAggregatesFilter<"ExperimentEvent"> | string
    observation?: StringNullableWithAggregatesFilter<"ExperimentEvent"> | string | null
    result?: StringNullableWithAggregatesFilter<"ExperimentEvent"> | string | null
    score?: FloatNullableWithAggregatesFilter<"ExperimentEvent"> | number | null
  }

  export type GameSessionWhereInput = {
    AND?: GameSessionWhereInput | GameSessionWhereInput[]
    OR?: GameSessionWhereInput[]
    NOT?: GameSessionWhereInput | GameSessionWhereInput[]
    id?: StringFilter<"GameSession"> | string
    createdAt?: DateTimeFilter<"GameSession"> | Date | string
    updatedAt?: DateTimeFilter<"GameSession"> | Date | string
    status?: EnumSessionStatusFilter<"GameSession"> | $Enums.SessionStatus
    summary?: StringNullableFilter<"GameSession"> | string | null
    userId?: StringFilter<"GameSession"> | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    messages?: GameMessageListRelationFilter
    missionRuns?: MissionRunListRelationFilter
    memoryEvents?: MemoryEventListRelationFilter
  }

  export type GameSessionOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    summary?: SortOrderInput | SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
    messages?: GameMessageOrderByRelationAggregateInput
    missionRuns?: MissionRunOrderByRelationAggregateInput
    memoryEvents?: MemoryEventOrderByRelationAggregateInput
  }

  export type GameSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GameSessionWhereInput | GameSessionWhereInput[]
    OR?: GameSessionWhereInput[]
    NOT?: GameSessionWhereInput | GameSessionWhereInput[]
    createdAt?: DateTimeFilter<"GameSession"> | Date | string
    updatedAt?: DateTimeFilter<"GameSession"> | Date | string
    status?: EnumSessionStatusFilter<"GameSession"> | $Enums.SessionStatus
    summary?: StringNullableFilter<"GameSession"> | string | null
    userId?: StringFilter<"GameSession"> | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    messages?: GameMessageListRelationFilter
    missionRuns?: MissionRunListRelationFilter
    memoryEvents?: MemoryEventListRelationFilter
  }, "id">

  export type GameSessionOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    summary?: SortOrderInput | SortOrder
    userId?: SortOrder
    _count?: GameSessionCountOrderByAggregateInput
    _max?: GameSessionMaxOrderByAggregateInput
    _min?: GameSessionMinOrderByAggregateInput
  }

  export type GameSessionScalarWhereWithAggregatesInput = {
    AND?: GameSessionScalarWhereWithAggregatesInput | GameSessionScalarWhereWithAggregatesInput[]
    OR?: GameSessionScalarWhereWithAggregatesInput[]
    NOT?: GameSessionScalarWhereWithAggregatesInput | GameSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GameSession"> | string
    createdAt?: DateTimeWithAggregatesFilter<"GameSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GameSession"> | Date | string
    status?: EnumSessionStatusWithAggregatesFilter<"GameSession"> | $Enums.SessionStatus
    summary?: StringNullableWithAggregatesFilter<"GameSession"> | string | null
    userId?: StringWithAggregatesFilter<"GameSession"> | string
  }

  export type GameMessageWhereInput = {
    AND?: GameMessageWhereInput | GameMessageWhereInput[]
    OR?: GameMessageWhereInput[]
    NOT?: GameMessageWhereInput | GameMessageWhereInput[]
    id?: StringFilter<"GameMessage"> | string
    createdAt?: DateTimeFilter<"GameMessage"> | Date | string
    role?: StringFilter<"GameMessage"> | string
    content?: StringFilter<"GameMessage"> | string
    gameSessionId?: StringFilter<"GameMessage"> | string
    gameSession?: XOR<GameSessionRelationFilter, GameSessionWhereInput>
  }

  export type GameMessageOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    role?: SortOrder
    content?: SortOrder
    gameSessionId?: SortOrder
    gameSession?: GameSessionOrderByWithRelationInput
  }

  export type GameMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GameMessageWhereInput | GameMessageWhereInput[]
    OR?: GameMessageWhereInput[]
    NOT?: GameMessageWhereInput | GameMessageWhereInput[]
    createdAt?: DateTimeFilter<"GameMessage"> | Date | string
    role?: StringFilter<"GameMessage"> | string
    content?: StringFilter<"GameMessage"> | string
    gameSessionId?: StringFilter<"GameMessage"> | string
    gameSession?: XOR<GameSessionRelationFilter, GameSessionWhereInput>
  }, "id">

  export type GameMessageOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    role?: SortOrder
    content?: SortOrder
    gameSessionId?: SortOrder
    _count?: GameMessageCountOrderByAggregateInput
    _max?: GameMessageMaxOrderByAggregateInput
    _min?: GameMessageMinOrderByAggregateInput
  }

  export type GameMessageScalarWhereWithAggregatesInput = {
    AND?: GameMessageScalarWhereWithAggregatesInput | GameMessageScalarWhereWithAggregatesInput[]
    OR?: GameMessageScalarWhereWithAggregatesInput[]
    NOT?: GameMessageScalarWhereWithAggregatesInput | GameMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GameMessage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"GameMessage"> | Date | string
    role?: StringWithAggregatesFilter<"GameMessage"> | string
    content?: StringWithAggregatesFilter<"GameMessage"> | string
    gameSessionId?: StringWithAggregatesFilter<"GameMessage"> | string
  }

  export type MemoryEventWhereInput = {
    AND?: MemoryEventWhereInput | MemoryEventWhereInput[]
    OR?: MemoryEventWhereInput[]
    NOT?: MemoryEventWhereInput | MemoryEventWhereInput[]
    id?: StringFilter<"MemoryEvent"> | string
    createdAt?: DateTimeFilter<"MemoryEvent"> | Date | string
    type?: EnumMemoryEventTypeFilter<"MemoryEvent"> | $Enums.MemoryEventType
    content?: StringFilter<"MemoryEvent"> | string
    tags?: StringNullableListFilter<"MemoryEvent">
    userId?: StringFilter<"MemoryEvent"> | string
    sessionId?: StringNullableFilter<"MemoryEvent"> | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    session?: XOR<GameSessionNullableRelationFilter, GameSessionWhereInput> | null
    embeddings?: MemoryEmbeddingListRelationFilter
  }

  export type MemoryEventOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    type?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    session?: GameSessionOrderByWithRelationInput
    embeddings?: MemoryEmbeddingOrderByRelationAggregateInput
  }

  export type MemoryEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MemoryEventWhereInput | MemoryEventWhereInput[]
    OR?: MemoryEventWhereInput[]
    NOT?: MemoryEventWhereInput | MemoryEventWhereInput[]
    createdAt?: DateTimeFilter<"MemoryEvent"> | Date | string
    type?: EnumMemoryEventTypeFilter<"MemoryEvent"> | $Enums.MemoryEventType
    content?: StringFilter<"MemoryEvent"> | string
    tags?: StringNullableListFilter<"MemoryEvent">
    userId?: StringFilter<"MemoryEvent"> | string
    sessionId?: StringNullableFilter<"MemoryEvent"> | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    session?: XOR<GameSessionNullableRelationFilter, GameSessionWhereInput> | null
    embeddings?: MemoryEmbeddingListRelationFilter
  }, "id">

  export type MemoryEventOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    type?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    _count?: MemoryEventCountOrderByAggregateInput
    _max?: MemoryEventMaxOrderByAggregateInput
    _min?: MemoryEventMinOrderByAggregateInput
  }

  export type MemoryEventScalarWhereWithAggregatesInput = {
    AND?: MemoryEventScalarWhereWithAggregatesInput | MemoryEventScalarWhereWithAggregatesInput[]
    OR?: MemoryEventScalarWhereWithAggregatesInput[]
    NOT?: MemoryEventScalarWhereWithAggregatesInput | MemoryEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemoryEvent"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MemoryEvent"> | Date | string
    type?: EnumMemoryEventTypeWithAggregatesFilter<"MemoryEvent"> | $Enums.MemoryEventType
    content?: StringWithAggregatesFilter<"MemoryEvent"> | string
    tags?: StringNullableListFilter<"MemoryEvent">
    userId?: StringWithAggregatesFilter<"MemoryEvent"> | string
    sessionId?: StringNullableWithAggregatesFilter<"MemoryEvent"> | string | null
  }

  export type MemoryEmbeddingWhereInput = {
    AND?: MemoryEmbeddingWhereInput | MemoryEmbeddingWhereInput[]
    OR?: MemoryEmbeddingWhereInput[]
    NOT?: MemoryEmbeddingWhereInput | MemoryEmbeddingWhereInput[]
    id?: StringFilter<"MemoryEmbedding"> | string
    createdAt?: DateTimeFilter<"MemoryEmbedding"> | Date | string
    provider?: StringNullableFilter<"MemoryEmbedding"> | string | null
    dimensions?: IntNullableFilter<"MemoryEmbedding"> | number | null
    vector?: JsonFilter<"MemoryEmbedding">
    memoryEventId?: StringFilter<"MemoryEmbedding"> | string
    memory?: XOR<MemoryEventRelationFilter, MemoryEventWhereInput>
  }

  export type MemoryEmbeddingOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    provider?: SortOrderInput | SortOrder
    dimensions?: SortOrderInput | SortOrder
    vector?: SortOrder
    memoryEventId?: SortOrder
    memory?: MemoryEventOrderByWithRelationInput
  }

  export type MemoryEmbeddingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MemoryEmbeddingWhereInput | MemoryEmbeddingWhereInput[]
    OR?: MemoryEmbeddingWhereInput[]
    NOT?: MemoryEmbeddingWhereInput | MemoryEmbeddingWhereInput[]
    createdAt?: DateTimeFilter<"MemoryEmbedding"> | Date | string
    provider?: StringNullableFilter<"MemoryEmbedding"> | string | null
    dimensions?: IntNullableFilter<"MemoryEmbedding"> | number | null
    vector?: JsonFilter<"MemoryEmbedding">
    memoryEventId?: StringFilter<"MemoryEmbedding"> | string
    memory?: XOR<MemoryEventRelationFilter, MemoryEventWhereInput>
  }, "id">

  export type MemoryEmbeddingOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    provider?: SortOrderInput | SortOrder
    dimensions?: SortOrderInput | SortOrder
    vector?: SortOrder
    memoryEventId?: SortOrder
    _count?: MemoryEmbeddingCountOrderByAggregateInput
    _avg?: MemoryEmbeddingAvgOrderByAggregateInput
    _max?: MemoryEmbeddingMaxOrderByAggregateInput
    _min?: MemoryEmbeddingMinOrderByAggregateInput
    _sum?: MemoryEmbeddingSumOrderByAggregateInput
  }

  export type MemoryEmbeddingScalarWhereWithAggregatesInput = {
    AND?: MemoryEmbeddingScalarWhereWithAggregatesInput | MemoryEmbeddingScalarWhereWithAggregatesInput[]
    OR?: MemoryEmbeddingScalarWhereWithAggregatesInput[]
    NOT?: MemoryEmbeddingScalarWhereWithAggregatesInput | MemoryEmbeddingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemoryEmbedding"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MemoryEmbedding"> | Date | string
    provider?: StringNullableWithAggregatesFilter<"MemoryEmbedding"> | string | null
    dimensions?: IntNullableWithAggregatesFilter<"MemoryEmbedding"> | number | null
    vector?: JsonWithAggregatesFilter<"MemoryEmbedding">
    memoryEventId?: StringWithAggregatesFilter<"MemoryEmbedding"> | string
  }

  export type PlayerProfileWhereInput = {
    AND?: PlayerProfileWhereInput | PlayerProfileWhereInput[]
    OR?: PlayerProfileWhereInput[]
    NOT?: PlayerProfileWhereInput | PlayerProfileWhereInput[]
    id?: StringFilter<"PlayerProfile"> | string
    userId?: StringFilter<"PlayerProfile"> | string
    traits?: JsonNullableFilter<"PlayerProfile">
    skills?: JsonNullableFilter<"PlayerProfile">
    preferences?: JsonNullableFilter<"PlayerProfile">
    updatedAt?: DateTimeFilter<"PlayerProfile"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type PlayerProfileOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    traits?: SortOrderInput | SortOrder
    skills?: SortOrderInput | SortOrder
    preferences?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type PlayerProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: PlayerProfileWhereInput | PlayerProfileWhereInput[]
    OR?: PlayerProfileWhereInput[]
    NOT?: PlayerProfileWhereInput | PlayerProfileWhereInput[]
    traits?: JsonNullableFilter<"PlayerProfile">
    skills?: JsonNullableFilter<"PlayerProfile">
    preferences?: JsonNullableFilter<"PlayerProfile">
    updatedAt?: DateTimeFilter<"PlayerProfile"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type PlayerProfileOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    traits?: SortOrderInput | SortOrder
    skills?: SortOrderInput | SortOrder
    preferences?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    _count?: PlayerProfileCountOrderByAggregateInput
    _max?: PlayerProfileMaxOrderByAggregateInput
    _min?: PlayerProfileMinOrderByAggregateInput
  }

  export type PlayerProfileScalarWhereWithAggregatesInput = {
    AND?: PlayerProfileScalarWhereWithAggregatesInput | PlayerProfileScalarWhereWithAggregatesInput[]
    OR?: PlayerProfileScalarWhereWithAggregatesInput[]
    NOT?: PlayerProfileScalarWhereWithAggregatesInput | PlayerProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PlayerProfile"> | string
    userId?: StringWithAggregatesFilter<"PlayerProfile"> | string
    traits?: JsonNullableWithAggregatesFilter<"PlayerProfile">
    skills?: JsonNullableWithAggregatesFilter<"PlayerProfile">
    preferences?: JsonNullableWithAggregatesFilter<"PlayerProfile">
    updatedAt?: DateTimeWithAggregatesFilter<"PlayerProfile"> | Date | string
  }

  export type MissionDefinitionWhereInput = {
    AND?: MissionDefinitionWhereInput | MissionDefinitionWhereInput[]
    OR?: MissionDefinitionWhereInput[]
    NOT?: MissionDefinitionWhereInput | MissionDefinitionWhereInput[]
    id?: StringFilter<"MissionDefinition"> | string
    createdAt?: DateTimeFilter<"MissionDefinition"> | Date | string
    updatedAt?: DateTimeFilter<"MissionDefinition"> | Date | string
    title?: StringFilter<"MissionDefinition"> | string
    prompt?: StringFilter<"MissionDefinition"> | string
    type?: StringFilter<"MissionDefinition"> | string
    minEvidence?: IntFilter<"MissionDefinition"> | number
    tags?: StringNullableListFilter<"MissionDefinition">
    active?: BoolFilter<"MissionDefinition"> | boolean
    missionRuns?: MissionRunListRelationFilter
  }

  export type MissionDefinitionOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    prompt?: SortOrder
    type?: SortOrder
    minEvidence?: SortOrder
    tags?: SortOrder
    active?: SortOrder
    missionRuns?: MissionRunOrderByRelationAggregateInput
  }

  export type MissionDefinitionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MissionDefinitionWhereInput | MissionDefinitionWhereInput[]
    OR?: MissionDefinitionWhereInput[]
    NOT?: MissionDefinitionWhereInput | MissionDefinitionWhereInput[]
    createdAt?: DateTimeFilter<"MissionDefinition"> | Date | string
    updatedAt?: DateTimeFilter<"MissionDefinition"> | Date | string
    title?: StringFilter<"MissionDefinition"> | string
    prompt?: StringFilter<"MissionDefinition"> | string
    type?: StringFilter<"MissionDefinition"> | string
    minEvidence?: IntFilter<"MissionDefinition"> | number
    tags?: StringNullableListFilter<"MissionDefinition">
    active?: BoolFilter<"MissionDefinition"> | boolean
    missionRuns?: MissionRunListRelationFilter
  }, "id">

  export type MissionDefinitionOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    prompt?: SortOrder
    type?: SortOrder
    minEvidence?: SortOrder
    tags?: SortOrder
    active?: SortOrder
    _count?: MissionDefinitionCountOrderByAggregateInput
    _avg?: MissionDefinitionAvgOrderByAggregateInput
    _max?: MissionDefinitionMaxOrderByAggregateInput
    _min?: MissionDefinitionMinOrderByAggregateInput
    _sum?: MissionDefinitionSumOrderByAggregateInput
  }

  export type MissionDefinitionScalarWhereWithAggregatesInput = {
    AND?: MissionDefinitionScalarWhereWithAggregatesInput | MissionDefinitionScalarWhereWithAggregatesInput[]
    OR?: MissionDefinitionScalarWhereWithAggregatesInput[]
    NOT?: MissionDefinitionScalarWhereWithAggregatesInput | MissionDefinitionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MissionDefinition"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MissionDefinition"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MissionDefinition"> | Date | string
    title?: StringWithAggregatesFilter<"MissionDefinition"> | string
    prompt?: StringWithAggregatesFilter<"MissionDefinition"> | string
    type?: StringWithAggregatesFilter<"MissionDefinition"> | string
    minEvidence?: IntWithAggregatesFilter<"MissionDefinition"> | number
    tags?: StringNullableListFilter<"MissionDefinition">
    active?: BoolWithAggregatesFilter<"MissionDefinition"> | boolean
  }

  export type MissionRunWhereInput = {
    AND?: MissionRunWhereInput | MissionRunWhereInput[]
    OR?: MissionRunWhereInput[]
    NOT?: MissionRunWhereInput | MissionRunWhereInput[]
    id?: StringFilter<"MissionRun"> | string
    createdAt?: DateTimeFilter<"MissionRun"> | Date | string
    updatedAt?: DateTimeFilter<"MissionRun"> | Date | string
    status?: EnumMissionRunStatusFilter<"MissionRun"> | $Enums.MissionRunStatus
    score?: FloatNullableFilter<"MissionRun"> | number | null
    feedback?: StringNullableFilter<"MissionRun"> | string | null
    payload?: JsonNullableFilter<"MissionRun">
    missionId?: StringFilter<"MissionRun"> | string
    userId?: StringFilter<"MissionRun"> | string
    sessionId?: StringNullableFilter<"MissionRun"> | string | null
    mission?: XOR<MissionDefinitionRelationFilter, MissionDefinitionWhereInput>
    user?: XOR<UserRelationFilter, UserWhereInput>
    session?: XOR<GameSessionNullableRelationFilter, GameSessionWhereInput> | null
    rewards?: RewardListRelationFilter
  }

  export type MissionRunOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    score?: SortOrderInput | SortOrder
    feedback?: SortOrderInput | SortOrder
    payload?: SortOrderInput | SortOrder
    missionId?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    mission?: MissionDefinitionOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
    session?: GameSessionOrderByWithRelationInput
    rewards?: RewardOrderByRelationAggregateInput
  }

  export type MissionRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MissionRunWhereInput | MissionRunWhereInput[]
    OR?: MissionRunWhereInput[]
    NOT?: MissionRunWhereInput | MissionRunWhereInput[]
    createdAt?: DateTimeFilter<"MissionRun"> | Date | string
    updatedAt?: DateTimeFilter<"MissionRun"> | Date | string
    status?: EnumMissionRunStatusFilter<"MissionRun"> | $Enums.MissionRunStatus
    score?: FloatNullableFilter<"MissionRun"> | number | null
    feedback?: StringNullableFilter<"MissionRun"> | string | null
    payload?: JsonNullableFilter<"MissionRun">
    missionId?: StringFilter<"MissionRun"> | string
    userId?: StringFilter<"MissionRun"> | string
    sessionId?: StringNullableFilter<"MissionRun"> | string | null
    mission?: XOR<MissionDefinitionRelationFilter, MissionDefinitionWhereInput>
    user?: XOR<UserRelationFilter, UserWhereInput>
    session?: XOR<GameSessionNullableRelationFilter, GameSessionWhereInput> | null
    rewards?: RewardListRelationFilter
  }, "id">

  export type MissionRunOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    score?: SortOrderInput | SortOrder
    feedback?: SortOrderInput | SortOrder
    payload?: SortOrderInput | SortOrder
    missionId?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    _count?: MissionRunCountOrderByAggregateInput
    _avg?: MissionRunAvgOrderByAggregateInput
    _max?: MissionRunMaxOrderByAggregateInput
    _min?: MissionRunMinOrderByAggregateInput
    _sum?: MissionRunSumOrderByAggregateInput
  }

  export type MissionRunScalarWhereWithAggregatesInput = {
    AND?: MissionRunScalarWhereWithAggregatesInput | MissionRunScalarWhereWithAggregatesInput[]
    OR?: MissionRunScalarWhereWithAggregatesInput[]
    NOT?: MissionRunScalarWhereWithAggregatesInput | MissionRunScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MissionRun"> | string
    createdAt?: DateTimeWithAggregatesFilter<"MissionRun"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MissionRun"> | Date | string
    status?: EnumMissionRunStatusWithAggregatesFilter<"MissionRun"> | $Enums.MissionRunStatus
    score?: FloatNullableWithAggregatesFilter<"MissionRun"> | number | null
    feedback?: StringNullableWithAggregatesFilter<"MissionRun"> | string | null
    payload?: JsonNullableWithAggregatesFilter<"MissionRun">
    missionId?: StringWithAggregatesFilter<"MissionRun"> | string
    userId?: StringWithAggregatesFilter<"MissionRun"> | string
    sessionId?: StringNullableWithAggregatesFilter<"MissionRun"> | string | null
  }

  export type RewardWhereInput = {
    AND?: RewardWhereInput | RewardWhereInput[]
    OR?: RewardWhereInput[]
    NOT?: RewardWhereInput | RewardWhereInput[]
    id?: StringFilter<"Reward"> | string
    createdAt?: DateTimeFilter<"Reward"> | Date | string
    type?: EnumRewardTypeFilter<"Reward"> | $Enums.RewardType
    amount?: FloatFilter<"Reward"> | number
    metadata?: JsonNullableFilter<"Reward">
    userId?: StringFilter<"Reward"> | string
    missionRunId?: StringNullableFilter<"Reward"> | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    missionRun?: XOR<MissionRunNullableRelationFilter, MissionRunWhereInput> | null
  }

  export type RewardOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    metadata?: SortOrderInput | SortOrder
    userId?: SortOrder
    missionRunId?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    missionRun?: MissionRunOrderByWithRelationInput
  }

  export type RewardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RewardWhereInput | RewardWhereInput[]
    OR?: RewardWhereInput[]
    NOT?: RewardWhereInput | RewardWhereInput[]
    createdAt?: DateTimeFilter<"Reward"> | Date | string
    type?: EnumRewardTypeFilter<"Reward"> | $Enums.RewardType
    amount?: FloatFilter<"Reward"> | number
    metadata?: JsonNullableFilter<"Reward">
    userId?: StringFilter<"Reward"> | string
    missionRunId?: StringNullableFilter<"Reward"> | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
    missionRun?: XOR<MissionRunNullableRelationFilter, MissionRunWhereInput> | null
  }, "id">

  export type RewardOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    metadata?: SortOrderInput | SortOrder
    userId?: SortOrder
    missionRunId?: SortOrderInput | SortOrder
    _count?: RewardCountOrderByAggregateInput
    _avg?: RewardAvgOrderByAggregateInput
    _max?: RewardMaxOrderByAggregateInput
    _min?: RewardMinOrderByAggregateInput
    _sum?: RewardSumOrderByAggregateInput
  }

  export type RewardScalarWhereWithAggregatesInput = {
    AND?: RewardScalarWhereWithAggregatesInput | RewardScalarWhereWithAggregatesInput[]
    OR?: RewardScalarWhereWithAggregatesInput[]
    NOT?: RewardScalarWhereWithAggregatesInput | RewardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Reward"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Reward"> | Date | string
    type?: EnumRewardTypeWithAggregatesFilter<"Reward"> | $Enums.RewardType
    amount?: FloatWithAggregatesFilter<"Reward"> | number
    metadata?: JsonNullableWithAggregatesFilter<"Reward">
    userId?: StringWithAggregatesFilter<"Reward"> | string
    missionRunId?: StringNullableWithAggregatesFilter<"Reward"> | string | null
  }

  export type UserCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionCreateNestedManyWithoutUserInput
    threads?: ThreadCreateNestedManyWithoutUserInput
    notes?: AgentNoteCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunCreateNestedManyWithoutUserInput
    rewards?: RewardCreateNestedManyWithoutUserInput
    profile?: PlayerProfileCreateNestedOneWithoutUserInput
    experiments?: ExperimentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    threads?: ThreadUncheckedCreateNestedManyWithoutUserInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutUserInput
    rewards?: RewardUncheckedCreateNestedManyWithoutUserInput
    profile?: PlayerProfileUncheckedCreateNestedOneWithoutUserInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUpdateManyWithoutUserNestedInput
    threads?: ThreadUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUpdateManyWithoutUserNestedInput
    rewards?: RewardUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    threads?: ThreadUncheckedUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutUserNestedInput
    rewards?: RewardUncheckedUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUncheckedUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SessionCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    token: string
    user: UserCreateNestedOneWithoutSessionsInput
  }

  export type SessionUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    token: string
  }

  export type SessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    user?: UserUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
  }

  export type SessionCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    token: string
  }

  export type SessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
  }

  export type SessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
  }

  export type ThreadCreateInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    accessTier?: number
    user: UserCreateNestedOneWithoutThreadsInput
    messages?: MessageCreateNestedManyWithoutThreadInput
    notes?: AgentNoteCreateNestedManyWithoutThreadInput
    experiments?: ExperimentCreateNestedManyWithoutThreadInput
  }

  export type ThreadUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    userId: string
    accessTier?: number
    messages?: MessageUncheckedCreateNestedManyWithoutThreadInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutThreadInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutThreadInput
  }

  export type ThreadUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    accessTier?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutThreadsNestedInput
    messages?: MessageUpdateManyWithoutThreadNestedInput
    notes?: AgentNoteUpdateManyWithoutThreadNestedInput
    experiments?: ExperimentUpdateManyWithoutThreadNestedInput
  }

  export type ThreadUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    userId?: StringFieldUpdateOperationsInput | string
    accessTier?: IntFieldUpdateOperationsInput | number
    messages?: MessageUncheckedUpdateManyWithoutThreadNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutThreadNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutThreadNestedInput
  }

  export type ThreadCreateManyInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    userId: string
    accessTier?: number
  }

  export type ThreadUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    accessTier?: IntFieldUpdateOperationsInput | number
  }

  export type ThreadUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    userId?: StringFieldUpdateOperationsInput | string
    accessTier?: IntFieldUpdateOperationsInput | number
  }

  export type MessageCreateInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
    thread: ThreadCreateNestedOneWithoutMessagesInput
  }

  export type MessageUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
    threadId: string
  }

  export type MessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    thread?: ThreadUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type MessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    threadId?: StringFieldUpdateOperationsInput | string
  }

  export type MessageCreateManyInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
    threadId: string
  }

  export type MessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
  }

  export type MessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    threadId?: StringFieldUpdateOperationsInput | string
  }

  export type AgentNoteCreateInput = {
    id?: string
    createdAt?: Date | string
    key: string
    value: string
    user: UserCreateNestedOneWithoutNotesInput
    thread?: ThreadCreateNestedOneWithoutNotesInput
  }

  export type AgentNoteUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    userId: string
    threadId?: string | null
    key: string
    value: string
  }

  export type AgentNoteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    user?: UserUpdateOneRequiredWithoutNotesNestedInput
    thread?: ThreadUpdateOneWithoutNotesNestedInput
  }

  export type AgentNoteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type AgentNoteCreateManyInput = {
    id?: string
    createdAt?: Date | string
    userId: string
    threadId?: string | null
    key: string
    value: string
  }

  export type AgentNoteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type AgentNoteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type ExperimentCreateInput = {
    id?: string
    createdAt?: Date | string
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
    user: UserCreateNestedOneWithoutExperimentsInput
    thread?: ThreadCreateNestedOneWithoutExperimentsInput
    events?: ExperimentEventCreateNestedManyWithoutExperimentInput
  }

  export type ExperimentUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    userId: string
    threadId?: string | null
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
    events?: ExperimentEventUncheckedCreateNestedManyWithoutExperimentInput
  }

  export type ExperimentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutExperimentsNestedInput
    thread?: ThreadUpdateOneWithoutExperimentsNestedInput
    events?: ExperimentEventUpdateManyWithoutExperimentNestedInput
  }

  export type ExperimentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    events?: ExperimentEventUncheckedUpdateManyWithoutExperimentNestedInput
  }

  export type ExperimentCreateManyInput = {
    id?: string
    createdAt?: Date | string
    userId: string
    threadId?: string | null
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
  }

  export type ExperimentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExperimentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExperimentEventCreateInput = {
    id?: string
    createdAt?: Date | string
    observation?: string | null
    result?: string | null
    score?: number | null
    experiment: ExperimentCreateNestedOneWithoutEventsInput
  }

  export type ExperimentEventUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    experimentId: string
    observation?: string | null
    result?: string | null
    score?: number | null
  }

  export type ExperimentEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    observation?: NullableStringFieldUpdateOperationsInput | string | null
    result?: NullableStringFieldUpdateOperationsInput | string | null
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    experiment?: ExperimentUpdateOneRequiredWithoutEventsNestedInput
  }

  export type ExperimentEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    experimentId?: StringFieldUpdateOperationsInput | string
    observation?: NullableStringFieldUpdateOperationsInput | string | null
    result?: NullableStringFieldUpdateOperationsInput | string | null
    score?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ExperimentEventCreateManyInput = {
    id?: string
    createdAt?: Date | string
    experimentId: string
    observation?: string | null
    result?: string | null
    score?: number | null
  }

  export type ExperimentEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    observation?: NullableStringFieldUpdateOperationsInput | string | null
    result?: NullableStringFieldUpdateOperationsInput | string | null
    score?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ExperimentEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    experimentId?: StringFieldUpdateOperationsInput | string
    observation?: NullableStringFieldUpdateOperationsInput | string | null
    result?: NullableStringFieldUpdateOperationsInput | string | null
    score?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type GameSessionCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    user: UserCreateNestedOneWithoutGameSessionsInput
    messages?: GameMessageCreateNestedManyWithoutGameSessionInput
    missionRuns?: MissionRunCreateNestedManyWithoutSessionInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutSessionInput
  }

  export type GameSessionUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    userId: string
    messages?: GameMessageUncheckedCreateNestedManyWithoutGameSessionInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutSessionInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutSessionInput
  }

  export type GameSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutGameSessionsNestedInput
    messages?: GameMessageUpdateManyWithoutGameSessionNestedInput
    missionRuns?: MissionRunUpdateManyWithoutSessionNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutSessionNestedInput
  }

  export type GameSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    messages?: GameMessageUncheckedUpdateManyWithoutGameSessionNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutSessionNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type GameSessionCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    userId: string
  }

  export type GameSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GameSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type GameMessageCreateInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
    gameSession: GameSessionCreateNestedOneWithoutMessagesInput
  }

  export type GameMessageUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
    gameSessionId: string
  }

  export type GameMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    gameSession?: GameSessionUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type GameMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    gameSessionId?: StringFieldUpdateOperationsInput | string
  }

  export type GameMessageCreateManyInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
    gameSessionId: string
  }

  export type GameMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
  }

  export type GameMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    gameSessionId?: StringFieldUpdateOperationsInput | string
  }

  export type MemoryEventCreateInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    user: UserCreateNestedOneWithoutMemoryEventsInput
    session?: GameSessionCreateNestedOneWithoutMemoryEventsInput
    embeddings?: MemoryEmbeddingCreateNestedManyWithoutMemoryInput
  }

  export type MemoryEventUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    userId: string
    sessionId?: string | null
    embeddings?: MemoryEmbeddingUncheckedCreateNestedManyWithoutMemoryInput
  }

  export type MemoryEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    user?: UserUpdateOneRequiredWithoutMemoryEventsNestedInput
    session?: GameSessionUpdateOneWithoutMemoryEventsNestedInput
    embeddings?: MemoryEmbeddingUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    embeddings?: MemoryEmbeddingUncheckedUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryEventCreateManyInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    userId: string
    sessionId?: string | null
  }

  export type MemoryEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
  }

  export type MemoryEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MemoryEmbeddingCreateInput = {
    id?: string
    createdAt?: Date | string
    provider?: string | null
    dimensions?: number | null
    vector: JsonNullValueInput | InputJsonValue
    memory: MemoryEventCreateNestedOneWithoutEmbeddingsInput
  }

  export type MemoryEmbeddingUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    provider?: string | null
    dimensions?: number | null
    vector: JsonNullValueInput | InputJsonValue
    memoryEventId: string
  }

  export type MemoryEmbeddingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableIntFieldUpdateOperationsInput | number | null
    vector?: JsonNullValueInput | InputJsonValue
    memory?: MemoryEventUpdateOneRequiredWithoutEmbeddingsNestedInput
  }

  export type MemoryEmbeddingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableIntFieldUpdateOperationsInput | number | null
    vector?: JsonNullValueInput | InputJsonValue
    memoryEventId?: StringFieldUpdateOperationsInput | string
  }

  export type MemoryEmbeddingCreateManyInput = {
    id?: string
    createdAt?: Date | string
    provider?: string | null
    dimensions?: number | null
    vector: JsonNullValueInput | InputJsonValue
    memoryEventId: string
  }

  export type MemoryEmbeddingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableIntFieldUpdateOperationsInput | number | null
    vector?: JsonNullValueInput | InputJsonValue
  }

  export type MemoryEmbeddingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableIntFieldUpdateOperationsInput | number | null
    vector?: JsonNullValueInput | InputJsonValue
    memoryEventId?: StringFieldUpdateOperationsInput | string
  }

  export type PlayerProfileCreateInput = {
    id?: string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProfileInput
  }

  export type PlayerProfileUncheckedCreateInput = {
    id?: string
    userId: string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type PlayerProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProfileNestedInput
  }

  export type PlayerProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerProfileCreateManyInput = {
    id?: string
    userId: string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type PlayerProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MissionDefinitionCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    prompt: string
    type?: string
    minEvidence?: number
    tags?: MissionDefinitionCreatetagsInput | string[]
    active?: boolean
    missionRuns?: MissionRunCreateNestedManyWithoutMissionInput
  }

  export type MissionDefinitionUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    prompt: string
    type?: string
    minEvidence?: number
    tags?: MissionDefinitionCreatetagsInput | string[]
    active?: boolean
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutMissionInput
  }

  export type MissionDefinitionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    prompt?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    minEvidence?: IntFieldUpdateOperationsInput | number
    tags?: MissionDefinitionUpdatetagsInput | string[]
    active?: BoolFieldUpdateOperationsInput | boolean
    missionRuns?: MissionRunUpdateManyWithoutMissionNestedInput
  }

  export type MissionDefinitionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    prompt?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    minEvidence?: IntFieldUpdateOperationsInput | number
    tags?: MissionDefinitionUpdatetagsInput | string[]
    active?: BoolFieldUpdateOperationsInput | boolean
    missionRuns?: MissionRunUncheckedUpdateManyWithoutMissionNestedInput
  }

  export type MissionDefinitionCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    prompt: string
    type?: string
    minEvidence?: number
    tags?: MissionDefinitionCreatetagsInput | string[]
    active?: boolean
  }

  export type MissionDefinitionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    prompt?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    minEvidence?: IntFieldUpdateOperationsInput | number
    tags?: MissionDefinitionUpdatetagsInput | string[]
    active?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MissionDefinitionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    prompt?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    minEvidence?: IntFieldUpdateOperationsInput | number
    tags?: MissionDefinitionUpdatetagsInput | string[]
    active?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MissionRunCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    mission: MissionDefinitionCreateNestedOneWithoutMissionRunsInput
    user: UserCreateNestedOneWithoutMissionRunsInput
    session?: GameSessionCreateNestedOneWithoutMissionRunsInput
    rewards?: RewardCreateNestedManyWithoutMissionRunInput
  }

  export type MissionRunUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId: string
    userId: string
    sessionId?: string | null
    rewards?: RewardUncheckedCreateNestedManyWithoutMissionRunInput
  }

  export type MissionRunUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    mission?: MissionDefinitionUpdateOneRequiredWithoutMissionRunsNestedInput
    user?: UserUpdateOneRequiredWithoutMissionRunsNestedInput
    session?: GameSessionUpdateOneWithoutMissionRunsNestedInput
    rewards?: RewardUpdateManyWithoutMissionRunNestedInput
  }

  export type MissionRunUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    rewards?: RewardUncheckedUpdateManyWithoutMissionRunNestedInput
  }

  export type MissionRunCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId: string
    userId: string
    sessionId?: string | null
  }

  export type MissionRunUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MissionRunUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RewardCreateInput = {
    id?: string
    createdAt?: Date | string
    type?: $Enums.RewardType
    amount?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    user: UserCreateNestedOneWithoutRewardsInput
    missionRun?: MissionRunCreateNestedOneWithoutRewardsInput
  }

  export type RewardUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    type?: $Enums.RewardType
    amount?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    userId: string
    missionRunId?: string | null
  }

  export type RewardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumRewardTypeFieldUpdateOperationsInput | $Enums.RewardType
    amount?: FloatFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    user?: UserUpdateOneRequiredWithoutRewardsNestedInput
    missionRun?: MissionRunUpdateOneWithoutRewardsNestedInput
  }

  export type RewardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumRewardTypeFieldUpdateOperationsInput | $Enums.RewardType
    amount?: FloatFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    userId?: StringFieldUpdateOperationsInput | string
    missionRunId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RewardCreateManyInput = {
    id?: string
    createdAt?: Date | string
    type?: $Enums.RewardType
    amount?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    userId: string
    missionRunId?: string | null
  }

  export type RewardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumRewardTypeFieldUpdateOperationsInput | $Enums.RewardType
    amount?: FloatFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type RewardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumRewardTypeFieldUpdateOperationsInput | $Enums.RewardType
    amount?: FloatFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    userId?: StringFieldUpdateOperationsInput | string
    missionRunId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SessionListRelationFilter = {
    every?: SessionWhereInput
    some?: SessionWhereInput
    none?: SessionWhereInput
  }

  export type ThreadListRelationFilter = {
    every?: ThreadWhereInput
    some?: ThreadWhereInput
    none?: ThreadWhereInput
  }

  export type AgentNoteListRelationFilter = {
    every?: AgentNoteWhereInput
    some?: AgentNoteWhereInput
    none?: AgentNoteWhereInput
  }

  export type GameSessionListRelationFilter = {
    every?: GameSessionWhereInput
    some?: GameSessionWhereInput
    none?: GameSessionWhereInput
  }

  export type MemoryEventListRelationFilter = {
    every?: MemoryEventWhereInput
    some?: MemoryEventWhereInput
    none?: MemoryEventWhereInput
  }

  export type MissionRunListRelationFilter = {
    every?: MissionRunWhereInput
    some?: MissionRunWhereInput
    none?: MissionRunWhereInput
  }

  export type RewardListRelationFilter = {
    every?: RewardWhereInput
    some?: RewardWhereInput
    none?: RewardWhereInput
  }

  export type PlayerProfileNullableRelationFilter = {
    is?: PlayerProfileWhereInput | null
    isNot?: PlayerProfileWhereInput | null
  }

  export type ExperimentListRelationFilter = {
    every?: ExperimentWhereInput
    some?: ExperimentWhereInput
    none?: ExperimentWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ThreadOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgentNoteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GameSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemoryEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MissionRunOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RewardOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ExperimentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    email?: SortOrder
    handle?: SortOrder
    role?: SortOrder
    consentedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    email?: SortOrder
    handle?: SortOrder
    role?: SortOrder
    consentedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    email?: SortOrder
    handle?: SortOrder
    role?: SortOrder
    consentedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    token?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    token?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    token?: SortOrder
  }

  export type EnumThreadKindFilter<$PrismaModel = never> = {
    equals?: $Enums.ThreadKind | EnumThreadKindFieldRefInput<$PrismaModel>
    in?: $Enums.ThreadKind[] | ListEnumThreadKindFieldRefInput<$PrismaModel>
    notIn?: $Enums.ThreadKind[] | ListEnumThreadKindFieldRefInput<$PrismaModel>
    not?: NestedEnumThreadKindFilter<$PrismaModel> | $Enums.ThreadKind
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type MessageListRelationFilter = {
    every?: MessageWhereInput
    some?: MessageWhereInput
    none?: MessageWhereInput
  }

  export type MessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ThreadCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    archivedAt?: SortOrder
    kind?: SortOrder
    userId?: SortOrder
    accessTier?: SortOrder
  }

  export type ThreadAvgOrderByAggregateInput = {
    accessTier?: SortOrder
  }

  export type ThreadMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    archivedAt?: SortOrder
    kind?: SortOrder
    userId?: SortOrder
    accessTier?: SortOrder
  }

  export type ThreadMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    archivedAt?: SortOrder
    kind?: SortOrder
    userId?: SortOrder
    accessTier?: SortOrder
  }

  export type ThreadSumOrderByAggregateInput = {
    accessTier?: SortOrder
  }

  export type EnumThreadKindWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ThreadKind | EnumThreadKindFieldRefInput<$PrismaModel>
    in?: $Enums.ThreadKind[] | ListEnumThreadKindFieldRefInput<$PrismaModel>
    notIn?: $Enums.ThreadKind[] | ListEnumThreadKindFieldRefInput<$PrismaModel>
    not?: NestedEnumThreadKindWithAggregatesFilter<$PrismaModel> | $Enums.ThreadKind
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumThreadKindFilter<$PrismaModel>
    _max?: NestedEnumThreadKindFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type ThreadRelationFilter = {
    is?: ThreadWhereInput
    isNot?: ThreadWhereInput
  }

  export type MessageCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    role?: SortOrder
    content?: SortOrder
    threadId?: SortOrder
  }

  export type MessageMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    role?: SortOrder
    content?: SortOrder
    threadId?: SortOrder
  }

  export type MessageMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    role?: SortOrder
    content?: SortOrder
    threadId?: SortOrder
  }

  export type ThreadNullableRelationFilter = {
    is?: ThreadWhereInput | null
    isNot?: ThreadWhereInput | null
  }

  export type AgentNoteCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    threadId?: SortOrder
    key?: SortOrder
    value?: SortOrder
  }

  export type AgentNoteMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    threadId?: SortOrder
    key?: SortOrder
    value?: SortOrder
  }

  export type AgentNoteMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    threadId?: SortOrder
    key?: SortOrder
    value?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type ExperimentEventListRelationFilter = {
    every?: ExperimentEventWhereInput
    some?: ExperimentEventWhereInput
    none?: ExperimentEventWhereInput
  }

  export type ExperimentEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ExperimentCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    threadId?: SortOrder
    hypothesis?: SortOrder
    task?: SortOrder
    successCriteria?: SortOrder
    timeoutS?: SortOrder
    title?: SortOrder
  }

  export type ExperimentAvgOrderByAggregateInput = {
    timeoutS?: SortOrder
  }

  export type ExperimentMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    threadId?: SortOrder
    hypothesis?: SortOrder
    task?: SortOrder
    successCriteria?: SortOrder
    timeoutS?: SortOrder
    title?: SortOrder
  }

  export type ExperimentMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    userId?: SortOrder
    threadId?: SortOrder
    hypothesis?: SortOrder
    task?: SortOrder
    successCriteria?: SortOrder
    timeoutS?: SortOrder
    title?: SortOrder
  }

  export type ExperimentSumOrderByAggregateInput = {
    timeoutS?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type ExperimentRelationFilter = {
    is?: ExperimentWhereInput
    isNot?: ExperimentWhereInput
  }

  export type ExperimentEventCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    experimentId?: SortOrder
    observation?: SortOrder
    result?: SortOrder
    score?: SortOrder
  }

  export type ExperimentEventAvgOrderByAggregateInput = {
    score?: SortOrder
  }

  export type ExperimentEventMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    experimentId?: SortOrder
    observation?: SortOrder
    result?: SortOrder
    score?: SortOrder
  }

  export type ExperimentEventMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    experimentId?: SortOrder
    observation?: SortOrder
    result?: SortOrder
    score?: SortOrder
  }

  export type ExperimentEventSumOrderByAggregateInput = {
    score?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumSessionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SessionStatus | EnumSessionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SessionStatus[] | ListEnumSessionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SessionStatus[] | ListEnumSessionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSessionStatusFilter<$PrismaModel> | $Enums.SessionStatus
  }

  export type GameMessageListRelationFilter = {
    every?: GameMessageWhereInput
    some?: GameMessageWhereInput
    none?: GameMessageWhereInput
  }

  export type GameMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GameSessionCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    summary?: SortOrder
    userId?: SortOrder
  }

  export type GameSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    summary?: SortOrder
    userId?: SortOrder
  }

  export type GameSessionMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    summary?: SortOrder
    userId?: SortOrder
  }

  export type EnumSessionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SessionStatus | EnumSessionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SessionStatus[] | ListEnumSessionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SessionStatus[] | ListEnumSessionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSessionStatusWithAggregatesFilter<$PrismaModel> | $Enums.SessionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSessionStatusFilter<$PrismaModel>
    _max?: NestedEnumSessionStatusFilter<$PrismaModel>
  }

  export type GameSessionRelationFilter = {
    is?: GameSessionWhereInput
    isNot?: GameSessionWhereInput
  }

  export type GameMessageCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    role?: SortOrder
    content?: SortOrder
    gameSessionId?: SortOrder
  }

  export type GameMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    role?: SortOrder
    content?: SortOrder
    gameSessionId?: SortOrder
  }

  export type GameMessageMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    role?: SortOrder
    content?: SortOrder
    gameSessionId?: SortOrder
  }

  export type EnumMemoryEventTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryEventType | EnumMemoryEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryEventType[] | ListEnumMemoryEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemoryEventType[] | ListEnumMemoryEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMemoryEventTypeFilter<$PrismaModel> | $Enums.MemoryEventType
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type GameSessionNullableRelationFilter = {
    is?: GameSessionWhereInput | null
    isNot?: GameSessionWhereInput | null
  }

  export type MemoryEmbeddingListRelationFilter = {
    every?: MemoryEmbeddingWhereInput
    some?: MemoryEmbeddingWhereInput
    none?: MemoryEmbeddingWhereInput
  }

  export type MemoryEmbeddingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemoryEventCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    type?: SortOrder
    content?: SortOrder
    tags?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
  }

  export type MemoryEventMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    type?: SortOrder
    content?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
  }

  export type MemoryEventMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    type?: SortOrder
    content?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
  }

  export type EnumMemoryEventTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryEventType | EnumMemoryEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryEventType[] | ListEnumMemoryEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemoryEventType[] | ListEnumMemoryEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMemoryEventTypeWithAggregatesFilter<$PrismaModel> | $Enums.MemoryEventType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMemoryEventTypeFilter<$PrismaModel>
    _max?: NestedEnumMemoryEventTypeFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type MemoryEventRelationFilter = {
    is?: MemoryEventWhereInput
    isNot?: MemoryEventWhereInput
  }

  export type MemoryEmbeddingCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    provider?: SortOrder
    dimensions?: SortOrder
    vector?: SortOrder
    memoryEventId?: SortOrder
  }

  export type MemoryEmbeddingAvgOrderByAggregateInput = {
    dimensions?: SortOrder
  }

  export type MemoryEmbeddingMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    provider?: SortOrder
    dimensions?: SortOrder
    memoryEventId?: SortOrder
  }

  export type MemoryEmbeddingMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    provider?: SortOrder
    dimensions?: SortOrder
    memoryEventId?: SortOrder
  }

  export type MemoryEmbeddingSumOrderByAggregateInput = {
    dimensions?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type PlayerProfileCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    traits?: SortOrder
    skills?: SortOrder
    preferences?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlayerProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlayerProfileMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type MissionDefinitionCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    prompt?: SortOrder
    type?: SortOrder
    minEvidence?: SortOrder
    tags?: SortOrder
    active?: SortOrder
  }

  export type MissionDefinitionAvgOrderByAggregateInput = {
    minEvidence?: SortOrder
  }

  export type MissionDefinitionMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    prompt?: SortOrder
    type?: SortOrder
    minEvidence?: SortOrder
    active?: SortOrder
  }

  export type MissionDefinitionMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    title?: SortOrder
    prompt?: SortOrder
    type?: SortOrder
    minEvidence?: SortOrder
    active?: SortOrder
  }

  export type MissionDefinitionSumOrderByAggregateInput = {
    minEvidence?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumMissionRunStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MissionRunStatus | EnumMissionRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MissionRunStatus[] | ListEnumMissionRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MissionRunStatus[] | ListEnumMissionRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMissionRunStatusFilter<$PrismaModel> | $Enums.MissionRunStatus
  }

  export type MissionDefinitionRelationFilter = {
    is?: MissionDefinitionWhereInput
    isNot?: MissionDefinitionWhereInput
  }

  export type MissionRunCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    score?: SortOrder
    feedback?: SortOrder
    payload?: SortOrder
    missionId?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
  }

  export type MissionRunAvgOrderByAggregateInput = {
    score?: SortOrder
  }

  export type MissionRunMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    score?: SortOrder
    feedback?: SortOrder
    missionId?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
  }

  export type MissionRunMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    status?: SortOrder
    score?: SortOrder
    feedback?: SortOrder
    missionId?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
  }

  export type MissionRunSumOrderByAggregateInput = {
    score?: SortOrder
  }

  export type EnumMissionRunStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MissionRunStatus | EnumMissionRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MissionRunStatus[] | ListEnumMissionRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MissionRunStatus[] | ListEnumMissionRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMissionRunStatusWithAggregatesFilter<$PrismaModel> | $Enums.MissionRunStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMissionRunStatusFilter<$PrismaModel>
    _max?: NestedEnumMissionRunStatusFilter<$PrismaModel>
  }

  export type EnumRewardTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.RewardType | EnumRewardTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RewardType[] | ListEnumRewardTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RewardType[] | ListEnumRewardTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRewardTypeFilter<$PrismaModel> | $Enums.RewardType
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type MissionRunNullableRelationFilter = {
    is?: MissionRunWhereInput | null
    isNot?: MissionRunWhereInput | null
  }

  export type RewardCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    metadata?: SortOrder
    userId?: SortOrder
    missionRunId?: SortOrder
  }

  export type RewardAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type RewardMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    userId?: SortOrder
    missionRunId?: SortOrder
  }

  export type RewardMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    userId?: SortOrder
    missionRunId?: SortOrder
  }

  export type RewardSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type EnumRewardTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RewardType | EnumRewardTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RewardType[] | ListEnumRewardTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RewardType[] | ListEnumRewardTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRewardTypeWithAggregatesFilter<$PrismaModel> | $Enums.RewardType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRewardTypeFilter<$PrismaModel>
    _max?: NestedEnumRewardTypeFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type SessionCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type ThreadCreateNestedManyWithoutUserInput = {
    create?: XOR<ThreadCreateWithoutUserInput, ThreadUncheckedCreateWithoutUserInput> | ThreadCreateWithoutUserInput[] | ThreadUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ThreadCreateOrConnectWithoutUserInput | ThreadCreateOrConnectWithoutUserInput[]
    createMany?: ThreadCreateManyUserInputEnvelope
    connect?: ThreadWhereUniqueInput | ThreadWhereUniqueInput[]
  }

  export type AgentNoteCreateNestedManyWithoutUserInput = {
    create?: XOR<AgentNoteCreateWithoutUserInput, AgentNoteUncheckedCreateWithoutUserInput> | AgentNoteCreateWithoutUserInput[] | AgentNoteUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentNoteCreateOrConnectWithoutUserInput | AgentNoteCreateOrConnectWithoutUserInput[]
    createMany?: AgentNoteCreateManyUserInputEnvelope
    connect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
  }

  export type GameSessionCreateNestedManyWithoutUserInput = {
    create?: XOR<GameSessionCreateWithoutUserInput, GameSessionUncheckedCreateWithoutUserInput> | GameSessionCreateWithoutUserInput[] | GameSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GameSessionCreateOrConnectWithoutUserInput | GameSessionCreateOrConnectWithoutUserInput[]
    createMany?: GameSessionCreateManyUserInputEnvelope
    connect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
  }

  export type MemoryEventCreateNestedManyWithoutUserInput = {
    create?: XOR<MemoryEventCreateWithoutUserInput, MemoryEventUncheckedCreateWithoutUserInput> | MemoryEventCreateWithoutUserInput[] | MemoryEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemoryEventCreateOrConnectWithoutUserInput | MemoryEventCreateOrConnectWithoutUserInput[]
    createMany?: MemoryEventCreateManyUserInputEnvelope
    connect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
  }

  export type MissionRunCreateNestedManyWithoutUserInput = {
    create?: XOR<MissionRunCreateWithoutUserInput, MissionRunUncheckedCreateWithoutUserInput> | MissionRunCreateWithoutUserInput[] | MissionRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutUserInput | MissionRunCreateOrConnectWithoutUserInput[]
    createMany?: MissionRunCreateManyUserInputEnvelope
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
  }

  export type RewardCreateNestedManyWithoutUserInput = {
    create?: XOR<RewardCreateWithoutUserInput, RewardUncheckedCreateWithoutUserInput> | RewardCreateWithoutUserInput[] | RewardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RewardCreateOrConnectWithoutUserInput | RewardCreateOrConnectWithoutUserInput[]
    createMany?: RewardCreateManyUserInputEnvelope
    connect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
  }

  export type PlayerProfileCreateNestedOneWithoutUserInput = {
    create?: XOR<PlayerProfileCreateWithoutUserInput, PlayerProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: PlayerProfileCreateOrConnectWithoutUserInput
    connect?: PlayerProfileWhereUniqueInput
  }

  export type ExperimentCreateNestedManyWithoutUserInput = {
    create?: XOR<ExperimentCreateWithoutUserInput, ExperimentUncheckedCreateWithoutUserInput> | ExperimentCreateWithoutUserInput[] | ExperimentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ExperimentCreateOrConnectWithoutUserInput | ExperimentCreateOrConnectWithoutUserInput[]
    createMany?: ExperimentCreateManyUserInputEnvelope
    connect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
  }

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type ThreadUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ThreadCreateWithoutUserInput, ThreadUncheckedCreateWithoutUserInput> | ThreadCreateWithoutUserInput[] | ThreadUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ThreadCreateOrConnectWithoutUserInput | ThreadCreateOrConnectWithoutUserInput[]
    createMany?: ThreadCreateManyUserInputEnvelope
    connect?: ThreadWhereUniqueInput | ThreadWhereUniqueInput[]
  }

  export type AgentNoteUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AgentNoteCreateWithoutUserInput, AgentNoteUncheckedCreateWithoutUserInput> | AgentNoteCreateWithoutUserInput[] | AgentNoteUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentNoteCreateOrConnectWithoutUserInput | AgentNoteCreateOrConnectWithoutUserInput[]
    createMany?: AgentNoteCreateManyUserInputEnvelope
    connect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
  }

  export type GameSessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<GameSessionCreateWithoutUserInput, GameSessionUncheckedCreateWithoutUserInput> | GameSessionCreateWithoutUserInput[] | GameSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GameSessionCreateOrConnectWithoutUserInput | GameSessionCreateOrConnectWithoutUserInput[]
    createMany?: GameSessionCreateManyUserInputEnvelope
    connect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
  }

  export type MemoryEventUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MemoryEventCreateWithoutUserInput, MemoryEventUncheckedCreateWithoutUserInput> | MemoryEventCreateWithoutUserInput[] | MemoryEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemoryEventCreateOrConnectWithoutUserInput | MemoryEventCreateOrConnectWithoutUserInput[]
    createMany?: MemoryEventCreateManyUserInputEnvelope
    connect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
  }

  export type MissionRunUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MissionRunCreateWithoutUserInput, MissionRunUncheckedCreateWithoutUserInput> | MissionRunCreateWithoutUserInput[] | MissionRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutUserInput | MissionRunCreateOrConnectWithoutUserInput[]
    createMany?: MissionRunCreateManyUserInputEnvelope
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
  }

  export type RewardUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<RewardCreateWithoutUserInput, RewardUncheckedCreateWithoutUserInput> | RewardCreateWithoutUserInput[] | RewardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RewardCreateOrConnectWithoutUserInput | RewardCreateOrConnectWithoutUserInput[]
    createMany?: RewardCreateManyUserInputEnvelope
    connect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
  }

  export type PlayerProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<PlayerProfileCreateWithoutUserInput, PlayerProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: PlayerProfileCreateOrConnectWithoutUserInput
    connect?: PlayerProfileWhereUniqueInput
  }

  export type ExperimentUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ExperimentCreateWithoutUserInput, ExperimentUncheckedCreateWithoutUserInput> | ExperimentCreateWithoutUserInput[] | ExperimentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ExperimentCreateOrConnectWithoutUserInput | ExperimentCreateOrConnectWithoutUserInput[]
    createMany?: ExperimentCreateManyUserInputEnvelope
    connect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type ThreadUpdateManyWithoutUserNestedInput = {
    create?: XOR<ThreadCreateWithoutUserInput, ThreadUncheckedCreateWithoutUserInput> | ThreadCreateWithoutUserInput[] | ThreadUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ThreadCreateOrConnectWithoutUserInput | ThreadCreateOrConnectWithoutUserInput[]
    upsert?: ThreadUpsertWithWhereUniqueWithoutUserInput | ThreadUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ThreadCreateManyUserInputEnvelope
    set?: ThreadWhereUniqueInput | ThreadWhereUniqueInput[]
    disconnect?: ThreadWhereUniqueInput | ThreadWhereUniqueInput[]
    delete?: ThreadWhereUniqueInput | ThreadWhereUniqueInput[]
    connect?: ThreadWhereUniqueInput | ThreadWhereUniqueInput[]
    update?: ThreadUpdateWithWhereUniqueWithoutUserInput | ThreadUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ThreadUpdateManyWithWhereWithoutUserInput | ThreadUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ThreadScalarWhereInput | ThreadScalarWhereInput[]
  }

  export type AgentNoteUpdateManyWithoutUserNestedInput = {
    create?: XOR<AgentNoteCreateWithoutUserInput, AgentNoteUncheckedCreateWithoutUserInput> | AgentNoteCreateWithoutUserInput[] | AgentNoteUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentNoteCreateOrConnectWithoutUserInput | AgentNoteCreateOrConnectWithoutUserInput[]
    upsert?: AgentNoteUpsertWithWhereUniqueWithoutUserInput | AgentNoteUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AgentNoteCreateManyUserInputEnvelope
    set?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    disconnect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    delete?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    connect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    update?: AgentNoteUpdateWithWhereUniqueWithoutUserInput | AgentNoteUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AgentNoteUpdateManyWithWhereWithoutUserInput | AgentNoteUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AgentNoteScalarWhereInput | AgentNoteScalarWhereInput[]
  }

  export type GameSessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<GameSessionCreateWithoutUserInput, GameSessionUncheckedCreateWithoutUserInput> | GameSessionCreateWithoutUserInput[] | GameSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GameSessionCreateOrConnectWithoutUserInput | GameSessionCreateOrConnectWithoutUserInput[]
    upsert?: GameSessionUpsertWithWhereUniqueWithoutUserInput | GameSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: GameSessionCreateManyUserInputEnvelope
    set?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    disconnect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    delete?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    connect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    update?: GameSessionUpdateWithWhereUniqueWithoutUserInput | GameSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: GameSessionUpdateManyWithWhereWithoutUserInput | GameSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: GameSessionScalarWhereInput | GameSessionScalarWhereInput[]
  }

  export type MemoryEventUpdateManyWithoutUserNestedInput = {
    create?: XOR<MemoryEventCreateWithoutUserInput, MemoryEventUncheckedCreateWithoutUserInput> | MemoryEventCreateWithoutUserInput[] | MemoryEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemoryEventCreateOrConnectWithoutUserInput | MemoryEventCreateOrConnectWithoutUserInput[]
    upsert?: MemoryEventUpsertWithWhereUniqueWithoutUserInput | MemoryEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MemoryEventCreateManyUserInputEnvelope
    set?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    disconnect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    delete?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    connect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    update?: MemoryEventUpdateWithWhereUniqueWithoutUserInput | MemoryEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MemoryEventUpdateManyWithWhereWithoutUserInput | MemoryEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MemoryEventScalarWhereInput | MemoryEventScalarWhereInput[]
  }

  export type MissionRunUpdateManyWithoutUserNestedInput = {
    create?: XOR<MissionRunCreateWithoutUserInput, MissionRunUncheckedCreateWithoutUserInput> | MissionRunCreateWithoutUserInput[] | MissionRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutUserInput | MissionRunCreateOrConnectWithoutUserInput[]
    upsert?: MissionRunUpsertWithWhereUniqueWithoutUserInput | MissionRunUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MissionRunCreateManyUserInputEnvelope
    set?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    disconnect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    delete?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    update?: MissionRunUpdateWithWhereUniqueWithoutUserInput | MissionRunUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MissionRunUpdateManyWithWhereWithoutUserInput | MissionRunUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MissionRunScalarWhereInput | MissionRunScalarWhereInput[]
  }

  export type RewardUpdateManyWithoutUserNestedInput = {
    create?: XOR<RewardCreateWithoutUserInput, RewardUncheckedCreateWithoutUserInput> | RewardCreateWithoutUserInput[] | RewardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RewardCreateOrConnectWithoutUserInput | RewardCreateOrConnectWithoutUserInput[]
    upsert?: RewardUpsertWithWhereUniqueWithoutUserInput | RewardUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RewardCreateManyUserInputEnvelope
    set?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    disconnect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    delete?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    connect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    update?: RewardUpdateWithWhereUniqueWithoutUserInput | RewardUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RewardUpdateManyWithWhereWithoutUserInput | RewardUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RewardScalarWhereInput | RewardScalarWhereInput[]
  }

  export type PlayerProfileUpdateOneWithoutUserNestedInput = {
    create?: XOR<PlayerProfileCreateWithoutUserInput, PlayerProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: PlayerProfileCreateOrConnectWithoutUserInput
    upsert?: PlayerProfileUpsertWithoutUserInput
    disconnect?: PlayerProfileWhereInput | boolean
    delete?: PlayerProfileWhereInput | boolean
    connect?: PlayerProfileWhereUniqueInput
    update?: XOR<XOR<PlayerProfileUpdateToOneWithWhereWithoutUserInput, PlayerProfileUpdateWithoutUserInput>, PlayerProfileUncheckedUpdateWithoutUserInput>
  }

  export type ExperimentUpdateManyWithoutUserNestedInput = {
    create?: XOR<ExperimentCreateWithoutUserInput, ExperimentUncheckedCreateWithoutUserInput> | ExperimentCreateWithoutUserInput[] | ExperimentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ExperimentCreateOrConnectWithoutUserInput | ExperimentCreateOrConnectWithoutUserInput[]
    upsert?: ExperimentUpsertWithWhereUniqueWithoutUserInput | ExperimentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ExperimentCreateManyUserInputEnvelope
    set?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    disconnect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    delete?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    connect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    update?: ExperimentUpdateWithWhereUniqueWithoutUserInput | ExperimentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ExperimentUpdateManyWithWhereWithoutUserInput | ExperimentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ExperimentScalarWhereInput | ExperimentScalarWhereInput[]
  }

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type ThreadUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ThreadCreateWithoutUserInput, ThreadUncheckedCreateWithoutUserInput> | ThreadCreateWithoutUserInput[] | ThreadUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ThreadCreateOrConnectWithoutUserInput | ThreadCreateOrConnectWithoutUserInput[]
    upsert?: ThreadUpsertWithWhereUniqueWithoutUserInput | ThreadUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ThreadCreateManyUserInputEnvelope
    set?: ThreadWhereUniqueInput | ThreadWhereUniqueInput[]
    disconnect?: ThreadWhereUniqueInput | ThreadWhereUniqueInput[]
    delete?: ThreadWhereUniqueInput | ThreadWhereUniqueInput[]
    connect?: ThreadWhereUniqueInput | ThreadWhereUniqueInput[]
    update?: ThreadUpdateWithWhereUniqueWithoutUserInput | ThreadUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ThreadUpdateManyWithWhereWithoutUserInput | ThreadUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ThreadScalarWhereInput | ThreadScalarWhereInput[]
  }

  export type AgentNoteUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AgentNoteCreateWithoutUserInput, AgentNoteUncheckedCreateWithoutUserInput> | AgentNoteCreateWithoutUserInput[] | AgentNoteUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentNoteCreateOrConnectWithoutUserInput | AgentNoteCreateOrConnectWithoutUserInput[]
    upsert?: AgentNoteUpsertWithWhereUniqueWithoutUserInput | AgentNoteUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AgentNoteCreateManyUserInputEnvelope
    set?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    disconnect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    delete?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    connect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    update?: AgentNoteUpdateWithWhereUniqueWithoutUserInput | AgentNoteUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AgentNoteUpdateManyWithWhereWithoutUserInput | AgentNoteUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AgentNoteScalarWhereInput | AgentNoteScalarWhereInput[]
  }

  export type GameSessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<GameSessionCreateWithoutUserInput, GameSessionUncheckedCreateWithoutUserInput> | GameSessionCreateWithoutUserInput[] | GameSessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GameSessionCreateOrConnectWithoutUserInput | GameSessionCreateOrConnectWithoutUserInput[]
    upsert?: GameSessionUpsertWithWhereUniqueWithoutUserInput | GameSessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: GameSessionCreateManyUserInputEnvelope
    set?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    disconnect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    delete?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    connect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    update?: GameSessionUpdateWithWhereUniqueWithoutUserInput | GameSessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: GameSessionUpdateManyWithWhereWithoutUserInput | GameSessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: GameSessionScalarWhereInput | GameSessionScalarWhereInput[]
  }

  export type MemoryEventUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MemoryEventCreateWithoutUserInput, MemoryEventUncheckedCreateWithoutUserInput> | MemoryEventCreateWithoutUserInput[] | MemoryEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemoryEventCreateOrConnectWithoutUserInput | MemoryEventCreateOrConnectWithoutUserInput[]
    upsert?: MemoryEventUpsertWithWhereUniqueWithoutUserInput | MemoryEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MemoryEventCreateManyUserInputEnvelope
    set?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    disconnect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    delete?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    connect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    update?: MemoryEventUpdateWithWhereUniqueWithoutUserInput | MemoryEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MemoryEventUpdateManyWithWhereWithoutUserInput | MemoryEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MemoryEventScalarWhereInput | MemoryEventScalarWhereInput[]
  }

  export type MissionRunUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MissionRunCreateWithoutUserInput, MissionRunUncheckedCreateWithoutUserInput> | MissionRunCreateWithoutUserInput[] | MissionRunUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutUserInput | MissionRunCreateOrConnectWithoutUserInput[]
    upsert?: MissionRunUpsertWithWhereUniqueWithoutUserInput | MissionRunUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MissionRunCreateManyUserInputEnvelope
    set?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    disconnect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    delete?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    update?: MissionRunUpdateWithWhereUniqueWithoutUserInput | MissionRunUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MissionRunUpdateManyWithWhereWithoutUserInput | MissionRunUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MissionRunScalarWhereInput | MissionRunScalarWhereInput[]
  }

  export type RewardUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<RewardCreateWithoutUserInput, RewardUncheckedCreateWithoutUserInput> | RewardCreateWithoutUserInput[] | RewardUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RewardCreateOrConnectWithoutUserInput | RewardCreateOrConnectWithoutUserInput[]
    upsert?: RewardUpsertWithWhereUniqueWithoutUserInput | RewardUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RewardCreateManyUserInputEnvelope
    set?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    disconnect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    delete?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    connect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    update?: RewardUpdateWithWhereUniqueWithoutUserInput | RewardUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RewardUpdateManyWithWhereWithoutUserInput | RewardUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RewardScalarWhereInput | RewardScalarWhereInput[]
  }

  export type PlayerProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<PlayerProfileCreateWithoutUserInput, PlayerProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: PlayerProfileCreateOrConnectWithoutUserInput
    upsert?: PlayerProfileUpsertWithoutUserInput
    disconnect?: PlayerProfileWhereInput | boolean
    delete?: PlayerProfileWhereInput | boolean
    connect?: PlayerProfileWhereUniqueInput
    update?: XOR<XOR<PlayerProfileUpdateToOneWithWhereWithoutUserInput, PlayerProfileUpdateWithoutUserInput>, PlayerProfileUncheckedUpdateWithoutUserInput>
  }

  export type ExperimentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ExperimentCreateWithoutUserInput, ExperimentUncheckedCreateWithoutUserInput> | ExperimentCreateWithoutUserInput[] | ExperimentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ExperimentCreateOrConnectWithoutUserInput | ExperimentCreateOrConnectWithoutUserInput[]
    upsert?: ExperimentUpsertWithWhereUniqueWithoutUserInput | ExperimentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ExperimentCreateManyUserInputEnvelope
    set?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    disconnect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    delete?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    connect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    update?: ExperimentUpdateWithWhereUniqueWithoutUserInput | ExperimentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ExperimentUpdateManyWithWhereWithoutUserInput | ExperimentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ExperimentScalarWhereInput | ExperimentScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    upsert?: UserUpsertWithoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserCreateNestedOneWithoutThreadsInput = {
    create?: XOR<UserCreateWithoutThreadsInput, UserUncheckedCreateWithoutThreadsInput>
    connectOrCreate?: UserCreateOrConnectWithoutThreadsInput
    connect?: UserWhereUniqueInput
  }

  export type MessageCreateNestedManyWithoutThreadInput = {
    create?: XOR<MessageCreateWithoutThreadInput, MessageUncheckedCreateWithoutThreadInput> | MessageCreateWithoutThreadInput[] | MessageUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutThreadInput | MessageCreateOrConnectWithoutThreadInput[]
    createMany?: MessageCreateManyThreadInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type AgentNoteCreateNestedManyWithoutThreadInput = {
    create?: XOR<AgentNoteCreateWithoutThreadInput, AgentNoteUncheckedCreateWithoutThreadInput> | AgentNoteCreateWithoutThreadInput[] | AgentNoteUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: AgentNoteCreateOrConnectWithoutThreadInput | AgentNoteCreateOrConnectWithoutThreadInput[]
    createMany?: AgentNoteCreateManyThreadInputEnvelope
    connect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
  }

  export type ExperimentCreateNestedManyWithoutThreadInput = {
    create?: XOR<ExperimentCreateWithoutThreadInput, ExperimentUncheckedCreateWithoutThreadInput> | ExperimentCreateWithoutThreadInput[] | ExperimentUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: ExperimentCreateOrConnectWithoutThreadInput | ExperimentCreateOrConnectWithoutThreadInput[]
    createMany?: ExperimentCreateManyThreadInputEnvelope
    connect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
  }

  export type MessageUncheckedCreateNestedManyWithoutThreadInput = {
    create?: XOR<MessageCreateWithoutThreadInput, MessageUncheckedCreateWithoutThreadInput> | MessageCreateWithoutThreadInput[] | MessageUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutThreadInput | MessageCreateOrConnectWithoutThreadInput[]
    createMany?: MessageCreateManyThreadInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type AgentNoteUncheckedCreateNestedManyWithoutThreadInput = {
    create?: XOR<AgentNoteCreateWithoutThreadInput, AgentNoteUncheckedCreateWithoutThreadInput> | AgentNoteCreateWithoutThreadInput[] | AgentNoteUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: AgentNoteCreateOrConnectWithoutThreadInput | AgentNoteCreateOrConnectWithoutThreadInput[]
    createMany?: AgentNoteCreateManyThreadInputEnvelope
    connect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
  }

  export type ExperimentUncheckedCreateNestedManyWithoutThreadInput = {
    create?: XOR<ExperimentCreateWithoutThreadInput, ExperimentUncheckedCreateWithoutThreadInput> | ExperimentCreateWithoutThreadInput[] | ExperimentUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: ExperimentCreateOrConnectWithoutThreadInput | ExperimentCreateOrConnectWithoutThreadInput[]
    createMany?: ExperimentCreateManyThreadInputEnvelope
    connect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
  }

  export type EnumThreadKindFieldUpdateOperationsInput = {
    set?: $Enums.ThreadKind
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutThreadsNestedInput = {
    create?: XOR<UserCreateWithoutThreadsInput, UserUncheckedCreateWithoutThreadsInput>
    connectOrCreate?: UserCreateOrConnectWithoutThreadsInput
    upsert?: UserUpsertWithoutThreadsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutThreadsInput, UserUpdateWithoutThreadsInput>, UserUncheckedUpdateWithoutThreadsInput>
  }

  export type MessageUpdateManyWithoutThreadNestedInput = {
    create?: XOR<MessageCreateWithoutThreadInput, MessageUncheckedCreateWithoutThreadInput> | MessageCreateWithoutThreadInput[] | MessageUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutThreadInput | MessageCreateOrConnectWithoutThreadInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutThreadInput | MessageUpsertWithWhereUniqueWithoutThreadInput[]
    createMany?: MessageCreateManyThreadInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutThreadInput | MessageUpdateWithWhereUniqueWithoutThreadInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutThreadInput | MessageUpdateManyWithWhereWithoutThreadInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type AgentNoteUpdateManyWithoutThreadNestedInput = {
    create?: XOR<AgentNoteCreateWithoutThreadInput, AgentNoteUncheckedCreateWithoutThreadInput> | AgentNoteCreateWithoutThreadInput[] | AgentNoteUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: AgentNoteCreateOrConnectWithoutThreadInput | AgentNoteCreateOrConnectWithoutThreadInput[]
    upsert?: AgentNoteUpsertWithWhereUniqueWithoutThreadInput | AgentNoteUpsertWithWhereUniqueWithoutThreadInput[]
    createMany?: AgentNoteCreateManyThreadInputEnvelope
    set?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    disconnect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    delete?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    connect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    update?: AgentNoteUpdateWithWhereUniqueWithoutThreadInput | AgentNoteUpdateWithWhereUniqueWithoutThreadInput[]
    updateMany?: AgentNoteUpdateManyWithWhereWithoutThreadInput | AgentNoteUpdateManyWithWhereWithoutThreadInput[]
    deleteMany?: AgentNoteScalarWhereInput | AgentNoteScalarWhereInput[]
  }

  export type ExperimentUpdateManyWithoutThreadNestedInput = {
    create?: XOR<ExperimentCreateWithoutThreadInput, ExperimentUncheckedCreateWithoutThreadInput> | ExperimentCreateWithoutThreadInput[] | ExperimentUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: ExperimentCreateOrConnectWithoutThreadInput | ExperimentCreateOrConnectWithoutThreadInput[]
    upsert?: ExperimentUpsertWithWhereUniqueWithoutThreadInput | ExperimentUpsertWithWhereUniqueWithoutThreadInput[]
    createMany?: ExperimentCreateManyThreadInputEnvelope
    set?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    disconnect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    delete?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    connect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    update?: ExperimentUpdateWithWhereUniqueWithoutThreadInput | ExperimentUpdateWithWhereUniqueWithoutThreadInput[]
    updateMany?: ExperimentUpdateManyWithWhereWithoutThreadInput | ExperimentUpdateManyWithWhereWithoutThreadInput[]
    deleteMany?: ExperimentScalarWhereInput | ExperimentScalarWhereInput[]
  }

  export type MessageUncheckedUpdateManyWithoutThreadNestedInput = {
    create?: XOR<MessageCreateWithoutThreadInput, MessageUncheckedCreateWithoutThreadInput> | MessageCreateWithoutThreadInput[] | MessageUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutThreadInput | MessageCreateOrConnectWithoutThreadInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutThreadInput | MessageUpsertWithWhereUniqueWithoutThreadInput[]
    createMany?: MessageCreateManyThreadInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutThreadInput | MessageUpdateWithWhereUniqueWithoutThreadInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutThreadInput | MessageUpdateManyWithWhereWithoutThreadInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type AgentNoteUncheckedUpdateManyWithoutThreadNestedInput = {
    create?: XOR<AgentNoteCreateWithoutThreadInput, AgentNoteUncheckedCreateWithoutThreadInput> | AgentNoteCreateWithoutThreadInput[] | AgentNoteUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: AgentNoteCreateOrConnectWithoutThreadInput | AgentNoteCreateOrConnectWithoutThreadInput[]
    upsert?: AgentNoteUpsertWithWhereUniqueWithoutThreadInput | AgentNoteUpsertWithWhereUniqueWithoutThreadInput[]
    createMany?: AgentNoteCreateManyThreadInputEnvelope
    set?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    disconnect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    delete?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    connect?: AgentNoteWhereUniqueInput | AgentNoteWhereUniqueInput[]
    update?: AgentNoteUpdateWithWhereUniqueWithoutThreadInput | AgentNoteUpdateWithWhereUniqueWithoutThreadInput[]
    updateMany?: AgentNoteUpdateManyWithWhereWithoutThreadInput | AgentNoteUpdateManyWithWhereWithoutThreadInput[]
    deleteMany?: AgentNoteScalarWhereInput | AgentNoteScalarWhereInput[]
  }

  export type ExperimentUncheckedUpdateManyWithoutThreadNestedInput = {
    create?: XOR<ExperimentCreateWithoutThreadInput, ExperimentUncheckedCreateWithoutThreadInput> | ExperimentCreateWithoutThreadInput[] | ExperimentUncheckedCreateWithoutThreadInput[]
    connectOrCreate?: ExperimentCreateOrConnectWithoutThreadInput | ExperimentCreateOrConnectWithoutThreadInput[]
    upsert?: ExperimentUpsertWithWhereUniqueWithoutThreadInput | ExperimentUpsertWithWhereUniqueWithoutThreadInput[]
    createMany?: ExperimentCreateManyThreadInputEnvelope
    set?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    disconnect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    delete?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    connect?: ExperimentWhereUniqueInput | ExperimentWhereUniqueInput[]
    update?: ExperimentUpdateWithWhereUniqueWithoutThreadInput | ExperimentUpdateWithWhereUniqueWithoutThreadInput[]
    updateMany?: ExperimentUpdateManyWithWhereWithoutThreadInput | ExperimentUpdateManyWithWhereWithoutThreadInput[]
    deleteMany?: ExperimentScalarWhereInput | ExperimentScalarWhereInput[]
  }

  export type ThreadCreateNestedOneWithoutMessagesInput = {
    create?: XOR<ThreadCreateWithoutMessagesInput, ThreadUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: ThreadCreateOrConnectWithoutMessagesInput
    connect?: ThreadWhereUniqueInput
  }

  export type ThreadUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<ThreadCreateWithoutMessagesInput, ThreadUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: ThreadCreateOrConnectWithoutMessagesInput
    upsert?: ThreadUpsertWithoutMessagesInput
    connect?: ThreadWhereUniqueInput
    update?: XOR<XOR<ThreadUpdateToOneWithWhereWithoutMessagesInput, ThreadUpdateWithoutMessagesInput>, ThreadUncheckedUpdateWithoutMessagesInput>
  }

  export type UserCreateNestedOneWithoutNotesInput = {
    create?: XOR<UserCreateWithoutNotesInput, UserUncheckedCreateWithoutNotesInput>
    connectOrCreate?: UserCreateOrConnectWithoutNotesInput
    connect?: UserWhereUniqueInput
  }

  export type ThreadCreateNestedOneWithoutNotesInput = {
    create?: XOR<ThreadCreateWithoutNotesInput, ThreadUncheckedCreateWithoutNotesInput>
    connectOrCreate?: ThreadCreateOrConnectWithoutNotesInput
    connect?: ThreadWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutNotesNestedInput = {
    create?: XOR<UserCreateWithoutNotesInput, UserUncheckedCreateWithoutNotesInput>
    connectOrCreate?: UserCreateOrConnectWithoutNotesInput
    upsert?: UserUpsertWithoutNotesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutNotesInput, UserUpdateWithoutNotesInput>, UserUncheckedUpdateWithoutNotesInput>
  }

  export type ThreadUpdateOneWithoutNotesNestedInput = {
    create?: XOR<ThreadCreateWithoutNotesInput, ThreadUncheckedCreateWithoutNotesInput>
    connectOrCreate?: ThreadCreateOrConnectWithoutNotesInput
    upsert?: ThreadUpsertWithoutNotesInput
    disconnect?: ThreadWhereInput | boolean
    delete?: ThreadWhereInput | boolean
    connect?: ThreadWhereUniqueInput
    update?: XOR<XOR<ThreadUpdateToOneWithWhereWithoutNotesInput, ThreadUpdateWithoutNotesInput>, ThreadUncheckedUpdateWithoutNotesInput>
  }

  export type UserCreateNestedOneWithoutExperimentsInput = {
    create?: XOR<UserCreateWithoutExperimentsInput, UserUncheckedCreateWithoutExperimentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutExperimentsInput
    connect?: UserWhereUniqueInput
  }

  export type ThreadCreateNestedOneWithoutExperimentsInput = {
    create?: XOR<ThreadCreateWithoutExperimentsInput, ThreadUncheckedCreateWithoutExperimentsInput>
    connectOrCreate?: ThreadCreateOrConnectWithoutExperimentsInput
    connect?: ThreadWhereUniqueInput
  }

  export type ExperimentEventCreateNestedManyWithoutExperimentInput = {
    create?: XOR<ExperimentEventCreateWithoutExperimentInput, ExperimentEventUncheckedCreateWithoutExperimentInput> | ExperimentEventCreateWithoutExperimentInput[] | ExperimentEventUncheckedCreateWithoutExperimentInput[]
    connectOrCreate?: ExperimentEventCreateOrConnectWithoutExperimentInput | ExperimentEventCreateOrConnectWithoutExperimentInput[]
    createMany?: ExperimentEventCreateManyExperimentInputEnvelope
    connect?: ExperimentEventWhereUniqueInput | ExperimentEventWhereUniqueInput[]
  }

  export type ExperimentEventUncheckedCreateNestedManyWithoutExperimentInput = {
    create?: XOR<ExperimentEventCreateWithoutExperimentInput, ExperimentEventUncheckedCreateWithoutExperimentInput> | ExperimentEventCreateWithoutExperimentInput[] | ExperimentEventUncheckedCreateWithoutExperimentInput[]
    connectOrCreate?: ExperimentEventCreateOrConnectWithoutExperimentInput | ExperimentEventCreateOrConnectWithoutExperimentInput[]
    createMany?: ExperimentEventCreateManyExperimentInputEnvelope
    connect?: ExperimentEventWhereUniqueInput | ExperimentEventWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutExperimentsNestedInput = {
    create?: XOR<UserCreateWithoutExperimentsInput, UserUncheckedCreateWithoutExperimentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutExperimentsInput
    upsert?: UserUpsertWithoutExperimentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutExperimentsInput, UserUpdateWithoutExperimentsInput>, UserUncheckedUpdateWithoutExperimentsInput>
  }

  export type ThreadUpdateOneWithoutExperimentsNestedInput = {
    create?: XOR<ThreadCreateWithoutExperimentsInput, ThreadUncheckedCreateWithoutExperimentsInput>
    connectOrCreate?: ThreadCreateOrConnectWithoutExperimentsInput
    upsert?: ThreadUpsertWithoutExperimentsInput
    disconnect?: ThreadWhereInput | boolean
    delete?: ThreadWhereInput | boolean
    connect?: ThreadWhereUniqueInput
    update?: XOR<XOR<ThreadUpdateToOneWithWhereWithoutExperimentsInput, ThreadUpdateWithoutExperimentsInput>, ThreadUncheckedUpdateWithoutExperimentsInput>
  }

  export type ExperimentEventUpdateManyWithoutExperimentNestedInput = {
    create?: XOR<ExperimentEventCreateWithoutExperimentInput, ExperimentEventUncheckedCreateWithoutExperimentInput> | ExperimentEventCreateWithoutExperimentInput[] | ExperimentEventUncheckedCreateWithoutExperimentInput[]
    connectOrCreate?: ExperimentEventCreateOrConnectWithoutExperimentInput | ExperimentEventCreateOrConnectWithoutExperimentInput[]
    upsert?: ExperimentEventUpsertWithWhereUniqueWithoutExperimentInput | ExperimentEventUpsertWithWhereUniqueWithoutExperimentInput[]
    createMany?: ExperimentEventCreateManyExperimentInputEnvelope
    set?: ExperimentEventWhereUniqueInput | ExperimentEventWhereUniqueInput[]
    disconnect?: ExperimentEventWhereUniqueInput | ExperimentEventWhereUniqueInput[]
    delete?: ExperimentEventWhereUniqueInput | ExperimentEventWhereUniqueInput[]
    connect?: ExperimentEventWhereUniqueInput | ExperimentEventWhereUniqueInput[]
    update?: ExperimentEventUpdateWithWhereUniqueWithoutExperimentInput | ExperimentEventUpdateWithWhereUniqueWithoutExperimentInput[]
    updateMany?: ExperimentEventUpdateManyWithWhereWithoutExperimentInput | ExperimentEventUpdateManyWithWhereWithoutExperimentInput[]
    deleteMany?: ExperimentEventScalarWhereInput | ExperimentEventScalarWhereInput[]
  }

  export type ExperimentEventUncheckedUpdateManyWithoutExperimentNestedInput = {
    create?: XOR<ExperimentEventCreateWithoutExperimentInput, ExperimentEventUncheckedCreateWithoutExperimentInput> | ExperimentEventCreateWithoutExperimentInput[] | ExperimentEventUncheckedCreateWithoutExperimentInput[]
    connectOrCreate?: ExperimentEventCreateOrConnectWithoutExperimentInput | ExperimentEventCreateOrConnectWithoutExperimentInput[]
    upsert?: ExperimentEventUpsertWithWhereUniqueWithoutExperimentInput | ExperimentEventUpsertWithWhereUniqueWithoutExperimentInput[]
    createMany?: ExperimentEventCreateManyExperimentInputEnvelope
    set?: ExperimentEventWhereUniqueInput | ExperimentEventWhereUniqueInput[]
    disconnect?: ExperimentEventWhereUniqueInput | ExperimentEventWhereUniqueInput[]
    delete?: ExperimentEventWhereUniqueInput | ExperimentEventWhereUniqueInput[]
    connect?: ExperimentEventWhereUniqueInput | ExperimentEventWhereUniqueInput[]
    update?: ExperimentEventUpdateWithWhereUniqueWithoutExperimentInput | ExperimentEventUpdateWithWhereUniqueWithoutExperimentInput[]
    updateMany?: ExperimentEventUpdateManyWithWhereWithoutExperimentInput | ExperimentEventUpdateManyWithWhereWithoutExperimentInput[]
    deleteMany?: ExperimentEventScalarWhereInput | ExperimentEventScalarWhereInput[]
  }

  export type ExperimentCreateNestedOneWithoutEventsInput = {
    create?: XOR<ExperimentCreateWithoutEventsInput, ExperimentUncheckedCreateWithoutEventsInput>
    connectOrCreate?: ExperimentCreateOrConnectWithoutEventsInput
    connect?: ExperimentWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ExperimentUpdateOneRequiredWithoutEventsNestedInput = {
    create?: XOR<ExperimentCreateWithoutEventsInput, ExperimentUncheckedCreateWithoutEventsInput>
    connectOrCreate?: ExperimentCreateOrConnectWithoutEventsInput
    upsert?: ExperimentUpsertWithoutEventsInput
    connect?: ExperimentWhereUniqueInput
    update?: XOR<XOR<ExperimentUpdateToOneWithWhereWithoutEventsInput, ExperimentUpdateWithoutEventsInput>, ExperimentUncheckedUpdateWithoutEventsInput>
  }

  export type UserCreateNestedOneWithoutGameSessionsInput = {
    create?: XOR<UserCreateWithoutGameSessionsInput, UserUncheckedCreateWithoutGameSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutGameSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type GameMessageCreateNestedManyWithoutGameSessionInput = {
    create?: XOR<GameMessageCreateWithoutGameSessionInput, GameMessageUncheckedCreateWithoutGameSessionInput> | GameMessageCreateWithoutGameSessionInput[] | GameMessageUncheckedCreateWithoutGameSessionInput[]
    connectOrCreate?: GameMessageCreateOrConnectWithoutGameSessionInput | GameMessageCreateOrConnectWithoutGameSessionInput[]
    createMany?: GameMessageCreateManyGameSessionInputEnvelope
    connect?: GameMessageWhereUniqueInput | GameMessageWhereUniqueInput[]
  }

  export type MissionRunCreateNestedManyWithoutSessionInput = {
    create?: XOR<MissionRunCreateWithoutSessionInput, MissionRunUncheckedCreateWithoutSessionInput> | MissionRunCreateWithoutSessionInput[] | MissionRunUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutSessionInput | MissionRunCreateOrConnectWithoutSessionInput[]
    createMany?: MissionRunCreateManySessionInputEnvelope
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
  }

  export type MemoryEventCreateNestedManyWithoutSessionInput = {
    create?: XOR<MemoryEventCreateWithoutSessionInput, MemoryEventUncheckedCreateWithoutSessionInput> | MemoryEventCreateWithoutSessionInput[] | MemoryEventUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MemoryEventCreateOrConnectWithoutSessionInput | MemoryEventCreateOrConnectWithoutSessionInput[]
    createMany?: MemoryEventCreateManySessionInputEnvelope
    connect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
  }

  export type GameMessageUncheckedCreateNestedManyWithoutGameSessionInput = {
    create?: XOR<GameMessageCreateWithoutGameSessionInput, GameMessageUncheckedCreateWithoutGameSessionInput> | GameMessageCreateWithoutGameSessionInput[] | GameMessageUncheckedCreateWithoutGameSessionInput[]
    connectOrCreate?: GameMessageCreateOrConnectWithoutGameSessionInput | GameMessageCreateOrConnectWithoutGameSessionInput[]
    createMany?: GameMessageCreateManyGameSessionInputEnvelope
    connect?: GameMessageWhereUniqueInput | GameMessageWhereUniqueInput[]
  }

  export type MissionRunUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<MissionRunCreateWithoutSessionInput, MissionRunUncheckedCreateWithoutSessionInput> | MissionRunCreateWithoutSessionInput[] | MissionRunUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutSessionInput | MissionRunCreateOrConnectWithoutSessionInput[]
    createMany?: MissionRunCreateManySessionInputEnvelope
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
  }

  export type MemoryEventUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<MemoryEventCreateWithoutSessionInput, MemoryEventUncheckedCreateWithoutSessionInput> | MemoryEventCreateWithoutSessionInput[] | MemoryEventUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MemoryEventCreateOrConnectWithoutSessionInput | MemoryEventCreateOrConnectWithoutSessionInput[]
    createMany?: MemoryEventCreateManySessionInputEnvelope
    connect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
  }

  export type EnumSessionStatusFieldUpdateOperationsInput = {
    set?: $Enums.SessionStatus
  }

  export type UserUpdateOneRequiredWithoutGameSessionsNestedInput = {
    create?: XOR<UserCreateWithoutGameSessionsInput, UserUncheckedCreateWithoutGameSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutGameSessionsInput
    upsert?: UserUpsertWithoutGameSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGameSessionsInput, UserUpdateWithoutGameSessionsInput>, UserUncheckedUpdateWithoutGameSessionsInput>
  }

  export type GameMessageUpdateManyWithoutGameSessionNestedInput = {
    create?: XOR<GameMessageCreateWithoutGameSessionInput, GameMessageUncheckedCreateWithoutGameSessionInput> | GameMessageCreateWithoutGameSessionInput[] | GameMessageUncheckedCreateWithoutGameSessionInput[]
    connectOrCreate?: GameMessageCreateOrConnectWithoutGameSessionInput | GameMessageCreateOrConnectWithoutGameSessionInput[]
    upsert?: GameMessageUpsertWithWhereUniqueWithoutGameSessionInput | GameMessageUpsertWithWhereUniqueWithoutGameSessionInput[]
    createMany?: GameMessageCreateManyGameSessionInputEnvelope
    set?: GameMessageWhereUniqueInput | GameMessageWhereUniqueInput[]
    disconnect?: GameMessageWhereUniqueInput | GameMessageWhereUniqueInput[]
    delete?: GameMessageWhereUniqueInput | GameMessageWhereUniqueInput[]
    connect?: GameMessageWhereUniqueInput | GameMessageWhereUniqueInput[]
    update?: GameMessageUpdateWithWhereUniqueWithoutGameSessionInput | GameMessageUpdateWithWhereUniqueWithoutGameSessionInput[]
    updateMany?: GameMessageUpdateManyWithWhereWithoutGameSessionInput | GameMessageUpdateManyWithWhereWithoutGameSessionInput[]
    deleteMany?: GameMessageScalarWhereInput | GameMessageScalarWhereInput[]
  }

  export type MissionRunUpdateManyWithoutSessionNestedInput = {
    create?: XOR<MissionRunCreateWithoutSessionInput, MissionRunUncheckedCreateWithoutSessionInput> | MissionRunCreateWithoutSessionInput[] | MissionRunUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutSessionInput | MissionRunCreateOrConnectWithoutSessionInput[]
    upsert?: MissionRunUpsertWithWhereUniqueWithoutSessionInput | MissionRunUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: MissionRunCreateManySessionInputEnvelope
    set?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    disconnect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    delete?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    update?: MissionRunUpdateWithWhereUniqueWithoutSessionInput | MissionRunUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: MissionRunUpdateManyWithWhereWithoutSessionInput | MissionRunUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: MissionRunScalarWhereInput | MissionRunScalarWhereInput[]
  }

  export type MemoryEventUpdateManyWithoutSessionNestedInput = {
    create?: XOR<MemoryEventCreateWithoutSessionInput, MemoryEventUncheckedCreateWithoutSessionInput> | MemoryEventCreateWithoutSessionInput[] | MemoryEventUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MemoryEventCreateOrConnectWithoutSessionInput | MemoryEventCreateOrConnectWithoutSessionInput[]
    upsert?: MemoryEventUpsertWithWhereUniqueWithoutSessionInput | MemoryEventUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: MemoryEventCreateManySessionInputEnvelope
    set?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    disconnect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    delete?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    connect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    update?: MemoryEventUpdateWithWhereUniqueWithoutSessionInput | MemoryEventUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: MemoryEventUpdateManyWithWhereWithoutSessionInput | MemoryEventUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: MemoryEventScalarWhereInput | MemoryEventScalarWhereInput[]
  }

  export type GameMessageUncheckedUpdateManyWithoutGameSessionNestedInput = {
    create?: XOR<GameMessageCreateWithoutGameSessionInput, GameMessageUncheckedCreateWithoutGameSessionInput> | GameMessageCreateWithoutGameSessionInput[] | GameMessageUncheckedCreateWithoutGameSessionInput[]
    connectOrCreate?: GameMessageCreateOrConnectWithoutGameSessionInput | GameMessageCreateOrConnectWithoutGameSessionInput[]
    upsert?: GameMessageUpsertWithWhereUniqueWithoutGameSessionInput | GameMessageUpsertWithWhereUniqueWithoutGameSessionInput[]
    createMany?: GameMessageCreateManyGameSessionInputEnvelope
    set?: GameMessageWhereUniqueInput | GameMessageWhereUniqueInput[]
    disconnect?: GameMessageWhereUniqueInput | GameMessageWhereUniqueInput[]
    delete?: GameMessageWhereUniqueInput | GameMessageWhereUniqueInput[]
    connect?: GameMessageWhereUniqueInput | GameMessageWhereUniqueInput[]
    update?: GameMessageUpdateWithWhereUniqueWithoutGameSessionInput | GameMessageUpdateWithWhereUniqueWithoutGameSessionInput[]
    updateMany?: GameMessageUpdateManyWithWhereWithoutGameSessionInput | GameMessageUpdateManyWithWhereWithoutGameSessionInput[]
    deleteMany?: GameMessageScalarWhereInput | GameMessageScalarWhereInput[]
  }

  export type MissionRunUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<MissionRunCreateWithoutSessionInput, MissionRunUncheckedCreateWithoutSessionInput> | MissionRunCreateWithoutSessionInput[] | MissionRunUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutSessionInput | MissionRunCreateOrConnectWithoutSessionInput[]
    upsert?: MissionRunUpsertWithWhereUniqueWithoutSessionInput | MissionRunUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: MissionRunCreateManySessionInputEnvelope
    set?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    disconnect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    delete?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    update?: MissionRunUpdateWithWhereUniqueWithoutSessionInput | MissionRunUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: MissionRunUpdateManyWithWhereWithoutSessionInput | MissionRunUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: MissionRunScalarWhereInput | MissionRunScalarWhereInput[]
  }

  export type MemoryEventUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<MemoryEventCreateWithoutSessionInput, MemoryEventUncheckedCreateWithoutSessionInput> | MemoryEventCreateWithoutSessionInput[] | MemoryEventUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: MemoryEventCreateOrConnectWithoutSessionInput | MemoryEventCreateOrConnectWithoutSessionInput[]
    upsert?: MemoryEventUpsertWithWhereUniqueWithoutSessionInput | MemoryEventUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: MemoryEventCreateManySessionInputEnvelope
    set?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    disconnect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    delete?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    connect?: MemoryEventWhereUniqueInput | MemoryEventWhereUniqueInput[]
    update?: MemoryEventUpdateWithWhereUniqueWithoutSessionInput | MemoryEventUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: MemoryEventUpdateManyWithWhereWithoutSessionInput | MemoryEventUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: MemoryEventScalarWhereInput | MemoryEventScalarWhereInput[]
  }

  export type GameSessionCreateNestedOneWithoutMessagesInput = {
    create?: XOR<GameSessionCreateWithoutMessagesInput, GameSessionUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutMessagesInput
    connect?: GameSessionWhereUniqueInput
  }

  export type GameSessionUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<GameSessionCreateWithoutMessagesInput, GameSessionUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutMessagesInput
    upsert?: GameSessionUpsertWithoutMessagesInput
    connect?: GameSessionWhereUniqueInput
    update?: XOR<XOR<GameSessionUpdateToOneWithWhereWithoutMessagesInput, GameSessionUpdateWithoutMessagesInput>, GameSessionUncheckedUpdateWithoutMessagesInput>
  }

  export type MemoryEventCreatetagsInput = {
    set: string[]
  }

  export type UserCreateNestedOneWithoutMemoryEventsInput = {
    create?: XOR<UserCreateWithoutMemoryEventsInput, UserUncheckedCreateWithoutMemoryEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMemoryEventsInput
    connect?: UserWhereUniqueInput
  }

  export type GameSessionCreateNestedOneWithoutMemoryEventsInput = {
    create?: XOR<GameSessionCreateWithoutMemoryEventsInput, GameSessionUncheckedCreateWithoutMemoryEventsInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutMemoryEventsInput
    connect?: GameSessionWhereUniqueInput
  }

  export type MemoryEmbeddingCreateNestedManyWithoutMemoryInput = {
    create?: XOR<MemoryEmbeddingCreateWithoutMemoryInput, MemoryEmbeddingUncheckedCreateWithoutMemoryInput> | MemoryEmbeddingCreateWithoutMemoryInput[] | MemoryEmbeddingUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: MemoryEmbeddingCreateOrConnectWithoutMemoryInput | MemoryEmbeddingCreateOrConnectWithoutMemoryInput[]
    createMany?: MemoryEmbeddingCreateManyMemoryInputEnvelope
    connect?: MemoryEmbeddingWhereUniqueInput | MemoryEmbeddingWhereUniqueInput[]
  }

  export type MemoryEmbeddingUncheckedCreateNestedManyWithoutMemoryInput = {
    create?: XOR<MemoryEmbeddingCreateWithoutMemoryInput, MemoryEmbeddingUncheckedCreateWithoutMemoryInput> | MemoryEmbeddingCreateWithoutMemoryInput[] | MemoryEmbeddingUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: MemoryEmbeddingCreateOrConnectWithoutMemoryInput | MemoryEmbeddingCreateOrConnectWithoutMemoryInput[]
    createMany?: MemoryEmbeddingCreateManyMemoryInputEnvelope
    connect?: MemoryEmbeddingWhereUniqueInput | MemoryEmbeddingWhereUniqueInput[]
  }

  export type EnumMemoryEventTypeFieldUpdateOperationsInput = {
    set?: $Enums.MemoryEventType
  }

  export type MemoryEventUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type UserUpdateOneRequiredWithoutMemoryEventsNestedInput = {
    create?: XOR<UserCreateWithoutMemoryEventsInput, UserUncheckedCreateWithoutMemoryEventsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMemoryEventsInput
    upsert?: UserUpsertWithoutMemoryEventsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMemoryEventsInput, UserUpdateWithoutMemoryEventsInput>, UserUncheckedUpdateWithoutMemoryEventsInput>
  }

  export type GameSessionUpdateOneWithoutMemoryEventsNestedInput = {
    create?: XOR<GameSessionCreateWithoutMemoryEventsInput, GameSessionUncheckedCreateWithoutMemoryEventsInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutMemoryEventsInput
    upsert?: GameSessionUpsertWithoutMemoryEventsInput
    disconnect?: GameSessionWhereInput | boolean
    delete?: GameSessionWhereInput | boolean
    connect?: GameSessionWhereUniqueInput
    update?: XOR<XOR<GameSessionUpdateToOneWithWhereWithoutMemoryEventsInput, GameSessionUpdateWithoutMemoryEventsInput>, GameSessionUncheckedUpdateWithoutMemoryEventsInput>
  }

  export type MemoryEmbeddingUpdateManyWithoutMemoryNestedInput = {
    create?: XOR<MemoryEmbeddingCreateWithoutMemoryInput, MemoryEmbeddingUncheckedCreateWithoutMemoryInput> | MemoryEmbeddingCreateWithoutMemoryInput[] | MemoryEmbeddingUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: MemoryEmbeddingCreateOrConnectWithoutMemoryInput | MemoryEmbeddingCreateOrConnectWithoutMemoryInput[]
    upsert?: MemoryEmbeddingUpsertWithWhereUniqueWithoutMemoryInput | MemoryEmbeddingUpsertWithWhereUniqueWithoutMemoryInput[]
    createMany?: MemoryEmbeddingCreateManyMemoryInputEnvelope
    set?: MemoryEmbeddingWhereUniqueInput | MemoryEmbeddingWhereUniqueInput[]
    disconnect?: MemoryEmbeddingWhereUniqueInput | MemoryEmbeddingWhereUniqueInput[]
    delete?: MemoryEmbeddingWhereUniqueInput | MemoryEmbeddingWhereUniqueInput[]
    connect?: MemoryEmbeddingWhereUniqueInput | MemoryEmbeddingWhereUniqueInput[]
    update?: MemoryEmbeddingUpdateWithWhereUniqueWithoutMemoryInput | MemoryEmbeddingUpdateWithWhereUniqueWithoutMemoryInput[]
    updateMany?: MemoryEmbeddingUpdateManyWithWhereWithoutMemoryInput | MemoryEmbeddingUpdateManyWithWhereWithoutMemoryInput[]
    deleteMany?: MemoryEmbeddingScalarWhereInput | MemoryEmbeddingScalarWhereInput[]
  }

  export type MemoryEmbeddingUncheckedUpdateManyWithoutMemoryNestedInput = {
    create?: XOR<MemoryEmbeddingCreateWithoutMemoryInput, MemoryEmbeddingUncheckedCreateWithoutMemoryInput> | MemoryEmbeddingCreateWithoutMemoryInput[] | MemoryEmbeddingUncheckedCreateWithoutMemoryInput[]
    connectOrCreate?: MemoryEmbeddingCreateOrConnectWithoutMemoryInput | MemoryEmbeddingCreateOrConnectWithoutMemoryInput[]
    upsert?: MemoryEmbeddingUpsertWithWhereUniqueWithoutMemoryInput | MemoryEmbeddingUpsertWithWhereUniqueWithoutMemoryInput[]
    createMany?: MemoryEmbeddingCreateManyMemoryInputEnvelope
    set?: MemoryEmbeddingWhereUniqueInput | MemoryEmbeddingWhereUniqueInput[]
    disconnect?: MemoryEmbeddingWhereUniqueInput | MemoryEmbeddingWhereUniqueInput[]
    delete?: MemoryEmbeddingWhereUniqueInput | MemoryEmbeddingWhereUniqueInput[]
    connect?: MemoryEmbeddingWhereUniqueInput | MemoryEmbeddingWhereUniqueInput[]
    update?: MemoryEmbeddingUpdateWithWhereUniqueWithoutMemoryInput | MemoryEmbeddingUpdateWithWhereUniqueWithoutMemoryInput[]
    updateMany?: MemoryEmbeddingUpdateManyWithWhereWithoutMemoryInput | MemoryEmbeddingUpdateManyWithWhereWithoutMemoryInput[]
    deleteMany?: MemoryEmbeddingScalarWhereInput | MemoryEmbeddingScalarWhereInput[]
  }

  export type MemoryEventCreateNestedOneWithoutEmbeddingsInput = {
    create?: XOR<MemoryEventCreateWithoutEmbeddingsInput, MemoryEventUncheckedCreateWithoutEmbeddingsInput>
    connectOrCreate?: MemoryEventCreateOrConnectWithoutEmbeddingsInput
    connect?: MemoryEventWhereUniqueInput
  }

  export type MemoryEventUpdateOneRequiredWithoutEmbeddingsNestedInput = {
    create?: XOR<MemoryEventCreateWithoutEmbeddingsInput, MemoryEventUncheckedCreateWithoutEmbeddingsInput>
    connectOrCreate?: MemoryEventCreateOrConnectWithoutEmbeddingsInput
    upsert?: MemoryEventUpsertWithoutEmbeddingsInput
    connect?: MemoryEventWhereUniqueInput
    update?: XOR<XOR<MemoryEventUpdateToOneWithWhereWithoutEmbeddingsInput, MemoryEventUpdateWithoutEmbeddingsInput>, MemoryEventUncheckedUpdateWithoutEmbeddingsInput>
  }

  export type UserCreateNestedOneWithoutProfileInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutProfileNestedInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    upsert?: UserUpsertWithoutProfileInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProfileInput, UserUpdateWithoutProfileInput>, UserUncheckedUpdateWithoutProfileInput>
  }

  export type MissionDefinitionCreatetagsInput = {
    set: string[]
  }

  export type MissionRunCreateNestedManyWithoutMissionInput = {
    create?: XOR<MissionRunCreateWithoutMissionInput, MissionRunUncheckedCreateWithoutMissionInput> | MissionRunCreateWithoutMissionInput[] | MissionRunUncheckedCreateWithoutMissionInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutMissionInput | MissionRunCreateOrConnectWithoutMissionInput[]
    createMany?: MissionRunCreateManyMissionInputEnvelope
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
  }

  export type MissionRunUncheckedCreateNestedManyWithoutMissionInput = {
    create?: XOR<MissionRunCreateWithoutMissionInput, MissionRunUncheckedCreateWithoutMissionInput> | MissionRunCreateWithoutMissionInput[] | MissionRunUncheckedCreateWithoutMissionInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutMissionInput | MissionRunCreateOrConnectWithoutMissionInput[]
    createMany?: MissionRunCreateManyMissionInputEnvelope
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
  }

  export type MissionDefinitionUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type MissionRunUpdateManyWithoutMissionNestedInput = {
    create?: XOR<MissionRunCreateWithoutMissionInput, MissionRunUncheckedCreateWithoutMissionInput> | MissionRunCreateWithoutMissionInput[] | MissionRunUncheckedCreateWithoutMissionInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutMissionInput | MissionRunCreateOrConnectWithoutMissionInput[]
    upsert?: MissionRunUpsertWithWhereUniqueWithoutMissionInput | MissionRunUpsertWithWhereUniqueWithoutMissionInput[]
    createMany?: MissionRunCreateManyMissionInputEnvelope
    set?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    disconnect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    delete?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    update?: MissionRunUpdateWithWhereUniqueWithoutMissionInput | MissionRunUpdateWithWhereUniqueWithoutMissionInput[]
    updateMany?: MissionRunUpdateManyWithWhereWithoutMissionInput | MissionRunUpdateManyWithWhereWithoutMissionInput[]
    deleteMany?: MissionRunScalarWhereInput | MissionRunScalarWhereInput[]
  }

  export type MissionRunUncheckedUpdateManyWithoutMissionNestedInput = {
    create?: XOR<MissionRunCreateWithoutMissionInput, MissionRunUncheckedCreateWithoutMissionInput> | MissionRunCreateWithoutMissionInput[] | MissionRunUncheckedCreateWithoutMissionInput[]
    connectOrCreate?: MissionRunCreateOrConnectWithoutMissionInput | MissionRunCreateOrConnectWithoutMissionInput[]
    upsert?: MissionRunUpsertWithWhereUniqueWithoutMissionInput | MissionRunUpsertWithWhereUniqueWithoutMissionInput[]
    createMany?: MissionRunCreateManyMissionInputEnvelope
    set?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    disconnect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    delete?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    connect?: MissionRunWhereUniqueInput | MissionRunWhereUniqueInput[]
    update?: MissionRunUpdateWithWhereUniqueWithoutMissionInput | MissionRunUpdateWithWhereUniqueWithoutMissionInput[]
    updateMany?: MissionRunUpdateManyWithWhereWithoutMissionInput | MissionRunUpdateManyWithWhereWithoutMissionInput[]
    deleteMany?: MissionRunScalarWhereInput | MissionRunScalarWhereInput[]
  }

  export type MissionDefinitionCreateNestedOneWithoutMissionRunsInput = {
    create?: XOR<MissionDefinitionCreateWithoutMissionRunsInput, MissionDefinitionUncheckedCreateWithoutMissionRunsInput>
    connectOrCreate?: MissionDefinitionCreateOrConnectWithoutMissionRunsInput
    connect?: MissionDefinitionWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutMissionRunsInput = {
    create?: XOR<UserCreateWithoutMissionRunsInput, UserUncheckedCreateWithoutMissionRunsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMissionRunsInput
    connect?: UserWhereUniqueInput
  }

  export type GameSessionCreateNestedOneWithoutMissionRunsInput = {
    create?: XOR<GameSessionCreateWithoutMissionRunsInput, GameSessionUncheckedCreateWithoutMissionRunsInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutMissionRunsInput
    connect?: GameSessionWhereUniqueInput
  }

  export type RewardCreateNestedManyWithoutMissionRunInput = {
    create?: XOR<RewardCreateWithoutMissionRunInput, RewardUncheckedCreateWithoutMissionRunInput> | RewardCreateWithoutMissionRunInput[] | RewardUncheckedCreateWithoutMissionRunInput[]
    connectOrCreate?: RewardCreateOrConnectWithoutMissionRunInput | RewardCreateOrConnectWithoutMissionRunInput[]
    createMany?: RewardCreateManyMissionRunInputEnvelope
    connect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
  }

  export type RewardUncheckedCreateNestedManyWithoutMissionRunInput = {
    create?: XOR<RewardCreateWithoutMissionRunInput, RewardUncheckedCreateWithoutMissionRunInput> | RewardCreateWithoutMissionRunInput[] | RewardUncheckedCreateWithoutMissionRunInput[]
    connectOrCreate?: RewardCreateOrConnectWithoutMissionRunInput | RewardCreateOrConnectWithoutMissionRunInput[]
    createMany?: RewardCreateManyMissionRunInputEnvelope
    connect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
  }

  export type EnumMissionRunStatusFieldUpdateOperationsInput = {
    set?: $Enums.MissionRunStatus
  }

  export type MissionDefinitionUpdateOneRequiredWithoutMissionRunsNestedInput = {
    create?: XOR<MissionDefinitionCreateWithoutMissionRunsInput, MissionDefinitionUncheckedCreateWithoutMissionRunsInput>
    connectOrCreate?: MissionDefinitionCreateOrConnectWithoutMissionRunsInput
    upsert?: MissionDefinitionUpsertWithoutMissionRunsInput
    connect?: MissionDefinitionWhereUniqueInput
    update?: XOR<XOR<MissionDefinitionUpdateToOneWithWhereWithoutMissionRunsInput, MissionDefinitionUpdateWithoutMissionRunsInput>, MissionDefinitionUncheckedUpdateWithoutMissionRunsInput>
  }

  export type UserUpdateOneRequiredWithoutMissionRunsNestedInput = {
    create?: XOR<UserCreateWithoutMissionRunsInput, UserUncheckedCreateWithoutMissionRunsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMissionRunsInput
    upsert?: UserUpsertWithoutMissionRunsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMissionRunsInput, UserUpdateWithoutMissionRunsInput>, UserUncheckedUpdateWithoutMissionRunsInput>
  }

  export type GameSessionUpdateOneWithoutMissionRunsNestedInput = {
    create?: XOR<GameSessionCreateWithoutMissionRunsInput, GameSessionUncheckedCreateWithoutMissionRunsInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutMissionRunsInput
    upsert?: GameSessionUpsertWithoutMissionRunsInput
    disconnect?: GameSessionWhereInput | boolean
    delete?: GameSessionWhereInput | boolean
    connect?: GameSessionWhereUniqueInput
    update?: XOR<XOR<GameSessionUpdateToOneWithWhereWithoutMissionRunsInput, GameSessionUpdateWithoutMissionRunsInput>, GameSessionUncheckedUpdateWithoutMissionRunsInput>
  }

  export type RewardUpdateManyWithoutMissionRunNestedInput = {
    create?: XOR<RewardCreateWithoutMissionRunInput, RewardUncheckedCreateWithoutMissionRunInput> | RewardCreateWithoutMissionRunInput[] | RewardUncheckedCreateWithoutMissionRunInput[]
    connectOrCreate?: RewardCreateOrConnectWithoutMissionRunInput | RewardCreateOrConnectWithoutMissionRunInput[]
    upsert?: RewardUpsertWithWhereUniqueWithoutMissionRunInput | RewardUpsertWithWhereUniqueWithoutMissionRunInput[]
    createMany?: RewardCreateManyMissionRunInputEnvelope
    set?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    disconnect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    delete?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    connect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    update?: RewardUpdateWithWhereUniqueWithoutMissionRunInput | RewardUpdateWithWhereUniqueWithoutMissionRunInput[]
    updateMany?: RewardUpdateManyWithWhereWithoutMissionRunInput | RewardUpdateManyWithWhereWithoutMissionRunInput[]
    deleteMany?: RewardScalarWhereInput | RewardScalarWhereInput[]
  }

  export type RewardUncheckedUpdateManyWithoutMissionRunNestedInput = {
    create?: XOR<RewardCreateWithoutMissionRunInput, RewardUncheckedCreateWithoutMissionRunInput> | RewardCreateWithoutMissionRunInput[] | RewardUncheckedCreateWithoutMissionRunInput[]
    connectOrCreate?: RewardCreateOrConnectWithoutMissionRunInput | RewardCreateOrConnectWithoutMissionRunInput[]
    upsert?: RewardUpsertWithWhereUniqueWithoutMissionRunInput | RewardUpsertWithWhereUniqueWithoutMissionRunInput[]
    createMany?: RewardCreateManyMissionRunInputEnvelope
    set?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    disconnect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    delete?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    connect?: RewardWhereUniqueInput | RewardWhereUniqueInput[]
    update?: RewardUpdateWithWhereUniqueWithoutMissionRunInput | RewardUpdateWithWhereUniqueWithoutMissionRunInput[]
    updateMany?: RewardUpdateManyWithWhereWithoutMissionRunInput | RewardUpdateManyWithWhereWithoutMissionRunInput[]
    deleteMany?: RewardScalarWhereInput | RewardScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutRewardsInput = {
    create?: XOR<UserCreateWithoutRewardsInput, UserUncheckedCreateWithoutRewardsInput>
    connectOrCreate?: UserCreateOrConnectWithoutRewardsInput
    connect?: UserWhereUniqueInput
  }

  export type MissionRunCreateNestedOneWithoutRewardsInput = {
    create?: XOR<MissionRunCreateWithoutRewardsInput, MissionRunUncheckedCreateWithoutRewardsInput>
    connectOrCreate?: MissionRunCreateOrConnectWithoutRewardsInput
    connect?: MissionRunWhereUniqueInput
  }

  export type EnumRewardTypeFieldUpdateOperationsInput = {
    set?: $Enums.RewardType
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutRewardsNestedInput = {
    create?: XOR<UserCreateWithoutRewardsInput, UserUncheckedCreateWithoutRewardsInput>
    connectOrCreate?: UserCreateOrConnectWithoutRewardsInput
    upsert?: UserUpsertWithoutRewardsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutRewardsInput, UserUpdateWithoutRewardsInput>, UserUncheckedUpdateWithoutRewardsInput>
  }

  export type MissionRunUpdateOneWithoutRewardsNestedInput = {
    create?: XOR<MissionRunCreateWithoutRewardsInput, MissionRunUncheckedCreateWithoutRewardsInput>
    connectOrCreate?: MissionRunCreateOrConnectWithoutRewardsInput
    upsert?: MissionRunUpsertWithoutRewardsInput
    disconnect?: MissionRunWhereInput | boolean
    delete?: MissionRunWhereInput | boolean
    connect?: MissionRunWhereUniqueInput
    update?: XOR<XOR<MissionRunUpdateToOneWithWhereWithoutRewardsInput, MissionRunUpdateWithoutRewardsInput>, MissionRunUncheckedUpdateWithoutRewardsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumThreadKindFilter<$PrismaModel = never> = {
    equals?: $Enums.ThreadKind | EnumThreadKindFieldRefInput<$PrismaModel>
    in?: $Enums.ThreadKind[] | ListEnumThreadKindFieldRefInput<$PrismaModel>
    notIn?: $Enums.ThreadKind[] | ListEnumThreadKindFieldRefInput<$PrismaModel>
    not?: NestedEnumThreadKindFilter<$PrismaModel> | $Enums.ThreadKind
  }

  export type NestedEnumThreadKindWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ThreadKind | EnumThreadKindFieldRefInput<$PrismaModel>
    in?: $Enums.ThreadKind[] | ListEnumThreadKindFieldRefInput<$PrismaModel>
    notIn?: $Enums.ThreadKind[] | ListEnumThreadKindFieldRefInput<$PrismaModel>
    not?: NestedEnumThreadKindWithAggregatesFilter<$PrismaModel> | $Enums.ThreadKind
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumThreadKindFilter<$PrismaModel>
    _max?: NestedEnumThreadKindFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumSessionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SessionStatus | EnumSessionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SessionStatus[] | ListEnumSessionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SessionStatus[] | ListEnumSessionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSessionStatusFilter<$PrismaModel> | $Enums.SessionStatus
  }

  export type NestedEnumSessionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SessionStatus | EnumSessionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SessionStatus[] | ListEnumSessionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SessionStatus[] | ListEnumSessionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSessionStatusWithAggregatesFilter<$PrismaModel> | $Enums.SessionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSessionStatusFilter<$PrismaModel>
    _max?: NestedEnumSessionStatusFilter<$PrismaModel>
  }

  export type NestedEnumMemoryEventTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryEventType | EnumMemoryEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryEventType[] | ListEnumMemoryEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemoryEventType[] | ListEnumMemoryEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMemoryEventTypeFilter<$PrismaModel> | $Enums.MemoryEventType
  }

  export type NestedEnumMemoryEventTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MemoryEventType | EnumMemoryEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MemoryEventType[] | ListEnumMemoryEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MemoryEventType[] | ListEnumMemoryEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMemoryEventTypeWithAggregatesFilter<$PrismaModel> | $Enums.MemoryEventType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMemoryEventTypeFilter<$PrismaModel>
    _max?: NestedEnumMemoryEventTypeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumMissionRunStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MissionRunStatus | EnumMissionRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MissionRunStatus[] | ListEnumMissionRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MissionRunStatus[] | ListEnumMissionRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMissionRunStatusFilter<$PrismaModel> | $Enums.MissionRunStatus
  }

  export type NestedEnumMissionRunStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MissionRunStatus | EnumMissionRunStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MissionRunStatus[] | ListEnumMissionRunStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MissionRunStatus[] | ListEnumMissionRunStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMissionRunStatusWithAggregatesFilter<$PrismaModel> | $Enums.MissionRunStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMissionRunStatusFilter<$PrismaModel>
    _max?: NestedEnumMissionRunStatusFilter<$PrismaModel>
  }

  export type NestedEnumRewardTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.RewardType | EnumRewardTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RewardType[] | ListEnumRewardTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RewardType[] | ListEnumRewardTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRewardTypeFilter<$PrismaModel> | $Enums.RewardType
  }

  export type NestedEnumRewardTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RewardType | EnumRewardTypeFieldRefInput<$PrismaModel>
    in?: $Enums.RewardType[] | ListEnumRewardTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.RewardType[] | ListEnumRewardTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumRewardTypeWithAggregatesFilter<$PrismaModel> | $Enums.RewardType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRewardTypeFilter<$PrismaModel>
    _max?: NestedEnumRewardTypeFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type SessionCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    token: string
  }

  export type SessionUncheckedCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    token: string
  }

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ThreadCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    accessTier?: number
    messages?: MessageCreateNestedManyWithoutThreadInput
    notes?: AgentNoteCreateNestedManyWithoutThreadInput
    experiments?: ExperimentCreateNestedManyWithoutThreadInput
  }

  export type ThreadUncheckedCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    accessTier?: number
    messages?: MessageUncheckedCreateNestedManyWithoutThreadInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutThreadInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutThreadInput
  }

  export type ThreadCreateOrConnectWithoutUserInput = {
    where: ThreadWhereUniqueInput
    create: XOR<ThreadCreateWithoutUserInput, ThreadUncheckedCreateWithoutUserInput>
  }

  export type ThreadCreateManyUserInputEnvelope = {
    data: ThreadCreateManyUserInput | ThreadCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AgentNoteCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    key: string
    value: string
    thread?: ThreadCreateNestedOneWithoutNotesInput
  }

  export type AgentNoteUncheckedCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    threadId?: string | null
    key: string
    value: string
  }

  export type AgentNoteCreateOrConnectWithoutUserInput = {
    where: AgentNoteWhereUniqueInput
    create: XOR<AgentNoteCreateWithoutUserInput, AgentNoteUncheckedCreateWithoutUserInput>
  }

  export type AgentNoteCreateManyUserInputEnvelope = {
    data: AgentNoteCreateManyUserInput | AgentNoteCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type GameSessionCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    messages?: GameMessageCreateNestedManyWithoutGameSessionInput
    missionRuns?: MissionRunCreateNestedManyWithoutSessionInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutSessionInput
  }

  export type GameSessionUncheckedCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    messages?: GameMessageUncheckedCreateNestedManyWithoutGameSessionInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutSessionInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutSessionInput
  }

  export type GameSessionCreateOrConnectWithoutUserInput = {
    where: GameSessionWhereUniqueInput
    create: XOR<GameSessionCreateWithoutUserInput, GameSessionUncheckedCreateWithoutUserInput>
  }

  export type GameSessionCreateManyUserInputEnvelope = {
    data: GameSessionCreateManyUserInput | GameSessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type MemoryEventCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    session?: GameSessionCreateNestedOneWithoutMemoryEventsInput
    embeddings?: MemoryEmbeddingCreateNestedManyWithoutMemoryInput
  }

  export type MemoryEventUncheckedCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    sessionId?: string | null
    embeddings?: MemoryEmbeddingUncheckedCreateNestedManyWithoutMemoryInput
  }

  export type MemoryEventCreateOrConnectWithoutUserInput = {
    where: MemoryEventWhereUniqueInput
    create: XOR<MemoryEventCreateWithoutUserInput, MemoryEventUncheckedCreateWithoutUserInput>
  }

  export type MemoryEventCreateManyUserInputEnvelope = {
    data: MemoryEventCreateManyUserInput | MemoryEventCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type MissionRunCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    mission: MissionDefinitionCreateNestedOneWithoutMissionRunsInput
    session?: GameSessionCreateNestedOneWithoutMissionRunsInput
    rewards?: RewardCreateNestedManyWithoutMissionRunInput
  }

  export type MissionRunUncheckedCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId: string
    sessionId?: string | null
    rewards?: RewardUncheckedCreateNestedManyWithoutMissionRunInput
  }

  export type MissionRunCreateOrConnectWithoutUserInput = {
    where: MissionRunWhereUniqueInput
    create: XOR<MissionRunCreateWithoutUserInput, MissionRunUncheckedCreateWithoutUserInput>
  }

  export type MissionRunCreateManyUserInputEnvelope = {
    data: MissionRunCreateManyUserInput | MissionRunCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type RewardCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    type?: $Enums.RewardType
    amount?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    missionRun?: MissionRunCreateNestedOneWithoutRewardsInput
  }

  export type RewardUncheckedCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    type?: $Enums.RewardType
    amount?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    missionRunId?: string | null
  }

  export type RewardCreateOrConnectWithoutUserInput = {
    where: RewardWhereUniqueInput
    create: XOR<RewardCreateWithoutUserInput, RewardUncheckedCreateWithoutUserInput>
  }

  export type RewardCreateManyUserInputEnvelope = {
    data: RewardCreateManyUserInput | RewardCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type PlayerProfileCreateWithoutUserInput = {
    id?: string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type PlayerProfileUncheckedCreateWithoutUserInput = {
    id?: string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: Date | string
  }

  export type PlayerProfileCreateOrConnectWithoutUserInput = {
    where: PlayerProfileWhereUniqueInput
    create: XOR<PlayerProfileCreateWithoutUserInput, PlayerProfileUncheckedCreateWithoutUserInput>
  }

  export type ExperimentCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
    thread?: ThreadCreateNestedOneWithoutExperimentsInput
    events?: ExperimentEventCreateNestedManyWithoutExperimentInput
  }

  export type ExperimentUncheckedCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    threadId?: string | null
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
    events?: ExperimentEventUncheckedCreateNestedManyWithoutExperimentInput
  }

  export type ExperimentCreateOrConnectWithoutUserInput = {
    where: ExperimentWhereUniqueInput
    create: XOR<ExperimentCreateWithoutUserInput, ExperimentUncheckedCreateWithoutUserInput>
  }

  export type ExperimentCreateManyUserInputEnvelope = {
    data: ExperimentCreateManyUserInput | ExperimentCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
  }

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[]
    OR?: SessionScalarWhereInput[]
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[]
    id?: StringFilter<"Session"> | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    userId?: StringFilter<"Session"> | string
    token?: StringFilter<"Session"> | string
  }

  export type ThreadUpsertWithWhereUniqueWithoutUserInput = {
    where: ThreadWhereUniqueInput
    update: XOR<ThreadUpdateWithoutUserInput, ThreadUncheckedUpdateWithoutUserInput>
    create: XOR<ThreadCreateWithoutUserInput, ThreadUncheckedCreateWithoutUserInput>
  }

  export type ThreadUpdateWithWhereUniqueWithoutUserInput = {
    where: ThreadWhereUniqueInput
    data: XOR<ThreadUpdateWithoutUserInput, ThreadUncheckedUpdateWithoutUserInput>
  }

  export type ThreadUpdateManyWithWhereWithoutUserInput = {
    where: ThreadScalarWhereInput
    data: XOR<ThreadUpdateManyMutationInput, ThreadUncheckedUpdateManyWithoutUserInput>
  }

  export type ThreadScalarWhereInput = {
    AND?: ThreadScalarWhereInput | ThreadScalarWhereInput[]
    OR?: ThreadScalarWhereInput[]
    NOT?: ThreadScalarWhereInput | ThreadScalarWhereInput[]
    id?: StringFilter<"Thread"> | string
    createdAt?: DateTimeFilter<"Thread"> | Date | string
    archivedAt?: DateTimeNullableFilter<"Thread"> | Date | string | null
    kind?: EnumThreadKindFilter<"Thread"> | $Enums.ThreadKind
    userId?: StringFilter<"Thread"> | string
    accessTier?: IntFilter<"Thread"> | number
  }

  export type AgentNoteUpsertWithWhereUniqueWithoutUserInput = {
    where: AgentNoteWhereUniqueInput
    update: XOR<AgentNoteUpdateWithoutUserInput, AgentNoteUncheckedUpdateWithoutUserInput>
    create: XOR<AgentNoteCreateWithoutUserInput, AgentNoteUncheckedCreateWithoutUserInput>
  }

  export type AgentNoteUpdateWithWhereUniqueWithoutUserInput = {
    where: AgentNoteWhereUniqueInput
    data: XOR<AgentNoteUpdateWithoutUserInput, AgentNoteUncheckedUpdateWithoutUserInput>
  }

  export type AgentNoteUpdateManyWithWhereWithoutUserInput = {
    where: AgentNoteScalarWhereInput
    data: XOR<AgentNoteUpdateManyMutationInput, AgentNoteUncheckedUpdateManyWithoutUserInput>
  }

  export type AgentNoteScalarWhereInput = {
    AND?: AgentNoteScalarWhereInput | AgentNoteScalarWhereInput[]
    OR?: AgentNoteScalarWhereInput[]
    NOT?: AgentNoteScalarWhereInput | AgentNoteScalarWhereInput[]
    id?: StringFilter<"AgentNote"> | string
    createdAt?: DateTimeFilter<"AgentNote"> | Date | string
    userId?: StringFilter<"AgentNote"> | string
    threadId?: StringNullableFilter<"AgentNote"> | string | null
    key?: StringFilter<"AgentNote"> | string
    value?: StringFilter<"AgentNote"> | string
  }

  export type GameSessionUpsertWithWhereUniqueWithoutUserInput = {
    where: GameSessionWhereUniqueInput
    update: XOR<GameSessionUpdateWithoutUserInput, GameSessionUncheckedUpdateWithoutUserInput>
    create: XOR<GameSessionCreateWithoutUserInput, GameSessionUncheckedCreateWithoutUserInput>
  }

  export type GameSessionUpdateWithWhereUniqueWithoutUserInput = {
    where: GameSessionWhereUniqueInput
    data: XOR<GameSessionUpdateWithoutUserInput, GameSessionUncheckedUpdateWithoutUserInput>
  }

  export type GameSessionUpdateManyWithWhereWithoutUserInput = {
    where: GameSessionScalarWhereInput
    data: XOR<GameSessionUpdateManyMutationInput, GameSessionUncheckedUpdateManyWithoutUserInput>
  }

  export type GameSessionScalarWhereInput = {
    AND?: GameSessionScalarWhereInput | GameSessionScalarWhereInput[]
    OR?: GameSessionScalarWhereInput[]
    NOT?: GameSessionScalarWhereInput | GameSessionScalarWhereInput[]
    id?: StringFilter<"GameSession"> | string
    createdAt?: DateTimeFilter<"GameSession"> | Date | string
    updatedAt?: DateTimeFilter<"GameSession"> | Date | string
    status?: EnumSessionStatusFilter<"GameSession"> | $Enums.SessionStatus
    summary?: StringNullableFilter<"GameSession"> | string | null
    userId?: StringFilter<"GameSession"> | string
  }

  export type MemoryEventUpsertWithWhereUniqueWithoutUserInput = {
    where: MemoryEventWhereUniqueInput
    update: XOR<MemoryEventUpdateWithoutUserInput, MemoryEventUncheckedUpdateWithoutUserInput>
    create: XOR<MemoryEventCreateWithoutUserInput, MemoryEventUncheckedCreateWithoutUserInput>
  }

  export type MemoryEventUpdateWithWhereUniqueWithoutUserInput = {
    where: MemoryEventWhereUniqueInput
    data: XOR<MemoryEventUpdateWithoutUserInput, MemoryEventUncheckedUpdateWithoutUserInput>
  }

  export type MemoryEventUpdateManyWithWhereWithoutUserInput = {
    where: MemoryEventScalarWhereInput
    data: XOR<MemoryEventUpdateManyMutationInput, MemoryEventUncheckedUpdateManyWithoutUserInput>
  }

  export type MemoryEventScalarWhereInput = {
    AND?: MemoryEventScalarWhereInput | MemoryEventScalarWhereInput[]
    OR?: MemoryEventScalarWhereInput[]
    NOT?: MemoryEventScalarWhereInput | MemoryEventScalarWhereInput[]
    id?: StringFilter<"MemoryEvent"> | string
    createdAt?: DateTimeFilter<"MemoryEvent"> | Date | string
    type?: EnumMemoryEventTypeFilter<"MemoryEvent"> | $Enums.MemoryEventType
    content?: StringFilter<"MemoryEvent"> | string
    tags?: StringNullableListFilter<"MemoryEvent">
    userId?: StringFilter<"MemoryEvent"> | string
    sessionId?: StringNullableFilter<"MemoryEvent"> | string | null
  }

  export type MissionRunUpsertWithWhereUniqueWithoutUserInput = {
    where: MissionRunWhereUniqueInput
    update: XOR<MissionRunUpdateWithoutUserInput, MissionRunUncheckedUpdateWithoutUserInput>
    create: XOR<MissionRunCreateWithoutUserInput, MissionRunUncheckedCreateWithoutUserInput>
  }

  export type MissionRunUpdateWithWhereUniqueWithoutUserInput = {
    where: MissionRunWhereUniqueInput
    data: XOR<MissionRunUpdateWithoutUserInput, MissionRunUncheckedUpdateWithoutUserInput>
  }

  export type MissionRunUpdateManyWithWhereWithoutUserInput = {
    where: MissionRunScalarWhereInput
    data: XOR<MissionRunUpdateManyMutationInput, MissionRunUncheckedUpdateManyWithoutUserInput>
  }

  export type MissionRunScalarWhereInput = {
    AND?: MissionRunScalarWhereInput | MissionRunScalarWhereInput[]
    OR?: MissionRunScalarWhereInput[]
    NOT?: MissionRunScalarWhereInput | MissionRunScalarWhereInput[]
    id?: StringFilter<"MissionRun"> | string
    createdAt?: DateTimeFilter<"MissionRun"> | Date | string
    updatedAt?: DateTimeFilter<"MissionRun"> | Date | string
    status?: EnumMissionRunStatusFilter<"MissionRun"> | $Enums.MissionRunStatus
    score?: FloatNullableFilter<"MissionRun"> | number | null
    feedback?: StringNullableFilter<"MissionRun"> | string | null
    payload?: JsonNullableFilter<"MissionRun">
    missionId?: StringFilter<"MissionRun"> | string
    userId?: StringFilter<"MissionRun"> | string
    sessionId?: StringNullableFilter<"MissionRun"> | string | null
  }

  export type RewardUpsertWithWhereUniqueWithoutUserInput = {
    where: RewardWhereUniqueInput
    update: XOR<RewardUpdateWithoutUserInput, RewardUncheckedUpdateWithoutUserInput>
    create: XOR<RewardCreateWithoutUserInput, RewardUncheckedCreateWithoutUserInput>
  }

  export type RewardUpdateWithWhereUniqueWithoutUserInput = {
    where: RewardWhereUniqueInput
    data: XOR<RewardUpdateWithoutUserInput, RewardUncheckedUpdateWithoutUserInput>
  }

  export type RewardUpdateManyWithWhereWithoutUserInput = {
    where: RewardScalarWhereInput
    data: XOR<RewardUpdateManyMutationInput, RewardUncheckedUpdateManyWithoutUserInput>
  }

  export type RewardScalarWhereInput = {
    AND?: RewardScalarWhereInput | RewardScalarWhereInput[]
    OR?: RewardScalarWhereInput[]
    NOT?: RewardScalarWhereInput | RewardScalarWhereInput[]
    id?: StringFilter<"Reward"> | string
    createdAt?: DateTimeFilter<"Reward"> | Date | string
    type?: EnumRewardTypeFilter<"Reward"> | $Enums.RewardType
    amount?: FloatFilter<"Reward"> | number
    metadata?: JsonNullableFilter<"Reward">
    userId?: StringFilter<"Reward"> | string
    missionRunId?: StringNullableFilter<"Reward"> | string | null
  }

  export type PlayerProfileUpsertWithoutUserInput = {
    update: XOR<PlayerProfileUpdateWithoutUserInput, PlayerProfileUncheckedUpdateWithoutUserInput>
    create: XOR<PlayerProfileCreateWithoutUserInput, PlayerProfileUncheckedCreateWithoutUserInput>
    where?: PlayerProfileWhereInput
  }

  export type PlayerProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: PlayerProfileWhereInput
    data: XOR<PlayerProfileUpdateWithoutUserInput, PlayerProfileUncheckedUpdateWithoutUserInput>
  }

  export type PlayerProfileUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlayerProfileUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    traits?: NullableJsonNullValueInput | InputJsonValue
    skills?: NullableJsonNullValueInput | InputJsonValue
    preferences?: NullableJsonNullValueInput | InputJsonValue
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExperimentUpsertWithWhereUniqueWithoutUserInput = {
    where: ExperimentWhereUniqueInput
    update: XOR<ExperimentUpdateWithoutUserInput, ExperimentUncheckedUpdateWithoutUserInput>
    create: XOR<ExperimentCreateWithoutUserInput, ExperimentUncheckedCreateWithoutUserInput>
  }

  export type ExperimentUpdateWithWhereUniqueWithoutUserInput = {
    where: ExperimentWhereUniqueInput
    data: XOR<ExperimentUpdateWithoutUserInput, ExperimentUncheckedUpdateWithoutUserInput>
  }

  export type ExperimentUpdateManyWithWhereWithoutUserInput = {
    where: ExperimentScalarWhereInput
    data: XOR<ExperimentUpdateManyMutationInput, ExperimentUncheckedUpdateManyWithoutUserInput>
  }

  export type ExperimentScalarWhereInput = {
    AND?: ExperimentScalarWhereInput | ExperimentScalarWhereInput[]
    OR?: ExperimentScalarWhereInput[]
    NOT?: ExperimentScalarWhereInput | ExperimentScalarWhereInput[]
    id?: StringFilter<"Experiment"> | string
    createdAt?: DateTimeFilter<"Experiment"> | Date | string
    userId?: StringFilter<"Experiment"> | string
    threadId?: StringNullableFilter<"Experiment"> | string | null
    hypothesis?: StringFilter<"Experiment"> | string
    task?: StringFilter<"Experiment"> | string
    successCriteria?: StringNullableFilter<"Experiment"> | string | null
    timeoutS?: IntNullableFilter<"Experiment"> | number | null
    title?: StringNullableFilter<"Experiment"> | string | null
  }

  export type UserCreateWithoutSessionsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    threads?: ThreadCreateNestedManyWithoutUserInput
    notes?: AgentNoteCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunCreateNestedManyWithoutUserInput
    rewards?: RewardCreateNestedManyWithoutUserInput
    profile?: PlayerProfileCreateNestedOneWithoutUserInput
    experiments?: ExperimentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSessionsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    threads?: ThreadUncheckedCreateNestedManyWithoutUserInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutUserInput
    rewards?: RewardUncheckedCreateNestedManyWithoutUserInput
    profile?: PlayerProfileUncheckedCreateNestedOneWithoutUserInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    threads?: ThreadUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUpdateManyWithoutUserNestedInput
    rewards?: RewardUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    threads?: ThreadUncheckedUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutUserNestedInput
    rewards?: RewardUncheckedUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUncheckedUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutThreadsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionCreateNestedManyWithoutUserInput
    notes?: AgentNoteCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunCreateNestedManyWithoutUserInput
    rewards?: RewardCreateNestedManyWithoutUserInput
    profile?: PlayerProfileCreateNestedOneWithoutUserInput
    experiments?: ExperimentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutThreadsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutUserInput
    rewards?: RewardUncheckedCreateNestedManyWithoutUserInput
    profile?: PlayerProfileUncheckedCreateNestedOneWithoutUserInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutThreadsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutThreadsInput, UserUncheckedCreateWithoutThreadsInput>
  }

  export type MessageCreateWithoutThreadInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
  }

  export type MessageUncheckedCreateWithoutThreadInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
  }

  export type MessageCreateOrConnectWithoutThreadInput = {
    where: MessageWhereUniqueInput
    create: XOR<MessageCreateWithoutThreadInput, MessageUncheckedCreateWithoutThreadInput>
  }

  export type MessageCreateManyThreadInputEnvelope = {
    data: MessageCreateManyThreadInput | MessageCreateManyThreadInput[]
    skipDuplicates?: boolean
  }

  export type AgentNoteCreateWithoutThreadInput = {
    id?: string
    createdAt?: Date | string
    key: string
    value: string
    user: UserCreateNestedOneWithoutNotesInput
  }

  export type AgentNoteUncheckedCreateWithoutThreadInput = {
    id?: string
    createdAt?: Date | string
    userId: string
    key: string
    value: string
  }

  export type AgentNoteCreateOrConnectWithoutThreadInput = {
    where: AgentNoteWhereUniqueInput
    create: XOR<AgentNoteCreateWithoutThreadInput, AgentNoteUncheckedCreateWithoutThreadInput>
  }

  export type AgentNoteCreateManyThreadInputEnvelope = {
    data: AgentNoteCreateManyThreadInput | AgentNoteCreateManyThreadInput[]
    skipDuplicates?: boolean
  }

  export type ExperimentCreateWithoutThreadInput = {
    id?: string
    createdAt?: Date | string
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
    user: UserCreateNestedOneWithoutExperimentsInput
    events?: ExperimentEventCreateNestedManyWithoutExperimentInput
  }

  export type ExperimentUncheckedCreateWithoutThreadInput = {
    id?: string
    createdAt?: Date | string
    userId: string
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
    events?: ExperimentEventUncheckedCreateNestedManyWithoutExperimentInput
  }

  export type ExperimentCreateOrConnectWithoutThreadInput = {
    where: ExperimentWhereUniqueInput
    create: XOR<ExperimentCreateWithoutThreadInput, ExperimentUncheckedCreateWithoutThreadInput>
  }

  export type ExperimentCreateManyThreadInputEnvelope = {
    data: ExperimentCreateManyThreadInput | ExperimentCreateManyThreadInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutThreadsInput = {
    update: XOR<UserUpdateWithoutThreadsInput, UserUncheckedUpdateWithoutThreadsInput>
    create: XOR<UserCreateWithoutThreadsInput, UserUncheckedCreateWithoutThreadsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutThreadsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutThreadsInput, UserUncheckedUpdateWithoutThreadsInput>
  }

  export type UserUpdateWithoutThreadsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUpdateManyWithoutUserNestedInput
    rewards?: RewardUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutThreadsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutUserNestedInput
    rewards?: RewardUncheckedUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUncheckedUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type MessageUpsertWithWhereUniqueWithoutThreadInput = {
    where: MessageWhereUniqueInput
    update: XOR<MessageUpdateWithoutThreadInput, MessageUncheckedUpdateWithoutThreadInput>
    create: XOR<MessageCreateWithoutThreadInput, MessageUncheckedCreateWithoutThreadInput>
  }

  export type MessageUpdateWithWhereUniqueWithoutThreadInput = {
    where: MessageWhereUniqueInput
    data: XOR<MessageUpdateWithoutThreadInput, MessageUncheckedUpdateWithoutThreadInput>
  }

  export type MessageUpdateManyWithWhereWithoutThreadInput = {
    where: MessageScalarWhereInput
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyWithoutThreadInput>
  }

  export type MessageScalarWhereInput = {
    AND?: MessageScalarWhereInput | MessageScalarWhereInput[]
    OR?: MessageScalarWhereInput[]
    NOT?: MessageScalarWhereInput | MessageScalarWhereInput[]
    id?: StringFilter<"Message"> | string
    createdAt?: DateTimeFilter<"Message"> | Date | string
    role?: StringFilter<"Message"> | string
    content?: StringFilter<"Message"> | string
    threadId?: StringFilter<"Message"> | string
  }

  export type AgentNoteUpsertWithWhereUniqueWithoutThreadInput = {
    where: AgentNoteWhereUniqueInput
    update: XOR<AgentNoteUpdateWithoutThreadInput, AgentNoteUncheckedUpdateWithoutThreadInput>
    create: XOR<AgentNoteCreateWithoutThreadInput, AgentNoteUncheckedCreateWithoutThreadInput>
  }

  export type AgentNoteUpdateWithWhereUniqueWithoutThreadInput = {
    where: AgentNoteWhereUniqueInput
    data: XOR<AgentNoteUpdateWithoutThreadInput, AgentNoteUncheckedUpdateWithoutThreadInput>
  }

  export type AgentNoteUpdateManyWithWhereWithoutThreadInput = {
    where: AgentNoteScalarWhereInput
    data: XOR<AgentNoteUpdateManyMutationInput, AgentNoteUncheckedUpdateManyWithoutThreadInput>
  }

  export type ExperimentUpsertWithWhereUniqueWithoutThreadInput = {
    where: ExperimentWhereUniqueInput
    update: XOR<ExperimentUpdateWithoutThreadInput, ExperimentUncheckedUpdateWithoutThreadInput>
    create: XOR<ExperimentCreateWithoutThreadInput, ExperimentUncheckedCreateWithoutThreadInput>
  }

  export type ExperimentUpdateWithWhereUniqueWithoutThreadInput = {
    where: ExperimentWhereUniqueInput
    data: XOR<ExperimentUpdateWithoutThreadInput, ExperimentUncheckedUpdateWithoutThreadInput>
  }

  export type ExperimentUpdateManyWithWhereWithoutThreadInput = {
    where: ExperimentScalarWhereInput
    data: XOR<ExperimentUpdateManyMutationInput, ExperimentUncheckedUpdateManyWithoutThreadInput>
  }

  export type ThreadCreateWithoutMessagesInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    accessTier?: number
    user: UserCreateNestedOneWithoutThreadsInput
    notes?: AgentNoteCreateNestedManyWithoutThreadInput
    experiments?: ExperimentCreateNestedManyWithoutThreadInput
  }

  export type ThreadUncheckedCreateWithoutMessagesInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    userId: string
    accessTier?: number
    notes?: AgentNoteUncheckedCreateNestedManyWithoutThreadInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutThreadInput
  }

  export type ThreadCreateOrConnectWithoutMessagesInput = {
    where: ThreadWhereUniqueInput
    create: XOR<ThreadCreateWithoutMessagesInput, ThreadUncheckedCreateWithoutMessagesInput>
  }

  export type ThreadUpsertWithoutMessagesInput = {
    update: XOR<ThreadUpdateWithoutMessagesInput, ThreadUncheckedUpdateWithoutMessagesInput>
    create: XOR<ThreadCreateWithoutMessagesInput, ThreadUncheckedCreateWithoutMessagesInput>
    where?: ThreadWhereInput
  }

  export type ThreadUpdateToOneWithWhereWithoutMessagesInput = {
    where?: ThreadWhereInput
    data: XOR<ThreadUpdateWithoutMessagesInput, ThreadUncheckedUpdateWithoutMessagesInput>
  }

  export type ThreadUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    accessTier?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutThreadsNestedInput
    notes?: AgentNoteUpdateManyWithoutThreadNestedInput
    experiments?: ExperimentUpdateManyWithoutThreadNestedInput
  }

  export type ThreadUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    userId?: StringFieldUpdateOperationsInput | string
    accessTier?: IntFieldUpdateOperationsInput | number
    notes?: AgentNoteUncheckedUpdateManyWithoutThreadNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutThreadNestedInput
  }

  export type UserCreateWithoutNotesInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionCreateNestedManyWithoutUserInput
    threads?: ThreadCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunCreateNestedManyWithoutUserInput
    rewards?: RewardCreateNestedManyWithoutUserInput
    profile?: PlayerProfileCreateNestedOneWithoutUserInput
    experiments?: ExperimentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutNotesInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    threads?: ThreadUncheckedCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutUserInput
    rewards?: RewardUncheckedCreateNestedManyWithoutUserInput
    profile?: PlayerProfileUncheckedCreateNestedOneWithoutUserInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutNotesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutNotesInput, UserUncheckedCreateWithoutNotesInput>
  }

  export type ThreadCreateWithoutNotesInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    accessTier?: number
    user: UserCreateNestedOneWithoutThreadsInput
    messages?: MessageCreateNestedManyWithoutThreadInput
    experiments?: ExperimentCreateNestedManyWithoutThreadInput
  }

  export type ThreadUncheckedCreateWithoutNotesInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    userId: string
    accessTier?: number
    messages?: MessageUncheckedCreateNestedManyWithoutThreadInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutThreadInput
  }

  export type ThreadCreateOrConnectWithoutNotesInput = {
    where: ThreadWhereUniqueInput
    create: XOR<ThreadCreateWithoutNotesInput, ThreadUncheckedCreateWithoutNotesInput>
  }

  export type UserUpsertWithoutNotesInput = {
    update: XOR<UserUpdateWithoutNotesInput, UserUncheckedUpdateWithoutNotesInput>
    create: XOR<UserCreateWithoutNotesInput, UserUncheckedCreateWithoutNotesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutNotesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutNotesInput, UserUncheckedUpdateWithoutNotesInput>
  }

  export type UserUpdateWithoutNotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUpdateManyWithoutUserNestedInput
    threads?: ThreadUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUpdateManyWithoutUserNestedInput
    rewards?: RewardUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutNotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    threads?: ThreadUncheckedUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutUserNestedInput
    rewards?: RewardUncheckedUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUncheckedUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ThreadUpsertWithoutNotesInput = {
    update: XOR<ThreadUpdateWithoutNotesInput, ThreadUncheckedUpdateWithoutNotesInput>
    create: XOR<ThreadCreateWithoutNotesInput, ThreadUncheckedCreateWithoutNotesInput>
    where?: ThreadWhereInput
  }

  export type ThreadUpdateToOneWithWhereWithoutNotesInput = {
    where?: ThreadWhereInput
    data: XOR<ThreadUpdateWithoutNotesInput, ThreadUncheckedUpdateWithoutNotesInput>
  }

  export type ThreadUpdateWithoutNotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    accessTier?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutThreadsNestedInput
    messages?: MessageUpdateManyWithoutThreadNestedInput
    experiments?: ExperimentUpdateManyWithoutThreadNestedInput
  }

  export type ThreadUncheckedUpdateWithoutNotesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    userId?: StringFieldUpdateOperationsInput | string
    accessTier?: IntFieldUpdateOperationsInput | number
    messages?: MessageUncheckedUpdateManyWithoutThreadNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutThreadNestedInput
  }

  export type UserCreateWithoutExperimentsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionCreateNestedManyWithoutUserInput
    threads?: ThreadCreateNestedManyWithoutUserInput
    notes?: AgentNoteCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunCreateNestedManyWithoutUserInput
    rewards?: RewardCreateNestedManyWithoutUserInput
    profile?: PlayerProfileCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutExperimentsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    threads?: ThreadUncheckedCreateNestedManyWithoutUserInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutUserInput
    rewards?: RewardUncheckedCreateNestedManyWithoutUserInput
    profile?: PlayerProfileUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutExperimentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutExperimentsInput, UserUncheckedCreateWithoutExperimentsInput>
  }

  export type ThreadCreateWithoutExperimentsInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    accessTier?: number
    user: UserCreateNestedOneWithoutThreadsInput
    messages?: MessageCreateNestedManyWithoutThreadInput
    notes?: AgentNoteCreateNestedManyWithoutThreadInput
  }

  export type ThreadUncheckedCreateWithoutExperimentsInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    userId: string
    accessTier?: number
    messages?: MessageUncheckedCreateNestedManyWithoutThreadInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutThreadInput
  }

  export type ThreadCreateOrConnectWithoutExperimentsInput = {
    where: ThreadWhereUniqueInput
    create: XOR<ThreadCreateWithoutExperimentsInput, ThreadUncheckedCreateWithoutExperimentsInput>
  }

  export type ExperimentEventCreateWithoutExperimentInput = {
    id?: string
    createdAt?: Date | string
    observation?: string | null
    result?: string | null
    score?: number | null
  }

  export type ExperimentEventUncheckedCreateWithoutExperimentInput = {
    id?: string
    createdAt?: Date | string
    observation?: string | null
    result?: string | null
    score?: number | null
  }

  export type ExperimentEventCreateOrConnectWithoutExperimentInput = {
    where: ExperimentEventWhereUniqueInput
    create: XOR<ExperimentEventCreateWithoutExperimentInput, ExperimentEventUncheckedCreateWithoutExperimentInput>
  }

  export type ExperimentEventCreateManyExperimentInputEnvelope = {
    data: ExperimentEventCreateManyExperimentInput | ExperimentEventCreateManyExperimentInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutExperimentsInput = {
    update: XOR<UserUpdateWithoutExperimentsInput, UserUncheckedUpdateWithoutExperimentsInput>
    create: XOR<UserCreateWithoutExperimentsInput, UserUncheckedCreateWithoutExperimentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutExperimentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutExperimentsInput, UserUncheckedUpdateWithoutExperimentsInput>
  }

  export type UserUpdateWithoutExperimentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUpdateManyWithoutUserNestedInput
    threads?: ThreadUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUpdateManyWithoutUserNestedInput
    rewards?: RewardUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutExperimentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    threads?: ThreadUncheckedUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutUserNestedInput
    rewards?: RewardUncheckedUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUncheckedUpdateOneWithoutUserNestedInput
  }

  export type ThreadUpsertWithoutExperimentsInput = {
    update: XOR<ThreadUpdateWithoutExperimentsInput, ThreadUncheckedUpdateWithoutExperimentsInput>
    create: XOR<ThreadCreateWithoutExperimentsInput, ThreadUncheckedCreateWithoutExperimentsInput>
    where?: ThreadWhereInput
  }

  export type ThreadUpdateToOneWithWhereWithoutExperimentsInput = {
    where?: ThreadWhereInput
    data: XOR<ThreadUpdateWithoutExperimentsInput, ThreadUncheckedUpdateWithoutExperimentsInput>
  }

  export type ThreadUpdateWithoutExperimentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    accessTier?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutThreadsNestedInput
    messages?: MessageUpdateManyWithoutThreadNestedInput
    notes?: AgentNoteUpdateManyWithoutThreadNestedInput
  }

  export type ThreadUncheckedUpdateWithoutExperimentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    userId?: StringFieldUpdateOperationsInput | string
    accessTier?: IntFieldUpdateOperationsInput | number
    messages?: MessageUncheckedUpdateManyWithoutThreadNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutThreadNestedInput
  }

  export type ExperimentEventUpsertWithWhereUniqueWithoutExperimentInput = {
    where: ExperimentEventWhereUniqueInput
    update: XOR<ExperimentEventUpdateWithoutExperimentInput, ExperimentEventUncheckedUpdateWithoutExperimentInput>
    create: XOR<ExperimentEventCreateWithoutExperimentInput, ExperimentEventUncheckedCreateWithoutExperimentInput>
  }

  export type ExperimentEventUpdateWithWhereUniqueWithoutExperimentInput = {
    where: ExperimentEventWhereUniqueInput
    data: XOR<ExperimentEventUpdateWithoutExperimentInput, ExperimentEventUncheckedUpdateWithoutExperimentInput>
  }

  export type ExperimentEventUpdateManyWithWhereWithoutExperimentInput = {
    where: ExperimentEventScalarWhereInput
    data: XOR<ExperimentEventUpdateManyMutationInput, ExperimentEventUncheckedUpdateManyWithoutExperimentInput>
  }

  export type ExperimentEventScalarWhereInput = {
    AND?: ExperimentEventScalarWhereInput | ExperimentEventScalarWhereInput[]
    OR?: ExperimentEventScalarWhereInput[]
    NOT?: ExperimentEventScalarWhereInput | ExperimentEventScalarWhereInput[]
    id?: StringFilter<"ExperimentEvent"> | string
    createdAt?: DateTimeFilter<"ExperimentEvent"> | Date | string
    experimentId?: StringFilter<"ExperimentEvent"> | string
    observation?: StringNullableFilter<"ExperimentEvent"> | string | null
    result?: StringNullableFilter<"ExperimentEvent"> | string | null
    score?: FloatNullableFilter<"ExperimentEvent"> | number | null
  }

  export type ExperimentCreateWithoutEventsInput = {
    id?: string
    createdAt?: Date | string
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
    user: UserCreateNestedOneWithoutExperimentsInput
    thread?: ThreadCreateNestedOneWithoutExperimentsInput
  }

  export type ExperimentUncheckedCreateWithoutEventsInput = {
    id?: string
    createdAt?: Date | string
    userId: string
    threadId?: string | null
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
  }

  export type ExperimentCreateOrConnectWithoutEventsInput = {
    where: ExperimentWhereUniqueInput
    create: XOR<ExperimentCreateWithoutEventsInput, ExperimentUncheckedCreateWithoutEventsInput>
  }

  export type ExperimentUpsertWithoutEventsInput = {
    update: XOR<ExperimentUpdateWithoutEventsInput, ExperimentUncheckedUpdateWithoutEventsInput>
    create: XOR<ExperimentCreateWithoutEventsInput, ExperimentUncheckedCreateWithoutEventsInput>
    where?: ExperimentWhereInput
  }

  export type ExperimentUpdateToOneWithWhereWithoutEventsInput = {
    where?: ExperimentWhereInput
    data: XOR<ExperimentUpdateWithoutEventsInput, ExperimentUncheckedUpdateWithoutEventsInput>
  }

  export type ExperimentUpdateWithoutEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutExperimentsNestedInput
    thread?: ThreadUpdateOneWithoutExperimentsNestedInput
  }

  export type ExperimentUncheckedUpdateWithoutEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateWithoutGameSessionsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionCreateNestedManyWithoutUserInput
    threads?: ThreadCreateNestedManyWithoutUserInput
    notes?: AgentNoteCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunCreateNestedManyWithoutUserInput
    rewards?: RewardCreateNestedManyWithoutUserInput
    profile?: PlayerProfileCreateNestedOneWithoutUserInput
    experiments?: ExperimentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutGameSessionsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    threads?: ThreadUncheckedCreateNestedManyWithoutUserInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutUserInput
    rewards?: RewardUncheckedCreateNestedManyWithoutUserInput
    profile?: PlayerProfileUncheckedCreateNestedOneWithoutUserInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutGameSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGameSessionsInput, UserUncheckedCreateWithoutGameSessionsInput>
  }

  export type GameMessageCreateWithoutGameSessionInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
  }

  export type GameMessageUncheckedCreateWithoutGameSessionInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
  }

  export type GameMessageCreateOrConnectWithoutGameSessionInput = {
    where: GameMessageWhereUniqueInput
    create: XOR<GameMessageCreateWithoutGameSessionInput, GameMessageUncheckedCreateWithoutGameSessionInput>
  }

  export type GameMessageCreateManyGameSessionInputEnvelope = {
    data: GameMessageCreateManyGameSessionInput | GameMessageCreateManyGameSessionInput[]
    skipDuplicates?: boolean
  }

  export type MissionRunCreateWithoutSessionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    mission: MissionDefinitionCreateNestedOneWithoutMissionRunsInput
    user: UserCreateNestedOneWithoutMissionRunsInput
    rewards?: RewardCreateNestedManyWithoutMissionRunInput
  }

  export type MissionRunUncheckedCreateWithoutSessionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId: string
    userId: string
    rewards?: RewardUncheckedCreateNestedManyWithoutMissionRunInput
  }

  export type MissionRunCreateOrConnectWithoutSessionInput = {
    where: MissionRunWhereUniqueInput
    create: XOR<MissionRunCreateWithoutSessionInput, MissionRunUncheckedCreateWithoutSessionInput>
  }

  export type MissionRunCreateManySessionInputEnvelope = {
    data: MissionRunCreateManySessionInput | MissionRunCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type MemoryEventCreateWithoutSessionInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    user: UserCreateNestedOneWithoutMemoryEventsInput
    embeddings?: MemoryEmbeddingCreateNestedManyWithoutMemoryInput
  }

  export type MemoryEventUncheckedCreateWithoutSessionInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    userId: string
    embeddings?: MemoryEmbeddingUncheckedCreateNestedManyWithoutMemoryInput
  }

  export type MemoryEventCreateOrConnectWithoutSessionInput = {
    where: MemoryEventWhereUniqueInput
    create: XOR<MemoryEventCreateWithoutSessionInput, MemoryEventUncheckedCreateWithoutSessionInput>
  }

  export type MemoryEventCreateManySessionInputEnvelope = {
    data: MemoryEventCreateManySessionInput | MemoryEventCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutGameSessionsInput = {
    update: XOR<UserUpdateWithoutGameSessionsInput, UserUncheckedUpdateWithoutGameSessionsInput>
    create: XOR<UserCreateWithoutGameSessionsInput, UserUncheckedCreateWithoutGameSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGameSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGameSessionsInput, UserUncheckedUpdateWithoutGameSessionsInput>
  }

  export type UserUpdateWithoutGameSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUpdateManyWithoutUserNestedInput
    threads?: ThreadUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUpdateManyWithoutUserNestedInput
    rewards?: RewardUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutGameSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    threads?: ThreadUncheckedUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutUserNestedInput
    rewards?: RewardUncheckedUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUncheckedUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type GameMessageUpsertWithWhereUniqueWithoutGameSessionInput = {
    where: GameMessageWhereUniqueInput
    update: XOR<GameMessageUpdateWithoutGameSessionInput, GameMessageUncheckedUpdateWithoutGameSessionInput>
    create: XOR<GameMessageCreateWithoutGameSessionInput, GameMessageUncheckedCreateWithoutGameSessionInput>
  }

  export type GameMessageUpdateWithWhereUniqueWithoutGameSessionInput = {
    where: GameMessageWhereUniqueInput
    data: XOR<GameMessageUpdateWithoutGameSessionInput, GameMessageUncheckedUpdateWithoutGameSessionInput>
  }

  export type GameMessageUpdateManyWithWhereWithoutGameSessionInput = {
    where: GameMessageScalarWhereInput
    data: XOR<GameMessageUpdateManyMutationInput, GameMessageUncheckedUpdateManyWithoutGameSessionInput>
  }

  export type GameMessageScalarWhereInput = {
    AND?: GameMessageScalarWhereInput | GameMessageScalarWhereInput[]
    OR?: GameMessageScalarWhereInput[]
    NOT?: GameMessageScalarWhereInput | GameMessageScalarWhereInput[]
    id?: StringFilter<"GameMessage"> | string
    createdAt?: DateTimeFilter<"GameMessage"> | Date | string
    role?: StringFilter<"GameMessage"> | string
    content?: StringFilter<"GameMessage"> | string
    gameSessionId?: StringFilter<"GameMessage"> | string
  }

  export type MissionRunUpsertWithWhereUniqueWithoutSessionInput = {
    where: MissionRunWhereUniqueInput
    update: XOR<MissionRunUpdateWithoutSessionInput, MissionRunUncheckedUpdateWithoutSessionInput>
    create: XOR<MissionRunCreateWithoutSessionInput, MissionRunUncheckedCreateWithoutSessionInput>
  }

  export type MissionRunUpdateWithWhereUniqueWithoutSessionInput = {
    where: MissionRunWhereUniqueInput
    data: XOR<MissionRunUpdateWithoutSessionInput, MissionRunUncheckedUpdateWithoutSessionInput>
  }

  export type MissionRunUpdateManyWithWhereWithoutSessionInput = {
    where: MissionRunScalarWhereInput
    data: XOR<MissionRunUpdateManyMutationInput, MissionRunUncheckedUpdateManyWithoutSessionInput>
  }

  export type MemoryEventUpsertWithWhereUniqueWithoutSessionInput = {
    where: MemoryEventWhereUniqueInput
    update: XOR<MemoryEventUpdateWithoutSessionInput, MemoryEventUncheckedUpdateWithoutSessionInput>
    create: XOR<MemoryEventCreateWithoutSessionInput, MemoryEventUncheckedCreateWithoutSessionInput>
  }

  export type MemoryEventUpdateWithWhereUniqueWithoutSessionInput = {
    where: MemoryEventWhereUniqueInput
    data: XOR<MemoryEventUpdateWithoutSessionInput, MemoryEventUncheckedUpdateWithoutSessionInput>
  }

  export type MemoryEventUpdateManyWithWhereWithoutSessionInput = {
    where: MemoryEventScalarWhereInput
    data: XOR<MemoryEventUpdateManyMutationInput, MemoryEventUncheckedUpdateManyWithoutSessionInput>
  }

  export type GameSessionCreateWithoutMessagesInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    user: UserCreateNestedOneWithoutGameSessionsInput
    missionRuns?: MissionRunCreateNestedManyWithoutSessionInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutSessionInput
  }

  export type GameSessionUncheckedCreateWithoutMessagesInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    userId: string
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutSessionInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutSessionInput
  }

  export type GameSessionCreateOrConnectWithoutMessagesInput = {
    where: GameSessionWhereUniqueInput
    create: XOR<GameSessionCreateWithoutMessagesInput, GameSessionUncheckedCreateWithoutMessagesInput>
  }

  export type GameSessionUpsertWithoutMessagesInput = {
    update: XOR<GameSessionUpdateWithoutMessagesInput, GameSessionUncheckedUpdateWithoutMessagesInput>
    create: XOR<GameSessionCreateWithoutMessagesInput, GameSessionUncheckedCreateWithoutMessagesInput>
    where?: GameSessionWhereInput
  }

  export type GameSessionUpdateToOneWithWhereWithoutMessagesInput = {
    where?: GameSessionWhereInput
    data: XOR<GameSessionUpdateWithoutMessagesInput, GameSessionUncheckedUpdateWithoutMessagesInput>
  }

  export type GameSessionUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutGameSessionsNestedInput
    missionRuns?: MissionRunUpdateManyWithoutSessionNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutSessionNestedInput
  }

  export type GameSessionUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    missionRuns?: MissionRunUncheckedUpdateManyWithoutSessionNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type UserCreateWithoutMemoryEventsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionCreateNestedManyWithoutUserInput
    threads?: ThreadCreateNestedManyWithoutUserInput
    notes?: AgentNoteCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunCreateNestedManyWithoutUserInput
    rewards?: RewardCreateNestedManyWithoutUserInput
    profile?: PlayerProfileCreateNestedOneWithoutUserInput
    experiments?: ExperimentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMemoryEventsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    threads?: ThreadUncheckedCreateNestedManyWithoutUserInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutUserInput
    rewards?: RewardUncheckedCreateNestedManyWithoutUserInput
    profile?: PlayerProfileUncheckedCreateNestedOneWithoutUserInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMemoryEventsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMemoryEventsInput, UserUncheckedCreateWithoutMemoryEventsInput>
  }

  export type GameSessionCreateWithoutMemoryEventsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    user: UserCreateNestedOneWithoutGameSessionsInput
    messages?: GameMessageCreateNestedManyWithoutGameSessionInput
    missionRuns?: MissionRunCreateNestedManyWithoutSessionInput
  }

  export type GameSessionUncheckedCreateWithoutMemoryEventsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    userId: string
    messages?: GameMessageUncheckedCreateNestedManyWithoutGameSessionInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutSessionInput
  }

  export type GameSessionCreateOrConnectWithoutMemoryEventsInput = {
    where: GameSessionWhereUniqueInput
    create: XOR<GameSessionCreateWithoutMemoryEventsInput, GameSessionUncheckedCreateWithoutMemoryEventsInput>
  }

  export type MemoryEmbeddingCreateWithoutMemoryInput = {
    id?: string
    createdAt?: Date | string
    provider?: string | null
    dimensions?: number | null
    vector: JsonNullValueInput | InputJsonValue
  }

  export type MemoryEmbeddingUncheckedCreateWithoutMemoryInput = {
    id?: string
    createdAt?: Date | string
    provider?: string | null
    dimensions?: number | null
    vector: JsonNullValueInput | InputJsonValue
  }

  export type MemoryEmbeddingCreateOrConnectWithoutMemoryInput = {
    where: MemoryEmbeddingWhereUniqueInput
    create: XOR<MemoryEmbeddingCreateWithoutMemoryInput, MemoryEmbeddingUncheckedCreateWithoutMemoryInput>
  }

  export type MemoryEmbeddingCreateManyMemoryInputEnvelope = {
    data: MemoryEmbeddingCreateManyMemoryInput | MemoryEmbeddingCreateManyMemoryInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutMemoryEventsInput = {
    update: XOR<UserUpdateWithoutMemoryEventsInput, UserUncheckedUpdateWithoutMemoryEventsInput>
    create: XOR<UserCreateWithoutMemoryEventsInput, UserUncheckedCreateWithoutMemoryEventsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMemoryEventsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMemoryEventsInput, UserUncheckedUpdateWithoutMemoryEventsInput>
  }

  export type UserUpdateWithoutMemoryEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUpdateManyWithoutUserNestedInput
    threads?: ThreadUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUpdateManyWithoutUserNestedInput
    rewards?: RewardUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMemoryEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    threads?: ThreadUncheckedUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutUserNestedInput
    rewards?: RewardUncheckedUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUncheckedUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type GameSessionUpsertWithoutMemoryEventsInput = {
    update: XOR<GameSessionUpdateWithoutMemoryEventsInput, GameSessionUncheckedUpdateWithoutMemoryEventsInput>
    create: XOR<GameSessionCreateWithoutMemoryEventsInput, GameSessionUncheckedCreateWithoutMemoryEventsInput>
    where?: GameSessionWhereInput
  }

  export type GameSessionUpdateToOneWithWhereWithoutMemoryEventsInput = {
    where?: GameSessionWhereInput
    data: XOR<GameSessionUpdateWithoutMemoryEventsInput, GameSessionUncheckedUpdateWithoutMemoryEventsInput>
  }

  export type GameSessionUpdateWithoutMemoryEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutGameSessionsNestedInput
    messages?: GameMessageUpdateManyWithoutGameSessionNestedInput
    missionRuns?: MissionRunUpdateManyWithoutSessionNestedInput
  }

  export type GameSessionUncheckedUpdateWithoutMemoryEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    messages?: GameMessageUncheckedUpdateManyWithoutGameSessionNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type MemoryEmbeddingUpsertWithWhereUniqueWithoutMemoryInput = {
    where: MemoryEmbeddingWhereUniqueInput
    update: XOR<MemoryEmbeddingUpdateWithoutMemoryInput, MemoryEmbeddingUncheckedUpdateWithoutMemoryInput>
    create: XOR<MemoryEmbeddingCreateWithoutMemoryInput, MemoryEmbeddingUncheckedCreateWithoutMemoryInput>
  }

  export type MemoryEmbeddingUpdateWithWhereUniqueWithoutMemoryInput = {
    where: MemoryEmbeddingWhereUniqueInput
    data: XOR<MemoryEmbeddingUpdateWithoutMemoryInput, MemoryEmbeddingUncheckedUpdateWithoutMemoryInput>
  }

  export type MemoryEmbeddingUpdateManyWithWhereWithoutMemoryInput = {
    where: MemoryEmbeddingScalarWhereInput
    data: XOR<MemoryEmbeddingUpdateManyMutationInput, MemoryEmbeddingUncheckedUpdateManyWithoutMemoryInput>
  }

  export type MemoryEmbeddingScalarWhereInput = {
    AND?: MemoryEmbeddingScalarWhereInput | MemoryEmbeddingScalarWhereInput[]
    OR?: MemoryEmbeddingScalarWhereInput[]
    NOT?: MemoryEmbeddingScalarWhereInput | MemoryEmbeddingScalarWhereInput[]
    id?: StringFilter<"MemoryEmbedding"> | string
    createdAt?: DateTimeFilter<"MemoryEmbedding"> | Date | string
    provider?: StringNullableFilter<"MemoryEmbedding"> | string | null
    dimensions?: IntNullableFilter<"MemoryEmbedding"> | number | null
    vector?: JsonFilter<"MemoryEmbedding">
    memoryEventId?: StringFilter<"MemoryEmbedding"> | string
  }

  export type MemoryEventCreateWithoutEmbeddingsInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    user: UserCreateNestedOneWithoutMemoryEventsInput
    session?: GameSessionCreateNestedOneWithoutMemoryEventsInput
  }

  export type MemoryEventUncheckedCreateWithoutEmbeddingsInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    userId: string
    sessionId?: string | null
  }

  export type MemoryEventCreateOrConnectWithoutEmbeddingsInput = {
    where: MemoryEventWhereUniqueInput
    create: XOR<MemoryEventCreateWithoutEmbeddingsInput, MemoryEventUncheckedCreateWithoutEmbeddingsInput>
  }

  export type MemoryEventUpsertWithoutEmbeddingsInput = {
    update: XOR<MemoryEventUpdateWithoutEmbeddingsInput, MemoryEventUncheckedUpdateWithoutEmbeddingsInput>
    create: XOR<MemoryEventCreateWithoutEmbeddingsInput, MemoryEventUncheckedCreateWithoutEmbeddingsInput>
    where?: MemoryEventWhereInput
  }

  export type MemoryEventUpdateToOneWithWhereWithoutEmbeddingsInput = {
    where?: MemoryEventWhereInput
    data: XOR<MemoryEventUpdateWithoutEmbeddingsInput, MemoryEventUncheckedUpdateWithoutEmbeddingsInput>
  }

  export type MemoryEventUpdateWithoutEmbeddingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    user?: UserUpdateOneRequiredWithoutMemoryEventsNestedInput
    session?: GameSessionUpdateOneWithoutMemoryEventsNestedInput
  }

  export type MemoryEventUncheckedUpdateWithoutEmbeddingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateWithoutProfileInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionCreateNestedManyWithoutUserInput
    threads?: ThreadCreateNestedManyWithoutUserInput
    notes?: AgentNoteCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunCreateNestedManyWithoutUserInput
    rewards?: RewardCreateNestedManyWithoutUserInput
    experiments?: ExperimentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProfileInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    threads?: ThreadUncheckedCreateNestedManyWithoutUserInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutUserInput
    rewards?: RewardUncheckedCreateNestedManyWithoutUserInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProfileInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
  }

  export type UserUpsertWithoutProfileInput = {
    update: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProfileInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
  }

  export type UserUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUpdateManyWithoutUserNestedInput
    threads?: ThreadUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUpdateManyWithoutUserNestedInput
    rewards?: RewardUpdateManyWithoutUserNestedInput
    experiments?: ExperimentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    threads?: ThreadUncheckedUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutUserNestedInput
    rewards?: RewardUncheckedUpdateManyWithoutUserNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type MissionRunCreateWithoutMissionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    user: UserCreateNestedOneWithoutMissionRunsInput
    session?: GameSessionCreateNestedOneWithoutMissionRunsInput
    rewards?: RewardCreateNestedManyWithoutMissionRunInput
  }

  export type MissionRunUncheckedCreateWithoutMissionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    userId: string
    sessionId?: string | null
    rewards?: RewardUncheckedCreateNestedManyWithoutMissionRunInput
  }

  export type MissionRunCreateOrConnectWithoutMissionInput = {
    where: MissionRunWhereUniqueInput
    create: XOR<MissionRunCreateWithoutMissionInput, MissionRunUncheckedCreateWithoutMissionInput>
  }

  export type MissionRunCreateManyMissionInputEnvelope = {
    data: MissionRunCreateManyMissionInput | MissionRunCreateManyMissionInput[]
    skipDuplicates?: boolean
  }

  export type MissionRunUpsertWithWhereUniqueWithoutMissionInput = {
    where: MissionRunWhereUniqueInput
    update: XOR<MissionRunUpdateWithoutMissionInput, MissionRunUncheckedUpdateWithoutMissionInput>
    create: XOR<MissionRunCreateWithoutMissionInput, MissionRunUncheckedCreateWithoutMissionInput>
  }

  export type MissionRunUpdateWithWhereUniqueWithoutMissionInput = {
    where: MissionRunWhereUniqueInput
    data: XOR<MissionRunUpdateWithoutMissionInput, MissionRunUncheckedUpdateWithoutMissionInput>
  }

  export type MissionRunUpdateManyWithWhereWithoutMissionInput = {
    where: MissionRunScalarWhereInput
    data: XOR<MissionRunUpdateManyMutationInput, MissionRunUncheckedUpdateManyWithoutMissionInput>
  }

  export type MissionDefinitionCreateWithoutMissionRunsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    prompt: string
    type?: string
    minEvidence?: number
    tags?: MissionDefinitionCreatetagsInput | string[]
    active?: boolean
  }

  export type MissionDefinitionUncheckedCreateWithoutMissionRunsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    title: string
    prompt: string
    type?: string
    minEvidence?: number
    tags?: MissionDefinitionCreatetagsInput | string[]
    active?: boolean
  }

  export type MissionDefinitionCreateOrConnectWithoutMissionRunsInput = {
    where: MissionDefinitionWhereUniqueInput
    create: XOR<MissionDefinitionCreateWithoutMissionRunsInput, MissionDefinitionUncheckedCreateWithoutMissionRunsInput>
  }

  export type UserCreateWithoutMissionRunsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionCreateNestedManyWithoutUserInput
    threads?: ThreadCreateNestedManyWithoutUserInput
    notes?: AgentNoteCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutUserInput
    rewards?: RewardCreateNestedManyWithoutUserInput
    profile?: PlayerProfileCreateNestedOneWithoutUserInput
    experiments?: ExperimentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMissionRunsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    threads?: ThreadUncheckedCreateNestedManyWithoutUserInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutUserInput
    rewards?: RewardUncheckedCreateNestedManyWithoutUserInput
    profile?: PlayerProfileUncheckedCreateNestedOneWithoutUserInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMissionRunsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMissionRunsInput, UserUncheckedCreateWithoutMissionRunsInput>
  }

  export type GameSessionCreateWithoutMissionRunsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    user: UserCreateNestedOneWithoutGameSessionsInput
    messages?: GameMessageCreateNestedManyWithoutGameSessionInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutSessionInput
  }

  export type GameSessionUncheckedCreateWithoutMissionRunsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
    userId: string
    messages?: GameMessageUncheckedCreateNestedManyWithoutGameSessionInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutSessionInput
  }

  export type GameSessionCreateOrConnectWithoutMissionRunsInput = {
    where: GameSessionWhereUniqueInput
    create: XOR<GameSessionCreateWithoutMissionRunsInput, GameSessionUncheckedCreateWithoutMissionRunsInput>
  }

  export type RewardCreateWithoutMissionRunInput = {
    id?: string
    createdAt?: Date | string
    type?: $Enums.RewardType
    amount?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    user: UserCreateNestedOneWithoutRewardsInput
  }

  export type RewardUncheckedCreateWithoutMissionRunInput = {
    id?: string
    createdAt?: Date | string
    type?: $Enums.RewardType
    amount?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    userId: string
  }

  export type RewardCreateOrConnectWithoutMissionRunInput = {
    where: RewardWhereUniqueInput
    create: XOR<RewardCreateWithoutMissionRunInput, RewardUncheckedCreateWithoutMissionRunInput>
  }

  export type RewardCreateManyMissionRunInputEnvelope = {
    data: RewardCreateManyMissionRunInput | RewardCreateManyMissionRunInput[]
    skipDuplicates?: boolean
  }

  export type MissionDefinitionUpsertWithoutMissionRunsInput = {
    update: XOR<MissionDefinitionUpdateWithoutMissionRunsInput, MissionDefinitionUncheckedUpdateWithoutMissionRunsInput>
    create: XOR<MissionDefinitionCreateWithoutMissionRunsInput, MissionDefinitionUncheckedCreateWithoutMissionRunsInput>
    where?: MissionDefinitionWhereInput
  }

  export type MissionDefinitionUpdateToOneWithWhereWithoutMissionRunsInput = {
    where?: MissionDefinitionWhereInput
    data: XOR<MissionDefinitionUpdateWithoutMissionRunsInput, MissionDefinitionUncheckedUpdateWithoutMissionRunsInput>
  }

  export type MissionDefinitionUpdateWithoutMissionRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    prompt?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    minEvidence?: IntFieldUpdateOperationsInput | number
    tags?: MissionDefinitionUpdatetagsInput | string[]
    active?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MissionDefinitionUncheckedUpdateWithoutMissionRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    title?: StringFieldUpdateOperationsInput | string
    prompt?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    minEvidence?: IntFieldUpdateOperationsInput | number
    tags?: MissionDefinitionUpdatetagsInput | string[]
    active?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UserUpsertWithoutMissionRunsInput = {
    update: XOR<UserUpdateWithoutMissionRunsInput, UserUncheckedUpdateWithoutMissionRunsInput>
    create: XOR<UserCreateWithoutMissionRunsInput, UserUncheckedCreateWithoutMissionRunsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMissionRunsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMissionRunsInput, UserUncheckedUpdateWithoutMissionRunsInput>
  }

  export type UserUpdateWithoutMissionRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUpdateManyWithoutUserNestedInput
    threads?: ThreadUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutUserNestedInput
    rewards?: RewardUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMissionRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    threads?: ThreadUncheckedUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutUserNestedInput
    rewards?: RewardUncheckedUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUncheckedUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type GameSessionUpsertWithoutMissionRunsInput = {
    update: XOR<GameSessionUpdateWithoutMissionRunsInput, GameSessionUncheckedUpdateWithoutMissionRunsInput>
    create: XOR<GameSessionCreateWithoutMissionRunsInput, GameSessionUncheckedCreateWithoutMissionRunsInput>
    where?: GameSessionWhereInput
  }

  export type GameSessionUpdateToOneWithWhereWithoutMissionRunsInput = {
    where?: GameSessionWhereInput
    data: XOR<GameSessionUpdateWithoutMissionRunsInput, GameSessionUncheckedUpdateWithoutMissionRunsInput>
  }

  export type GameSessionUpdateWithoutMissionRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutGameSessionsNestedInput
    messages?: GameMessageUpdateManyWithoutGameSessionNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutSessionNestedInput
  }

  export type GameSessionUncheckedUpdateWithoutMissionRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
    messages?: GameMessageUncheckedUpdateManyWithoutGameSessionNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type RewardUpsertWithWhereUniqueWithoutMissionRunInput = {
    where: RewardWhereUniqueInput
    update: XOR<RewardUpdateWithoutMissionRunInput, RewardUncheckedUpdateWithoutMissionRunInput>
    create: XOR<RewardCreateWithoutMissionRunInput, RewardUncheckedCreateWithoutMissionRunInput>
  }

  export type RewardUpdateWithWhereUniqueWithoutMissionRunInput = {
    where: RewardWhereUniqueInput
    data: XOR<RewardUpdateWithoutMissionRunInput, RewardUncheckedUpdateWithoutMissionRunInput>
  }

  export type RewardUpdateManyWithWhereWithoutMissionRunInput = {
    where: RewardScalarWhereInput
    data: XOR<RewardUpdateManyMutationInput, RewardUncheckedUpdateManyWithoutMissionRunInput>
  }

  export type UserCreateWithoutRewardsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionCreateNestedManyWithoutUserInput
    threads?: ThreadCreateNestedManyWithoutUserInput
    notes?: AgentNoteCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunCreateNestedManyWithoutUserInput
    profile?: PlayerProfileCreateNestedOneWithoutUserInput
    experiments?: ExperimentCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutRewardsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    email?: string | null
    handle?: string | null
    role?: $Enums.Role
    consentedAt?: Date | string | null
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    threads?: ThreadUncheckedCreateNestedManyWithoutUserInput
    notes?: AgentNoteUncheckedCreateNestedManyWithoutUserInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutUserInput
    memoryEvents?: MemoryEventUncheckedCreateNestedManyWithoutUserInput
    missionRuns?: MissionRunUncheckedCreateNestedManyWithoutUserInput
    profile?: PlayerProfileUncheckedCreateNestedOneWithoutUserInput
    experiments?: ExperimentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutRewardsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutRewardsInput, UserUncheckedCreateWithoutRewardsInput>
  }

  export type MissionRunCreateWithoutRewardsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    mission: MissionDefinitionCreateNestedOneWithoutMissionRunsInput
    user: UserCreateNestedOneWithoutMissionRunsInput
    session?: GameSessionCreateNestedOneWithoutMissionRunsInput
  }

  export type MissionRunUncheckedCreateWithoutRewardsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId: string
    userId: string
    sessionId?: string | null
  }

  export type MissionRunCreateOrConnectWithoutRewardsInput = {
    where: MissionRunWhereUniqueInput
    create: XOR<MissionRunCreateWithoutRewardsInput, MissionRunUncheckedCreateWithoutRewardsInput>
  }

  export type UserUpsertWithoutRewardsInput = {
    update: XOR<UserUpdateWithoutRewardsInput, UserUncheckedUpdateWithoutRewardsInput>
    create: XOR<UserCreateWithoutRewardsInput, UserUncheckedCreateWithoutRewardsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutRewardsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutRewardsInput, UserUncheckedUpdateWithoutRewardsInput>
  }

  export type UserUpdateWithoutRewardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUpdateManyWithoutUserNestedInput
    threads?: ThreadUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutRewardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    consentedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    threads?: ThreadUncheckedUpdateManyWithoutUserNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutUserNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutUserNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutUserNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutUserNestedInput
    profile?: PlayerProfileUncheckedUpdateOneWithoutUserNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type MissionRunUpsertWithoutRewardsInput = {
    update: XOR<MissionRunUpdateWithoutRewardsInput, MissionRunUncheckedUpdateWithoutRewardsInput>
    create: XOR<MissionRunCreateWithoutRewardsInput, MissionRunUncheckedCreateWithoutRewardsInput>
    where?: MissionRunWhereInput
  }

  export type MissionRunUpdateToOneWithWhereWithoutRewardsInput = {
    where?: MissionRunWhereInput
    data: XOR<MissionRunUpdateWithoutRewardsInput, MissionRunUncheckedUpdateWithoutRewardsInput>
  }

  export type MissionRunUpdateWithoutRewardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    mission?: MissionDefinitionUpdateOneRequiredWithoutMissionRunsNestedInput
    user?: UserUpdateOneRequiredWithoutMissionRunsNestedInput
    session?: GameSessionUpdateOneWithoutMissionRunsNestedInput
  }

  export type MissionRunUncheckedUpdateWithoutRewardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionCreateManyUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    token: string
  }

  export type ThreadCreateManyUserInput = {
    id?: string
    createdAt?: Date | string
    archivedAt?: Date | string | null
    kind?: $Enums.ThreadKind
    accessTier?: number
  }

  export type AgentNoteCreateManyUserInput = {
    id?: string
    createdAt?: Date | string
    threadId?: string | null
    key: string
    value: string
  }

  export type GameSessionCreateManyUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.SessionStatus
    summary?: string | null
  }

  export type MemoryEventCreateManyUserInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    sessionId?: string | null
  }

  export type MissionRunCreateManyUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId: string
    sessionId?: string | null
  }

  export type RewardCreateManyUserInput = {
    id?: string
    createdAt?: Date | string
    type?: $Enums.RewardType
    amount?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    missionRunId?: string | null
  }

  export type ExperimentCreateManyUserInput = {
    id?: string
    createdAt?: Date | string
    threadId?: string | null
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
  }

  export type SessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
  }

  export type SessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
  }

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
  }

  export type ThreadUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    accessTier?: IntFieldUpdateOperationsInput | number
    messages?: MessageUpdateManyWithoutThreadNestedInput
    notes?: AgentNoteUpdateManyWithoutThreadNestedInput
    experiments?: ExperimentUpdateManyWithoutThreadNestedInput
  }

  export type ThreadUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    accessTier?: IntFieldUpdateOperationsInput | number
    messages?: MessageUncheckedUpdateManyWithoutThreadNestedInput
    notes?: AgentNoteUncheckedUpdateManyWithoutThreadNestedInput
    experiments?: ExperimentUncheckedUpdateManyWithoutThreadNestedInput
  }

  export type ThreadUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    archivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    kind?: EnumThreadKindFieldUpdateOperationsInput | $Enums.ThreadKind
    accessTier?: IntFieldUpdateOperationsInput | number
  }

  export type AgentNoteUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    thread?: ThreadUpdateOneWithoutNotesNestedInput
  }

  export type AgentNoteUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type AgentNoteUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type GameSessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    messages?: GameMessageUpdateManyWithoutGameSessionNestedInput
    missionRuns?: MissionRunUpdateManyWithoutSessionNestedInput
    memoryEvents?: MemoryEventUpdateManyWithoutSessionNestedInput
  }

  export type GameSessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
    messages?: GameMessageUncheckedUpdateManyWithoutGameSessionNestedInput
    missionRuns?: MissionRunUncheckedUpdateManyWithoutSessionNestedInput
    memoryEvents?: MemoryEventUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type GameSessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus
    summary?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MemoryEventUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    session?: GameSessionUpdateOneWithoutMemoryEventsNestedInput
    embeddings?: MemoryEmbeddingUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryEventUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    embeddings?: MemoryEmbeddingUncheckedUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryEventUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MissionRunUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    mission?: MissionDefinitionUpdateOneRequiredWithoutMissionRunsNestedInput
    session?: GameSessionUpdateOneWithoutMissionRunsNestedInput
    rewards?: RewardUpdateManyWithoutMissionRunNestedInput
  }

  export type MissionRunUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    rewards?: RewardUncheckedUpdateManyWithoutMissionRunNestedInput
  }

  export type MissionRunUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RewardUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumRewardTypeFieldUpdateOperationsInput | $Enums.RewardType
    amount?: FloatFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    missionRun?: MissionRunUpdateOneWithoutRewardsNestedInput
  }

  export type RewardUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumRewardTypeFieldUpdateOperationsInput | $Enums.RewardType
    amount?: FloatFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    missionRunId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RewardUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumRewardTypeFieldUpdateOperationsInput | $Enums.RewardType
    amount?: FloatFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    missionRunId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExperimentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    thread?: ThreadUpdateOneWithoutExperimentsNestedInput
    events?: ExperimentEventUpdateManyWithoutExperimentNestedInput
  }

  export type ExperimentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    events?: ExperimentEventUncheckedUpdateManyWithoutExperimentNestedInput
  }

  export type ExperimentUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    threadId?: NullableStringFieldUpdateOperationsInput | string | null
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MessageCreateManyThreadInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
  }

  export type AgentNoteCreateManyThreadInput = {
    id?: string
    createdAt?: Date | string
    userId: string
    key: string
    value: string
  }

  export type ExperimentCreateManyThreadInput = {
    id?: string
    createdAt?: Date | string
    userId: string
    hypothesis: string
    task: string
    successCriteria?: string | null
    timeoutS?: number | null
    title?: string | null
  }

  export type MessageUpdateWithoutThreadInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
  }

  export type MessageUncheckedUpdateWithoutThreadInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
  }

  export type MessageUncheckedUpdateManyWithoutThreadInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
  }

  export type AgentNoteUpdateWithoutThreadInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    user?: UserUpdateOneRequiredWithoutNotesNestedInput
  }

  export type AgentNoteUncheckedUpdateWithoutThreadInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type AgentNoteUncheckedUpdateManyWithoutThreadInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type ExperimentUpdateWithoutThreadInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutExperimentsNestedInput
    events?: ExperimentEventUpdateManyWithoutExperimentNestedInput
  }

  export type ExperimentUncheckedUpdateWithoutThreadInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    events?: ExperimentEventUncheckedUpdateManyWithoutExperimentNestedInput
  }

  export type ExperimentUncheckedUpdateManyWithoutThreadInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    hypothesis?: StringFieldUpdateOperationsInput | string
    task?: StringFieldUpdateOperationsInput | string
    successCriteria?: NullableStringFieldUpdateOperationsInput | string | null
    timeoutS?: NullableIntFieldUpdateOperationsInput | number | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExperimentEventCreateManyExperimentInput = {
    id?: string
    createdAt?: Date | string
    observation?: string | null
    result?: string | null
    score?: number | null
  }

  export type ExperimentEventUpdateWithoutExperimentInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    observation?: NullableStringFieldUpdateOperationsInput | string | null
    result?: NullableStringFieldUpdateOperationsInput | string | null
    score?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ExperimentEventUncheckedUpdateWithoutExperimentInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    observation?: NullableStringFieldUpdateOperationsInput | string | null
    result?: NullableStringFieldUpdateOperationsInput | string | null
    score?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ExperimentEventUncheckedUpdateManyWithoutExperimentInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    observation?: NullableStringFieldUpdateOperationsInput | string | null
    result?: NullableStringFieldUpdateOperationsInput | string | null
    score?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type GameMessageCreateManyGameSessionInput = {
    id?: string
    createdAt?: Date | string
    role: string
    content: string
  }

  export type MissionRunCreateManySessionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId: string
    userId: string
  }

  export type MemoryEventCreateManySessionInput = {
    id?: string
    createdAt?: Date | string
    type: $Enums.MemoryEventType
    content: string
    tags?: MemoryEventCreatetagsInput | string[]
    userId: string
  }

  export type GameMessageUpdateWithoutGameSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
  }

  export type GameMessageUncheckedUpdateWithoutGameSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
  }

  export type GameMessageUncheckedUpdateManyWithoutGameSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
  }

  export type MissionRunUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    mission?: MissionDefinitionUpdateOneRequiredWithoutMissionRunsNestedInput
    user?: UserUpdateOneRequiredWithoutMissionRunsNestedInput
    rewards?: RewardUpdateManyWithoutMissionRunNestedInput
  }

  export type MissionRunUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rewards?: RewardUncheckedUpdateManyWithoutMissionRunNestedInput
  }

  export type MissionRunUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    missionId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type MemoryEventUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    user?: UserUpdateOneRequiredWithoutMemoryEventsNestedInput
    embeddings?: MemoryEmbeddingUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryEventUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    userId?: StringFieldUpdateOperationsInput | string
    embeddings?: MemoryEmbeddingUncheckedUpdateManyWithoutMemoryNestedInput
  }

  export type MemoryEventUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumMemoryEventTypeFieldUpdateOperationsInput | $Enums.MemoryEventType
    content?: StringFieldUpdateOperationsInput | string
    tags?: MemoryEventUpdatetagsInput | string[]
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type MemoryEmbeddingCreateManyMemoryInput = {
    id?: string
    createdAt?: Date | string
    provider?: string | null
    dimensions?: number | null
    vector: JsonNullValueInput | InputJsonValue
  }

  export type MemoryEmbeddingUpdateWithoutMemoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableIntFieldUpdateOperationsInput | number | null
    vector?: JsonNullValueInput | InputJsonValue
  }

  export type MemoryEmbeddingUncheckedUpdateWithoutMemoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableIntFieldUpdateOperationsInput | number | null
    vector?: JsonNullValueInput | InputJsonValue
  }

  export type MemoryEmbeddingUncheckedUpdateManyWithoutMemoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    dimensions?: NullableIntFieldUpdateOperationsInput | number | null
    vector?: JsonNullValueInput | InputJsonValue
  }

  export type MissionRunCreateManyMissionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    status?: $Enums.MissionRunStatus
    score?: number | null
    feedback?: string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    userId: string
    sessionId?: string | null
  }

  export type MissionRunUpdateWithoutMissionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    user?: UserUpdateOneRequiredWithoutMissionRunsNestedInput
    session?: GameSessionUpdateOneWithoutMissionRunsNestedInput
    rewards?: RewardUpdateManyWithoutMissionRunNestedInput
  }

  export type MissionRunUncheckedUpdateWithoutMissionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    rewards?: RewardUncheckedUpdateManyWithoutMissionRunNestedInput
  }

  export type MissionRunUncheckedUpdateManyWithoutMissionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumMissionRunStatusFieldUpdateOperationsInput | $Enums.MissionRunStatus
    score?: NullableFloatFieldUpdateOperationsInput | number | null
    feedback?: NullableStringFieldUpdateOperationsInput | string | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RewardCreateManyMissionRunInput = {
    id?: string
    createdAt?: Date | string
    type?: $Enums.RewardType
    amount?: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    userId: string
  }

  export type RewardUpdateWithoutMissionRunInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumRewardTypeFieldUpdateOperationsInput | $Enums.RewardType
    amount?: FloatFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    user?: UserUpdateOneRequiredWithoutRewardsNestedInput
  }

  export type RewardUncheckedUpdateWithoutMissionRunInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumRewardTypeFieldUpdateOperationsInput | $Enums.RewardType
    amount?: FloatFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type RewardUncheckedUpdateManyWithoutMissionRunInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    type?: EnumRewardTypeFieldUpdateOperationsInput | $Enums.RewardType
    amount?: FloatFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    userId?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ThreadCountOutputTypeDefaultArgs instead
     */
    export type ThreadCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ThreadCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ExperimentCountOutputTypeDefaultArgs instead
     */
    export type ExperimentCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExperimentCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GameSessionCountOutputTypeDefaultArgs instead
     */
    export type GameSessionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GameSessionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MemoryEventCountOutputTypeDefaultArgs instead
     */
    export type MemoryEventCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MemoryEventCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MissionDefinitionCountOutputTypeDefaultArgs instead
     */
    export type MissionDefinitionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MissionDefinitionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MissionRunCountOutputTypeDefaultArgs instead
     */
    export type MissionRunCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MissionRunCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SessionDefaultArgs instead
     */
    export type SessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SessionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ThreadDefaultArgs instead
     */
    export type ThreadArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ThreadDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MessageDefaultArgs instead
     */
    export type MessageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MessageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AgentNoteDefaultArgs instead
     */
    export type AgentNoteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AgentNoteDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ExperimentDefaultArgs instead
     */
    export type ExperimentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExperimentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ExperimentEventDefaultArgs instead
     */
    export type ExperimentEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExperimentEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GameSessionDefaultArgs instead
     */
    export type GameSessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GameSessionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GameMessageDefaultArgs instead
     */
    export type GameMessageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GameMessageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MemoryEventDefaultArgs instead
     */
    export type MemoryEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MemoryEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MemoryEmbeddingDefaultArgs instead
     */
    export type MemoryEmbeddingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MemoryEmbeddingDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PlayerProfileDefaultArgs instead
     */
    export type PlayerProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PlayerProfileDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MissionDefinitionDefaultArgs instead
     */
    export type MissionDefinitionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MissionDefinitionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MissionRunDefaultArgs instead
     */
    export type MissionRunArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MissionRunDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RewardDefaultArgs instead
     */
    export type RewardArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RewardDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}