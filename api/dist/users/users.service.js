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
const prisma_service_1 = require("../prisma.service");
const hash_1 = require("../common/hash");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.user.findMany({
            include: {
                members: { include: { team: true } },
            },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException("not found");
        return user;
    }
    async create(data) {
        if (data.password) {
            data.password = await (0, hash_1.hashPassword)(data.password);
        }
        if (!data.username && data.email) {
            data.username = data.email.split("@")[0];
        }
        return this.prisma.user.create({
            data: { id: (0, ulid_1.ulid)(), ...data, phone: data.phone },
        });
    }
    async update(id, data) {
        if (data.password) {
            data.password = await (0, hash_1.hashPassword)(data.password);
        }
        if (data.email) {
            data.username = data.email.split("@")[0];
        }
        return this.prisma.user.update({
            where: { id },
            data: { ...data, phone: data.phone },
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
        return this.prisma.user.delete({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
