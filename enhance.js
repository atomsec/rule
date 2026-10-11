async function operator(proxies, targetPlatform, context) {


/*
 *
 * Proxy Normalizer
 *
 * 多机场节点标准化
 *
 * 输出:
 *
 * [机场] 🇯🇵 JP [OPT-GPT] [vmess] 01
 *
 */



// ==========================
// 排除无效节点
// ==========================


const ignoreRules = [

    /剩余流量/,
    /套餐到期/,
    /距离下次/,
    /重置/,
    /官网/,
    /https?:\/\//,
    /建议/,
    /公告/,
    /群/,
    /频道/

];




// ==========================
// 标签规则
// ==========================


function getTags(name){


    let tags=[];



    // GPT

    if(
        /GPT|AI|OpenAI|ChatGPT/i.test(name)
    )
        tags.push("GPT");



    // 优化

    if(
        /优化|OPT/i.test(name)
    )
        tags.push("OPT");



    // WAP

    if(
        /WAP/i.test(name)
    )
        tags.push("WAP");



    // 专线

    if(
        /高速专线|专线|IEPL|IPLC/i.test(name)
    )
        tags.push("PREMIUM");



    // 直连

    if(
        /直连|DIRECT/i.test(name)
    )
        tags.push("DIRECT");



    // 原生

    if(
        /原生|Native|ISP/i.test(name)
    )
        tags.push("ISP");



    // IPv6

    if(
        /V6|IPv6|IPV6/i.test(name)
    )
        tags.push("V6");



    // 倍率

    let rate =
        name.match(
        /(0\.\d+|[1-9]\d*)[倍×x]/i
        );


    if(rate)
        tags.push(rate[1]+"x");



    // 国内线路

    if(/移动|CM/i.test(name))
        tags.push("CM");


    if(/联通|CU/i.test(name))
        tags.push("CU");


    if(/电信|CT/i.test(name))
        tags.push("CT");



    return [
        ...new Set(tags)
    ];

}



// ==========================
// 国家识别
// ==========================


function getCountry(name){


    let flag;
    let iso;


    try{


        flag =
        ProxyUtils.getFlag(name);


        iso =
        ProxyUtils.getISO(name);



        if(iso)
            return {
                flag,
                iso
            };


    }catch(e){}



    return {

        flag:"🌐",
        iso:"UN"

    };


}




// ==========================
// 编号
// ==========================


const counter={};




// ==========================
// 主处理
// ==========================


return proxies


.filter(proxy=>{


    return !ignoreRules.some(
        r=>r.test(proxy.name)
    );


})


.map(proxy=>{


    const oldName =
        proxy.name || "";



    const subName =
        proxy._subDisplayName ||
        proxy._subName ||
        "SUB";



    const country =
        getCountry(oldName);



    const tags =
        getTags(oldName);



    const type =
        proxy.type ||
        "unknown";



    const tagText =
        tags.length
        ?
        `[${tags.join("-")}]`
        :
        "";



    const key =
        `${subName}-${country.iso}-${tagText}-${type}`;



    counter[key] =
        (counter[key]||0)+1;



    const num =
        String(counter[key])
        .padStart(2,"0");




    proxy.name =
    `[${subName}] ${country.flag} ${country.iso} ${tagText} [${type}] ${num}`;



    return proxy;


});


}
