"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const db_1 = __importDefault(require("./config/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const socket_1 = require("./socket");
const product_1 = __importDefault(require("./routes/product"));
const AppointmentRoutes_1 = __importDefault(require("./routes/AppointmentRoutes"));
const cart_1 = __importDefault(require("./routes/cart"));
(0, db_1.default)();
socket_1.app.use(express_1.default.json());
socket_1.app.use((0, cors_1.default)());
socket_1.app.use("/api/auth", auth_1.default);
socket_1.app.use("/api/product", product_1.default);
socket_1.app.use('/api/appointment', AppointmentRoutes_1.default);
socket_1.app.use('/api/cart', cart_1.default);
socket_1.app.get('/', (req, res) => {
    res.send('hi manish ');
});
const PORT = process.env.PORT || 9000;
socket_1.server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
