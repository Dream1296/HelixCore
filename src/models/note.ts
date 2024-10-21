const db = require('../config/db/mysql');

type NoteType = {
    id: number,
    date: string,
    title: string,
    preview: string,
    imgs: string,
    content: string,
    classs: string
}
type NoteLog = {
    id: number,
    date: string,
    content: string,
}
type NoteTag = {
    id: number,
    tagName: string,
    tagld: string,
}

//获取指定笔记信息
function getNote(id: number) {
    return new Promise<NoteType>((resolve, reject) => {
        let sql = 'select id,date,title,preview,imgs,content,classs from notes where shows = 1 and id = ? ';
        try {

            db.query(sql, id, (err: any, results: NoteType[]) => {
                if (err) {
                    reject('0')
                }
                if (results.length > 0) {
                    resolve(results[0]);
                }
            })
        }
        catch {
            reject('0')
        }
    })
}

//获取标签的笔记列表
function getNoteList(classs: number) {
    return new Promise<NoteType[]>((resolve, reject) => {
        let sql = 'select id,date,title,preview,imgs,classs from notes where shows = 1 and classs = ? ';
        try {

            db.query(sql, classs, (err: any, results: NoteType[]) => {
                if (err) {
                    reject('0')
                }
                if (results.length > 0) {
                    resolve(results);
                }
            })
        }
        catch {
            reject('0')
        }
    })
}
//按时间顺序获取笔记列表
function getNoteLists() {
    return new Promise<NoteType[]>((resolve, reject) => {
        let sql = `SELECT id, date, title, preview, imgs, classs  
                    FROM notes  
                    WHERE shows = 1  
                    ORDER BY date DESC;`;
        try {

            db.query(sql, (err: any, results: NoteType[]) => {
                if (err) {
                    reject('0')
                }
                if (results.length > 0) {
                    resolve(results);
                }
            })
        }
        catch {
            reject('0')
        }
    })
}


//获取标签列表
function getNoteTagList() {
    return new Promise<NoteTag[]>((resolve, reject) => {
        let sql = 'select id,tagName,tagId from noteClass';
        try {
            db.query(sql, (err: any, results: NoteTag[]) => {
                if (err) {
                    reject('0')
                }
                if (results.length > 0) {
                    resolve(results);
                }
            })
        }
        catch {
            reject('0')
        }
    })
}




function setNoteLog(content: string) {
    return new Promise<string>((resolve, reject) => {
        const sql = `insert into notelog (date, content)  
                     values (NOW(), ?);`
        try {
            db.query(sql, content, (err: any, results: any) => {
                if (err) {
                    return console.log(err.message);
                }
                if (results.affectedRows == 1) {
                    resolve(content);
                }

            })
        }
        catch {
            reject('0');
        }
    })
}

function getNoteLog() {
    return new Promise<NoteLog>((resolve, reject) => {
        const sql = `SELECT id,date,content FROM notelog WHERE id = (SELECT MAX(id) FROM notelog);`;
        try {
            db.query(sql, (err: any, results: NoteLog[]) => {
                if (err) {
                    return console.log(err.message);
                }
                if (results.length == 1) {
                    resolve(results[0]);
                }

            })
        }
        catch {
            reject('0');
        }
    })
}


export { getNote, setNoteLog, getNoteLog, getNoteList, getNoteTagList ,getNoteLists}