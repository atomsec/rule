async function operator(proxies, targetPlatform, context) {


  const counter = {};


  return proxies.map(proxy => {


    let name = proxy.name;



    // ====================
    // 标签识别
    // ====================


    let tags = [];



    if (/GPT|AI|OpenAI/i.test(name)) {
      tags.push("GPT");
    }


    if (/优化|OPT/i.test(name)) {
      tags.push("OPT");
    }


    if (/WAP/i.test(name)) {
      tags.push("WAP");
    }


    if (/高速专线|专线|IEPL|IPLC/i.test(name)) {
      tags.push("PREMIUM");
    }


    if (/直连|DIRECT/i.test(name)) {
      tags.push("DIRECT");
    }


    if (/原生|ISP/i.test(name)) {
      tags.push("ISP");
    }


    if (/V6|IPv6/i.test(name)) {
      tags.push("V6");
    }



    // 倍率

    let rate =
      name.match(
        /(0\.\d+)倍|【(\d+)x】|(\d+)倍/
      );


    if(rate){

      let r =
        rate[1] ||
        rate[2] ||
        rate[3];


      tags.push(
        r + "x"
      );

    }



    // 运营商

    if(/移动|CM/i.test(name)){
      tags.push("CM");
    }


    if(/联通|CU/i.test(name)){
      tags.push("CU");
    }


    if(/电信|CT/i.test(name)){
      tags.push("CT");
    }



    // ====================
    // 防重复编号
    // ====================


    let key =
      tags.join("-");


    counter[key] =
      (counter[key] || 0)+1;


    let num =
      String(counter[key])
      .padStart(2,"0");



    // ====================
    // 最终格式
    // ====================


    if(tags.length){

      proxy.name =
        `${name} [${tags.join("-")}] ${num}`;

    }
    else{

      proxy.name =
        `${name} ${num}`;

    }


    return proxy;


  });


}
