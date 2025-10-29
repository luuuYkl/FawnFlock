import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(__dirname, '../data/users.json');

// 读取用户数据
const getUsers = () => {
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
};

// 保存用户数据
const saveUsers = (users: any[]) => {
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
};

// 用户登录
export const login = (req: Request, res: Response) => {
  const { phone_number, password } = req.body;
  const users = getUsers();
  
  const user = users.find((u: any) => u.phone_number === phone_number);
  
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

// 用户注册
export const register = (req: Request, res: Response) => {
  const { username, phone_number, password } = req.body;
  const users = getUsers();
  
  // 检查手机号是否已存在
  if (users.find((u: any) => u.phone_number === phone_number)) {
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

// 获取用户信息
export const getUserById = (req: Request, res: Response) => {
  const { id } = req.params;
  const users = getUsers();
  
  const user = users.find((u: any) => u.id === parseInt(id));
  
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

// 更新头像
export const updateAvatar = (req: Request, res: Response) => {
  const { id } = req.params;
  const { avatar_url } = req.body;
  const users = getUsers();
  
  const userIndex = users.findIndex((u: any) => u.id === parseInt(id));
  
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