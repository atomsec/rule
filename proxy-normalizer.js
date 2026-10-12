async function operator(proxies, targetPlatform, context) {


/*
 Proxy Normalizer v2.1

 Multi Airport Node Standardizer
 VL=VLESS, VM=VMESS, HY2=Hysteria2, TR=Trojan, SS=Shadowsocks,
 CM=China Mobile, CU=China Unicom, CT=China Telecom,
 PREMIUM=IEPL/IPLC/Dedicated/HIGH Dedicated, OPT=optimization, WAP=WAP OPT

*/


// =============================
// 过滤规则
// =============================

const ignoreRules = [

    /剩余流量/i,
    /流量/i,
    /套餐/i,
    /到期/i,
    /长期有效/i,
    /有效期/i,
    /重置/i,
    /下次/i,
    /周期/i,

    /过滤掉/i,

    /官网/i,
    /https?:\/\//i,

    /建议/i,
    /公告/i,
    /通知/i,

    /telegram/i,
    /频道/i,
    /群/i,

    /机场地址/i

];



// =============================
// 清理名称
// =============================

function cleanName(name){

    return name

    .replace(/【.*?】/g,"")

    .replace(/丨/g," ")

    .replace(/\|/g," ")

    .replace(/×/g,"x")

    .replace(/\s+/g," ")

    .trim();

}



// =============================
// 标签识别
// =============================

function getTags(name){


    let tags=[];



    if(/直连|DIRECT/i.test(name))
        tags.push("DIRECT");


    if(/高速专线|专线|IEPL|IPLC/i.test(name))
        tags.push("PREMIUM");


    if(/优化|OPT/i.test(name))
        tags.push("OPT");


    if(/WAP/i.test(name))
        tags.push("WAP");


    if(/GPT|AI|OpenAI|ChatGPT/i.test(name))
        tags.push("GPT");


    if(/原生|Native|ISP/i.test(name))
        tags.push("ISP");


    if(/V6|IPv6|IPV6/i.test(name))
        tags.push("V6");



    // 倍率

    let rate =
    name.match(
        /(0\.\d+|\d+)x|(\d+)倍/i
    );


    if(rate){

        let r =
        rate[1] || rate[2];

        tags.push(
            r+"x"
        );

    }




    if(/移动|CM/i.test(name))
        tags.push("CM");


    if(/联通|CU/i.test(name))
        tags.push("CU");


    if(/电信|CT/i.test(name))
        tags.push("CT");



    return [...new Set(tags)];

}



// =============================
// 国家识别
// =============================

function getCountry(name){


    // 台湾修正

    name =
    name.replace(
        /🇨🇳\s*台湾/g,
        "🇹🇼 台湾"
    );



    try{

        let iso =
        ProxyUtils.getISO(name);


        let flag =
        ProxyUtils.getFlag(name);


        if(iso){

            return {
                iso,
                flag
            };

        }


    }catch(e){}



    return {
        iso:"UN",
        flag:"🌐"
    };

}



// =============================
// 协议缩写
// =============================

function shortType(type){


    const map={

        vmess:"VM",

        vless:"VL",

        hysteria2:"HY2",

        trojan:"TR",

        shadowsocks:"SS"

    };


    return map[type]
    ||
    type.toUpperCase();

}



// =============================
// 编号
// =============================

const counter={};



// =============================
// 主流程
// =============================


return proxies


.filter(proxy=>{


    let name =
    proxy.name || "";



    // 广告过滤

    if(
        ignoreRules.some(
            r=>r.test(name)
        )
    ){

        return false;

    }



    return true;


})


.map(proxy=>{


    let raw =
    proxy.name || "";


    let name =
    cleanName(raw);



    let country =
    getCountry(name);



    let tags =
    getTags(name);



    let type =
    shortType(
        proxy.type || "UNKNOWN"
    );



    let subName =
    proxy._subDisplayName ||
    proxy._subName ||
    "SUB";



    let tagText =
    tags.length
    ?
    `[${tags.join("-")}]`
    :
    "";



    let key =
    [
        subName,
        country.iso,
        tagText,
        type

    ].join("-");



    counter[key]=
    (counter[key]||0)+1;



    let num =
    String(counter[key])
    .padStart(2,"0");



    proxy.name =
    `[${subName}] ${country.flag} ${country.iso} ${tagText} [${type}] ${num}`;



    return proxy;


});


}
