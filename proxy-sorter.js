async function operator(proxies, targetPlatform, context) {



/*
 Proxy Sorter v1.0

*/


// ===========================
// 权重
// ===========================


const regionOrder={


    HK:1,
    JP:2,
    SG:3,
    TW:4,
    KR:5,

    US:6,
    CA:7,

    GB:8,
    DE:9,

    IN:10


};



const tagOrder={


    DIRECT:1,

    PREMIUM:2,

    OPT:3,

    GPT:4,

    ISP:5,

    V6:9


};



const protocolOrder={


    HY2:1,

    VL:2,

    VM:3,

    TR:4,

    SS:5


};




// ===========================
// 提取
// ===========================


function getRegion(name){


    let m =
    name.match(
        /\s([A-Z]{2})\s/
    );


    return m
    ?
    m[1]
    :
    "ZZ";

}




function getTags(name){


    let result=[];


    let m =
    name.match(
        /\[(.*?)\]/
    );


    if(m){

        result =
        m[1].split("-");

    }


    return result;

}




function getProtocol(name){


    let m =
    name.match(
        /\[(HY2|VL|VM|TR|SS)\]/
    );


    return m
    ?
    m[1]
    :
    "ZZ";

}




function getAirport(name){


    let m =
    name.match(
        /^\[(.*?)\]/
    );


    return m
    ?
    m[1]
    :
    "";

}




function getNumber(name){


    let m =
    name.match(
        /(\d+)$/
    );


    return m
    ?
    Number(m[1])
    :
    999;

}





// ===========================
// 排序
// ===========================


return proxies.sort((a,b)=>{


    let an =
    a.name;

    let bn =
    b.name;



    // 机场

    let aa =
    getAirport(an);

    let ba =
    getAirport(bn);


    if(aa!==ba){

        return aa.localeCompare(
            ba
        );

    }




    // 地区

    let ar =
    regionOrder[
        getRegion(an)
    ]
    ||
    99;


    let br =
    regionOrder[
        getRegion(bn)
    ]
    ||
    99;



    if(ar!==br)
        return ar-br;




    // 标签

    let at =
    getTags(an)[0]
    ||
    "ZZ";


    let bt =
    getTags(bn)[0]
    ||
    "ZZ";


    if(
        (tagOrder[at]||99)
        !==
        (tagOrder[bt]||99)
    ){

        return
        (tagOrder[at]||99)
        -
        (tagOrder[bt]||99);

    }




    // 协议


    let ap =
    protocolOrder[
        getProtocol(an)
    ]
    ||
    99;


    let bp =
    protocolOrder[
        getProtocol(bn)
    ]
    ||
    99;


    if(ap!==bp)
        return ap-bp;




    // 编号

    return (
        getNumber(an)
        -
        getNumber(bn)
    );



});


}
