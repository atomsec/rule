async function operator(proxies, targetPlatform, context) {


/*
 *
 * Proxy Normalizer v2.0
 *
 * Sub-Store 节点标准化脚本
 *
 * 输出:
 *
 * [机场] 🇯🇵 JP [OPT-GPT] [VM] 01
 *
 */



// ===============================
// 过滤非节点信息
// ===============================


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




// ===============================
// 名称清洗
// ===============================


function cleanName(name){


    return name

    // 删除区域描述
    .replace(
        /【.*?】/g,
        ""
    )

    // 删除分隔符
    .replace(
        /丨/g,
        " "
    )

    .replace(
        /\|/g,
        " "
    )

    // 统一倍率符号

    .replace(
        /×/g,
        "x"
    )


    // 多空格

    .replace(
        /\s+/g,
        " "
    )

    .trim();

}





// ===============================
// 标签识别
// ===============================


function getTags(name){


    let tags=[];



    // GPT

    if(
        /GPT|AI|OpenAI|ChatGPT/i.test(name)
    ){

        tags.push("GPT");

    }




    // 优化

    if(
        /优化|OPT/i.test(name)
    ){

        tags.push("OPT");

    }




    // WAP

    if(
        /WAP/i.test(name)
    ){

        tags.push("WAP");

    }




    // 专线

    if(
        /高速专线|专线|IEPL|IPLC/i.test(name)
    ){

        tags.push("PREMIUM");

    }




    // 直连

    if(
        /直连|DIRECT/i.test(name)
    ){

        tags.push("DIRECT");

    }




    // 原生

    if(
        /原生|Native|ISP/i.test(name)
    ){

        tags.push("ISP");

    }




    // IPv6

    if(
        /V6|IPv6|IPV6/i.test(name)
    ){

        tags.push("V6");

    }




    // 倍率

    let rate =
    name.match(
        /(0\.\d+|\d+)x|(\d+)倍/i
    );



    if(rate){

        let r =
        rate[1] ||
        rate[2];


        tags.push(
            r+"x"
        );

    }




    // 运营商


    if(
        /移动|CM/i.test(name)
    ){

        tags.push("CM");

    }



    if(
        /联通|CU/i.test(name)
    ){

        tags.push("CU");

    }



    if(
        /电信|CT/i.test(name)
    ){

        tags.push("CT");

    }




    return [
        ...new Set(tags)
    ];

}





// ===============================
// 国家识别
// ===============================


function getCountry(name){



    // 修正台湾

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





// ===============================
// 协议缩写
// ===============================


function shortType(type){


    const map={


        vmess:"VM",

        vless:"VL",

        hysteria2:"HY2",

        trojan:"TR",

        shadowsocks:"SS",

        ss:"SS"


    };


    return (
        map[type]
        ||
        type.toUpperCase()
    );


}





// ===============================
// 主处理
// ===============================


const counter={};



return proxies



.filter(proxy=>{


    let name =
    proxy.name || "";



    // 广告过滤

    if(
        ignoreRules.some(
            rule=>rule.test(name)
        )
    ){

        return false;

    }



    /*
      非节点判断

      没有:
      - 国家
      - 协议关键词

      认为不是节点
    */


    let hasCountry = false;


    try{

        hasCountry =
        !!ProxyUtils.getISO(name);

    }catch(e){}



    let hasProtocol =
    /vmess|vless|trojan|hy2|hysteria|ss/i
    .test(name);



    if(
        !hasCountry &&
        !hasProtocol
    ){

        return false;

    }



    return true;



})



.map(proxy=>{


    let oldName =
    cleanName(proxy.name || "");



    const subName =
    proxy._subDisplayName ||
    proxy._subName ||
    "SUB";



    const country =
    getCountry(oldName);




    const tags =
    getTags(oldName);




    const type =
    shortType(
        proxy.type || "UNKNOWN"
    );





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





    counter[key] =
    (counter[key] || 0)+1;





    let num =
    String(counter[key])
    .padStart(2,"0");






    proxy.name =
    `[${subName}] ${country.flag} ${country.iso} ${tagText} [${type}] ${num}`;




    return proxy;


});


}
