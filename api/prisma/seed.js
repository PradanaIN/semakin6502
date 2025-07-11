"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var users, sosial, ipds, kegiatanSosial1, kegiatanSosial2, kegiatanIpds1, kegiatanIpds2, tugasA, tugasB, tugasC;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.user.createMany({
                        data: [
                            { nama: 'Admin Utama', email: 'admin@bps.go.id', password: 'admin123', role: 'admin' },
                            { nama: 'Pimpinan BPS', email: 'pimpinan@bps.go.id', password: 'pimpinan123', role: 'pimpinan' },
                            { nama: 'Ketua Tim Sosial', email: 'ketua.sosial@bps.go.id', password: 'ketua123', role: 'ketua' },
                            { nama: 'Ketua Tim IPDS', email: 'ketua.ipds@bps.go.id', password: 'ketua456', role: 'ketua' },
                            { nama: 'Anggota A', email: 'anggota.a@bps.go.id', password: 'anggota123', role: 'anggota' },
                            { nama: 'Anggota B', email: 'anggota.b@bps.go.id', password: 'anggota456', role: 'anggota' },
                        ]
                    })];
                case 1:
                    users = _a.sent();
                    return [4 /*yield*/, prisma.team.create({ data: { nama_tim: 'Sosial' } })];
                case 2:
                    sosial = _a.sent();
                    return [4 /*yield*/, prisma.team.create({ data: { nama_tim: 'IPDS' } })];
                case 3:
                    ipds = _a.sent();
                    // Members
                    return [4 /*yield*/, prisma.member.createMany({
                            data: [
                                { userId: 3, teamId: sosial.id, is_leader: true },
                                { userId: 4, teamId: ipds.id, is_leader: true },
                                { userId: 5, teamId: sosial.id, is_leader: false },
                                { userId: 6, teamId: ipds.id, is_leader: false },
                            ]
                        })];
                case 4:
                    // Members
                    _a.sent();
                    return [4 /*yield*/, prisma.masterKegiatan.create({ data: { teamId: sosial.id, nama_kegiatan: 'Pendataan Sosial Ekonomi' } })];
                case 5:
                    kegiatanSosial1 = _a.sent();
                    return [4 /*yield*/, prisma.masterKegiatan.create({ data: { teamId: sosial.id, nama_kegiatan: 'Pengolahan Data Survei' } })];
                case 6:
                    kegiatanSosial2 = _a.sent();
                    return [4 /*yield*/, prisma.masterKegiatan.create({ data: { teamId: ipds.id, nama_kegiatan: 'Pemetaan Digital IPDS' } })];
                case 7:
                    kegiatanIpds1 = _a.sent();
                    return [4 /*yield*/, prisma.masterKegiatan.create({ data: { teamId: ipds.id, nama_kegiatan: 'Pemeliharaan Sistem Statistik' } })];
                case 8:
                    kegiatanIpds2 = _a.sent();
                    return [4 /*yield*/, prisma.penugasan.create({ data: { kegiatanId: kegiatanSosial1.id, pegawaiId: 5, minggu: 1, bulan: 'Juni', tahun: 2025 } })];
                case 9:
                    tugasA = _a.sent();
                    return [4 /*yield*/, prisma.penugasan.create({ data: { kegiatanId: kegiatanSosial2.id, pegawaiId: 5, minggu: 1, bulan: 'Juni', tahun: 2025 } })];
                case 10:
                    tugasB = _a.sent();
                    return [4 /*yield*/, prisma.penugasan.create({ data: { kegiatanId: kegiatanIpds1.id, pegawaiId: 6, minggu: 1, bulan: 'Juni', tahun: 2025 } })];
                case 11:
                    tugasC = _a.sent();
                    // Laporan Harian
                    return [4 /*yield*/, prisma.laporanHarian.createMany({
                            data: [
                                { penugasanId: tugasA.id, tanggal: new Date('2025-06-02'), status: 'Selesai Dikerjakan', bukti_link: 'http://link.com/bukti1', catatan: 'Tuntas', pegawaiId: 5 },
                                { penugasanId: tugasB.id, tanggal: new Date('2025-06-02'), status: 'Sedang Dikerjakan', bukti_link: 'http://link.com/bukti2', catatan: '', pegawaiId: 5 },
                                { penugasanId: tugasC.id, tanggal: new Date('2025-06-03'), status: 'Belum Dikerjakan', bukti_link: null, catatan: '', pegawaiId: 6 },
                            ]
                        })];
                case 12:
                    // Laporan Harian
                    _a.sent();
                    // Kegiatan Tambahan
                    return [4 /*yield*/, prisma.kegiatanTambahan.createMany({
                            data: [
                                { nama: 'Penyusunan Laporan Internal', tanggal: new Date('2025-06-04'), status: 'Selesai Dikerjakan', bukti_link: 'http://link.com/bukti3', userId: 5 },
                                { nama: 'Pelatihan Statistik', tanggal: new Date('2025-06-04'), status: 'Sedang Dikerjakan', bukti_link: null, userId: 6 },
                            ]
                        })];
                case 13:
                    // Kegiatan Tambahan
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return prisma.$disconnect(); })
    .catch(function (e) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.error(e);
                return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                process.exit(1);
                return [2 /*return*/];
        }
    });
}); });
