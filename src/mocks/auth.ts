/**
 * 认证模块 Mock - 与 src/api/auth.ts 对应
 * 模拟登录、获取用户信息、登出，返回 Token 与用户信息（含 roles、permissions）
 */
import { http, HttpResponse } from 'msw';

const MOCK_USER = {
  id: 1,
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com',
  avatar: '',
  roles: ['admin', 'user'],
  permissions: [
    'read',
    'write',
    'admin:read',
    'admin:write',
    'user:read',
    'user:write',
    // 菜单管理
    'system:menu:create',
    'system:menu:update',
    'system:menu:delete',
    // 部门管理
    'system:dept:create',
    'system:dept:update',
    'system:dept:delete',
    // 字典管理
    'system:dict:create',
    'system:dict:update',
    'system:dict:delete',
    'system:dict:export',
    // 角色管理
    'system:role:create',
    'system:role:update',
    'system:role:delete',
    'system:role:export',
    // 权限分配
    'system:permission:assign-role-menu',
    'system:permission:assign-role-data-scope',
    // 用户管理
    'system:user:delete',
  ],
};

export const authHandlers = [
  http.post(/\/api\/auth\/login\/?$/, async ({ request }) => {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body?.username ?? '';
    const password = body?.password ?? '';

    if (!username || !password) {
      return HttpResponse.json(
        { code: 400, message: '用户名和密码不能为空' },
        { status: 200 }
      );
    }

    // 模拟：admin/123456 通过，其余 401
    if (username === 'admin' && password === '123456') {
      const token = `mock_token_${Date.now()}`;
      const refreshToken = `mock_refresh_${Date.now()}`;
      const user = {
        ...MOCK_USER,
        username,
        nickname: username === 'admin' ? '管理员' : username,
      };
      return HttpResponse.json({
        code: 0,
        data: { token, refreshToken, user },
      });
    }

    return HttpResponse.json(
      { code: 401, message: '用户名或密码错误' },
      { status: 200 }
    );
  }),

  http.get(/\/api\/auth\/user\/?$/, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ code: 401, message: '未登录' }, { status: 200 });
    }
    return HttpResponse.json({
      code: 0,
      data: MOCK_USER,
    });
  }),

  http.post(/\/api\/auth\/logout\/?$/, () => {
    return HttpResponse.json({ code: 0, data: null });
  }),
];
