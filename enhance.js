async function operator(proxies, targetPlatform, context) {


const counter = {};



return proxies.map(proxy=>{


let name = proxy.name;



// =======================
// 修复台湾旗帜
// =======================

name =
name.replace(
/🇨🇳 台湾/g,
"🇹🇼 台湾"
);




// =======================
// 删除重复标签
// =======================


name =
name.replace(
/GPT GPT/g,
"GPT"
);


name =
name.replace(
/WAP WAP/g,
"WAP"
);



name =
name.replace(
/移动 联通/g,
""
);


name =
name.replace(
/联通 电信/g,
""
);




// =======================
// 国家ISO
// =======================


const geo =
ProxyUtils.getISO(name);



const flag =
ProxyUtils.getFlag(name);




// =======================
// 标签提取
// =======================


let tags=[];



if(/GPT|AI/i.test(name))
 tags.push("GPT");



if(/WAP/i.test(name))
 tags.push("WAP");



if(/直连|DIRECT/i.test(name))
 tags.push("DIRECT");



if(/原生|ISP/i.test(name))
 tags.push("ISP");



if(/移动|CM/i.test(name))
 tags.push("CM");


if(/联通|CU/i.test(name))
 tags.push("CU");


if(/电信|CT/i.test(name))
 tags.push("CT");



if(/0\.1|0\.1×/i.test(name))
 tags.push("0.1x");


if(/2×|2x/i.test(name))
 tags.push("2x");





// =======================
// 去重
// =======================


tags =
[...new Set(tags)];




// =======================
// 编号
// =======================


let key =
`${geo}-${tags.join("-")}-${proxy.type}`;



counter[key] =
(counter[key]||0)+1;



let num =
String(counter[key])
.padStart(2,"0");




// =======================
// 输出
// =======================


proxy.name =
`${flag} ${geo} ${tags.length?"["+tags.join("-")+"]":""} ${num}`;



return proxy;


});


}
