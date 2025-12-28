# NestJS Best Practices - Based on Official Documentation

This document outlines best practices for implementing the Candidate and Job modules based on the [official NestJS documentation](https://docs.nestjs.com/).

## 1. Configuration Management

### Use ConfigModule with Validation

According to [NestJS Configuration documentation](https://docs.nestjs.com/techniques/configuration), always use `ConfigModule` with validation:

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        // ... other env vars
      }),
    }),
  ],
})
export class AppModule {}
```

**Why**: Ensures environment variables are validated at startup, catching configuration errors early.

## 2. Database Configuration

### Use forRootAsync Pattern

Always use `TypeOrmModule.forRootAsync()` instead of `forRoot()` to properly inject `ConfigService`:

```typescript
// database/database.module.ts
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    // ... other config
    autoLoadEntities: true, // Recommended by NestJS docs
  }),
  inject: [ConfigService],
}),
```

**Reference**: [NestJS Database documentation](https://docs.nestjs.com/techniques/database)

### Never Use synchronize in Production

```typescript
synchronize: configService.get('NODE_ENV') !== 'production',
```

**Why**: `synchronize: true` can cause data loss in production. Always use migrations.

## 3. Validation

### Global ValidationPipe Configuration

Configure `ValidationPipe` globally in `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

**Reference**: [NestJS Validation documentation](https://docs.nestjs.com/techniques/validation)

### DTO Validation

Always use `class-validator` decorators in DTOs:

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateCandidateDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  firstName!: string;
}
```

## 4. Module Organization

### One Module Per Domain

Follow the pattern: one module per main domain/route:

```
candidate/
  ├── candidate.module.ts
  ├── candidate.controller.ts
  ├── candidate.service.ts
  ├── entities/
  │   └── candidate.entity.ts
  └── models/
      ├── dto/
      └── types/
```

**Reference**: [NestJS Modules documentation](https://docs.nestjs.com/modules)

### Feature Module Pattern

Each feature module should:
- Import `TypeOrmModule.forFeature([Entity])`
- Export service if used by other modules
- Keep controllers and services in the same module

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Candidate])],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService], // If needed by other modules
})
export class CandidateModule {}
```

## 5. Repository Pattern

### Use Repository<T> from TypeORM

Inject repositories using `@InjectRepository()`:

```typescript
@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}
}
```

**Reference**: [NestJS Database - Repository pattern](https://docs.nestjs.com/techniques/database#repository-pattern)

## 6. Error Handling

### Use Built-in Exceptions

Use NestJS built-in exceptions:

```typescript
import { NotFoundException, BadRequestException } from '@nestjs/common';

async findOne(id: string): Promise<Candidate> {
  const candidate = await this.candidateRepository.findOne({ where: { id } });
  if (!candidate) {
    throw new NotFoundException(`Candidate with ID ${id} not found`);
  }
  return candidate;
}
```

**Reference**: [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

### Global Exception Filter (Optional)

For consistent error responses:

```typescript
// core/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      message: exception.message,
    });
  }
}
```

## 7. API Documentation

### Swagger/OpenAPI Integration

Always use `@nestjs/swagger` for API documentation:

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('JobMate API')
  .setDescription('JobMate Backend API Documentation')
  .setVersion('1.0')
  .addTag('candidates')
  .addTag('jobs')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

**Reference**: [NestJS OpenAPI documentation](https://docs.nestjs.com/openapi/introduction)

### Use Swagger Decorators

Annotate DTOs and controllers:

```typescript
@ApiProperty({ example: 'john.doe@example.com' })
@IsEmail()
email!: string;
```

## 8. Testing

### Unit Tests

Test services and controllers in isolation:

```typescript
describe('CandidateService', () => {
  let service: CandidateService;
  let repository: Repository<Candidate>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        {
          provide: getRepositoryToken(Candidate),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
    repository = module.get<Repository<Candidate>>(getRepositoryToken(Candidate));
  });
});
```

**Reference**: [NestJS Testing documentation](https://docs.nestjs.com/fundamentals/testing)

### E2E Tests

Test complete request/response cycles:

```typescript
describe('Candidates (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
});
```

## 9. Logging

### Use Built-in Logger

NestJS provides a built-in logger:

```typescript
import { Logger } from '@nestjs/common';

export class CandidateService {
  private readonly logger = new Logger(CandidateService.name);

  async createCandidate(dto: CreateCandidateDto) {
    this.logger.log(`Creating candidate with email: ${dto.email}`);
    // ...
  }
}
```

**Reference**: [NestJS Logger documentation](https://docs.nestjs.com/techniques/logger)

## 10. Migrations

### Use TypeORM Migrations

Never use `synchronize: true` in production. Always use migrations:

```bash
# Generate migration
npm run typeorm migration:generate -- -n CreateCandidateTable

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

**Reference**: [TypeORM Migrations](https://typeorm.io/migrations)

## 11. Code Organization

### Follow SOLID Principles

- **Single Responsibility**: Each class should have one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable for their base classes
- **Interface Segregation**: Many specific interfaces are better than one general interface
- **Dependency Inversion**: Depend on abstractions, not concretions

### File Naming Conventions

- Use kebab-case for files: `candidate.service.ts`
- Use PascalCase for classes: `CandidateService`
- Use camelCase for variables and functions: `createCandidate`

## 12. Performance

### Use Pagination

Always implement pagination for list endpoints:

```typescript
async findAll(queryDto: QueryCandidateDto) {
  const { page = 1, limit = 10 } = queryDto;
  const [items, total] = await this.repository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });
  return { items, total, page, limit };
}
```

### Database Indexing

Add indexes for frequently queried fields:

```typescript
@Index(['email'])
@Index(['status', 'postedAt'])
export class Job extends BaseEntity {
  // ...
}
```

## References

- [NestJS Official Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [NestJS Best Practices](https://github.com/nestjs/awesome-nestjs)

