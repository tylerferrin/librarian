---
name: cathedral-cqrs
description: Create CQRS queries and commands in Cathedral. Use when creating new query/command classes, handlers, when a service needs to interact with infrastructure (database, Redis, external APIs), or when deciding how a service should access a port/adapter.
---

# Creating CQRS Queries and Commands in Cathedral

Step-by-step guide for creating queries and commands following project conventions.

## Critical Architecture Rule

**CQRS is for cross-domain communication.** Within the same domain, services can use ports directly.

### Same-Domain Access (Direct Port Injection)

Within a domain, services/handlers/crons CAN inject ports directly:

```typescript
// ✅ CORRECT - Same domain (patient cron using patient port)
@Injectable()
export class EncounterSyncCronService {
  constructor(
    private readonly encounterSyncCache: EncounterSyncCachePort,  // Same domain - OK!
    private readonly queryBus: QueryBus,  // For cross-domain queries
  ) {}
}

// ✅ CORRECT - Handler injects the port (always allowed)
@Injectable()
@CommandHandler(CreateSomethingCommand)
export class CreateSomethingHandler {
  constructor(private readonly repository: SomeRepositoryPort) {} // Handlers CAN inject ports
}
```

### Cross-Domain Access (Use CQRS)

When accessing data from another domain, use CommandBus/QueryBus:

```typescript
// ✅ CORRECT - Cross-domain (ui-api reading from patient domain)
@Injectable()
export class ShiftListService {
  constructor(private readonly queryBus: QueryBus) {}

  async getLastSyncedAt(orgId: number) {
    // patient domain exposes this via query
    return await this.queryBus.execute(new GetEncounterLastSyncedQuery({ organizationId: orgId }));
  }
}

// ❌ WRONG - Cross-domain direct import
@Injectable()
export class ShiftListService {
  constructor(private readonly encounterSyncCache: EncounterSyncCachePort) {} // Don't import from patient!
}
```

### Why This Matters

- Makes cross-domain dependencies **explicit and traceable**
- Allows efficient intra-domain access without CQRS overhead
- Domain boundaries are enforced at the CQRS layer

## Creating a Query

### Step 1: Create the Query Class

Location: `apps/cathedral/src/modules/{module}/application/cqrs/queries/{name}.query.ts`

Use the **same class shape as commands**: declare `readonly` properties on the class, object destructuring in the constructor, and assign in the constructor body.

```typescript
import { POJO } from '@lib/types/pojo.type';
import { SomeEntity } from '@modules/{module}/domain/entities/some.entity';
import { Query } from '@nestjs/cqrs';

export class GetSomethingByIdQuery extends Query<POJO<SomeEntity>> {
  readonly id: number;
  readonly userId: string;

  constructor({ id, userId }: { id: number; userId: string }) {
    super();
    this.id = id;
    this.userId = userId;
  }
}
```

Key points:
- Extend `Query<ReturnType>` with the return type in the generic
- **Declare each parameter as a `readonly` property on the class** (same style as commands)
- **Constructor**: single object argument, destructure, then `this.prop = prop` for each
- Use `POJO<Entity>` for serialized return types when appropriate

### Step 2: Create the Handler

Location: `apps/cathedral/src/modules/{module}/application/cqrs/handlers/{name}.handler.ts`

```typescript
import { HandleError } from '@lib/decorators/handle-errors.decorator';
import { POJO } from '@lib/types/pojo.type';
import { SomeEntity } from '@modules/{module}/domain/entities/some.entity';
import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SomeRepositoryPort } from '../../ports/some.repository.port';
import { GetSomethingByIdQuery } from '../queries/get-something-by-id.query';

@Injectable()
@QueryHandler(GetSomethingByIdQuery)
export class GetSomethingByIdHandler implements IQueryHandler<GetSomethingByIdQuery> {
  constructor(private readonly repository: SomeRepositoryPort) {}

  @HandleError()
  async execute(query: GetSomethingByIdQuery): Promise<POJO<SomeEntity>> {
    const entity = await this.repository.findById(query.id);
    return entity.serialize();
  }
}
```

Key points:
- Use `@Injectable()`, `@QueryHandler()`, and `@HandleError()` decorators
- Implement `IQueryHandler<QueryClass>` (no second generic needed)
- Return serialized POJOs using `.serialize()`

### Step 3: Register in Module

Add to the module's providers array:

```typescript
@Module({
  providers: [
    GetSomethingByIdHandler,
    // ... other handlers
  ],
})
export class SomeModule {}
```

### Step 4: Execute the Query

**CRITICAL: Do NOT add generic type parameters to execute()**

```typescript
// ✅ CORRECT - types are inferred from the query class
const result = await this.queryBus.execute(
  new GetSomethingByIdQuery({ id: 123, userId: 'user-1' }),
);

// ❌ WRONG - never add explicit generics
const result = await this.queryBus.execute<GetSomethingByIdQuery, POJO<Entity>>(
  new GetSomethingByIdQuery({ id: 123, userId: 'user-1' }),
);
```

## Creating a Command

### Step 1: Create the Command Class

Location: `apps/cathedral/src/modules/{module}/application/cqrs/commands/{name}.command.ts`

```typescript
import { Command } from '@nestjs/cqrs';

export class CreateSomethingCommand extends Command<{
  name: string;
  value: number;
}> {
  readonly name: string;
  readonly value: number;

  constructor({ name, value }: { name: string; value: number }) {
    super();
    this.name = name;
    this.value = value;
  }
}
```

Key points:
- Extend `Command<ReturnType>`
- Use object destructuring in constructor
- Declare all properties as `readonly`

### Step 2: Create the Handler

Location: `apps/cathedral/src/modules/{module}/application/cqrs/handlers/{name}.handler.ts`

```typescript
import { HandleError } from '@lib/decorators/handle-errors.decorator';
import { POJO } from '@lib/types/pojo.type';
import { SomeEntity } from '@modules/{module}/domain/entities/some.entity';
import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SomeRepositoryPort } from '../../ports/some.repository.port';
import { CreateSomethingCommand } from '../commands/create-something.command';

@Injectable()
@CommandHandler(CreateSomethingCommand)
export class CreateSomethingHandler
  implements ICommandHandler<CreateSomethingCommand, POJO<SomeEntity>>
{
  constructor(private readonly repository: SomeRepositoryPort) {}

  @HandleError()
  async execute(command: CreateSomethingCommand): Promise<POJO<SomeEntity>> {
    const entity = SomeEntity.create({
      name: command.name,
      value: command.value,
    });

    await this.repository.save(entity);

    return entity.serialize();
  }
}
```

Key points:
- Command handlers MUST return `POJO<Entity>` (not raw entities)
- Use `ICommandHandler<CommandClass, ReturnType>` for commands with return values

### Step 3: Register and Execute

Same as queries - register in module, execute without generics:

```typescript
// ✅ CORRECT
const result = await this.commandBus.execute(
  new CreateSomethingCommand({ name: 'test', value: 42 }),
);
```

## Testing Handlers

### Step 1: Create the Test File

Location: `apps/cathedral/src/modules/{module}/application/cqrs/handlers/{name}.handler.spec.ts`

### Step 2: Set Up Mocks

```typescript
import { createMock } from '@lib/test/create-mock';
import { SomeRepositoryPort } from '../../ports/some.repository.port';
import { FindSomethingHandler } from './find-something.handler';
import { FindSomethingQuery } from '../queries/find-something.query';

describe('FindSomethingHandler', () => {
  let handler: FindSomethingHandler;
  let repository: jest.Mocked<SomeRepositoryPort>;

  beforeEach(() => {
    repository = createMock<SomeRepositoryPort>();
    handler = new FindSomethingHandler(repository);
  });
});
```

### Step 3: Test Query Handler

```typescript
it('should return serialized results', async () => {
  const mockEntity = SomeEntity.create({ name: 'test', value: 42 });
  repository.findMany.mockResolvedValue([mockEntity]);

  const query = new FindSomethingQuery({ by: 'name', value: 'test' });
  const result = await handler.execute(query);

  expect(repository.findMany).toHaveBeenCalledWith(query.options);
  expect(result).toEqual([
    expect.objectContaining({
      name: 'test',
      value: 42,
      createdAt: expect.any(String), // Date serialized to string
    }),
  ]);
});

it('should return empty array when no results', async () => {
  repository.findMany.mockResolvedValue([]);

  const result = await handler.execute(new FindSomethingQuery({ by: 'id', value: 999 }));

  expect(result).toEqual([]);
});
```

### Step 4: Test Command Handler

```typescript
it('should create entity and return POJO', async () => {
  const command = new CreateSomethingCommand({ name: 'test', value: 42 });

  const result = await handler.execute(command);

  expect(repository.save).toHaveBeenCalled();
  expect(result).toEqual({
    id: expect.any(Number),
    name: 'test',
    value: 42,
    createdAt: expect.any(String), // Date serialized to string
    updatedAt: expect.any(String),
  });
});
```

Key testing points:
- Mock repository ports, not concrete implementations
- Verify POJO return types have dates as strings (not Date objects)
- Test both success and edge cases (empty results, not found, etc.)

## Quick Reference

| Component | Extends | Handler Interface | Returns |
|-----------|---------|-------------------|---------|
| Query | `Query<T>` | `IQueryHandler<Q>` | Entity or `POJO<T>` |
| Command | `Command<T>` | `ICommandHandler<C, T>` | `POJO<T>` (always) |

## CQRS as Public API with Application Services

When a domain needs to expose complex business operations to other layers (e.g., UI-API), use CQRS commands as the public API with handlers that orchestrate application services.

### Pattern Overview

```
UI-API Layer                      Domain Layer
┌─────────────────┐              ┌──────────────────────────────────────┐
│ ThinWrapperSvc  │──────────────▶ SomeOperationCommand                 │
│ (just calls cmd)│   commandBus │     ↓                                │
└─────────────────┘              │ SomeOperationHandler                 │
                                 │     │ fetches data, validates        │
                                 │     ↓                                │
                                 │ ApplicationService                   │
                                 │   (business logic)                   │
                                 └──────────────────────────────────────┘
```

### When to Use This Pattern

- Domain operations that need to be called from other layers (UI-API, crons, etc.)
- Complex business logic that should live in application services
- Operations requiring orchestration of multiple services
- When you want thin UI-API wrappers that just delegate to domain commands

### Real Example: Checklist Edit Flow

**1. UI-API Service (thin wrapper):**

```typescript
// ui-api/application/services/checklist-edit.service.ts
@Injectable()
export class ChecklistEditService {
  constructor(private readonly commandBus: CommandBus) {}

  @Transactional()
  async execute(request: ChecklistEditRequest): Promise<EditChecklistOutput> {
    return await this.commandBus.execute(
      new EditChecklistCommand({
        auditId: request.auditId,
        submission: request.submission,
        ehrContext: request.ehrContext,
        userId: request.userId,
      }),
    );
  }
}
```

**2. Domain Command:**

```typescript
// audit/application/cqrs/commands/edit-checklist.command.ts
export type EditChecklistResult = { auditId: number };

export class EditChecklistCommand extends Command<EditChecklistResult> {
  readonly auditId: number;
  readonly submission: Record<string, unknown>;
  readonly ehrContext: Record<string, unknown> | null;
  readonly userId: string;

  constructor({ auditId, submission, ehrContext, userId }: {...}) {
    super();
    this.auditId = auditId;
    this.submission = submission;
    this.ehrContext = ehrContext ?? null;
    this.userId = userId;
  }
}
```

**3. Handler (fetches data, orchestrates services):**

```typescript
// audit/application/cqrs/handlers/edit-checklist.handler.ts
@CommandHandler(EditChecklistCommand)
export class EditChecklistHandler
  implements ICommandHandler<EditChecklistCommand, EditChecklistResult>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly checklistDeleteService: ChecklistDeleteService,
    private readonly checklistEditService: ChecklistEditService,
  ) {}

  @HandleError()
  async execute(command: EditChecklistCommand): Promise<EditChecklistResult> {
    // 1. Fetch data needed by services
    const existingAudit = await this.queryBus.execute(
      new GetAuditByIdQuery(command.auditId),
    );
    const formDefinition = await this.queryBus.execute(
      new GetFormByIdQuery({ id: existingAudit.formId }),
    );
    const taskListId = await this.fetchTaskListIfNeeded(existingAudit);

    // 2. Orchestrate application services
    await this.checklistDeleteService.execute({ audit: existingAudit, taskListId });
    return await this.checklistEditService.execute({
      existingAudit,
      formDefinition,
      submission: command.submission,
      ehrContext: command.ehrContext,
      taskListId,
      userId: command.userId,
    });
  }
}
```

**4. Application Services (business logic):**

```typescript
// audit/application/services/checklist-delete.service.ts
@Injectable()
export class ChecklistDeleteService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly auditRiskMappingService: AuditRiskMappingService,
  ) {}

  async execute({ audit, taskListId }: ChecklistDeleteInput): Promise<void> {
    // Soft-delete + cleanup logic
    await this.commandBus.execute(new DeleteAuditCommand({ auditId: audit.id }));
    
    if (this.isBedAudit(audit) && taskListId !== null) {
      await this.commandBus.execute(
        new RemoveChecklistFromPatientShiftSummaryCommand({...}),
      );
      // ... risk removal
    }
  }
}
```

### Key Benefits

1. **Thin UI-API wrappers** - Services in UI-API layer just call commands
2. **Data fetching in handlers** - Handlers fetch all necessary data before calling services
3. **Services focus on business logic** - Application services receive data, don't fetch it
4. **Reduced coupling** - Services don't depend on each other for data
5. **Testability** - Mock services in handler tests, mock buses in service tests

### Handler vs Application Service Responsibilities

| Responsibility | Handler | Application Service |
|----------------|---------|---------------------|
| Fetch entities/data | ✅ | ❌ |
| Validate existence | ✅ | ❌ |
| Call application services | ✅ | ❌ |
| Cross-domain CQRS calls | ✅ | ✅ |
| Business logic | ❌ | ✅ |
| Domain-specific operations | ❌ | ✅ |

## Common Mistakes to Avoid

1. **Injecting ports from other domains** - Only inject ports from your own domain; use CQRS for cross-domain access
2. **Adding generics to execute()** - Types are inferred, never add them
3. **Returning entities from commands** - Always return `POJO<T>` via `.serialize()`
4. **Forgetting `@HandleError()`** - All handlers need this decorator
5. **Forgetting `@Injectable()`** - Required for NestJS DI
6. **Services fetching their own data** - In the public API pattern, handlers fetch data, services receive it
