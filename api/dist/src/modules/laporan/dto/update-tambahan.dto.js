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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTambahanDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const status_constants_1 = __importDefault(require("../../../shared/constants/status.constants"));
class UpdateTambahanDto {
}
exports.UpdateTambahanDto = UpdateTambahanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTambahanDto.prototype, "kegiatanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === "" ? undefined : value)),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateTambahanDto.prototype, "tanggal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTambahanDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_transformer_1.Transform)(({ value }) => (value === "" ? undefined : value)),
    (0, class_validator_1.ValidateIf)((o) => [status_constants_1.default.SEDANG_DIKERJAKAN, status_constants_1.default.SELESAI_DIKERJAKAN].includes(o.status)),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTambahanDto.prototype, "buktiLink", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === "" ? undefined : value)),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTambahanDto.prototype, "deskripsi", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === "" ? undefined : value)),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTambahanDto.prototype, "capaianKegiatan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === "" ? undefined : value)),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateTambahanDto.prototype, "tanggalSelesai", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === "" ? undefined : value)),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateTambahanDto.prototype, "tanggalSelesaiAkhir", void 0);
