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
    'system:user:create', 'system:user:update', 'system:user:delete',
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

  http.post(/\/api\/auth\/refresh\/?$/, async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string };
    const refreshToken = body?.refreshToken ?? '';
    if (!refreshToken || !refreshToken.startsWith('mock_refresh_')) {
      return HttpResponse.json({ code: 401, message: 'refreshToken 无效或已过期' }, { status: 200 });
    }
    const token = `mock_token_${Date.now()}`;
    const newRefreshToken = `mock_refresh_${Date.now()}`;
    return HttpResponse.json({
      code: 0,
      data: { token, refreshToken: newRefreshToken, user: MOCK_USER },
    });
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

  http.get(/\/api\/auth\/menus\/?$/, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ code: 401, message: '未登录' }, { status: 200 });
    }
    const menus = [
      { id: 100, name: '首页', path: '/', icon: 'mdi:home-outline', sort: 1, children: null },
      {
        id: 101,
        name: '演示',
        path: '/demo',
        icon: 'mdi:view-dashboard-outline',
        sort: 2,
        children: [
          { id: 102, name: '概览', path: '/demo/overview', icon: 'mdi:view-dashboard', sort: 1, children: null },
          { id: 103, name: '时间', path: '/demo/time', icon: 'mdi:clock-outline', sort: 2, children: null },
          { id: 104, name: 'Pinia', path: '/demo/pinia', icon: 'mdi:database-outline', sort: 3, children: null },
          { id: 105, name: '日历', path: '/demo/calendar', icon: 'mdi:calendar-month', sort: 4, children: null },
          { id: 106, name: '富文本', path: '/demo/richtext', icon: 'mdi:format-bold', sort: 5, children: null },
          { id: 107, name: '表单校验', path: '/demo/form-validation', icon: 'mdi:form-textbox', sort: 6, children: null },
          { id: 108, name: '分步表单', path: '/demo/step-form', icon: 'mdi:form-select', sort: 7, children: null },
        ],
      },
      {
        id: 1,
        name: '系统管理',
        path: '/system',
        icon: 'ep:setting',
        sort: 8,
        children: [
          { id: 2, name: '菜单管理', path: '/system/menu', icon: 'ep:menu', sort: 1, children: null },
          { id: 110, name: '区域管理', path: '/system/area', icon: 'ep:location', sort: 2, children: null },
          { id: 111, name: '部门管理', path: '/system/dept', icon: 'ep:office-building', sort: 3, children: null },
          { id: 112, name: '字典管理', path: '/system/dict', icon: 'ep:collection', sort: 4, children: null },
          { id: 113, name: '角色管理', path: '/system/role', icon: 'ep:user', sort: 5, children: null },
          { id: 114, name: '用户管理', path: '/system/user', icon: 'ep:user-filled', sort: 6, children: null },
        ],
      },
    ];
    return HttpResponse.json({ code: 0, data: menus });
  }),
];
