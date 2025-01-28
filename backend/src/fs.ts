import fs from "fs";

export const fetchDir = (dir: string, baseDir: string) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, { withFileTypes: true }, (err, files) => {
            if (err) {
                reject(err)
            } else {
                resolve(files.map(file => ({ type: file.isDirectory() ? "dir" : "file", name: file.name, })))
            }
        })
    })

}