/**
 * Sub-Store Proxy Deduper (可选)
 * 基于完整连接参数去重，不基于名称、server:port 等不安全的简单字段。
 * 建议放在组合订阅的标准化脚本之前，保留首次出现的节点。
 * 不进行外网连通性检测。
 */
async function operator(proxies, targetPlatform, context) {
  if (!Array.isArray(proxies)) return proxies;

  // 仅忽略订阅来源信息和节点显示名，保留协议、安全参数、TLS、传输层等。
  const ignore = new Set([
    'name', '_subName', '_subDisplayName',
    '_collectionName', '_collectionDisplayName',
  ]);
  function normalize(value) {
    if (Array.isArray(value)) return value.map(normalize);
    if (value && typeof value === 'object') {
      const out = {};
      for (const key of Object.keys(value).filter(k => !ignore.has(k)).sort()) {
        if (value[key] !== undefined) out[key] = normalize(value[key]);
      }
      return out;
    }
    return value;
  }
  const seen = new Set();
  const result = [];
  let removed = 0;
  for (const proxy of proxies) {
    if (!proxy || typeof proxy !== 'object') continue;
    // 信息不足时不做推断式去重，防止误删不同的有效节点。
    if (!proxy.type || !proxy.server || !proxy.port) {
      result.push(proxy);
      continue;
    }
    const fingerprint = JSON.stringify(normalize(proxy));
    if (seen.has(fingerprint)) {
      removed++;
      continue;
    }
    seen.add(fingerprint);
    result.push(proxy);
  }
  console.log(`[Sub-Store 去重] 输入 ${proxies.length}，去重 ${removed}，保留 ${result.length}`);
  return result;
}
