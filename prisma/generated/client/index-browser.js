
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  email: 'email',
  handle: 'handle',
  role: 'role',
  consentedAt: 'consentedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  token: 'token'
};

exports.Prisma.ThreadScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  archivedAt: 'archivedAt',
  kind: 'kind',
  userId: 'userId',
  accessTier: 'accessTier'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  role: 'role',
  content: 'content',
  threadId: 'threadId'
};

exports.Prisma.AgentNoteScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  userId: 'userId',
  threadId: 'threadId',
  key: 'key',
  value: 'value'
};

exports.Prisma.ExperimentScalarFieldEnum = {
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

exports.Prisma.ExperimentEventScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  experimentId: 'experimentId',
  observation: 'observation',
  result: 'result',
  score: 'score'
};

exports.Prisma.GameSessionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  status: 'status',
  summary: 'summary',
  userId: 'userId'
};

exports.Prisma.GameMessageScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  role: 'role',
  content: 'content',
  gameSessionId: 'gameSessionId'
};

exports.Prisma.MemoryEventScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  type: 'type',
  content: 'content',
  tags: 'tags',
  userId: 'userId',
  sessionId: 'sessionId'
};

exports.Prisma.MemoryEmbeddingScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  provider: 'provider',
  dimensions: 'dimensions',
  vector: 'vector',
  memoryEventId: 'memoryEventId'
};

exports.Prisma.PlayerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  traits: 'traits',
  skills: 'skills',
  preferences: 'preferences',
  updatedAt: 'updatedAt'
};

exports.Prisma.MissionDefinitionScalarFieldEnum = {
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

exports.Prisma.MissionRunScalarFieldEnum = {
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

exports.Prisma.RewardScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  type: 'type',
  amount: 'amount',
  metadata: 'metadata',
  userId: 'userId',
  missionRunId: 'missionRunId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  AGENT: 'AGENT',
  ADMIN: 'ADMIN'
};

exports.ThreadKind = exports.$Enums.ThreadKind = {
  ADVENTURE: 'ADVENTURE',
  OPS: 'OPS'
};

exports.SessionStatus = exports.$Enums.SessionStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED'
};

exports.MemoryEventType = exports.$Enums.MemoryEventType = {
  OBSERVATION: 'OBSERVATION',
  REFLECTION: 'REFLECTION',
  MISSION: 'MISSION',
  REPORT: 'REPORT',
  SYSTEM: 'SYSTEM',
  TOOL: 'TOOL'
};

exports.MissionRunStatus = exports.$Enums.MissionRunStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  SUBMITTED: 'SUBMITTED',
  REVIEWING: 'REVIEWING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

exports.RewardType = exports.$Enums.RewardType = {
  CREDIT: 'CREDIT',
  TOKEN: 'TOKEN',
  BADGE: 'BADGE'
};

exports.Prisma.ModelName = {
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

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
