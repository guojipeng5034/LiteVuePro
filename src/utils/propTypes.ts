/**
 * 简易 props 类型工具（不依赖 vue-types）
 * 用于兼容原写法 propTypes.string、propTypes.number.def(16) 等
 */

export const propTypes = {
  string: { type: String },
  number: Object.assign({ type: Number }, { def: (v: number) => ({ type: Number, default: v }) }),
  bool: { type: Boolean },
  object: { type: Object },
} as {
  string: { type: typeof String };
  number: { type: typeof Number; def: (v: number) => { type: typeof Number; default: number } };
  bool: { type: typeof Boolean };
  object: { type: typeof Object };
};
