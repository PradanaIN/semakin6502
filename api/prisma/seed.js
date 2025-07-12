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
var hash_1 = require("../src/common/hash");
var prisma = new client_1.PrismaClient();
var rawUsers = [
    { nama: "Yuda Agus Irianto", email: "yuda@bps.go.id", username: "yuda", password: "password", team: "Pimpinan", role: "Pimpinan" },
    { nama: "Warsidi", email: "warsidi2@bps.go.id", username: "warsidi2", password: "password", team: "Sosial", role: "Anggota Tim" },
    { nama: "Muhamadsyah", email: "muhamadsyah@bps.go.id", username: "muhamadsyah", password: "password", team: "Neraca", role: "Anggota Tim" },
    { nama: "Dwi Prasetyono", email: "dwipras@bps.go.id", username: "dwipras", password: "password", team: "Produksi", role: "Ketua Tim" },
    { nama: "Tiara Kusuma Widianingrum", email: "tiara.kusuma@bps.go.id", username: "tiara.kusuma", password: "password", team: "Sosial", role: "Ketua Tim" },
    { nama: "Idhamsyah", email: "idhamsyah@bps.go.id", username: "idhamsyah", password: "password", team: "Umum", role: "Anggota Tim" },
    { nama: "Mohammad Agusti Rahman", email: "agusti.rahman@bps.go.id", username: "agusti.rahman", password: "password", team: "Distribusi", role: "Ketua Tim" },
    { nama: "Okta Wahyu Nugraha", email: "okta.nugraha@bps.go.id", username: "okta.nugraha", password: "password", team: "Umum", role: "Anggota Tim" },
    { nama: "Rosetina Fini Alsera", email: "finialsera@bps.go.id", username: "finialsera", password: "password", team: "Umum", role: "Anggota Tim" },
    { nama: "Shafa", email: "sha.fa@bps.go.id", username: "sha.fa", password: "password", team: "Umum", role: "Anggota Tim" },
    { nama: "Ari Susilowati", email: "arisusilo@bps.go.id", username: "arisusilo", password: "password", team: "Umum", role: "Ketua Tim" },
    { nama: "Rifki Maulana", email: "rifki.maulana@bps.go.id", username: "rifki.maulana", password: "password", team: "Neraca", role: "Ketua Tim" },
    { nama: "Sega Purwa Wika", email: "sega.wika@bps.go.id", username: "sega.wika", password: "password", team: "Distribusi", role: "Anggota Tim" },
    { nama: "Alphin Pratama Husada", email: "alphin.pratama@bps.go.id", username: "alphin.pratama", password: "password", team: "Produksi", role: "Anggota Tim" },
    { nama: "Bambang Luhat", email: "bambang_luhat@bps.go.id", username: "bambang_luhat", password: "password", team: "Produksi", role: "Anggota Tim" },
    { nama: "Fachri Izzudin Lazuardi", email: "fachri.lazuardi@bps.go.id", username: "fachri.lazuardi", password: "password", team: "IPDS", role: "Ketua Tim" },
    { nama: "Andi Nurdiansyah", email: "andi.nurdiansyah@bps.go.id", username: "andi.nurdiansyah", password: "password", team: "Sosial", role: "Anggota Tim" },
    { nama: "Afnita Rahma Auliya Putri", email: "afnita.rahma@bps.go.id", username: "afnita.rahma", password: "password", team: "IPDS", role: "Anggota Tim" },
    { nama: "Anissa Nurullya Fernanda", email: "anissa.nurullya@bps.go.id", username: "anissa.nurullya", password: "password", team: "Neraca", role: "Anggota Tim" },
    { nama: "Febri Fatika Sari", email: "febri.fatika@bps.go.id", username: "febri.fatika", password: "password", team: "Distribusi", role: "Anggota Tim" },
    { nama: "Marini Safa Aziza", email: "marinisafa@bps.go.id", username: "marinisafa", password: "password", team: "Sosial", role: "Anggota Tim" },
    { nama: "Najwa Fairus Samaya", email: "najwa.fairus@bps.go.id", username: "najwa.fairus", password: "password", team: "Neraca", role: "Anggota Tim" },
    { nama: "Fiqah Rochmah Ningtyas Duana Putri", email: "fiqah.putri@bps.go.id", username: "fiqah.putri", password: "password", team: "Produksi", role: "Anggota Tim" },
    { nama: "Lia Aulia Hayati", email: "liaauliahayati@bps.go.id", username: "liaauliahayati", password: "password", team: "Produksi", role: "Anggota Tim" },
    { nama: "Mardiana", email: "mar.diana@bps.go.id", username: "mar.diana", password: "password", team: "Distribusi", role: "Anggota Tim" },
    { nama: "Novanni Indi Pradana", email: "novanniindipradana@bps.go.id", username: "novanniindipradana", password: "password", team: "IPDS", role: "Anggota Tim" },
    { nama: "Elly Astutik", email: "elly.astutik@bps.go.id", username: "elly.astutik", password: "password", team: "Umum", role: "Anggota Tim" },
    { nama: "Ayu Pinta Gabina Siregar", email: "ayu.pinta@bps.go.id", username: "ayu.pinta", password: "password", team: "Umum", role: "Anggota Tim" },
];
var roleMap = {
    "Pimpinan": "pimpinan",
    "Ketua Tim": "ketua",
    "Anggota Tim": "anggota",
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, teamNames, teams, teamMap, kegiatanByTeam, _i, _c, _d, teamName, kegiatan, teamId, _e, kegiatan_1, nama, existing, _f, rawUsers_1, u, role, user, _g, _h, teamId;
        var _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0: return [4 /*yield*/, prisma.role.createMany({
                        data: [
                            { name: "admin" },
                            { name: "pimpinan" },
                            { name: "ketua" },
                            { name: "anggota" },
                        ],
                        skipDuplicates: true,
                    })];
                case 1:
                    _o.sent();
                    _b = (_a = prisma.user).upsert;
                    _j = {
                        where: { email: "admin@bps.go.id" },
                        update: {}
                    };
                    _k = {
                        nama: "Admin Utama",
                        username: "admin",
                        email: "admin@bps.go.id"
                    };
                    return [4 /*yield*/, (0, hash_1.hashPassword)("password")];
                case 2: return [4 /*yield*/, _b.apply(_a, [(_j.create = (_k.password = _o.sent(),
                            _k.role = "admin",
                            _k),
                            _j)])];
                case 3:
                    _o.sent();
                    teamNames = Array.from(new Set(rawUsers.map(function (u) { return u.team; })));
                    return [4 /*yield*/, prisma.team.createMany({
                            data: teamNames.map(function (n) { return ({ nama_tim: n }); }),
                            skipDuplicates: true,
                        })];
                case 4:
                    _o.sent();
                    return [4 /*yield*/, prisma.team.findMany({ where: { nama_tim: { in: teamNames } } })];
                case 5:
                    teams = _o.sent();
                    teamMap = new Map(teams.map(function (t) { return [t.nama_tim, t.id]; }));
                    kegiatanByTeam = {
                        Umum: [
                            "SAKIP",
                            "SPI",
                            "Keuangan",
                            "Kepegawaian",
                            "Kehumasan",
                            "Kearsipan",
                            "BMN",
                            "Pengadaan barang dan jasa",
                            "Rapat/Sosialisasi",
                            "TB",
                            "Apel/Upacara",
                            "Anggaran",
                            "Rapat",
                            "ZI",
                            "Monev",
                        ],
                        Sosial: [
                            "Susenas Maret",
                            "Susenas Sep",
                            "Seruti Tw I",
                            "Seruti Tw II",
                            "Seruti Tw III",
                            "Seruti Tw IV",
                            "Podes",
                            "Polkam",
                            "Sakernas Feb",
                            "Sakernas Ags",
                            "Supas",
                            "Desa Cantik",
                        ],
                        Distribusi: [
                            "SHK",
                            "SHP",
                            "SHPED",
                            "SHPB",
                            "SHMP",
                            "VHTS",
                            "VHTL",
                            "SIMOPPEL",
                            "LLAU",
                            "SHKK",
                            "SVPEB",
                            "VPBD",
                            "VPEK",
                            "PJ II/5",
                            "SKP",
                            "SVK",
                            "SLK-KSP",
                            "VREST",
                            "SLK-BUMD",
                            "K3",
                            "ECOMMERCE",
                            "UPD PARIWISATA",
                            "SBR",
                            "SE2026",
                            "POLDIS",
                        ],
                        Produksi: [
                            "SKTH",
                            "KOMSTRAT",
                            "UPDATING DIREKTORI PERUSAHAAN AWAL",
                            "SIMENTAL",
                            "VN HORTI",
                            "CAPTIVE POWER",
                            "IBS",
                            "AIR BERSIH TAHUNAN",
                            "PENGGALIAN URT",
                            "IMK TAHUNAN",
                            "RAPAT & KOORDINASI",
                            "SKTR",
                            "KSA",
                            "UBINAN",
                            "STPIM",
                            "SIUTAN-PBPH",
                            "SIM-TP",
                            "SPH",
                            "UDPE",
                            "MIGAS",
                            "NON MIGAS",
                            "IMK TRIWULANAN",
                            "PENGGALIAN BERBADAN HUKUM TRIWULANAN",
                            "BRIEFING IMK TAHUNAN",
                        ],
                        Neraca: [
                            "Neraca Produksi",
                            "Neraca Pengeluaran",
                            "Analisis Lintas Sektor",
                            "Penjaminan Kualitas QG",
                        ],
                        IPDS: [
                            "Wilkerstat SE2026",
                            "Pembinaan Statistik Sektoral",
                            "Metadata dan Romantik",
                            "KCDA",
                            "SPBE",
                            "PEKPPP",
                            "PST",
                            "Pengolahan",
                        ],
                    };
                    _i = 0, _c = Object.entries(kegiatanByTeam);
                    _o.label = 6;
                case 6:
                    if (!(_i < _c.length)) return [3 /*break*/, 12];
                    _d = _c[_i], teamName = _d[0], kegiatan = _d[1];
                    teamId = teamMap.get(teamName);
                    if (!teamId)
                        return [3 /*break*/, 11];
                    _e = 0, kegiatan_1 = kegiatan;
                    _o.label = 7;
                case 7:
                    if (!(_e < kegiatan_1.length)) return [3 /*break*/, 11];
                    nama = kegiatan_1[_e];
                    return [4 /*yield*/, prisma.masterKegiatan.findFirst({
                            where: { teamId: teamId, nama_kegiatan: nama },
                        })];
                case 8:
                    existing = _o.sent();
                    if (!!existing) return [3 /*break*/, 10];
                    return [4 /*yield*/, prisma.masterKegiatan.create({ data: { teamId: teamId, nama_kegiatan: nama } })];
                case 9:
                    _o.sent();
                    _o.label = 10;
                case 10:
                    _e++;
                    return [3 /*break*/, 7];
                case 11:
                    _i++;
                    return [3 /*break*/, 6];
                case 12:
                    _f = 0, rawUsers_1 = rawUsers;
                    _o.label = 13;
                case 13:
                    if (!(_f < rawUsers_1.length)) return [3 /*break*/, 18];
                    u = rawUsers_1[_f];
                    role = roleMap[u.role] || "anggota";
                    _h = (_g = prisma.user).upsert;
                    _l = {
                        where: { email: u.email },
                        update: {}
                    };
                    _m = {
                        nama: u.nama,
                        email: u.email,
                        username: u.username
                    };
                    return [4 /*yield*/, (0, hash_1.hashPassword)(u.password)];
                case 14: return [4 /*yield*/, _h.apply(_g, [(_l.create = (_m.password = _o.sent(),
                            _m.role = role,
                            _m),
                            _l)])];
                case 15:
                    user = _o.sent();
                    teamId = teamMap.get(u.team);
                    if (!teamId) return [3 /*break*/, 17];
                    return [4 /*yield*/, prisma.member.create({
                            data: {
                                userId: user.id,
                                teamId: teamId,
                                is_leader: role !== "anggota",
                            },
                        })];
                case 16:
                    _o.sent();
                    _o.label = 17;
                case 17:
                    _f++;
                    return [3 /*break*/, 13];
                case 18: return [2 /*return*/];
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
