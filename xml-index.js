if(process.env.NODE_ENV == "development"){
    require('dotenv').config();
}
const { processVariants }  = require('./controllers/products');
const { xmlFileToJSON } = require('./controllers/xml-json');
const { csvFileToJSON } = require("./controllers/csv-json");
const { 
    getProduct,
    listProduct,
    createProduct, 
    updateProduct,
    createProductMetafield, 
    listProductMetafield,
    updateProductMetafield,
    listProductOptions
} = require('./controllers/bigcommerce');
const { 
    convertToBigCProduct, 
    generateMetafields, 
    normalizeXMLJSONData, 
    normalizeVariantXMLJSONData,
    normalizePriceXMLJSONData
 } = require("./utils/convert-xml-version-v2")

async function main() {
    const productArr = await xmlFileToJSON(`${__dirname}/xml/allSS21MasterProducts.xml`);
    const productVarient = await xmlFileToJSON(`${__dirname}/xml/allSS21Variants.xml`);
    const productPrice = await xmlFileToJSON(`${__dirname}/xml/pricebook-us.xml`);
    // get EAN-SKU maping from CSV
    const eanToSKUData = csvFileToJSON(`${__dirname}/csv/SKU-EAN-Mapping.csv`);
    const EanSKUObj = (await eanToSKUData).reduce((acc, obj, i) => {
        acc[obj["EAN"]] = obj["ItemCode_ SKU"] || null;
        return acc;
    }, {});
    let productsData = normalizeXMLJSONData(productArr['catalog']['product']);
    let variantsData = productVarient['catalog']["product"];
    // console.log(variantsData[0]["custom-attributes"])
    variantsData = normalizeXMLJSONData(variantsData);
    // console.log(JSON.stringify(variantsData.filter(o => o["modelNumber"]["en"] == 10002).map(o => o["product-id"])));

    let allVariantPrices = productPrice["pricebooks"]?.["pricebook"]?.["price-tables"]?.["price-table"] || [];
    allVariantPrices = normalizePriceXMLJSONData(allVariantPrices);
    // convert prices to obj [EAN, price]
    const SKUPriceUSD = allVariantPrices.reduce((acc, obj, i) => {
        acc[obj["EAN"]] = obj["USD"]
        return acc;
    }, {});

    // return;
    // let i = 0;
    // filter out products which have 'online-flag': true and 'online-flag': { en: true }
    productsData = productsData.filter(o => o["online-flag"] == true || o["online-flag"]?.["en"] == true);
    console.log("Total products to sync:", productsData.length);
    // for (let product of productsData.filter(p => p["product-id"] == 100147)) {
    for (let product of productsData) {
        // if(product["product-id"] < 100147){
        //     continue;
        // }
        console.log("Syncing Product -> ", product["product-id"]);
        // console.log(JSON.stringify(product.variations));
        // const pVarientOld = variantsData.filter(
        //     (i) => i["product-id"] == product["product-id"]);
        // console.log("\n\nOld Pvariants", JSON.stringify(pVarientOld));
        
        // uncomment below block while using v1
        // let productVariantsData = [{
        //     "product-id": product["product-id"],
        //     "variations": product.variations
        // }];
        // const pVarient = normalizeVariantXMLJSONData(productVariantsData);
        // product["variants"] = pVarient.map((obj) => {
        //     let price = SKUPriceUSD[obj.EAN] || 0
        //     obj.price = price;
        //     // set sku from csv mapping
        //     obj.sku = EanSKUObj[obj.EAN];
        //     return obj
        // });
        // ==== block end

        // use this while using v2
        product["variants"] = variantsData.filter(o => o["modelNumber"]["en"] == product["product-id"]).map((obj) => {
            let EAN = obj["product-id"]
            let price = SKUPriceUSD[EAN] || 0
            obj.price = price;
            // set sku from csv mapping
            obj.sku = EanSKUObj[EAN];
            return obj
        });
        
        console.log(product);
        // return;
        let bigCProductJSON = await convertToBigCProduct(product);
        let metafieldsToCreate = generateMetafields(product);
        let { sku } = bigCProductJSON;
        let productId = null;
        let existingMetafields = [];
        // return;
        let isExisting = await listProduct({ sku: sku, include: "custom_fields, variants" });
        isExisting = isExisting.length ? isExisting[0] : null;
        console.log("Is Existing -> ", isExisting);
        // return
        if(isExisting){
            let bigCProduct = isExisting;
            let existingCustomFields = bigCProduct.custom_fields || [];
            let existingVariants = bigCProduct.variants || [];
            productId = bigCProduct.id;
            // console.log(bigCProduct);
            existingMetafields = await listProductMetafield(productId);
            // console.log(existingMetafields);
            bigCProductJSON.custom_fields = bigCProductJSON.custom_fields.map( obj => {
                let existingCustomField = existingCustomFields.find(cf => cf.name == obj.name);
                if(existingCustomField) { obj.id = existingCustomField.id };
                return obj; 
            });

            let variantsToUpdate = [];
            let variantsToCreate = [];

            bigCProductJSON.variants.forEach((obj, i) => {
                let existingVariant = existingVariants.find(ev => ev.sku == obj.sku);
                if(existingVariant){ 
                    obj.id = existingVariant.id;
                    variantsToUpdate.push(obj);
                }else{
                    variantsToCreate.push(obj);
                }
            });

            // bigCProductJSON.variants = bigCProductJSON.variants.map( obj => {
            //     let existingVariant = existingVariants.find(ev => ev.sku == obj.sku);
            //     if(existingVariant) { obj.id = existingVariant.id };
            //     delete obj.option_values;
            //     return obj;
            // })
            // update the product 
            let updateProductPayload = Object.assign({}, bigCProductJSON);
            delete updateProductPayload.variants;
            console.log("Update product payload: ", JSON.stringify(updateProductPayload));
            let updateResponse = await updateProduct(productId, updateProductPayload);
            console.log("Update Product Response: ", updateResponse);

            // process variants
            await processVariants(productId, variantsToCreate, variantsToUpdate);
        }else{
            let response = await createProduct(bigCProductJSON);
            console.log("bigcomm response: ", response);
            productId = response.id;
        }

        // create or update metafields
        for(let [key, value] of Object.entries(metafieldsToCreate)){
            let obj = {
                key: key,
                namespace: "Product Details",
                permission_set: "read_and_sf_access",
                value: typeof value == "object" ? JSON.stringify(value): value,   
            }
            obj.value = obj.value.replace(/&#13;/g, '');
            let existingMetafieldKey = existingMetafields.find(em => em.key == key)
            if(existingMetafieldKey){
                let metafieldId = existingMetafieldKey.id;
                let updateMetafieldResponse = 
                    await updateProductMetafield(productId, metafieldId, obj);
                console.log("Update metafield response: ", updateMetafieldResponse);
            }else{
                let createMetafieldResponse = await createProductMetafield(productId, obj);
                console.log("Create metafield response: ", createMetafieldResponse);
            }
        }
        // // break;
        // if(i == 3) break;
        // i++;
    }
}

main()