import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "@core/database/prisma.service";
import { ROLES } from "@shared/constants/roles.constants";

interface ResolveScopeOptions {
  role: string | undefined;
  currentUserId: string;
  teamId?: string;
  requestedUserId?: string;
}

@Injectable()
export class MonitoringAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveUserScope({
    role,
    currentUserId,
    teamId,
    requestedUserId,
  }: ResolveScopeOptions): Promise<string | undefined> {
    if (role === ROLES.ADMIN || role === ROLES.PIMPINAN) {
      return requestedUserId;
    }

    if (!teamId) {
      return requestedUserId ?? currentUserId;
    }

    const membership = await this.prisma.member.findFirst({
      where: { teamId, userId: currentUserId },
    });

    if (!membership) {
      // Not part of team -> allow aggregate view only
      return undefined;
    }

    if (membership.isLeader) {
      return requestedUserId;
    }

    if (requestedUserId && requestedUserId !== currentUserId) {
      throw new ForbiddenException("bukan ketua tim");
    }

    return currentUserId;
  }
}
