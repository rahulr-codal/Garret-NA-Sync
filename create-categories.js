const { createCategory, listCategory } = require(`./controllers/bigcommerce`);

const parentIds = {
    "Shop Men":  24,
    "Shop Women": 29,
    "Category Men": 35,
    "Activity Men": 32,
    "Category Women": 46,
    "Activity Women": 47,
    "Technology Men": 60,
    "Technology Women": 62,
    "Activity": 74,
    "Technology": 75,
};

const createCategoryList = [
    // men
    // { name: "Category", parent: 24 },
    // { name: "Activity", parent: 24 },
    // { name: "Technology", parent: 24 },
    // { name: "Jackets & Vests", parent: 35 },
    // { name: "Jerseys", parent: 35 },
    // { name: "Tops", parent: 35 },
    // { name: "Bib Shorts", parent: 35 },
    // { name: "Shorts", parent: 35 },
    // { name: "Tights", parent: 35 },
    // { name: "Bottoms", parent: 35 },
    // { name: "Baselayers", parent: 35 },
    // { name: "Gloves & Hats", parent: 35 },
    // { name: "Socks & Accesories", parent: 35 },
    // { name: "Running", parent: 32 },
    // { name: "Cycling", parent: 32 },
    // { name: "Multi Sport", parent: 32, isVisible: false },
    // { name: "Gore-Tex", parent: 60 },
    // { name: "Gore-Tex-Infinium", parent: 60 },
    // { name: "Gore-Windstopper", parent: 60 },
    // { name: "Selected Fabric", parent: 60, isVisible: false },
    // { name: "Shake Dry", parent: 60, isVisible: false },
    
    // women 
    // { name: "Category", parent: 29 },
    // { name: "Activity", parent: 29 },
    // { name: "Technology", parent: 29 },
    // { name: "Jackets & Vests", parent: 46 },
    // { name: "Jerseys", parent: 46 },
    // { name: "Tops", parent: 46 },
    // { name: "Bib Shorts", parent: 46 },
    // { name: "Shorts", parent: 46 },
    // { name: "Tights", parent: 46 },
    // { name: "Bottoms", parent: 46 },
    // { name: "Baselayers", parent: 46 },
    // { name: "Gloves & Hats", parent: 46 },
    // { name: "Socks & Accesories", parent: 46 },
    // { name: "Running", parent: 47 },
    // { name: "Multi Sport", parent: 47, isVisible: false },
    // { name: "Gore-Tex", parent: 62 },
    // { name: "Gore-Tex-Infinium", parent: 62 },
    // { name: "Gore-Windstopper", parent: 62 },
    // { name: "Selected Fabric", parent: 62, isVisible: false },
    // { name: "Shake Dry", parent: 62, isVisible: false },

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

    // Activity
    // { name: "Activity", parent: 0 },
    // { name: "Running", parent: 74 },
    // { name: "Cycling", parent: 74 },
    // { name: "Multi Sport", parent: 74 },
    // { name: "Ski", parent: 74, isVisible: false },
    // { name: "Road", parent: 74, isVisible: false },
    // { name: "Run", parent: 74, isVisible: false },
   
    // Technology
    // { name: "Technology", parent: 0 },
    // { name: "Gore-Tex", parent: 75 },
    // { name: "Gore-Tex-Infinium", parent: 75 },
    // { name: "Gore-Windstopper", parent: 75 },
    // { name: "Selected Fabric", parent: 75, isVisible: false },
    // { name: "Shake Dry", parent: 75, isVisible: false },

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