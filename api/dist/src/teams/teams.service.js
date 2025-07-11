"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let TeamsService = class TeamsService {
    findAll() {
        return prisma.team.findMany({ include: { members: true } });
    }
    findOne(id) {
        return prisma.team.findUnique({
            where: { id },
            include: { members: true },
        });
    }
    create(data) {
        return prisma.team.create({ data });
    }
    update(id, data) {
        return prisma.team.update({ where: { id }, data });
    }
    remove(id) {
        return prisma.team.delete({ where: { id } });
    }
    addMember(teamId, member) {
        return prisma.member.create({
            data: {
                teamId,
                userId: member.user_id,
                is_leader: member.is_leader,
            },
        });
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)()
], TeamsService);
