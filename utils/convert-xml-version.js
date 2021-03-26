const { listCategory } = require('../controllers/bigcommerce');
const { ColorCodes } = require('./constant');
const { validateValue, titleCase } = require("./index");

const convertToBigCProduct = async (data) => {
    const product = data;

    const bigCommProductObj = {
        brand_name: "Gore", // not able to determined in csv,
        custom_fields: getCustomFields(product),
        description: product?.["productDetails"]?.["en"] || "",
        name: (product?.["display-name"]?.["en"] || "").slice(0, 255),
        inventory_tracking: "variant",
        is_free_shipping: false,
        is_visible: true,
        type: "physical",
        weight: +(product?.["weightOZ"]?.["en"] || 0),
        variants: getProductVariants(product),
        price: 0,
        sku: product["product-id"]?.toString(),
    }
    bigCommProductObj.categories = await getCategoriesIds(product).catch(err => []);
    console.log("bigCommProductObj: ",  JSON.stringify(bigCommProductObj));
    return bigCommProductObj;
};

const getCustomFields = (product) => {
    let fields = [
        { "name": "fit", "value": validateValue(product?.["fitLevel"]?.["en"], "string") },
        { "name": "gender", "value": validateValue(product?.["gender"]?.["en"], "string") },
        { "name": "fabric_tech", "value": validateValue(product?.["fabricTechnology"]?.["en"], "string") },
        { "name": "waterproofness", "value": validateValue(product?.["waterproofness"]?.["en"], "string") },
        { "name": "windproofness", "value": validateValue(product?.["windproofness"]?.["en"], "string") },
        { "name": "breathability", "value": validateValue(product?.["breathability"]?.["en"], "string") },
        { "name": "insulation", "value": validateValue(product?.["insulation"]?.["en"], "string") },
        { "name": "temperature", "value": validateValue(product?.["temperature"]?.["en"], "string") },
        { "name": "highlights", "value": validateValue(product?.["benefits"]?.["en"], "string") },
        { "name": "backpack_use", "value": validateValue(product?.["backpackUse"]?.["en"], "string") },
        { "name": "seat_insert", "value": validateValue(product?.["SeatInsert"]?.["en"], "string") },
        { "name": "secondary_end_use", "value": validateValue(product?.["endUseSecondary"]?.["en"], "string") },
        { "name": "shop_runner_eligible", "value": validateValue(product?.["sr_eligible"]?.["en"], "string") },   
        { "name": "search_placement", "value": validateValue(product?.["search-placement"], "string") },
        { "name": "is_coming_soon", "value": validateValue(product?.["isComingSoon"]?.["en"], "string") },   
        { "name": "is_new", "value": validateValue(product?.["isNew"]?.["en"], "string") },   
        { "name": "model_number", "value": validateValue(product?.["modelNumber"]?.["en"], "string") },   
        { "name": "new_colours", "value": validateValue(product?.["newColours"]?.["en"], "string") },   
        { "name": "pdp_content_assets", "value": validateValue(product?.["pdpContentAssets"]?.["en"], "string") },
        // todo: not populating value correctly "protection"
        { "name": "protection", "value": validateValue(product?.["protection"]?.["en"], "string") }, 
        { "name": "size_guide_id", "value": validateValue(product?.["sizeguideid"]?.["en"], "string") },   
        { "name": "size_guide_update_asset_id", "value": validateValue(product?.["sizeguideupdateassetid"]?.["en"], "string") },
    ];
    fields = fields.filter(o => o.value);
    return fields;
};

const getProductVariants = (product) => {
    const { variants: productVariants } = product; 
    let variantArr = [];
    for(let variant of productVariants){
        let optionValues = getOptionValues(variant);
        let obj = {
            // sku: variant["EAN"]?.toString(),
            price: variant.price,
            upc: variant["EAN"]?.toString()
        };
        if(optionValues){
            let extraData = optionValues.reduce( (acc, o) => {
                acc = { ...acc, ...o.extra }
                return acc;
            }, {});
            obj.option_values = optionValues.map(o => {
                delete o.extra;
                return o;
            });
            // update the sku based on 'ProductID-ColorCode-Size'
            let { colorCode="", defaultSize="" } = extraData;
            // if we get size in form of 'XS/3' then just take the value after /
            // size = size.substring(size.indexOf("/")+1)
            let newSku = [ product["product-id"]?.toString(), colorCode, defaultSize]
                .filter(v => v).join("-");
            obj.sku = newSku;
            // console.log("new SKU -> ", newSku)
            console.log(obj)
            variantArr.push(obj);
        }
    }
    return variantArr;
};

const getOptionValues = (variantData) => {
    let options = [];
    for(let key of Object.keys(variantData)){
        let keyLower = key.toLowerCase();
        switch(keyLower){
            case "color": 
                let colorName = getColorName(variantData[key]);
                if(colorName){
                    options.push({ label: colorName, option_display_name: "Color", extra: { colorCode: variantData[key] } })
                }
                break;
            case "us_consumer_size": options.push({ label: variantData[key], option_display_name: "Size", extra: { defaultSize: variantData["EU_Order_Size"] } })
        }
    }
    // filter out options which are missing any option from a switch case
    options = options.length == 2 ? options : null;
    return options;
};

const ColorCodeRegx = /^[A-Z0-9]{4}$/
const getColorName = (colorCode) => {
    colorCode = colorCode.toString();
    console.log("Color code -> ", colorCode);
    if(ColorCodeRegx.test(colorCode)){
        let colorName = "";
        let colorCode1 = colorCode.substring(0, 2);
        let colorName1 = ColorCodes[colorCode1];
    
        let colorCode2 = colorCode.substring(2)
        let colorName2 = ColorCodes[colorCode2];
        colorName = [colorName1, colorName2]
            .filter(v => v && v != "none").map(v => titleCase(v)).join("/");
        console.log("Color name -> ", colorName);
        return colorName || "None";
    }else{
        return null;
    }
};
    
const CategoryMapping = {
    "bibs": "Bib Shorts",
    "head": "Gloves & Hats",
    "overshoes": "Socks & Accessories",
    "pants": "Bib Shorts",
    "shirts": "Jackets & Vests",
    "warmers": "Socks & Accessories",
    "selectedfabric": "Selected Fabric",
    "shakedry": "Shake Dry",
    "road": "Cycling"
};

const getCategoriesIds = async (product) => {
    let categories = await listCategoryCustom();
    console.log("categories ->", categories)
    let { sport, gender } = product;
    let categoryIds = [];
    let productType = product?.["productType"]?.["en"];
    let fabricTech = product?.["fabricTechnology"]?.["en"];

    let secondaryEndUse = 
        product?.["endUseSecondary"]?.["en"].split(",").filter(v => v)
        .map(v => { return ( CategoryMapping[v] ? CategoryMapping[v] : v ).toLowerCase() })
    gender = gender?.["en"].toLowerCase();
    sport = sport?.["en"].toLowerCase();
    productType = productType.toLowerCase();
    fabricTech = fabricTech.toLowerCase();

    // check if it is part of category mapping then get the corrosponding value
    productType = 
        CategoryMapping[productType] ? CategoryMapping[productType].toLowerCase(): productType;
    fabricTech = 
        CategoryMapping[fabricTech] ? CategoryMapping[fabricTech].toLowerCase() : fabricTech;
    
        // get categories by gender first
    let menCatg = categories.find(cat => cat.name.toLowerCase().includes("men"));
    let menCatgId = menCatg.id;
    let womenCatg = categories.find(cat => cat.name.toLowerCase().includes("women"));
    let womenCatgId = womenCatg.id;
    let genderFilteredCategories = [];
    console.log("gender", gender);
    if(gender == "women"){
        categoryIds = [ ...categoryIds, womenCatgId ];
        genderFilteredCategories = categories.filter(cat => cat.id == womenCatgId || cat.parentIds.includes(womenCatgId));
    }else if(gender == "men"){
        categoryIds = [ ...categoryIds, menCatgId ];
        genderFilteredCategories = categories.filter(cat => cat.id == menCatgId || cat.parentIds.includes(menCatgId));
    }else{
        categoryIds = [ ...categoryIds, menCatgId, womenCatgId ];
        genderFilteredCategories = categories;
    }
    // console.log("categoryIds", categoryIds);

    // filter categories by gender first
    // let genderFilteredCategories = [];
    // if(gender == "unisex"){
    //     genderFilteredCategories = categories;
    // }else{
    //     let genderCat = categories.find(cat => cat.name.toLowerCase().includes(gender));
    //     if(genderCat){
    //         genderCatId = genderCat.id;
    //         console.log("genderCatId", genderCatId);
    //         genderFilteredCategories = categories.filter(cat => cat.id == genderCatId || cat.parentIds.includes(genderCatId));
    //     }
    // }
    console.log("genderFilteredCategories -> ", genderFilteredCategories)
    // get categories based on product type
    let productTypeCatIds = [];
    console.log("Product type", productType);
    if(productType){
        let productTypeCategories = genderFilteredCategories.filter(cat => cat.name.toLowerCase().includes(productType))
        console.log("productTypeCategories", productTypeCategories);
        productTypeCatIds = productTypeCategories.map(obj => obj.id);
    }
    
    // get categories based on product sport
    let sportCategoriesIds = [];
    if(sport){
        let sportCategories = categories.filter(cat => cat.name.toLowerCase().includes(sport));
        sportCategoriesIds = sportCategories.map(obj => obj.id);
    }

    // get categories based on technology
    let fabricTechCategoriesIds = [];
    if(fabricTech){
        let fabricTechCategories = categories.filter(cat => cat.name.toLowerCase() == fabricTech);
        fabricTechCategoriesIds = fabricTechCategories.map(obj => obj.id);
    }
    
    // get categories based on 'secondary end use' field
    // console.log(secondaryEndUse);
    let secondaryEndUseCategoriesIds = [];
    if(secondaryEndUse){
        let secondaryEndUseCategories = categories.filter(cat => secondaryEndUse.some(el => cat.name.toLowerCase().includes(el)))
        secondaryEndUseCategoriesIds = secondaryEndUseCategories.map(obj => obj.id);
    }

    categoryIds = [ ...categoryIds, ...productTypeCatIds,
        ...secondaryEndUseCategoriesIds, ...sportCategoriesIds, ...fabricTechCategoriesIds];

    console.log(categoryIds);
    return categoryIds;
};

const getCategoriesIdsV2 = async (product) => {
    let categories = await listCategoryCustom();
    console.log("categories ->", categories)
    let { sport, gender } = product;
    let categoryIds = [];
    let productType = product?.["productType"]?.["en"];
    let fabricTech = product?.["fabricTechnology"]?.["en"];
    let secondaryEndUse = 
        product?.["endUseSecondary"]?.["en"].split(",").filter(v => v)
        .map(v => { return ( CategoryMapping[v] ? CategoryMapping[v] : v ).toLowerCase() })
    gender = gender?.["en"].toLowerCase();
    sport = sport?.["en"].toLowerCase();
    productType = productType.toLowerCase();
    fabricTech = fabricTech.toLowerCase();
    // check if it is part of category mapping then get the corrosponding value
    productType = 
        CategoryMapping[productType] ? CategoryMapping[productType].toLowerCase(): productType;
    fabricTech = 
        CategoryMapping[fabricTech] ? CategoryMapping[fabricTech].toLowerCase() : fabricTech;
    console.log("\n------------------- categories----------------------");
    console.log(gender, sport, productType, fabricTech, productType, fabricTech);
    
    // get categories by gender first
    let menCatg = categories.find(cat => cat.name.toLowerCase().includes("men"));
    let menCatgId = menCatg.id;
    let womenCatg = categories.find(cat => cat.name.toLowerCase().includes("women"));
    let womenCatgId = womenCatg.id;

    if(gender == "women"){
        categoryIds = [ ...categoryIds, womenCatgId ];
    }else if(gender == "men"){
        categoryIds = [ ...categoryIds, menCatgId ];
    }else{
        categoryIds = [ ...categoryIds, menCatgId, womenCatgId ];
    }
    // get categories based on product type
    console.log("Product type", productType);
    let productTypeCategories = categories.filter(cat => cat.name.toLowerCase().includes(productType))
    // console.log("productTypeCategories", productTypeCategories);
    let productTypeCatIds = productTypeCategories.map(obj => obj.id);
    
    // get categories based on product sport
    let sportCategories = categories.filter(cat => cat.name.toLowerCase().includes(sport));
    let sportCategoriesIds = sportCategories.map(obj => obj.id);

    // get categories based on 'secondary end use' field
    let secondaryEndUseCategories = categories.filter(cat => secondaryEndUse.some(el => cat.name.toLowerCase().includes(el)))
    let secondaryEndUseCategoriesIds = secondaryEndUseCategories.map(obj => obj.id);
    
    // get categories based on technology
    let fabricTechCategories = categories.filter(cat => cat.name.toLowerCase() == fabricTech);
    let fabricTechCategoriesIds = fabricTechCategories.map(obj => obj.id);
    
    categoryIds = [ ...categoryIds, ...productTypeCatIds, 
            ...sportCategoriesIds, ...secondaryEndUseCategoriesIds, ...fabricTechCategoriesIds];
    console.log(categoryIds);
    return categoryIds;
};

let bigCommerceCategories = null; 
const listCategoryCustom = async () => {
    if(bigCommerceCategories) return bigCommerceCategories;
    let categories = await listCategory({ limit: 250 });
   
    categories = categories.map(obj => {
        let { id, parent_id, name } = obj;
        return { id, parent_id, name };
    })
    // let modifiedCategories = categories;
    let modifiedCategories = categories.reduce((acc, obj) => {
        obj.parentIds = [ obj.parent_id ].filter(v => v);
        // console.log("obj.parentIds 13", obj.parentIds);
        let parentId = obj.parent_id;
        // console.log("parentId", parentId);
        while(parentId){
            let parentObj = categories.find(obj => obj.id == parentId);
            if(parentObj){
                parentId = parentObj.parent_id;
                // console.log("parentId 20", parentId);
            }else{
                parentId = 0;
            }
            if(parentId) obj.parentIds.push(parentId);
            // console.log("obj.parentIds 19", obj.parentIds);
        }
        return [ ...acc, obj ];
    }, [])
    bigCommerceCategories = modifiedCategories;
    return bigCommerceCategories;
};

// const XMLFieldsForMetafields = [
//     // "Full Product Name",
//     "display-name",
//     // "Designed for",
//     "short-description",
//     // "Why we made this",
//     "long-description",
//     // "Design Story",
//     "designStory",
//     // "Short Product Name",
//     "d2cName",
//     // "Product Benefit Statement",
//     "productBenefitStatement",
//     // "Product Details",
//     "productDetails",
//     // "Materials",
//     "materialList",
//     // "Care Instructions"
//     "careInstructions"
// ];
const MetafieldKeyNameMapping = {
    "display-name": "full_product_name",
    "short-description": "designed_for",
    "long-description": "why_we_made_this",
    "designStory": "design_story",
    "d2cName": "short_product_name",
    "productBenefitStatement": "product_benefit_statement",
    "productDetails": "product_details",
    "materialList": "materials",
    "careInstructions": "care_instructions"

}
const generateMetafields = (product) => {
    try {
        let metafieldsToCreate = {};
        let productKeys = Object.keys(product);
        for(let key of productKeys){
            let matchedKey = Object.keys(MetafieldKeyNameMapping).find(el => el == key);
            // console.log("matchedKey", matchedKey);
            if(matchedKey){
                // let metafieldKeyName = matchedKey.toLowerCase().replace(/\s+/g, "_");
                let metafieldKeyName = MetafieldKeyNameMapping[matchedKey];
                // console.log("metafieldKeyName", metafieldKeyName, "lang key", lang);
                console.log(key);
                metafieldsToCreate[metafieldKeyName]= product[key];
            }
        }
        console.log("metafieldsToCreate:\n", metafieldsToCreate);
        return metafieldsToCreate;
    } catch (error) {
        console.log(`Error inside generateMetafields():\n`, error);
    }
};

const normalizeVariantXMLJSONData = (data) => {
    let normalizeData = [];
    let variationData = data.filter(({variations}=d) => variations);
    let extraVariantsData = data.filter(({variations}=d) => !variations);
    console.log(variationData.length, extraVariantsData.length);
    // return 
    for(let obj of variationData){
        let normalizedObj = {"product-id": obj["product-id"]};
        let colorVariations = [];
        // console.log(JSON.stringify(obj))
        let colorVariationObj = 
            obj.variations.attributes["variation-attribute"].find(v => v["attribute-id"] == "color")
        
        if(colorVariationObj) {
            let variantsOptions = colorVariationObj["variation-attribute-values"]["variation-attribute-value"];
            // console.log("variantsOptions:", variantsOptions);
            if(typeof variantsOptions == "object" && !Array.isArray(variantsOptions)){
                variantsOptions = [variantsOptions];
            }
            let normalizedOptions = variantsOptions.map(o => { 
                return {
                    color: o["value"],
                    colorName: o?.["display-value"]?.["#text"] ?? "",
                }
            });
            colorVariations = normalizedOptions;
        } 
        // console.log("colorVariations:", colorVariations);

        let sizeVariations = [];
        let sizeVariationObj = 
            obj.variations.attributes["variation-attribute"].find(v => v["attribute-id"] == "size");
        if(sizeVariationObj){
            let variantsOptions = sizeVariationObj["variation-attribute-values"]["variation-attribute-value"];
            // console.log("variantsOptions:", JSON.stringify(variantsOptions, null, 2));
            if(typeof variantsOptions == "object" && !Array.isArray(variantsOptions)){
                variantsOptions = [variantsOptions];
            }
            let normalizedOptions = variantsOptions.map(o => {
                if(typeof o["display-value"] == "object" && !Array.isArray(o["display-value"])){
                    o["display-value"] = [o["display-value"]];
                }
                let usSize = o["display-value"]?.find(v => v["xml:lang"]=="en-US");
                if(!usSize){
                    usSize = o["display-value"]?.find(v => v["xml:lang"]=="x-default");
                }
                // console.log("us size -> ", usSize);
                usSize = usSize?.["#text"]?.toString().replace(/\s+\(/g, "/").replace(")", "") ?? "";
                // console.log("us size after -> ", usSize);
                let euSize = o["value"];
                return {
                    EU_Order_Size: euSize,
                    US_Consumer_Size: usSize,
                    EU_Consumer_Size: usSize.replace(/\/.+/g, `/${euSize}`)
                }
            })
            sizeVariations = normalizedOptions.filter(obj => obj.US_Consumer_Size.trim());
        }
        // console.log("Size Options:", sizeVariations);

        let allVariantSkus = obj.variations.variants.variant;
        let allVariants = [];
        let i = 0;
        for(let colorOp of colorVariations){
            for(let sizeOp of sizeVariations){
                // console.log(colorOp);
                // console.log(sizeOp)
                let combineObj = { ...normalizedObj, ...colorOp, ...sizeOp, EAN: allVariantSkus[i]?.["product-id"] };
                allVariants.push(combineObj);
                i++;
            }
        }
        // console.log("Variants Data:", allVariants);
        normalizeData.push(...allVariants);
    }
    return normalizeData;
};


const normalizeXMLJSONData = (data) => {
    let normalizeData = [];
    for(let obj of data){
        let normalizeObj = {};
        for(let [key, value] of Object.entries(obj)){
            // console.log("key:", key)
            if(key == "custom-attributes"){
               value = value["custom-attribute"];
            }
            if(Array.isArray(value)){
                value = value.reduce((acc, obj) => {
                    let textValue = obj['#text'] || "";
                    let keyValue = obj["xml:lang"] || "en";
                    keyValue = (keyValue == "x-default") ? "en" : keyValue;
                    if(obj["attribute-id"]){
                        let parentKey = obj["attribute-id"];
                        acc[parentKey] = acc[parentKey] || {};
                        acc[parentKey][keyValue] =  textValue;
                    }else{
                        acc[keyValue] = textValue;
                    }
                    return acc;
                }, {})
            }
            normalizeObj[key] = value;
        }
        let newObj = { ...normalizeObj, ...normalizeObj["custom-attributes"] };
        delete newObj["custom-attributes"]
        normalizeData.push(newObj);
    }
        
    // console.log(normalizeData);
    return normalizeData;
};

const normalizePriceXMLJSONData = (data) => {
    let normalizeData = [];
    for(let obj of data){
        let normalizedObj = {
            EAN: obj["product-id"],
            USD: obj["amount"]?.["#text"]
        };
        normalizeData.push(normalizedObj);
    };
    return normalizeData;
}

module.exports = {
    convertToBigCProduct,
    generateMetafields,
    normalizeXMLJSONData,
    normalizeVariantXMLJSONData,
    normalizePriceXMLJSONData
}