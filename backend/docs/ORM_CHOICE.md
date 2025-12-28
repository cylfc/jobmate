# ORM Choice: TypeORM

## Why TypeORM?

### MikroORM vs TypeORM

**MikroORM:**
- ❌ Not the official ORM for NestJS
- ❌ Less popular in the NestJS community
- ❌ Smaller ecosystem and fewer resources
- ✅ Modern and feature-rich

**TypeORM:**
- ✅ **Most popular ORM with NestJS** (used by majority of NestJS projects)
- ✅ **Official integration** via `@nestjs/typeorm`
- ✅ Large community and extensive documentation
- ✅ Used in other projects in this workspace (21.blackink, 01.peoplez)
- ✅ Better TypeScript support
- ✅ Active development and maintenance
- ✅ More Stack Overflow answers and tutorials

## Decision

Based on:
1. **Popularity**: TypeORM is the de facto standard for NestJS projects
2. **Consistency**: Other projects in the workspace use TypeORM
3. **Community Support**: Easier to find help, tutorials, and solutions
4. **Official Integration**: `@nestjs/typeorm` is maintained by the NestJS team

## Migration Notes

All documentation has been updated to use TypeORM instead of MikroORM:

- ✅ Dependencies updated
- ✅ Entity definitions updated (TypeORM decorators)
- ✅ Service layer updated (TypeORM Repository pattern)
- ✅ Module configuration updated
- ✅ Database configuration updated
- ✅ Migration strategy updated

## Key Differences

### Entity Decorators
- **MikroORM**: `@Property()`, `@PrimaryKey()`
- **TypeORM**: `@Column()`, `@PrimaryGeneratedColumn()`

### Repository Pattern
- **MikroORM**: `EntityRepository<T>`, `persistAndFlush()`
- **TypeORM**: `Repository<T>`, `save()`, `remove()`

### Query Builder
- **MikroORM**: `createQueryBuilder()` with MikroORM syntax
- **TypeORM**: `createQueryBuilder()` with TypeORM syntax

### Module Registration
- **MikroORM**: `MikroOrmModule.forFeature([Entity])`
- **TypeORM**: `TypeOrmModule.forFeature([Entity])`

## Resources

- [TypeORM Documentation](https://typeorm.io/)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [TypeORM Migrations](https://typeorm.io/migrations)

