const fs = require("fs");
const parser = require("fast-xml-parser");
const xml2js = require('xml2js');
const { parseNumbers, parseBooleans} = xml2js.processors;

const xmlFileToJSON = async (filePath) => {
    try {
        const xmlData = fs.readFileSync(filePath, {
            encoding: "utf-8",
        });
        const options = {
            // attrNodeName: "#attr",
            textNodeName: "#text",
            attributeNamePrefix: "",
            arrayMode: false,
            ignoreAttributes: false,
            parseAttributeValue: true,
            trimValues: true,
        };
        const jsonData = parser.parse(xmlData, options, true);
        return jsonData;
    } catch (error) {
        throw error;
    }
};


const xmlFileToJSONV2 = async (filePath) => {
    try {
        const xmlData = fs.readFileSync(filePath, {
            encoding: "utf-8",
        });
        const options = {
            mergeAttrs: true,
            normalize: true,
            trim: true,
            explicitArray: false,
            charkey: "#text",
            includeWhiteChars: true,
            valueProcessors: [parseNumbers, parseBooleans]
        };
        const jsonData = xml2js.parseStringPromise(xmlData, options);
        return jsonData;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    xmlFileToJSON,
    xmlFileToJSONV2
}