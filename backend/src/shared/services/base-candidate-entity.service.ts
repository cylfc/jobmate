/**
 * Base Service for Candidate-Related Entities
 * Provides common CRUD operations với ownership verification
 */

import { Repository, FindOptionsWhere, FindOptionsOrder } from 'typeorm';
import { Candidate } from '@candidate/entities/candidate.entity';
import { EntityNotFoundException, OwnershipException } from '@shared/exceptions/custom-exceptions';

export interface OwnershipCheckOptions {
  userId?: string;
  errorMessage?: string;
}

/**
 * Base service class cho candidate-related entities
 * Tất cả candidate-related entities (Education, Skill, WorkExperience, Project) đều có:
 * - candidate relation
 * - ownership check logic
 * - Similar CRUD patterns
 * 
 * Note: This is an abstract class. Subclasses must inject repositories và set entityName
 */
export abstract class BaseCandidateEntityService<
  TEntity extends { id: string; candidate: Candidate },
  TCreateDto,
  TUpdateDto,
> {
  protected abstract get entityRepository(): Repository<TEntity>;
  protected abstract get candidateRepository(): Repository<Candidate>;
  protected abstract get entityName(): string; // e.g., 'Education', 'Skill', etc.

  /**
   * Verify candidate exists và belongs to user (if userId provided)
   * Made protected để subclass có thể gọi
   */
  protected async verifyCandidateOwnership(
    candidateId: string,
    options: OwnershipCheckOptions = {},
  ): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new EntityNotFoundException('Candidate', candidateId);
    }

    if (options.userId && candidate.userId !== options.userId) {
      throw new OwnershipException(
        this.entityName,
        options.errorMessage ? 'manage' : undefined,
      );
    }

    return candidate;
  }

  /**
   * Find one entity với ownership check
   */
  protected async findOneWithOwnershipCheck(
    id: string,
    options: OwnershipCheckOptions = {},
    relations: string[] = ['candidate'],
  ): Promise<TEntity> {
    const entity = await this.entityRepository.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
      relations,
    });

    if (!entity) {
      throw new EntityNotFoundException(this.entityName, id);
    }

    if (options.userId && entity.candidate.userId !== options.userId) {
      throw new OwnershipException(this.entityName, 'access');
    }

    return entity;
  }

  /**
   * Find all entities by candidate với ownership check
   * Made protected để subclass có thể gọi
   */
  protected async findAllByCandidateWithOwnershipCheck(
    candidateId: string,
    options: OwnershipCheckOptions = {},
    order: FindOptionsOrder<TEntity> = {},
  ): Promise<TEntity[]> {
    await this.verifyCandidateOwnership(candidateId, options);

    const defaultOrder = { orderIndex: 'ASC' } as any;
    return this.entityRepository.find({
      where: { candidate: { id: candidateId } } as FindOptionsWhere<TEntity>,
      order: order || defaultOrder,
    });
  }

  /**
   * Create entity với ownership check
   * Subclasses should implement this để handle entity-specific creation logic
   */
  abstract create(
    candidateId: string,
    createDto: TCreateDto,
    userId?: string,
  ): Promise<TEntity>;

  /**
   * Find all entities by candidate
   */
  async findAllByCandidate(
    candidateId: string,
    userId?: string,
    order?: FindOptionsOrder<TEntity>,
  ): Promise<TEntity[]> {
    return this.findAllByCandidateWithOwnershipCheck(
      candidateId,
      { userId },
      order,
    );
  }

  /**
   * Find one entity by ID
   */
  async findOne(id: string, userId?: string): Promise<TEntity> {
    return this.findOneWithOwnershipCheck(id, { userId });
  }

  /**
   * Update entity
   * Subclasses should implement this để handle entity-specific update logic
   */
  abstract update(
    id: string,
    updateDto: TUpdateDto,
    userId?: string,
  ): Promise<TEntity>;

  /**
   * Delete entity
   */
  async delete(id: string, userId?: string): Promise<void> {
    const entity = await this.findOneWithOwnershipCheck(id, { userId });
    await this.entityRepository.remove(entity);
  }

  /**
   * Reorder entities (optional - only some entities support this)
   * Subclasses can override nếu cần custom logic
   */
  async reorder(
    candidateId: string,
    orderIds: string[],
    userId?: string,
  ): Promise<TEntity[]> {
    await this.verifyCandidateOwnership(candidateId, { userId });

    const entities = await this.findAllByCandidate(candidateId, userId);
    const entityMap = new Map(entities.map((e) => [e.id, e]));

    // Update orderIndex based on orderIds array
    orderIds.forEach((id, index) => {
      const entity = entityMap.get(id);
      if (entity && 'orderIndex' in entity) {
        (entity as any).orderIndex = index;
      }
    });

    return this.entityRepository.save(entities);
  }
}
