/**
 * vue-dompurify-html 自定义规则与配置
 * 企业级框架统一 XSS 防护与富文本策略
 */
import type { DirectiveConfig, MinimalDOMPurifyConfig } from 'vue-dompurify-html';
import type {
  UponSanitizeAttributeHookEvent,
  UponSanitizeElementHookEvent,
} from 'dompurify';

/** 默认配置：安全 HTML，允许基础排版与链接 */
const defaultConfig: MinimalDOMPurifyConfig = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['target'],
  ALLOW_DATA_ATTR: false,
};

/** 富文本配置：用于正文、详情等，允许更多标签与安全 data 属性 */
const richConfig: MinimalDOMPurifyConfig = {
  ...defaultConfig,
  ADD_TAGS: ['mark', 'kbd', 'sub', 'sup', 'small', 'ins', 'del'],
  ADD_ATTR: ['target', 'class', 'data-id', 'data-type'],
  ALLOW_DATA_ATTR: true,
};

/** SVG 配置：内联 SVG 场景 */
const svgConfig: MinimalDOMPurifyConfig = {
  USE_PROFILES: { svg: true, svgFilters: true },
};

/** 纯文本/严格模式：仅保留换行与基础格式，适合摘要、标题 */
const strictConfig: MinimalDOMPurifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'span'],
  ALLOWED_ATTR: ['class'],
};

/**
 * 对外部链接统一加上 rel="noopener noreferrer"，
 * 避免 target="_blank" 带来的安全与性能问题
 */
function uponSanitizeElement(
  currentNode: Node,
  hookEvent: UponSanitizeElementHookEvent,
  _config: MinimalDOMPurifyConfig
): void {
  if (currentNode.nodeType !== Node.ELEMENT_NODE) return;
  const el = currentNode as Element;
  const tagName = (hookEvent.tagName || el.tagName || '').toLowerCase();
  if (tagName !== 'a') return;
  const target = el.getAttribute('target');
  if (target === '_blank' || target === 'blank') {
    el.setAttribute('rel', 'noopener noreferrer');
  }
}

/**
 * 可选：在属性被保留后再次校验 href，仅允许 http/https/mailto/tel
 * 若需更严格，可在 uponSanitizeAttribute 中实现
 */
function uponSanitizeAttribute(
  currentNode: Element,
  hookEvent: UponSanitizeAttributeHookEvent,
  _config: MinimalDOMPurifyConfig
): void {
  if (hookEvent.attrName?.toLowerCase() !== 'href') return;
  const value = (hookEvent.attrValue ?? '').trim().toLowerCase();
  if (!value) return;
  const allowed = value.startsWith('http:') || value.startsWith('https:') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('#');
  if (!allowed) {
    currentNode.removeAttribute('href');
  }
}

/** 供 main.ts 使用的插件配置 */
export const dompurifyDirectiveConfig: DirectiveConfig = {
  default: defaultConfig,
  namedConfigurations: {
    default: defaultConfig,
    rich: richConfig,
    svg: svgConfig,
    strict: strictConfig,
  },
  hooks: {
    uponSanitizeElement,
    uponSanitizeAttribute,
  },
};
