const request = require('request')
const AK = "xjIVq5OXMFbcsek9lO6vf8IW"
const SK = "O2VQG0gIZOe8tyQj2O8TkCbitDKIY3m8"

type A = {
    texts:{text_1:string,text_2:string},
    score:number,
    log_id:string,
}

async function setWorld(text_1: string, text_2: string):Promise<A> {
    var options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/rpc/2.0/nlp/v2/simnet?charset=UTF-8&access_token=' + await getAccessToken(),
        'headers': {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "text_1": text_1,
            "text_2": text_2
        })

    };
    return await new Promise((resolve, reject) => {
        request(options, function (error: string | undefined, response: { body: unknown; }) {
            if (error) {
                throw new Error(error);
            }
            resolve(JSON.parse(response.body as string));
        });
    });

}

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
function getAccessToken() {

    let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK,
    }
    return new Promise((resolve, reject) => {
        request(options, (error: any, response: { body: string; }) => {
            if (error) { reject(error) }
            else { resolve(JSON.parse(response.body).access_token) }
        })
    })
}

export {setWorld};
