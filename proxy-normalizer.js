/**
 * Sub-Store Proxy Normalizer v2.2 (修订版)
 * 输出：[机场] 🇭🇰 HK [PREMIUM-CM] [VL] 01
 * 用法：订阅 / 组合订阅 → 节点操作 → 脚本操作（函数式脚本）
 * 建议：先去重，再运行本脚本，最后运行 proxy-sorter-fixed.js。
 */
async function operator(proxies, targetPlatform, context) {
  if (!Array.isArray(proxies)) return proxies;

  // 仅过滤明显属于订阅通知、套餐信息、广告的伪节点。
  // 不用 /流量/i：它可能误删名为“低倍率流量”等真实节点。
  const ignoreRules = [
    /剩余流量|流量剩余|已用流量|总流量|流量重置|流量用量/i,
    /套餐(?:信息|到期|剩余|余量|有效期)|到期时间|有效期|长期有效|下次重置|重置时间/i,
    /过滤掉|机场地址|官网|订阅地址|https?:\/\/|www\./i,
    /公告|通知|Telegram|TG群|频道|交流群|官方群|续费|购买套餐|建议/i,
  ];

  function cleanName(value) {
    return String(value || '')
      // 保留【香港】等方括号里的有用地区或线路信息。
      .replace(/【([^】]*)】/g, ' $1 ')
      .replace(/[丨|]/g, ' ')
      .replace(/×/g, 'x')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 对已经标准化的名称单独解析，保证重复执行时不再误识别机场名里的 AI/CM。
  function parseNormalized(name) {
    const m = name.match(/^\[([^\]]*)\]\s+(?:\S+\s+)?([A-Z]{2})\s+(?:\[([^\]]+)\]\s+)?\[([A-Za-z0-9_-]+)\]\s+(\d+)$/);
    return m ? { region: m[2], tags: m[3] ? m[3].split('-') : [], protocol: m[4] } : null;
  }

  function getTags(name) {
    const existing = parseNormalized(name);
    if (existing) return existing.tags;

    const tags = [];
    if (/直连|\bDIRECT\b/i.test(name)) tags.push('DIRECT');
    if (/高速专线|专线|IEPL|IPLC/i.test(name)) tags.push('PREMIUM');
    if (/优化|\bOPT\b/i.test(name)) tags.push('OPT');
    if (/\bWAP\b/i.test(name)) tags.push('WAP');
    // AI 应是独立的英文单词，避免误把 Thailand / Spain 标记成 GPT。
    if (/GPT|OpenAI|ChatGPT|\bAI\b/i.test(name)) tags.push('GPT');
    if (/原生|\bNative\b|\bISP\b/i.test(name)) tags.push('ISP');
    if (/IPv6|\bV6\b/i.test(name)) tags.push('V6');

    // 同时正确识别 0.5x 和 0.5倍；不会把后者误写为 5x。
    const rate = name.match(/(?:^|[^\d.])(\d+(?:\.\d+)?)\s*(?:x|倍)(?![a-z])/i);
    if (rate) tags.push(`${rate[1]}x`);

    // 避免误把包含 CM/CU/CT 的长英文单词当成运营商。
    if (/移动|(?:^|[^A-Za-z])CM(?=$|[^A-Za-z])/i.test(name)) tags.push('CM');
    if (/联通|(?:^|[^A-Za-z])CU(?=$|[^A-Za-z])/i.test(name)) tags.push('CU');
    if (/电信|(?:^|[^A-Za-z])CT(?=$|[^A-Za-z])/i.test(name)) tags.push('CT');
    return [...new Set(tags)];
  }

  function flagByISO(code) {
    if (!/^[A-Z]{2}$/.test(code) || code === 'UN' || code === 'ZZ') return '🌐';
    return String.fromCodePoint(...[...code].map(c => 127397 + c.charCodeAt(0)));
  }

  function getCountry(name) {
    const fixed = name.replace(/🇨🇳\s*台湾/g, '🇹🇼 台湾');
    const existing = parseNormalized(fixed);
    let iso = existing ? existing.region : '';
    let flag = '';
    try {
      if (!iso && typeof ProxyUtils !== 'undefined' && ProxyUtils.getISO) {
        const result = ProxyUtils.getISO(fixed);
        iso = Array.isArray(result) ? result.find(x => /^[A-Z]{2}$/.test(x)) : result;
      }
      if (typeof ProxyUtils !== 'undefined' && ProxyUtils.getFlag) {
        flag = ProxyUtils.getFlag(fixed);
      }
    } catch (_) { /* ISO 无法判断时使用 UN */ }
    iso = typeof iso === 'string' ? iso.toUpperCase() : '';
    if (!/^[A-Z]{2}$/.test(iso) || iso === 'ZZ') iso = 'UN';
    if (!flag || flag === '🌐') flag = flagByISO(iso);
    if (iso === 'UN') flag = '🌐';
    return { iso, flag };
  }

  function shortType(value) {
    const type = String(value || 'unknown').toLowerCase();
    const map = {
      vless: 'VL', vmess: 'VM', hysteria2: 'HY2', 'hysteria-2': 'HY2',
      trojan: 'TR', shadowsocks: 'SS', ss: 'SS',
      shadowsocksr: 'SSR', ssr: 'SSR', hysteria: 'HY', tuic: 'TUIC',
      wireguard: 'WG', http: 'HTTP', socks5: 'SOCKS5', snell: 'SNELL',
      juicity: 'JUICITY',
    };
    return map[type] || type.toUpperCase().replace(/[^A-Z0-9_-]/g, '') || 'UNKNOWN';
  }

  const counters = new Map();
  return proxies.filter(proxy => {
    if (!proxy || typeof proxy !== 'object') return false;
    const name = String(proxy.name || '');
    return name.trim() && !ignoreRules.some(rule => rule.test(name));
  }).map(proxy => {
    const raw = cleanName(proxy.name);
    const country = getCountry(raw);
    const tags = getTags(raw);
    const type = shortType(proxy.type);
    const subName = String(proxy._subDisplayName || proxy._subName || 'SUB')
      .replace(/[\[\]【】]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'SUB';
    const tagText = tags.length ? `[${tags.join('-')}]` : '';
    const key = JSON.stringify([subName, country.iso, tagText, type]);
    const number = (counters.get(key) || 0) + 1;
    counters.set(key, number);
    proxy.name = [`[${subName}]`, country.flag, country.iso, tagText, `[${type}]`, String(number).padStart(2, '0')]
      .filter(Boolean).join(' ');
    return proxy;
  });
}
