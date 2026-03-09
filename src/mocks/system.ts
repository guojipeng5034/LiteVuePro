/**
 * 系统管理模块 Mock - 与 api/system 各模块对应
 */
import { http, HttpResponse } from 'msw';

const menuList: Record<string, unknown>[] = [
  { id: 1, name: '系统管理', type: 1, sort: 10, parentId: 0, path: '/system', icon: 'ep:setting', status: 0, visible: true, keepAlive: false, alwaysShow: true },
  { id: 2, name: '菜单管理', type: 2, sort: 1, parentId: 1, path: 'menu', icon: 'ep:menu', component: 'system/menu/index', componentName: 'system-menu', status: 0, visible: true, keepAlive: true, alwaysShow: false },
];

// 地区树 Mock
const areaTree: { id: number; name: string; children?: { id: number; name: string }[] }[] = [
  { id: 1, name: '中国', children: [{ id: 2, name: '北京' }, { id: 3, name: '上海' }] },
];

// 部门 Mock
const deptList: { id: number; parentId: number; name: string; sort: number; leaderUserId?: number; phone?: string; email?: string; status: number; createTime: string }[] = [
  { id: 1, parentId: 0, name: '总公司', sort: 0, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 2, parentId: 1, name: '研发部', sort: 1, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 3, parentId: 1, name: '市场部', sort: 2, status: 0, createTime: '2024-01-01 00:00:00' },
];

// 用户列表 Mock（含分页字段）
type UserMock = { id: number; username: string; nickname: string; deptId?: number; deptName?: string; mobile?: string; status: number; createTime: string };
const userList: UserMock[] = [
  { id: 1, username: 'admin', nickname: '管理员', deptId: 1, deptName: '总公司', mobile: '13800138000', status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 2, username: 'test', nickname: '测试用户', deptId: 2, deptName: '研发部', mobile: '13800138001', status: 0, createTime: '2024-01-02 00:00:00' },
  { id: 3, username: 'demo', nickname: '演示账号', deptId: 3, deptName: '市场部', mobile: '13800138002', status: 0, createTime: '2024-01-03 00:00:00' },
];
const userRoleIds: Record<number, number[]> = { 1: [1], 2: [2], 3: [2] };

// 字典类型 Mock
const dictTypeList: { id: number; name: string; type: string; status: number; remark?: string; createTime: string }[] = [
  { id: 1, name: '通用状态', type: 'common_status', status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 2, name: '用户性别', type: 'system_user_sex', status: 0, createTime: '2024-01-01 00:00:00' },
];

// 字典数据 Mock
const dictDataList: { id: number; dictType: string; label: string; value: string; sort: number; status: number; colorType?: string; cssClass?: string; remark?: string; createTime: string }[] = [
  { id: 1, dictType: 'common_status', label: '启用', value: '0', sort: 0, status: 0, colorType: 'success', createTime: '2024-01-01 00:00:00' },
  { id: 2, dictType: 'common_status', label: '关闭', value: '1', sort: 1, status: 0, colorType: 'danger', createTime: '2024-01-01 00:00:00' },
  { id: 3, dictType: 'system_menu_type', label: '目录', value: '1', sort: 0, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 4, dictType: 'system_menu_type', label: '菜单', value: '2', sort: 1, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 5, dictType: 'system_menu_type', label: '按钮', value: '3', sort: 2, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 6, dictType: 'system_role_type', label: '内置角色', value: '1', sort: 0, status: 0, colorType: 'danger', createTime: '2024-01-01 00:00:00' },
  { id: 7, dictType: 'system_role_type', label: '自定义角色', value: '2', sort: 1, status: 0, colorType: 'primary', createTime: '2024-01-01 00:00:00' },
  { id: 8, dictType: 'system_data_scope', label: '全部数据', value: '1', sort: 0, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 9, dictType: 'system_data_scope', label: '本部门及以下', value: '2', sort: 1, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 10, dictType: 'system_data_scope', label: '本部门', value: '3', sort: 2, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 11, dictType: 'system_data_scope', label: '仅本人', value: '4', sort: 3, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 12, dictType: 'system_data_scope', label: '自定义部门', value: '5', sort: 4, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 13, dictType: 'system_user_sex', label: '男', value: '1', sort: 1, status: 0, createTime: '2024-01-01 00:00:00' },
  { id: 14, dictType: 'system_user_sex', label: '女', value: '2', sort: 2, status: 0, createTime: '2024-01-01 00:00:00' },
];

// 角色 Mock
const roleList: { id: number; name: string; code: string; type: number; sort: number; status: number; remark?: string; createTime: string; dataScope?: number; dataScopeDeptIds?: number[] }[] = [
  { id: 1, name: '超级管理员', code: 'super_admin', type: 1, sort: 0, status: 0, dataScope: 1, createTime: '2024-01-01 00:00:00' },
  { id: 2, name: '普通角色', code: 'common', type: 2, sort: 1, status: 0, dataScope: 2, createTime: '2024-01-01 00:00:00' },
];

// 角色菜单 ID Mock
const roleMenuIds: Record<number, number[]> = { 1: [1, 2], 2: [1] };

export const systemHandlers = [
  // ---------- 菜单 ----------
  http.get(/\/api\/system\/menu\/list\/?/, ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    let data = menuList;
    if (name) data = menuList.filter((m: Record<string, unknown>) => String(m.name).includes(name));
    return HttpResponse.json({ code: 0, data: JSON.parse(JSON.stringify(data)) });
  }),
  http.get(/\/api\/system\/menu\/get\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const menu = menuList.find((m: Record<string, unknown>) => m.id === id);
    if (!menu) return HttpResponse.json({ code: 404, message: '菜单不存在' }, { status: 404 });
    return HttpResponse.json({ code: 0, data: { ...menu } });
  }),
  http.get(/\/api\/system\/menu\/simple-list\/?/, () => HttpResponse.json({ code: 0, data: JSON.parse(JSON.stringify(menuList)) })),
  http.post(/\/api\/system\/menu\/create\/?/, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const id = Math.max(...menuList.map((m: Record<string, unknown>) => m.id as number), 0) + 1;
    menuList.push({ ...body, id, icon: body.icon ?? '', component: body.component ?? '', componentName: body.componentName ?? '', visible: true, keepAlive: true, alwaysShow: true });
    return HttpResponse.json({ code: 0, data: id });
  }),
  http.put(/\/api\/system\/menu\/update\/?/, async ({ request }) => {
    const body = (await request.json()) as { id: number };
    const idx = menuList.findIndex((m: Record<string, unknown>) => m.id === body.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '菜单不存在' }, { status: 404 });
    menuList[idx] = { ...menuList[idx], ...body };
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.delete(/\/api\/system\/menu\/delete\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const idx = menuList.findIndex((m: Record<string, unknown>) => m.id === id);
    if (idx !== -1) menuList.splice(idx, 1);
    return HttpResponse.json({ code: 0, data: undefined });
  }),

  // ---------- 地区 ----------
  http.get(/\/api\/system\/area\/tree\/?/, () => HttpResponse.json({ code: 0, data: JSON.parse(JSON.stringify(areaTree)) })),
  http.get(/\/api\/system\/area\/get-by-ip\/?/, ({ request }) => {
    const ip = new URL(request.url).searchParams.get('ip') || '';
    return HttpResponse.json({ code: 0, data: ip ? `中国 / ${ip}` : '' });
  }),

  // ---------- 部门 ----------
  http.get(/\/api\/system\/dept\/list\/?/, () => HttpResponse.json({ code: 0, data: JSON.parse(JSON.stringify(deptList)) })),
  http.get(/\/api\/system\/dept\/get\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const dept = deptList.find((d) => d.id === id);
    if (!dept) return HttpResponse.json({ code: 404, message: '部门不存在' }, { status: 404 });
    return HttpResponse.json({ code: 0, data: { ...dept } });
  }),
  http.get(/\/api\/system\/dept\/simple-list\/?/, () => HttpResponse.json({ code: 0, data: JSON.parse(JSON.stringify(deptList)) })),
  http.post(/\/api\/system\/dept\/create\/?/, async ({ request }) => {
    const body = (await request.json()) as (typeof deptList)[0];
    const id = Math.max(...deptList.map((d) => d.id), 0) + 1;
    deptList.push({ ...body, id, createTime: new Date().toISOString().slice(0, 19).replace('T', ' ') });
    return HttpResponse.json({ code: 0, data: id });
  }),
  http.put(/\/api\/system\/dept\/update\/?/, async ({ request }) => {
    const body = (await request.json()) as { id: number };
    const idx = deptList.findIndex((d) => d.id === body.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '部门不存在' }, { status: 404 });
    Object.assign(deptList[idx], body);
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.delete(/\/api\/system\/dept\/delete\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const idx = deptList.findIndex((d) => d.id === id);
    if (idx !== -1) deptList.splice(idx, 1);
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.delete(/\/api\/system\/dept\/delete-list\/?/, ({ request }) => {
    const ids = (new URL(request.url).searchParams.get('ids') || '').split(',').map(Number).filter(Boolean);
    ids.forEach((id) => {
      const idx = deptList.findIndex((d) => d.id === id);
      if (idx !== -1) deptList.splice(idx, 1);
    });
    return HttpResponse.json({ code: 0, data: undefined });
  }),

  // ---------- 用户 ----------
  http.get(/\/api\/system\/user\/page\/?/, ({ request }) => {
    const url = new URL(request.url);
    const pageNo = Number(url.searchParams.get('pageNo')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const username = url.searchParams.get('username');
    const nickname = url.searchParams.get('nickname');
    const status = url.searchParams.get('status');
    let list = [...userList];
    if (username) list = list.filter((u) => u.username.includes(username));
    if (nickname) list = list.filter((u) => u.nickname.includes(nickname));
    if (status !== null && status !== '') list = list.filter((u) => u.status === Number(status));
    const total = list.length;
    const start = (pageNo - 1) * pageSize;
    list = list.slice(start, start + pageSize);
    return HttpResponse.json({ code: 0, data: { list, total } });
  }),
  http.get(/\/api\/system\/user\/get\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const u = userList.find((x) => x.id === id);
    if (!u) return HttpResponse.json({ code: 404, message: '用户不存在' }, { status: 404 });
    const deptName = u.deptId ? deptList.find((d) => d.id === u.deptId)?.name : u.deptName;
    return HttpResponse.json({
      code: 0,
      data: { ...u, deptName, roleIds: userRoleIds[id] ?? [] },
    });
  }),
  http.post(/\/api\/system\/user\/create\/?/, async ({ request }) => {
    const body = (await request.json()) as { username: string; password?: string; nickname?: string; deptId?: number; mobile?: string; status?: number; roleIds?: number[] };
    if (userList.some((u) => u.username === body.username)) {
      return HttpResponse.json({ code: 400, message: '用户名已存在' }, { status: 200 });
    }
    const id = Math.max(...userList.map((u) => u.id), 0) + 1;
    const dept = body.deptId ? deptList.find((d) => d.id === body.deptId) : null;
    const createTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    userList.push({
      id,
      username: body.username,
      nickname: body.nickname ?? body.username,
      deptId: body.deptId,
      deptName: dept?.name,
      mobile: body.mobile ?? '',
      status: body.status ?? 0,
      createTime,
    });
    if (body.roleIds?.length) userRoleIds[id] = body.roleIds;
    return HttpResponse.json({ code: 0, data: id });
  }),
  http.put(/\/api\/system\/user\/update\/?/, async ({ request }) => {
    const body = (await request.json()) as { id: number; nickname?: string; deptId?: number; mobile?: string; status?: number; password?: string; roleIds?: number[] };
    const idx = userList.findIndex((u) => u.id === body.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '用户不存在' }, { status: 404 });
    const u = userList[idx];
    if (body.nickname != null) u.nickname = body.nickname;
    if (body.deptId != null) {
      u.deptId = body.deptId;
      u.deptName = deptList.find((d) => d.id === body.deptId)?.name;
    }
    if (body.mobile != null) u.mobile = body.mobile;
    if (body.status != null) u.status = body.status;
    if (body.roleIds != null) userRoleIds[u.id] = body.roleIds;
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.get(/\/api\/system\/user\/simple-list\/?/, () => HttpResponse.json({ code: 0, data: JSON.parse(JSON.stringify(userList)) })),
  http.delete(/\/api\/system\/user\/delete\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const idx = userList.findIndex((u) => u.id === id);
    if (idx !== -1) {
      userList.splice(idx, 1);
      delete userRoleIds[id];
    }
    return HttpResponse.json({ code: 0, data: undefined });
  }),

  // ---------- 字典类型 ----------
  http.get(/\/api\/system\/dict-type\/page\/?/, ({ request }) => {
    const url = new URL(request.url);
    const pageNo = Number(url.searchParams.get('pageNo')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const name = url.searchParams.get('name');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    let list = [...dictTypeList];
    if (name) list = list.filter((d) => d.name.includes(name));
    if (type) list = list.filter((d) => d.type.includes(type));
    if (status !== null && status !== '') list = list.filter((d) => d.status === Number(status));
    const total = list.length;
    const start = (pageNo - 1) * pageSize;
    list = list.slice(start, start + pageSize);
    return HttpResponse.json({ code: 0, data: { list, total } });
  }),
  http.get(/\/api\/system\/dict-type\/get\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const row = dictTypeList.find((d) => d.id === id);
    if (!row) return HttpResponse.json({ code: 404, message: '字典类型不存在' }, { status: 404 });
    return HttpResponse.json({ code: 0, data: { ...row } });
  }),
  http.get(/\/api\/system\/dict-type\/simple-list\/?/, () => HttpResponse.json({ code: 0, data: JSON.parse(JSON.stringify(dictTypeList)) })),
  http.post(/\/api\/system\/dict-type\/create\/?/, async ({ request }) => {
    const body = (await request.json()) as (typeof dictTypeList)[0];
    const id = Math.max(...dictTypeList.map((d) => d.id), 0) + 1;
    dictTypeList.push({ ...body, id, createTime: new Date().toISOString().slice(0, 19).replace('T', ' ') });
    return HttpResponse.json({ code: 0, data: id });
  }),
  http.put(/\/api\/system\/dict-type\/update\/?/, async ({ request }) => {
    const body = (await request.json()) as { id: number };
    const idx = dictTypeList.findIndex((d) => d.id === body.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '字典类型不存在' }, { status: 404 });
    Object.assign(dictTypeList[idx], body);
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.delete(/\/api\/system\/dict-type\/delete\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const idx = dictTypeList.findIndex((d) => d.id === id);
    if (idx !== -1) dictTypeList.splice(idx, 1);
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.delete(/\/api\/system\/dict-type\/delete-list\/?/, ({ request }) => {
    const ids = (new URL(request.url).searchParams.get('ids') || '').split(',').map(Number).filter(Boolean);
    ids.forEach((id) => {
      const idx = dictTypeList.findIndex((d) => d.id === id);
      if (idx !== -1) dictTypeList.splice(idx, 1);
    });
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.get(/\/api\/system\/dict-type\/export\/?/, () => {
    const blob = new Blob(['\uFEFF' + JSON.stringify(dictTypeList, null, 2)], { type: 'text/csv;charset=utf-8' });
    return new HttpResponse(blob, { headers: { 'Content-Disposition': 'attachment; filename=dict-type.csv' } });
  }),

  // ---------- 字典数据 ----------
  http.get(/\/api\/system\/dict-data\/list-by-types\/?/, ({ request }) => {
    const types = (new URL(request.url).searchParams.get('types') || '').split(',').map((s) => s.trim()).filter(Boolean);
    const list = types.length
      ? dictDataList.filter((d) => types.includes(d.dictType) && d.status === 0)
      : dictDataList.filter((d) => d.status === 0);
    return HttpResponse.json({ code: 0, data: JSON.parse(JSON.stringify(list)) });
  }),
  http.get(/\/api\/system\/dict-data\/page\/?/, ({ request }) => {
    const url = new URL(request.url);
    const pageNo = Number(url.searchParams.get('pageNo')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const dictType = url.searchParams.get('dictType');
    const label = url.searchParams.get('label');
    const status = url.searchParams.get('status');
    let list = [...dictDataList];
    if (dictType) list = list.filter((d) => d.dictType === dictType);
    if (label) list = list.filter((d) => d.label.includes(label));
    if (status !== null && status !== '') list = list.filter((d) => d.status === Number(status));
    const total = list.length;
    const start = (pageNo - 1) * pageSize;
    list = list.slice(start, start + pageSize);
    return HttpResponse.json({ code: 0, data: { list, total } });
  }),
  http.get(/\/api\/system\/dict-data\/get\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const row = dictDataList.find((d) => d.id === id);
    if (!row) return HttpResponse.json({ code: 404, message: '字典数据不存在' }, { status: 404 });
    return HttpResponse.json({ code: 0, data: { ...row } });
  }),
  http.post(/\/api\/system\/dict-data\/create\/?/, async ({ request }) => {
    const body = (await request.json()) as (typeof dictDataList)[0];
    const id = Math.max(...dictDataList.map((d) => d.id), 0) + 1;
    dictDataList.push({ ...body, id, createTime: new Date().toISOString().slice(0, 19).replace('T', ' ') });
    return HttpResponse.json({ code: 0, data: id });
  }),
  http.put(/\/api\/system\/dict-data\/update\/?/, async ({ request }) => {
    const body = (await request.json()) as { id: number };
    const idx = dictDataList.findIndex((d) => d.id === body.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '字典数据不存在' }, { status: 404 });
    Object.assign(dictDataList[idx], body);
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.delete(/\/api\/system\/dict-data\/delete\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const idx = dictDataList.findIndex((d) => d.id === id);
    if (idx !== -1) dictDataList.splice(idx, 1);
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.delete(/\/api\/system\/dict-data\/delete-list\/?/, ({ request }) => {
    const ids = (new URL(request.url).searchParams.get('ids') || '').split(',').map(Number).filter(Boolean);
    ids.forEach((id) => {
      const idx = dictDataList.findIndex((d) => d.id === id);
      if (idx !== -1) dictDataList.splice(idx, 1);
    });
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.get(/\/api\/system\/dict-data\/export\/?/, () => {
    const blob = new Blob(['\uFEFF' + JSON.stringify(dictDataList, null, 2)], { type: 'text/csv;charset=utf-8' });
    return new HttpResponse(blob, { headers: { 'Content-Disposition': 'attachment; filename=dict-data.csv' } });
  }),

  // ---------- 角色 ----------
  http.get(/\/api\/system\/role\/page\/?/, ({ request }) => {
    const url = new URL(request.url);
    const pageNo = Number(url.searchParams.get('pageNo')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const name = url.searchParams.get('name');
    const code = url.searchParams.get('code');
    const status = url.searchParams.get('status');
    let list = [...roleList];
    if (name) list = list.filter((r) => r.name.includes(name));
    if (code) list = list.filter((r) => r.code.includes(code));
    if (status !== null && status !== '') list = list.filter((r) => r.status === Number(status));
    const total = list.length;
    const start = (pageNo - 1) * pageSize;
    list = list.slice(start, start + pageSize);
    return HttpResponse.json({ code: 0, data: { list, total } });
  }),
  http.get(/\/api\/system\/role\/get\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const row = roleList.find((r) => r.id === id);
    if (!row) return HttpResponse.json({ code: 404, message: '角色不存在' }, { status: 404 });
    return HttpResponse.json({ code: 0, data: { ...row } });
  }),
  http.post(/\/api\/system\/role\/create\/?/, async ({ request }) => {
    const body = (await request.json()) as (typeof roleList)[0];
    const id = Math.max(...roleList.map((r) => r.id), 0) + 1;
    roleList.push({ ...body, id, createTime: new Date().toISOString().slice(0, 19).replace('T', ' ') });
    return HttpResponse.json({ code: 0, data: id });
  }),
  http.put(/\/api\/system\/role\/update\/?/, async ({ request }) => {
    const body = (await request.json()) as { id: number };
    const idx = roleList.findIndex((r) => r.id === body.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '角色不存在' }, { status: 404 });
    Object.assign(roleList[idx], body);
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.delete(/\/api\/system\/role\/delete\/?/, ({ request }) => {
    const id = Number(new URL(request.url).searchParams.get('id'));
    const idx = roleList.findIndex((r) => r.id === id);
    if (idx !== -1) roleList.splice(idx, 1);
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.delete(/\/api\/system\/role\/delete-list\/?/, ({ request }) => {
    const ids = (new URL(request.url).searchParams.get('ids') || '').split(',').map(Number).filter(Boolean);
    ids.forEach((id) => {
      const idx = roleList.findIndex((r) => r.id === id);
      if (idx !== -1) roleList.splice(idx, 1);
    });
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.get(/\/api\/system\/role\/export\/?/, () => {
    const blob = new Blob(['\uFEFF' + JSON.stringify(roleList, null, 2)], { type: 'text/csv;charset=utf-8' });
    return new HttpResponse(blob, { headers: { 'Content-Disposition': 'attachment; filename=role.csv' } });
  }),

  // ---------- 权限（角色菜单/数据权限） ----------
  http.get(/\/api\/system\/permission\/role-menu-ids\/?/, ({ request }) => {
    const roleId = Number(new URL(request.url).searchParams.get('roleId'));
    const ids = roleMenuIds[roleId] ?? [];
    return HttpResponse.json({ code: 0, data: ids });
  }),
  http.put(/\/api\/system\/permission\/assign-role-menu\/?/, async ({ request }) => {
    const body = (await request.json()) as { roleId: number; menuIds: number[] };
    roleMenuIds[body.roleId] = body.menuIds;
    return HttpResponse.json({ code: 0, data: undefined });
  }),
  http.put(/\/api\/system\/permission\/assign-role-data-scope\/?/, async ({ request }) => {
    const body = (await request.json()) as { roleId: number; dataScope: number; dataScopeDeptIds?: number[] };
    const role = roleList.find((r) => r.id === body.roleId);
    if (role) {
      role.dataScope = body.dataScope;
      role.dataScopeDeptIds = body.dataScopeDeptIds ?? [];
    }
    return HttpResponse.json({ code: 0, data: undefined });
  }),
];
