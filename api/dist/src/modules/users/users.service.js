"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const ulid_1 = require("ulid");
const prisma_service_1 = require("../../core/database/prisma.service");
const hash_1 = require("../../shared/security/hash");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.userSelect = {
            id: true,
            nama: true,
            username: true,
            email: true,
            phone: true,
            role: true,
        };
    }
    async findAll(page = 1, pageSize = 10, all = false) {
        const p = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        const ps = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10;
        const [total, data] = await this.prisma.$transaction([
            this.prisma.user.count(),
            this.prisma.user.findMany({
                ...(all ? {} : { skip: (p - 1) * ps, take: ps }),
                orderBy: { nama: "asc" },
                select: {
                    ...this.userSelect,
                    members: { include: { team: true } },
                },
            }),
        ]);
        return {
            data,
            meta: {
                page: p,
                pageSize: all ? total : ps,
                total,
                totalPages: all ? 1 : Math.max(1, Math.ceil(total / ps)),
            },
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: this.userSelect,
        });
        if (!user)
            throw new common_1.NotFoundException("not found");
        return user;
    }
    async create(data) {
        const { teamId, ...rest } = data;
        if (rest.password) {
            rest.password = await (0, hash_1.hashPassword)(rest.password);
        }
        if (!rest.username && rest.email) {
            rest.username = rest.email.split("@")[0];
        }
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { id: (0, ulid_1.ulid)(), ...rest, phone: rest.phone },
            });
            if (teamId) {
                await tx.member.create({
                    data: { id: (0, ulid_1.ulid)(), userId: user.id, teamId, isLeader: false },
                });
            }
            return user;
        });
    }
    async update(id, data) {
        const { teamId, ...rest } = data;
        if (rest.password) {
            rest.password = await (0, hash_1.hashPassword)(rest.password);
        }
        if (rest.email) {
            rest.username = rest.email.split("@")[0];
        }
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id },
                data: { ...rest, phone: rest.phone },
            });
            const existing = await tx.member.findFirst({ where: { userId: id } });
            if (teamId) {
                if (existing) {
                    await tx.member.update({
                        where: { id: existing.id },
                        data: { teamId },
                    });
                }
                else {
                    await tx.member.create({
                        data: { id: (0, ulid_1.ulid)(), userId: id, teamId, isLeader: false },
                    });
                }
            }
            else if (existing) {
                await tx.member.delete({ where: { id: existing.id } });
            }
            return user;
        });
    }
    async findProfile(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { members: { include: { team: true } } },
        });
        if (!user)
            throw new common_1.NotFoundException("not found");
        const member = user.members?.[0];
        const { password: _password, members, ...rest } = user;
        const sanitized = {
            ...rest,
            teamId: member?.teamId,
            teamName: member?.team?.namaTim,
        };
        return sanitized;
    }
    async updateProfile(id, data) {
        if (data.password) {
            data.password = await (0, hash_1.hashPassword)(data.password);
        }
        // Jangan paksa username menjadi bagian dari email; hormati input eksplisit
        if (data.email && !data.username) {
            data.username = data.email.split("@")[0];
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: { ...data, phone: data.phone },
        });
        const member = await this.prisma.member.findFirst({
            where: { userId: id },
            include: { team: true },
        });
        const { password: _password, ...rest } = user;
        const sanitized = {
            ...rest,
            teamId: member?.teamId,
            teamName: member?.team?.namaTim,
        };
        return sanitized;
    }
    remove(id) {
        return this.prisma.user.delete({
            where: { id },
            select: this.userSelect,
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
