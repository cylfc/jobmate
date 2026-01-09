/**
 * Ownership Utilities
 * Helper functions để verify ownership của entities
 */

import { Repository } from 'typeorm';
import { EntityNotFoundException, OwnershipException } from '@shared/exceptions/custom-exceptions';

export interface OwnershipCheckResult {
  entity: any;
  hasAccess: boolean;
}

/**
 * Verify entity ownership
 * @param repository Repository của entity
 * @param entityId ID của entity
 * @param userId ID của user đang request
 * @param ownerField Field name chứa owner ID (default: 'userId')
 * @param entityName Tên của entity (for error messages)
 * @returns Entity nếu có access
 * @throws NotFoundException nếu entity không tồn tại
 * @throws ForbiddenException nếu user không có quyền
 */
export async function verifyOwnership<T extends { [key: string]: any }>(
  repository: Repository<T>,
  entityId: string,
  userId: string,
  options: {
    ownerField?: string;
    entityName?: string;
    relations?: string[];
  } = {},
): Promise<T> {
  const { ownerField = 'userId', entityName = 'Entity', relations = [] } = options;

  const entity = await repository.findOne({
    where: { id: entityId } as any,
    relations,
  });

  if (!entity) {
    throw new EntityNotFoundException(entityName, entityId);
  }

  const ownerId = entity[ownerField];
  if (ownerId !== userId) {
    throw new OwnershipException(entityName, 'access');
  }

  return entity;
}

/**
 * Verify candidate ownership
 * Specialized function cho candidate entities
 */
export async function verifyCandidateOwnership(
  candidateRepository: Repository<any>,
  candidateId: string,
  userId?: string,
  errorMessage?: string,
): Promise<any> {
  const candidate = await candidateRepository.findOne({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new EntityNotFoundException('Candidate', candidateId);
  }

  if (userId && candidate.userId !== userId) {
    throw new OwnershipException('Candidate', errorMessage ? 'manage' : undefined);
  }

  return candidate;
}

/**
 * Check if user owns entity
 * Returns boolean instead of throwing exception
 */
export async function checkOwnership<T extends { [key: string]: any }>(
  repository: Repository<T>,
  entityId: string,
  userId: string,
  ownerField: string = 'userId',
  relations: string[] = [],
): Promise<boolean> {
  try {
    const entity = await repository.findOne({
      where: { id: entityId } as any,
      relations,
    });

    if (!entity) {
      return false;
    }

    return entity[ownerField] === userId;
  } catch {
    return false;
  }
}
