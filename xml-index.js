if(process.env.NODE_ENV == "development"){
    require('dotenv').config();
}
const { processVariants }  = require('./controllers/products');
const { xmlFileToJSON } = require('./controllers/xml-json');
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
 } = require("./utils/convert-xml-version")

async function main() {
    // const productArr = await xmlFileToJSON(`${__dirname}/xml/productsSS21.xml`);
    const productArr = await xmlFileToJSON(`${__dirname}/xml/allSS21MasterProducts.xml`);
    // const productVarient = await xmlFileToJSON(`${__dirname}/xml/variantsSS21.xml`);

    // const productVarient = await xmlFileToJSON(`${__dirname}/xml/allSS21Variants.xml`);
    const productPrice = await xmlFileToJSON(`${__dirname}/xml/pricebook-us.xml`);
    
    let productsData = normalizeXMLJSONData(productArr['catalog']['product']);
    // let variantsData = productVarient['catalog']["product"];
    // variantsData = normalizeVariantXMLJSONData(variantsData);
    // console.log(JSON.stringify(variantsData));
    let allVariantPrices = productPrice["pricebooks"]?.["pricebook"]?.["price-tables"]?.["price-table"] || [];
    allVariantPrices = normalizePriceXMLJSONData(allVariantPrices);
    // convert prices to obj [EAN, price]
    const SKUPriceUSD = allVariantPrices.reduce((acc, obj, i) => {
        acc[obj["EAN"]] = obj["USD"]
        return acc;
    }, {});

    // return;
    // let i = 0;
    // 100501 100459 57 093
    // for (let product of productsData.filter(p => p["product-id"] == 100501)) {
    for (let product of productsData) {
        // if(product["product-id"] < 100147){
        //     continue;
        // }
        console.log("Syncing Product -> ", product["product-id"]);
        // console.log(JSON.stringify(product.variations));
        // const pVarientOld = variantsData.filter(
        //     (i) => i["product-id"] == product["product-id"]);
        // console.log("\n\nOld Pvariants", JSON.stringify(pVarientOld));
        let productVariantsData = [{
            "product-id": product["product-id"],
            "variations": product.variations
        }];
        const pVarient = normalizeVariantXMLJSONData(productVariantsData);
        product["variants"] = pVarient.map((obj) => {
            let price = SKUPriceUSD[obj.EAN] || 0
            obj.price = price;
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