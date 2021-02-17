const { listCategory } = require('../controllers/bigcommerce');
const { ColorCodes } = require('./constant');

const convertToBigCProduct = async (data) => {
    const product = data;

    const bigCommProductObj = {
        brand_name: "Gore", // not able to determined in csv,
        custom_fields: getCustomFields(product),
        description: product["Product Details EN"],
        name: product["Full Product Name EN"].slice(0, 255),
        inventory_tracking: "variant",
        is_free_shipping: false,
        is_visible: true,
        type: "physical",
        weight: product["Weight (ounces)"] || 0,
        variants: getProductVariants(product),
        price: 0,
        sku: product["ID"],
    }
    bigCommProductObj.categories = await getCategoriesIdsV2(product).catch(err => []);
    console.log("bigCommProductObj: ",  JSON.stringify(bigCommProductObj));
    return bigCommProductObj;
};

const getCustomFields = (product) => {
    let fields = [
        // { "name": "why_we_made_this_en", "value": product["Why we made this EN"].trim().slice(0, 250) },
        // { "name": "designed_for_en", "value": product["Designed for EN"].trim().slice(0, 250) },
        // { "name": "design_story_en", "value": product["Design Story EN"].trim().slice(0, 250) },
        // { "name": "benefit_statement_en", "value": product["Product Benefit Statement EN"].trim().slice(0, 250) },
        { "name": "fit", "value": product["Fit"].trim().slice(0, 250) },
        { "name": "gender", "value": product["Gender"].trim().slice(0, 250) },
        { "name": "fabric_tech", "value": product["Fabric Technology"].trim().slice(0, 250) },
        { "name": "waterproofness", "value": product["Waterproofness"].trim().slice(0, 250) },
        { "name": "windproofness", "value": product["Windproofness"].trim().slice(0, 250) },
        { "name": "breathability", "value": product["Breathability"].trim().slice(0, 250) },
        { "name": "insulation", "value": product["Insulation"].trim().slice(0, 250) },
        { "name": "temperature", "value": product["Temperature"].trim().slice(0, 250) },
        { "name": "highlights", "value": product["Product Highlights"].trim().slice(0, 250) },
        { "name": "backpack_use", "value": product["Backpack Use"].trim().slice(0, 250) },
        { "name": "seat_insert", "value": product["Seat Insert"].trim().slice(0, 250) },
        { "name": "secondary_end_use", "value": product["Secondary End Use"].trim().slice(0, 250) },
        // { "name": "materials_en", "value": product["Materials EN"].trim().slice(0, 250) },
        // { "name": "care_instructions_en", "value": product["Care Instructions EN"].trim().slice(0, 250) },
        { "name": "shop_runner_eligible", "value": product["ShopRunner Eligible"].trim().slice(0, 250) },
        // { "colours": product["Colours"].trim().slice(0, 250) },
        
    ];
    fields = fields.filter(o => o.value);
    return fields;
};

const getProductVariants = (product) => {
    const { variants: productVariants, prices: productPrices } = product; 
    const SKUPriceUSD = productPrices.reduce((acc, obj, i) => {
        acc[obj["EAN"]] = obj["USD"]
        return acc;
    }, {});

    let variantArr = [];
    for(let variant of productVariants){
        let obj = {
            sku: variant["EAN"],
            price: SKUPriceUSD[variant["EAN"]],
            option_values: getOptionValues(variant),
        };
        if(obj.option_values){
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
                    options.push({ label: colorName, option_display_name: "Color" })
                }
                break;
            case "us_consumer_size": options.push({ label: variantData[key], option_display_name: "Size" })
        }
    }
    // filter out options which are missing any option from a switch case
    options = options.length == 2 ? options : null;
    return options;
};

const ColorCodeRegx = /^[A-Z0-9]{4}$/
const getColorName = (colorCode) => {
    console.log("Color code -> ", colorCode);
    // if(colorCode == 0){ colorCode = "00" };
    if(ColorCodeRegx.test(colorCode)){
        let colorName = "";
        // if(colorCode.length == 3){
        //     colorCode = "0" + colorCode;
        // }
        let colorCode1 = colorCode.substring(0, 2);
        let colorName1 = ColorCodes[colorCode1];
        // console.log("colorCode1", colorCode1, "colorName1", colorName1);
        // let colorName2 = null;
        // if(colorCode.length == 4){
        let colorCode2 = colorCode.substring(2)
        let colorName2 = ColorCodes[colorCode2];
            // console.log("colorCode2", colorCode2, "colorName2", colorName2);
        // }
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
    let { Sport: sport, Gender: gender } = product;
    let categoryIds = [];
    let productType = product["Product Type"];
    let fabricTech = product["Fabric Technology"];

    gender = gender.toLowerCase();
    sport = sport.toLowerCase();
    productType = productType.toLowerCase();
    fabricTech = fabricTech.toLowerCase();
    // check if it is part of category mapping then get the corrosponding value
    productType = 
        CategoryMapping[productType] ? CategoryMapping[productType].toLowerCase(): productType;
    fabricTech = 
        CategoryMapping[fabricTech] ? CategoryMapping[fabricTech].toLowerCase() : fabricTech;

    // filter categories by gender first
    let genderFilteredCategories = [];
    if(gender == "unisex"){
        genderFilteredCategories = categories;
    }else{
        let genderCat = categories.find(cat => cat.name.toLowerCase().includes(gender));
        if(genderCat){
            genderCatId = genderCat.id;
            console.log("genderCatId", genderCatId);
            genderFilteredCategories = categories.filter(cat => cat.id == genderCatId || cat.parentIds.includes(genderCatId));
        }
    }
    console.log("genderFilteredCategories -> ", genderFilteredCategories)
    // get categories based on product type
    console.log("Product type", productType);
    let productTypeCategories = genderFilteredCategories.filter(cat => cat.name.toLowerCase().includes(productType))
    // console.log("productTypeCategories", productTypeCategories);
    let productTypeCatIds = productTypeCategories.map(obj => obj.id);
    
    // get categories based on product sport
    let sportCategories = genderFilteredCategories.filter(cat => cat.name.toLowerCase().includes(sport));
    let sportCategoriesIds = sportCategories.map(obj => obj.id);

    // get categories based on technology
    let fabricTechCategories = genderFilteredCategories.filter(cat => cat.name.toLowerCase() == fabricTech);
    let fabricTechCategoriesIds = fabricTechCategories.map(obj => obj.id);
    
    categoryIds = [ ...categoryIds, ...productTypeCatIds, ...sportCategoriesIds, ...fabricTechCategoriesIds];
    console.log(categoryIds);
    return categoryIds;
};

const getCategoriesIdsV2 = async (product) => {
    let categories = await listCategoryCustom();
    console.log("categories ->", categories)
    let { Sport: sport, Gender: gender } = product;
    let categoryIds = [];
    let productType = product["Product Type"];
    let fabricTech = product["Fabric Technology"];
    let secondaryEndUse = 
        product["Secondary End Use"].split(",").filter(v => v)
        .map(v => { return ( CategoryMapping[v] ? CategoryMapping[v] : v ).toLowerCase() })
    gender = gender.toLowerCase();
    sport = sport.toLowerCase();
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

const CsvFieldsForMetafields = [
    "Full Product Name",
    "Designed for",
    "Why we made this",
    "Design Story",
    "Short Product Name",
    "Product Benefit Statement",
    "Product Details",
    "Materials",
    "Care Instructions"
]
const generateMetafields = (product) => {
    try {
        let metafieldsToCreate = {};
        let productKeys = Object.keys(product);
        for(let key of productKeys){
            let keyArr = key.split(" ");
            let lang = keyArr.pop().toLowerCase();
            let keyWithoutLang = keyArr.join(" ");
            // console.log("keyWithoutLang", keyWithoutLang, "language", lang);
            let matchedKey = CsvFieldsForMetafields.find(el => el == keyWithoutLang);
            // console.log("matchedKey", matchedKey);
            if(matchedKey){
                let metafieldKeyName = matchedKey.toLowerCase().replace(/\s+/g, "_");
                // console.log("metafieldKeyName", metafieldKeyName, "lang key", lang);
                console.log(key);
                if(metafieldsToCreate[metafieldKeyName]){
                    metafieldsToCreate[metafieldKeyName][lang] = product[key];
                }else{
                    metafieldsToCreate[metafieldKeyName] = { [lang]: product[key]};
                }
            }
        }
        console.log("metafieldsToCreate:\n", metafieldsToCreate);
        return metafieldsToCreate;
    } catch (error) {
        console.log(`Error inside generateMetafields():\n`, error);
    }
};

const titleCase = (str) => {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}
module.exports = {
    convertToBigCProduct,
    generateMetafields,
}