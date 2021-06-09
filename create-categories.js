if(process.env.NODE_ENV == "development"){
    require('dotenv').config();
}
const { createCategory, listCategory } = require(`./controllers/bigcommerce`);

const parentIds = {
    // "Shop Men":  24,
    // "Shop Women": 29,
    // "Category Men": 35,
    // "Activity Men": 32,
    // "Category Women": 46,
    // "Activity Women": 47,
    // "Technology Men": 60,
    // "Technology Women": 62,
    // "Activity": 74,
    // "Technology": 75,
    
    // new categoriey hierarchy 
    "Shop Men": 111,
    "Shop Women": 112,
    "Shop By Sports": 113,
    // 
    "Activity Men": 114,
    "Activity Women": 115,
    // 
    "Cycling Activity Men": 116 ,
    "Multi Sport Activity Men": 117 ,
    "Running Activity Men": 118,
    "Ski Activity Men": 119,
    // 
    "Cycling Activity Women": 120,
    "Multi Sport Activity Women": 121,
    "Running Activity Women": 122,
    "Ski Activity Women": 123,
    // 
    "Cycling Shop By Sports": 188 ,
    "Multi Sport Shop By Sports": 189 ,
    "Running Shop By Sports": 190,
    "Ski Shop By Sports": 191,

};

const createCategoryList = [
    // Gender 
    // { name: "Gender", parent: 0 },
    // { name: "Shop Men", parent: 87 },
    // { name: "Shop Women", parent: 87 },
    
    // Categories
    // { name: "Category", parent: 0 },
    // { name: "Jackets & Vests", parent: 35 },
    // { name: "Jerseys", parent: 35 },
    // { name: "Tops", parent: 35 },
    // { name: "Bib Shorts", parent: 35 },
    // { name: "Shorts", parent: 35 },
    // { name: "Tights", parent: 35 },
    // { name: "Bottoms", parent: 35 },
    // { name: "Baselayers", parent: 35 },
    // { name: "Gloves & Hats", parent: 35 },
    // { name: "Socks & Accesories", parent: 35 }

    // Shop men
    // { name: "Activity", parent: parentIds["Shop Men"] },
    // { name: "Baselayers", parent: parentIds["Shop Men"] },
    // { name: "Bib Shorts", parent: parentIds["Shop Men"] },
    // { name: "Gloves & Hats", parent: parentIds["Shop Men"] },
    // { name: "Jackets & Vests", parent: parentIds["Shop Men"] },
    // { name: "Jerseys", parent: parentIds["Shop Men"] },
    // { name: "Shorts", parent: parentIds["Shop Men"] },
    // { name: "Socks & Accessories", parent: parentIds["Shop Men"] },
    // { name: "Tights", parent: parentIds["Shop Men"] },
    
    // activity men
    // { name: "Cycling", parent: parentIds["Activity Men"] },
    // { name: "Multi Sport", parent: parentIds["Activity Men"], isVisible: true },
    // { name: "Running", parent: parentIds["Activity Men"] },
    // { name: "Ski", parent: parentIds["Activity Men"], isVisible: true },

    // // activity men cycling sub category
    // { name: "Baselayers", parent: parentIds["Cycling Activity Men"] },
    // { name: "Bib Shorts", parent: parentIds["Cycling Activity Men"] },
    // { name: "Gloves & Hats", parent: parentIds["Cycling Activity Men"] },
    // { name: "Jackets & Vests", parent: parentIds["Cycling Activity Men"] },
    // { name: "Jerseys", parent: parentIds["Cycling Activity Men"] },
    // { name: "Shorts", parent: parentIds["Cycling Activity Men"] },
    // { name: "Socks & Accessories", parent: parentIds["Cycling Activity Men"] },
    // { name: "Tights", parent: parentIds["Cycling Activity Men"] },

    // // activity men Multi Sport sub category
    // { name: "Baselayers", parent: parentIds["Multi Sport Activity Men"] },
    // { name: "Bib Shorts", parent: parentIds["Multi Sport Activity Men"] },
    // { name: "Gloves & Hats", parent: parentIds["Multi Sport Activity Men"] },
    // { name: "Jackets & Vests", parent: parentIds["Multi Sport Activity Men"] },
    // { name: "Jerseys", parent: parentIds["Multi Sport Activity Men"] },
    // { name: "Shorts", parent: parentIds["Multi Sport Activity Men"] },
    // { name: "Socks & Accessories", parent: parentIds["Multi Sport Activity Men"] },
    // { name: "Tights", parent: parentIds["Multi Sport Activity Men"] },

    // // activity men Running sub category
    // { name: "Baselayers", parent: parentIds["Running Activity Men"] },
    // { name: "Bib Shorts", parent: parentIds["Running Activity Men"] },
    // { name: "Gloves & Hats", parent: parentIds["Running Activity Men"] },
    // { name: "Jackets & Vests", parent: parentIds["Running Activity Men"] },
    // { name: "Jerseys", parent: parentIds["Running Activity Men"] },
    // { name: "Shorts", parent: parentIds["Running Activity Men"] },
    // { name: "Socks & Accessories", parent: parentIds["Running Activity Men"] },
    // { name: "Tights", parent: parentIds["Running Activity Men"] },

    //  // activity men Ski sub category
    //  { name: "Baselayers", parent: parentIds["Ski Activity Men"] },
    //  { name: "Bib Shorts", parent: parentIds["Ski Activity Men"] },
    //  { name: "Gloves & Hats", parent: parentIds["Ski Activity Men"] },
    //  { name: "Jackets & Vests", parent: parentIds["Ski Activity Men"] },
    //  { name: "Jerseys", parent: parentIds["Ski Activity Men"] },
    //  { name: "Shorts", parent: parentIds["Ski Activity Men"] },
    //  { name: "Socks & Accessories", parent: parentIds["Ski Activity Men"] },
    //  { name: "Tights", parent: parentIds["Ski Activity Men"] },
    

    // women =============================== 
    // { name: "Activity", parent: parentIds["Shop Women"], url: "/shop-women/activity" },
    // { name: "Baselayers", parent: parentIds["Shop Women"] },
    // { name: "Bib Shorts", parent: parentIds["Shop Women"] },
    // { name: "Gloves & Hats", parent: parentIds["Shop Women"] },
    // { name: "Jackets & Vests", parent: parentIds["Shop Women"] },
    // { name: "Jerseys", parent: parentIds["Shop Women"] },
    // { name: "Shorts", parent: parentIds["Shop Women"] },
    // { name: "Socks & Accessories", parent: parentIds["Shop Women"] },
    // { name: "Tights", parent: parentIds["Shop Women"] }
    
    // activity women 
    // { name: "Cycling", parent: parentIds["Activity Women"] },
    // { name: "Multi Sport", parent: parentIds["Activity Women"], isVisible: true },
    // { name: "Running", parent: parentIds["Activity Women"] },
    // { name: "Ski", parent: parentIds["Activity Women"], isVisible: true }

    // // activity Women cycling sub category
    // { name: "Baselayers", parent: parentIds["Cycling Activity Women"] },
    // { name: "Bib Shorts", parent: parentIds["Cycling Activity Women"] },
    // { name: "Gloves & Hats", parent: parentIds["Cycling Activity Women"] },
    // { name: "Jackets & Vests", parent: parentIds["Cycling Activity Women"] },
    // { name: "Jerseys", parent: parentIds["Cycling Activity Women"] },
    // { name: "Shorts", parent: parentIds["Cycling Activity Women"] },
    // { name: "Socks & Accessories", parent: parentIds["Cycling Activity Women"] },
    // { name: "Tights", parent: parentIds["Cycling Activity Women"] },

    // // activity Women Multi Sport sub category
    // { name: "Baselayers", parent: parentIds["Multi Sport Activity Women"] },
    // { name: "Bib Shorts", parent: parentIds["Multi Sport Activity Women"] },
    // { name: "Gloves & Hats", parent: parentIds["Multi Sport Activity Women"] },
    // { name: "Jackets & Vests", parent: parentIds["Multi Sport Activity Women"] },
    // { name: "Jerseys", parent: parentIds["Multi Sport Activity Women"] },
    // { name: "Shorts", parent: parentIds["Multi Sport Activity Women"] },
    // { name: "Socks & Accessories", parent: parentIds["Multi Sport Activity Women"] },
    // { name: "Tights", parent: parentIds["Multi Sport Activity Women"] },

    // // activity Women Running sub category
    // { name: "Baselayers", parent: parentIds["Running Activity Women"] },
    // { name: "Bib Shorts", parent: parentIds["Running Activity Women"] },
    // { name: "Gloves & Hats", parent: parentIds["Running Activity Women"] },
    // { name: "Jackets & Vests", parent: parentIds["Running Activity Women"] },
    // { name: "Jerseys", parent: parentIds["Running Activity Women"] },
    // { name: "Shorts", parent: parentIds["Running Activity Women"] },
    // { name: "Socks & Accessories", parent: parentIds["Running Activity Women"] },
    // { name: "Tights", parent: parentIds["Running Activity Women"] },

    //  // activity Women Ski sub category
    //  { name: "Baselayers", parent: parentIds["Ski Activity Women"] },
    //  { name: "Bib Shorts", parent: parentIds["Ski Activity Women"] },
    //  { name: "Gloves & Hats", parent: parentIds["Ski Activity Women"] },
    //  { name: "Jackets & Vests", parent: parentIds["Ski Activity Women"] },
    //  { name: "Jerseys", parent: parentIds["Ski Activity Women"] },
    //  { name: "Shorts", parent: parentIds["Ski Activity Women"] },
    //  { name: "Socks & Accessories", parent: parentIds["Ski Activity Women"] },
    //  { name: "Tights", parent: parentIds["Ski Activity Women"] },


    // Shop By Sports =====================
    // { name: "Shop By Sports", parent: 0 },
    // { name: "Cycling", parent: parentIds["Shop By Sports"] },
    // { name: "Multi Sport", parent: parentIds["Shop By Sports"] },
    // { name: "Running", parent: parentIds["Shop By Sports"] },
    // { name: "Ski", parent: parentIds["Shop By Sports"] },
   
    // // Shop By Sports cycling sub category
    // { name: "Baselayers", parent: parentIds["Cycling Shop By Sports"] },
    // { name: "Bib Shorts", parent: parentIds["Cycling Shop By Sports"] },
    // { name: "Gloves & Hats", parent: parentIds["Cycling Shop By Sports"] },
    // { name: "Jackets & Vests", parent: parentIds["Cycling Shop By Sports"] },
    // { name: "Jerseys", parent: parentIds["Cycling Shop By Sports"] },
    // { name: "Shorts", parent: parentIds["Cycling Shop By Sports"] },
    // { name: "Socks & Accessories", parent: parentIds["Cycling Shop By Sports"] },
    // { name: "Tights", parent: parentIds["Cycling Shop By Sports"] },

    // // Shop By Sports Multi Sport sub category
    // { name: "Baselayers", parent: parentIds["Multi Sport Shop By Sports"] },
    // { name: "Bib Shorts", parent: parentIds["Multi Sport Shop By Sports"] },
    // { name: "Gloves & Hats", parent: parentIds["Multi Sport Shop By Sports"] },
    // { name: "Jackets & Vests", parent: parentIds["Multi Sport Shop By Sports"] },
    // { name: "Jerseys", parent: parentIds["Multi Sport Shop By Sports"] },
    // { name: "Shorts", parent: parentIds["Multi Sport Shop By Sports"] },
    // { name: "Socks & Accessories", parent: parentIds["Multi Sport Shop By Sports"] },
    // { name: "Tights", parent: parentIds["Multi Sport Shop By Sports"] },

    // // Shop By Sports Running sub category
    // { name: "Baselayers", parent: parentIds["Running Shop By Sports"] },
    // { name: "Bib Shorts", parent: parentIds["Running Shop By Sports"] },
    // { name: "Gloves & Hats", parent: parentIds["Running Shop By Sports"] },
    // { name: "Jackets & Vests", parent: parentIds["Running Shop By Sports"] },
    // { name: "Jerseys", parent: parentIds["Running Shop By Sports"] },
    // { name: "Shorts", parent: parentIds["Running Shop By Sports"] },
    // { name: "Socks & Accessories", parent: parentIds["Running Shop By Sports"] },
    // { name: "Tights", parent: parentIds["Running Shop By Sports"] },

    //  // Shop By Sports Ski sub category
    //  { name: "Baselayers", parent: parentIds["Ski Shop By Sports"] },
    //  { name: "Bib Shorts", parent: parentIds["Ski Shop By Sports"] },
    //  { name: "Gloves & Hats", parent: parentIds["Ski Shop By Sports"] },
    //  { name: "Jackets & Vests", parent: parentIds["Ski Shop By Sports"] },
    //  { name: "Jerseys", parent: parentIds["Ski Shop By Sports"] },
    //  { name: "Shorts", parent: parentIds["Ski Shop By Sports"] },
    //  { name: "Socks & Accessories", parent: parentIds["Ski Shop By Sports"] },
    //  { name: "Tights", parent: parentIds["Ski Shop By Sports"] },

    // Technology
    // { name: "Technology", parent: 0 },
    // { name: "Gore-Tex", parent: 75 },
    // { name: "Gore-Tex-Infinium", parent: 75 },
    // { name: "Gore-Windstopper", parent: 75 },
    // { name: "Selected Fabric", parent: 75, isVisible: false },
    // { name: "Shake Dry", parent: 75, isVisible: true },

];
const main = async () => {
    // let categories = await listCategory();
    // console.log(categories);
    // return;

    for(let catg of createCategoryList){
        let obj = {
            name: catg.name,
            parent_id: catg.parent,
            is_visible: typeof catg.isVisible == "boolean" ? catg.isVisible : true,
        };
        if(catg.url){
            obj.custom_url = { url: catg.url, is_customized: true };
        }
        await createCategory(obj);
    }
}

main();

// Category 
// All 
// Jackets & Vests 
// Jerseys 
// Tops 
// Bib Shorts 
// Shorts 
// Tights 
// Bottoms 
// Baselayers 
// Gloves & Hats 
// Socks & Accesories