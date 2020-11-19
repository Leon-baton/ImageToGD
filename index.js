const fs = require('fs');
const zlib = require('zlib')

const hsv = require('rgb-hsv')

var circleCount = require("./config.json").circle_count;

const { Geometrize } = require('geometrizejs-extra');
const { Bitmap, ImageRunner, ShapeTypes } = require('geometrizejs');

let level = process.env.HOME || process.env.USERPROFILE + "/AppData/Local/GeometryDash/CCLocalLevels.dat"
let dir = fs.readdirSync("./image")

let extensions = [".png", ".jpg", ".jpeg", ".bmp"]
let f = dir.find(x => extensions.find(y => x.toLowerCase().endsWith(y)))

if (!f) return console.log("Нет изображений.")

function xor(str, key) {
        str = String(str).split('').map(letter => letter.charCodeAt());
        let res = "";
        for (i = 0; i < str.length; i++) res += String.fromCodePoint(str[i] ^ key);
        return res;
}

function map(value, low1, high1, low2, high2) {
        return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)
}

var getData = new Promise ( (res, rej) => {
        fs.readFile(level, 'utf8', function(err, data) {
                if (err) return console.log("Файл \"CCLocalLevels.dat\", не существует!")
                if (!data.startsWith('<?xml version="1.0"?>')) {
                        data = xor(data, 11);
                        data = Buffer.from(data, 'base64')
                        try { 
                                data = zlib.unzipSync(data).toString() 
                        } catch(e) { }
                }
        res(data);
})})

var offsetx = require("./config.json").offsetX;
let index = 0;

(async () => {
        process.stdout.write("...");
                const job = new Geometrize({
                        input: `image/${f}`,
                        output: `temp/image.json`,
                        shapeTypes: [ShapeTypes.CIRCLE],
                        candidateShapesPerStep: 100,
                        iterations: circleCount,
                        onFinish: result => {
                                process.stdout.write(`\nИзображение успешно конвертировано!\n`)
                        },
                        onStep: step => {
                                index++;
                                process.stdout.write(`\r`)
                                process.stdout.write(`\rШаг: ${index}/${circleCount}`)
                        }
                  })
        await job.start()
})()

getData.then(data => {
        var lvl = data.match("<k>k4</k><s>(.*)</s>")[0].replace("<k>k4</k><s>", "").split("</s><k>k5</k>")[0]

        var lvlName = data.match("<i>4</i><k>k2</k><s>(.*)<s>")[0].replace("<i>4</i><k>k2</k><s>", "").split("</s>")[0]

        var bg = [0, 0, 0]

        var lvlStr = `kS38,1_${bg[0]}_2_${bg[1]}_3_${bg[2]}_11_255_12_255_13_255_4_-`+ 
        `1_6_1000_7_1_15_1_18_0_8_1|1_0_2_0_3_0_11_255_12_255_13_255_4_-1_6_1001_7_1_15_1_18_0_8_1|` +
        `1_0_2_0_3_0_11_255_12_255_13_255_4_-1_6_1009_7_1_15_1_18_0_8_1|` +
        `1_255_2_255_3_255_11_255_12_255_13_255_4_-1_6_1002_5_1_7_1_15_1_18_0_8_1|` +
        `1_135_2_135_3_135_11_255_12_255_13_255_4_-1_6_1005_5_1_7_1_15_1_18_0_8_1|` +
        `1_255_2_125_3_0_11_255_12_255_13_255_4_-1_6_1006_5_1_7_1_15_1_18_0_8_1|` +
        `1_255_2_0_3_0_11_255_12_255_13_255_4_-1_6_10_7_1_15_1_18_0_8_1|`;

        for(let i = 0; i<101; i++) {
                lvlStr += `|1_0_2_255_3_255_7_${i/100}_6_${20 + i}_8_1_5_0`;
        }

        lvlStr += `,kA13,0,kA15,0,kA16,0,kA14,,kA6,13,kA7,0,kA17,0,kA18,0,kS39,0,kA2,0,kA3,0,kA8,0,kA4,0,kA9,0,kA10,0,kA11,0;`

        var image = require("./temp/image.json");
        var scale = 1;

        image.forEach((img)=>{
                let colorID = 20 + Math.round((img.color[3] / 255) * 100) || 70;
                        var size = ((img.data[2] * scale) / 4);
                        let color = hsv(img.color[0], img.color[1], img.color[2])

                        lvlStr += `1,1764,` +
                        `2,${(img.data[0] * scale) + offsetx},` +
                        `3,${0 + (128 - (img.data[1] * scale))},` +
                        `21,${colorID},32,${size},41,1,43,${map(color[0], 0, 360, -180, 180)}a${map(color[1], 0, 100, 0, 1)}a${map(color[2], 0, 100, 0, 1)}a0a0;`
        });

        var writeData = data.replace(lvl, lvlStr)

        fs.writeFile(level, writeData, (err) => {
                if (err) console.log("\nОшибка записи файла!")
                console.log('\nСохранено в ' + lvlName);
        });
}).catch(e => console.log("Создай хотя бы один уровень!"));
