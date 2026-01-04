"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAvatar = exports.getUserById = exports.register = exports.login = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataPath = path_1.default.join(__dirname, '../data/users.json');
// 读取用户数据
const getUsers = () => {
    const data = fs_1.default.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
};
// 保存用户数据
const saveUsers = (users) => {
    fs_1.default.writeFileSync(dataPath, JSON.stringify(users, null, 2));
};
// 用户登录
const login = (req, res) => {
    const { phone_number, password } = req.body;
    const users = getUsers();
    const user = users.find((u) => u.phone_number === phone_number);
    if (!user) {
        return res.status(404).json({ error: '用户不存在' });
    }
    if (user.password !== password) {
        return res.status(401).json({ error: '密码错误' });
    }
    // 模拟 JWT token
    const token = `mock_token_${user.id}_${Date.now()}`;
    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            phone_number: user.phone_number,
            avatar_url: user.avatar_url
        }
    });
};
exports.login = login;
// 用户注册
const register = (req, res) => {
    const { username, phone_number, password } = req.body;
    const users = getUsers();
    // 检查手机号是否已存在
    if (users.find((u) => u.phone_number === phone_number)) {
        return res.status(409).json({ error: '手机号已被注册' });
    }
    const newUser = {
        id: users.length + 1,
        username,
        phone_number,
        password,
        avatar_url: '/default-avatar.png',
        created_at: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    const token = `mock_token_${newUser.id}_${Date.now()}`;
    res.status(201).json({
        token,
        user: {
            id: newUser.id,
            username: newUser.username,
            phone_number: newUser.phone_number,
            avatar_url: newUser.avatar_url
        }
    });
};
exports.register = register;
// 获取用户信息
const getUserById = (req, res) => {
    const { id } = req.params;
    const users = getUsers();
    const user = users.find((u) => u.id === parseInt(id));
    if (!user) {
        return res.status(404).json({ error: '用户不存在' });
    }
    res.json({
        id: user.id,
        username: user.username,
        phone_number: user.phone_number,
        avatar_url: user.avatar_url
    });
};
exports.getUserById = getUserById;
// 更新头像
const updateAvatar = (req, res) => {
    const { id } = req.params;
    const { avatar_url } = req.body;
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === parseInt(id));
    if (userIndex === -1) {
        return res.status(404).json({ error: '用户不存在' });
    }
    users[userIndex].avatar_url = avatar_url;
    saveUsers(users);
    res.json({
        message: '头像更新成功',
        avatar_url
    });
};
exports.updateAvatar = updateAvatar;
//# sourceMappingURL=userController.js.map