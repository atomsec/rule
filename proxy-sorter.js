/**
 * Sub-Store Proxy Sorter v1.1 (修订版)
 * 机场 → 地区 → 线路标签 → 协议 → 编号
 * 修复原版 getTags() 误读机场名和 return 换行导致返回 undefined 的问题。
 */
async function operator(proxies, targetPlatform, context) {
  if (!Array.isArray(proxies)) return proxies;

  const regionOrder = { HK: 1, JP: 2, SG: 3, TW: 4, KR: 5,
    US: 6, CA: 7, GB: 8, DE: 9, IN: 10 };
  const tagOrder = { DIRECT: 1, PREMIUM: 2, OPT: 3, WAP: 3.5,
    GPT: 4, ISP: 5, V6: 9 };
  const protocolOrder = { HY2: 1, VL: 2, VM: 3, TR: 4, SS: 5,
    SSR: 6, HY: 7, TUIC: 8, WG: 9, HTTP: 10, SOCKS5: 11 };

  function parse(name) {
    const text = String(name || '');
    // 完整匹配规范化名称：第一个 [] 为机场，中间可选 [] 为标签，最后 [] 为协议。
    const m = text.match(/^\[([^\]]*)\]\s+(?:\S+\s+)?([A-Z]{2})\s+(?:\[([^\]]+)\]\s+)?\[([A-Za-z0-9_-]+)\]\s+(\d+)$/);
    if (m) return {
      airport: m[1], region: m[2], tags: m[3] ? m[3].split('-') : [],
      protocol: m[4], number: Number(m[5]), text,
    };
    // 对偶发的非标准名称，保留节点并提供兜底排序，不会误读第一个 [] 为线路标签。
    const a = text.match(/^\[([^\]]+)\]/);
    return { airport: a ? a[1] : '', region: 'ZZ', tags: [],
      protocol: '', number: Number.POSITIVE_INFINITY, text };
  }

  const rank = (order, key) => Object.prototype.hasOwnProperty.call(order, key)
    ? order[key] : 99;
  const tagRank = tags => tags.length
    ? Math.min(...tags.map(tag => rank(tagOrder, tag))) : 99;

  // 先解析一次，避免比较器在大批量节点排序时重复运行正则。
  const entries = proxies.map((proxy, index) => ({
    proxy, index, info: parse(proxy && proxy.name),
  }));
  entries.sort((a, b) => {
    const x = a.info, y = b.info;
    let d = x.airport.localeCompare(y.airport, 'zh-CN');
    if (d) return d;
    d = rank(regionOrder, x.region) - rank(regionOrder, y.region);
    if (d) return d;
    // 未列入优先级的其他国家，按 ISO 字母排序，结果可预测。
    d = x.region.localeCompare(y.region);
    if (d) return d;
    d = tagRank(x.tags) - tagRank(y.tags);
    if (d) return d;
    d = rank(protocolOrder, x.protocol) - rank(protocolOrder, y.protocol);
    if (d) return d;
    d = x.protocol.localeCompare(y.protocol);
    if (d) return d;
    d = x.number - y.number;
    if (Number.isNaN(d)) d = 0; // Infinity - Infinity
    if (d) return d;
    d = x.tags.join('-').localeCompare(y.tags.join('-'));
    if (d) return d;
    d = x.text.localeCompare(y.text, 'zh-CN');
    return d || a.index - b.index;
  });
  return entries.map(item => item.proxy);
}
