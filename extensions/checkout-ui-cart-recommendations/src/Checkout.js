import {
  extension,
  Text,
  InlineLayout,
  BlockStack,
  Divider,
  Image,
  Banner,
  Heading,
  Button,
  SkeletonImage,
  SkeletonText,
  Select,
} from "@shopify/ui-extensions/checkout";
// Set up the entry point for the extension
export default extension(
  "purchase.checkout.block.render",
  (root, { attributes, lines, applyCartLinesChange, query, i18n }) => {
    let products = [];
    let loading = true;
    let appRendered = false;
    let kidsBellyBiotic = false;
    var productIds = ["gid://shopify/Product/4526304198754", "gid://shopify/Product/7252075380834", "gid://shopify/Product/7338812702818", "gid://shopify/Product/7338819256418", "gid://shopify/Product/7252123189346", "gid://shopify/Product/6610526765154", "gid://shopify/Product/7252590297186", "gid://shopify/Product/7338819780706", "gid://shopify/Product/6610494062690", "gid://shopify/Product/7252587642978", "gid://shopify/Product/7338820960354", "gid://shopify/Product/4538633814114", "gid://shopify/Product/7338812702818", "gid://shopify/Product/7338819256418", "gid://shopify/Product/7338820960354", "gid://shopify/Product/7338819780706", "gid://shopify/Product/7331745267810"]
    var addShippingProtection = false;
    var removeShippingProtection = false;
    var containsShippingProtection = false;
    var containsSubscription = false;
    var packageProtectionId;
    var packageProtectionQuantity = 0;
    var moreThanZeroItems = false;
    var moreThanThreeItems = false;
    var addDigitalDownload = false;
    var removeDigitalDownload = false;
    var containsDigitalDownload = false;
    var digitalDownloadQuantity = 0;
    var digitalDownloadId;
    var addMinicartGwp = false;
    var removeMinicartGwp = false;
    var containsMinicartGwp = false;
    var minicartGwpQuantity = 0;
    var minicartGwpId;
    var minicartGwpVariantId;
    console.log('attributes ', attributes)
    console.log('lines ', lines)

    for (var i=0; i < attributes.current.length; i++){
      //Contains more than zero item check
      if ((attributes.current[i].key == '_itemCount') && (attributes.current[i].value > 0)) {
        moreThanZeroItems = true;
      }
      //Contains more than three item check
      if ((attributes.current[i].key == '_itemCount') && (attributes.current[i].value >= 3)) {
        moreThanThreeItems = true;
      }
      //Contains subscription item check
      if ((attributes.current[i].key == '_is_subscription_purchase') && (attributes.current[i].value == 'true')) {
        containsSubscription = true;
      }
      //Digital Download Checks
      if ((attributes.current[i].key == '_free_digital_item') && (attributes.current[i].value == 'true')) {
        addDigitalDownload = true;
      }
      if ((attributes.current[i].key == '_free_digital_item') && (attributes.current[i].value == 'false')) {
        removeDigitalDownload = true;
      }
      //Minicart Gwp Checks
      if ((attributes.current[i].key == '_minicart_gwp_variant_id') && (attributes.current[i].value != '')) {
        minicartGwpVariantId = attributes.current[i].value;
      }
      if ((attributes.current[i].key == '_minicart_gwp') && (attributes.current[i].value == 'true')) {
        addMinicartGwp = true;
      }
      if ((attributes.current[i].key == '_minicart_gwp') && (attributes.current[i].value == 'false')) {
        removeMinicartGwp = true;
      }
      //Shipping Protection Checks
      if ((attributes.current[i].key == '_shippingProtection') && (attributes.current[i].value == 'true')) {
        addShippingProtection = true;
      }
      if ((attributes.current[i].key == '_shippingProtection') && (attributes.current[i].value == 'false')) {
        removeShippingProtection = true;
      }
    }
    for (var i =0; i <lines.current.length; i++){
      if (lines.current[i].merchandise.sku == "FirstDay") {
        containsShippingProtection = true;
        packageProtectionQuantity = lines.current[i].quantity
        packageProtectionId = lines.current[i].id
        console.log('contains sku firstday')
      }
      if (lines.current[i].merchandise.sku == "MealPlanner") {
        containsDigitalDownload = true;
        digitalDownloadQuantity = lines.current[i].quantity
        digitalDownloadId = lines.current[i].id
        console.log('contains sku MealPlanner')
      }
      if (lines.current[i].merchandise.id.includes(minicartGwpVariantId)) {
        containsMinicartGwp = true;
        minicartGwpQuantity = lines.current[i].quantity
        minicartGwpId = lines.current[i].id
        console.log('contains variant id ', minicartGwpVariantId)
      }
    }  
    //Minicart Gwp add and remove  
    if ((addMinicartGwp == true) && (moreThanThreeItems == true) && (containsMinicartGwp == false)){
      if (containsSubscription) {
        applyCartLinesChange({
          type: "addCartLine",
          merchandiseId: `gid://shopify/ProductVariant/${minicartGwpVariantId}`,
          quantity: 1,
          sellingPlanId: 'gid://shopify/SellingPlan/3151855714'
        });       
      } else {        
        applyCartLinesChange({
          type: "addCartLine",
          merchandiseId: `gid://shopify/ProductVariant/${minicartGwpVariantId}`,
          quantity: 1,
        });    
      }     
    }
    if ((addMinicartGwp == true) && (containsMinicartGwp == true) && (moreThanThreeItems == true)){
      if (containsSubscription) {
        applyCartLinesChange({
          type: "updateCartLine",
          id: minicartGwpId,
          quantity: 1,
          sellingPlanId: 'gid://shopify/SellingPlan/3151855714'
        });        
      } else {        
        applyCartLinesChange({
          type: "updateCartLine",
          id: minicartGwpId,
          quantity: 1,
          sellingPlanId: null,
        });        
      }
    }    
    if ((addMinicartGwp == false) && (containsMinicartGwp == true) && (moreThanThreeItems == false)){
        applyCartLinesChange({
          type: "removeCartLine",
          id: minicartGwpId,
          quantity: minicartGwpQuantity
        });    
    }
    //Digital download add and remove  
    if ((addDigitalDownload == true) && (moreThanZeroItems == true) && (containsDigitalDownload == false)){
      if (containsSubscription) {
        applyCartLinesChange({
          type: "addCartLine",
          merchandiseId: "gid://shopify/ProductVariant/42014666260578",
          quantity: 1,
          sellingPlanId: 'gid://shopify/SellingPlan/3151855714'
        });       
      } else {        
        applyCartLinesChange({
          type: "addCartLine",
          merchandiseId: "gid://shopify/ProductVariant/42014666260578",
          quantity: 1,
        });    
      }     
    }
    if ((addDigitalDownload == true) && (containsDigitalDownload == true) && (moreThanZeroItems == true)){
      if (containsSubscription) {
        applyCartLinesChange({
          type: "updateCartLine",
          id: digitalDownloadId,
          quantity: 1,
          sellingPlanId: 'gid://shopify/SellingPlan/3151855714'
        });        
      } else {        
        applyCartLinesChange({
          type: "updateCartLine",
          id: digitalDownloadId,
          quantity: 1,
          sellingPlanId: null,
        });        
      }
    }    
    if ((addDigitalDownload == false) && (containsDigitalDownload == true)){
        applyCartLinesChange({
          type: "removeCartLine",
          id: digitalDownloadId,
          quantity: digitalDownloadQuantity
        });    
    }
    //Shipping Protection add and remove
    if ((addShippingProtection == true) && (containsShippingProtection == false)){
      if (containsSubscription) {
        applyCartLinesChange({
          type: "addCartLine",
          merchandiseId: "gid://shopify/ProductVariant/41925710643298",
          quantity: 1,
          sellingPlanId: 'gid://shopify/SellingPlan/2882076770'
        });        
      } else {        
        applyCartLinesChange({
          type: "addCartLine",
          merchandiseId: "gid://shopify/ProductVariant/41925710643298",
          quantity: 1,
        });        
      }
    }
    if ((addShippingProtection == true) && (containsShippingProtection == true)){
      if (containsSubscription) {
        applyCartLinesChange({
          type: "updateCartLine",
          id: packageProtectionId,
          quantity: 1,
          sellingPlanId: 'gid://shopify/SellingPlan/2882076770'
        });        
      } else {        
        applyCartLinesChange({
          type: "updateCartLine",
          id: packageProtectionId,
          quantity: 1,
          sellingPlanId: null,
        });        
      }
    }
    if ((removeShippingProtection == true) && (containsShippingProtection == true)){
      applyCartLinesChange({
        type: "removeCartLine",
        id: packageProtectionId,
        quantity: packageProtectionQuantity,
      });        
    }

    if (moreThanZeroItems == false) {
      if (packageProtectionQuantity > 0) {
        applyCartLinesChange({
          type: "removeCartLine",
          id: packageProtectionId,
          quantity: packageProtectionQuantity,
        }); 
      }
      if (digitalDownloadQuantity > 0) {
        applyCartLinesChange({
          type: "removeCartLine",
          id: digitalDownloadId,
          quantity: digitalDownloadQuantity
        });   
      }
      if (minicartGwpQuantity > 0) {
        applyCartLinesChange({
          type: "removeCartLine",
          id: minicartGwpId,
          quantity: minicartGwpQuantity
        });      
      }
    }
    // Fetch products from the server
    fetchProducts(query, productIds).then((fetchedProducts) => {
      products = fetchedProducts;
      loading = false;
      renderApp();
    });

    lines.subscribe(() => renderApp());

    const loadingState = createLoadingState(root);
    if (loading) {
      root.appendChild(loadingState);
    }

    const { imageComponent, titleMarkup, blurbMarkup, priceMarkup, merchandise, imageComponentTwo, titleMarkupTwo, blurbMarkupTwo, priceMarkupTwo, merchandiseTwo } =
      createProductComponents(root);
    const addButtonComponent = createAddButtonComponent(
      root,
      applyCartLinesChange,
      merchandise
    );
    const addButtonComponentTwo = createAddButtonComponent(
      root,
      applyCartLinesChange,
      merchandiseTwo
    );
    const selectFrequency = createFrequencySelect(root, merchandise);
    const selectFrequencyTwo = createFrequencySelect(root, merchandiseTwo);


    const app = createApp(
      root,
      imageComponent,
      titleMarkup,
      blurbMarkup,
      priceMarkup,
      addButtonComponent,
      //selectFrequency,
      imageComponentTwo,
      titleMarkupTwo,
      blurbMarkupTwo,
      priceMarkupTwo,
      addButtonComponentTwo,
      //selectFrequencyTwo
    );

    function renderApp() {
      if (loading) {
        return;
      }

      if (!loading && products.length === 0) {
        root.removeChild(loadingState);
        return;
      }

      const productsOnOffer = filterProductsOnOfferUpgradeToSubscription(lines, products);

      //console.log('productsOnOffer ', productsOnOffer)
      // console.log('productsOnOffer[0] ', productsOnOffer[0])


      if (!loading && productsOnOffer.length === 0) {
        if (loadingState.parent) root.removeChild(loadingState);
        if (root.children) root.removeChild(root.children[0]);
        return;
      }
      if (productsOnOffer.length > 1) {
        updateProductComponents(
          productsOnOffer[0],
          imageComponent,
          titleMarkup,
          blurbMarkup,
          priceMarkup,
          addButtonComponent,
          merchandise,
          i18n
        );
        updateProductComponentsTwo(
          productsOnOffer[1],
          imageComponentTwo,
          titleMarkupTwo,
          blurbMarkupTwo,
          priceMarkupTwo,
          addButtonComponentTwo,
          merchandiseTwo,
          i18n
        );
      } else if (productsOnOffer.length == 1) {
        updateProductComponents(
          productsOnOffer[0],
          imageComponent,
          titleMarkup,
          blurbMarkup,
          priceMarkup,
          addButtonComponent,
          merchandise,
          i18n
        );        
        removeProductComponentsTwo(
          productsOnOffer[0],
          imageComponentTwo,
          titleMarkupTwo,
          blurbMarkupTwo,
          priceMarkupTwo,
          addButtonComponentTwo,
          merchandiseTwo,
          //selectFrequencyTwo,
          i18n
        );        
      }

      if (!appRendered) {
        root.removeChild(loadingState);
        root.appendChild(app);
        appRendered = true;
      }
    }
  }
);

function fetchProducts(query, productIds) {
  return query(
    `query Products($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          title
          images (first: 1){
            nodes {
              url(transform: {maxHeight: 80, maxWidth: 80})
            }
          }
          variants(first: 1) {
            nodes {
              id
              price {
                amount
              }
            }
          }             
        }
      }
    }`,
    {
      variables: { 
        "ids": productIds
      },
    }
  )
    .then(({ data }) => data.nodes)
    .catch((err) => {
      console.error(err);
      return [];
    });
}
function createLoadingState(root) {
  return root.createComponent(BlockStack, { spacing: "loose" }, [
    root.createComponent(Divider),
    root.createComponent(Heading, { level: 2 }, ["You'll Also Love:"]),
    root.createComponent(BlockStack, { spacing: "loose" }, [
      root.createComponent(
        InlineLayout,
        {
          spacing: "base",
          columns: [64, "fill", "auto"],
          blockAlignment: "center",
        },
        [
          root.createComponent(SkeletonImage, { aspectRatio: 1 }),
          root.createComponent(BlockStack, { spacing: "none" }, [
            root.createComponent(SkeletonText, { inlineSize: "large" }),
            root.createComponent(SkeletonText, { inlineSize: "small" }),
          ]),
          root.createComponent(Button, { kind: "secondary", disabled: true }, [
            root.createText("Add"),
          ]),
        ]
      ),
    ]),
  ]);
}

function createProductComponents(root) {
  const imageComponent = root.createComponent(Image, {
    border: "base",
    borderWidth: "base",
    borderRadius: "loose",
    source: "",
    accessibilityDescription: "",
    aspectRatio: 1,
  });
  const titleMarkup = root.createText("");
  const blurbMarkup = root.createText("");
  const priceMarkup = root.createText("");
  const merchandise = { id: "", attributes: "" };
  const imageComponentTwo = root.createComponent(Image, {
    border: "base",
    borderWidth: "base",
    borderRadius: "loose",
    source: "",
    accessibilityDescription: "",
    aspectRatio: 1,
  });
  const titleMarkupTwo = root.createText("");
  const blurbMarkupTwo = root.createText("");
  const priceMarkupTwo = root.createText("");
  const merchandiseTwo = { id: "", attributes: "" };

  return { imageComponent, titleMarkup, blurbMarkup, priceMarkup, merchandise, imageComponentTwo, titleMarkupTwo, blurbMarkupTwo, priceMarkupTwo, merchandiseTwo };
}

function createAddButtonComponent(root, applyCartLinesChange, merchandise) {
  return root.createComponent(
    Button,
    {
      kind: "secondary",
      loading: false,
      onPress: async () => {
        await handleAddButtonPress(root, applyCartLinesChange, merchandise);
      },
    },
    ["Add To Cart"]
  );
}

function createFrequencySelect(root, merchandise) {
  return root.createComponent(Select, {
    label: 'Subscription Frequency',
    value: 'gid://shopify/SellingPlan/2882076770',
    options: [
      {
        value: 'gid://shopify/SellingPlan/2882076770',
        label: 'Every Month',
      },
      {
        value: 'gid://shopify/SellingPlan/2961703010',
        label: 'Every 3 Months',
      },
    ],
    onChange: (value) => {
      //console.log(value);
      merchandise.sellingPlan = value
      var newSellingPlan = value
      updateProductComponentsForSelect(
        newSellingPlan,
        merchandise,
      );      
  },    
  });
}

async function handleAddButtonPress(root, applyCartLinesChange, merchandise) {
  //console.log('merchandise.id ', merchandise.id)
  // const result = await applyCartLinesChange({
  //   type: "addCartLine",
  //   merchandiseId: merchandise.id,
  //   quantity: 1,
  //   sellingPlanId: 'gid://shopify/SellingPlan/2882076770',
  // });
  const result = await applyCartLinesChange({
    type: "addCartLine",
    merchandiseId: merchandise.id,
    quantity: 1,
    attributes: merchandise.attributes,
  });

  if (result.type === "error") {
    displayErrorBanner(
      root,
      "There was an issue adding this product. Please try again."
    );
  }
}
function displayErrorBanner(root, message) {
  const errorComponent = root.createComponent(Banner, { status: "critical" }, [
    message,
  ]);
  const topLevelComponent = root.children[0];
  topLevelComponent.appendChild(errorComponent);
  setTimeout(() => topLevelComponent.removeChild(errorComponent), 3000);
}


function createApp(
  root,
  imageComponent,
  titleMarkup,
  blurbMarkup,
  priceMarkup,
  addButtonComponent,
  //selectFrequency,
  imageComponentTwo,
  titleMarkupTwo,
  blurbMarkupTwo,
  priceMarkupTwo,
  addButtonComponentTwo,
  //selectFrequencyTwo
) {
  // console.log('imageComponent ', imageComponent)
  // console.log('titleMarkup ', titleMarkup)
  // console.log('addButtonComponent ', addButtonComponent)
  // console.log('priceMarkup ', priceMarkup)
    return root.createComponent(BlockStack, { spacing: "loose" }, [
      root.createComponent(Divider),
      root.createComponent(Heading, { level: 2 }, "You'll Also Love:"),
      root.createComponent(BlockStack, { spacing: "loose" }, [
        root.createComponent(
          InlineLayout,
          {
            spacing: "base",
            columns: [64, "fill", "auto"],
            blockAlignment: "center",
          },
          [
            imageComponent,
            root.createComponent(BlockStack, { spacing: "none" }, [
              root.createComponent(Text, { size: "medium", emphasis: "bold" }, [
                titleMarkup,
              ]),
              root.createComponent(Text, { appearance: "subdued" }, [
                blurbMarkup,
              ]),
              root.createComponent(Text, { appearance: "subdued" }, [
                priceMarkup,
              ]),
            ]),
          ]
        ),
        // root.createComponent(
        //   InlineLayout,
        //   {
        //     spacing: "base",
        //     columns: ['75%',"25%"],
        //     blockAlignment: "center",
        //   },
        //   [
        //     root.createComponent(BlockStack, { spacing: "none" }, [
        //       //selectFrequency,
        //     ]),
        //     addButtonComponent,
        //   ]
        // ),
        root.createComponent(
          InlineLayout,
          {
            spacing: "base",
            columns: ['100%'],
            blockAlignment: "center",
          },
          [
            addButtonComponent,           
          ]
        ),        
      ]),
      root.createComponent(BlockStack, { spacing: "loose" }, [
        root.createComponent(
          InlineLayout,
          {
            spacing: "base",
            columns: [64, "fill", "auto"],
            blockAlignment: "center",
          },
          [
            imageComponentTwo,
            root.createComponent(BlockStack, { spacing: "none" }, [
              root.createComponent(Text, { size: "medium", emphasis: "bold" }, [
                titleMarkupTwo,
              ]),
              root.createComponent(Text, { appearance: "subdued" }, [
                blurbMarkupTwo,
              ]),
              root.createComponent(Text, { appearance: "subdued" }, [
                priceMarkupTwo,
              ]),
            ]),          
          ]
        ),
        // root.createComponent(
        //   InlineLayout,
        //   {
        //     spacing: "base",
        //     columns: ['75%',"25%"],
        //     blockAlignment: "center",
        //   },
        //   [
        //     root.createComponent(BlockStack, { spacing: "none" }, [
        //       //selectFrequencyTwo,
        //     ]),
        //     addButtonComponentTwo,           
        //   ]
        // ),
        root.createComponent(
          InlineLayout,
          {
            spacing: "base",
            columns: ['100%'],
            blockAlignment: "center",
          },
          [
            addButtonComponentTwo,           
          ]
        ),
      ]),
      root.createComponent(Text, {size: 'base'}, "45 Day Money-Back Guarantee. Cancel or skip anytime."),
    ]);
}

function filterProductsOnOfferUpgradeToSubscription(lines, products) {
  // console.log('filterProductsOnOfferUpgradeToSubscription products ', products)
  //console.log('filterProductsOnOfferUpgradeToSubscription lines ', lines)
  var itemsToUpsell = []
  var quantityInOrder = 0;
  var newLines = []
  var toddlersMulti = false;
  var kidsPro = false;
  var kidsMag = false;
  var kidsMulti = false;
  var teensPro = false;
  var teensMag = false;
  var teensMulti = false;
  var womensPro = false;
  var womensMag = false;
  var womensMulti = false;
  var mensPro = false;
  var mensMag = false;
  var mensMulti = false;
  var toddlersMultiObject = {};
  var kidsProObject = {};
  var kidsMagObject = {};
  var kidsMultiObject = {};
  var teensProObject = {};
  var teensMagObject = {};
  var teensMultiObject = {};
  var womensProObject = {};
  var womensMagObject = {};
  var womensMultiObject = {};
  var mensProObject = {};
  var mensMagObject = {};
  var mensMultiObject = {};
  var toddlersMultiUpsell = false;
  var kidsProUpsell = false;
  var kidsMagUpsell = false;
  var kidsMultiUpsell = false;
  var teensProUpsell = false;
  var teensMagUpsell = false;
  var teensMultiUpsell = false;
  var womensProUpsell = false;
  var womensMagUpsell = false;
  var womensMultiUpsell = false;
  var mensProUpsell = false;
  var mensMagUpsell = false;
  var mensMultiUpsell = false;
  var fullPriceItem = false;

  for (var i =0; i <lines.current.length; i++){
    //console.log(lines.current[i])
    if (lines.current[i].merchandise.sku == 'FIRSTDAY') {
      containsShippingProtection = true;
    }
    var pushToNewLines = false
    if (lines.current[i].attributes.length > 0){
      for (var ii =0; ii <lines.current[i].attributes.length; ii++){
        //console.log(lines.current[i].attributes[ii])
        if (lines.current[i].attributes[ii].key != '_add_on') {
          pushToNewLines = true
        }
        if (lines.current[i].attributes[ii].key == '_full_price') {
          fullPriceItem = true
        }
      }
    }
    if (lines.current[i].attributes.length == 0){
      pushToNewLines = true
    }
    if (pushToNewLines){
      newLines.push(lines.current[i])
    }
  }
  var containsSusbcription = false;

  for (var i=0; i < newLines.length; i++) {
    if (newLines[i].merchandise.sellingPlan != undefined){
      containsSusbcription = true;
    }
  }  
  //console.log('newLines ', newLines)
  // console.log('lines.current ', lines.current)
  // lines.current = newLines
  // console.log('lines.curernt newLines ', lines.current)
  for (var i=0; i < products.length; i++){
    for (var ii=0; ii < newLines.length; ii++) {
      if (products[i].variants.nodes[0].id == newLines[ii].merchandise.id) {
        quantityInOrder += newLines[ii].quantity
      }
    }
  }
  for (var i=0; i < newLines.length; i++) {
    if (newLines[i].merchandise.id.includes('41869557334114')) {
      toddlersMulti = true;
    }
    if (newLines[i].merchandise.id.includes('41898168549474')) {
      kidsPro = true;
    }
    if (newLines[i].merchandise.id.includes('41548237275234')) {
      kidsMag = true;
    }
    if (newLines[i].merchandise.id.includes('32050881855586')) {
      kidsMulti = true;
    }
    if (newLines[i].merchandise.id.includes('41898189389922')) {
      teensPro = true;
    }
    if (newLines[i].merchandise.id.includes('41548415041634')) {
      teensMag = true;
    }
    if (newLines[i].merchandise.id.includes('39463608516706')) {
      teensMulti = true;
    }
    if (newLines[i].merchandise.id.includes('41898193584226')) {
      womensPro = true;
    }
    if (newLines[i].merchandise.id.includes('41550215282786')) {
      womensMag = true;
    }
    if (newLines[i].merchandise.id.includes('39271491731554')) {
      womensMulti = true;
    }
    if (newLines[i].merchandise.id.includes('41898190766178')) {
      mensPro = true;
    }
    if (newLines[i].merchandise.id.includes('39271491731554')) {
      mensMag = true;
    }
    if (newLines[i].merchandise.id.includes('39463537737826')) {
      mensMulti = true;
    }
  }
  for (var i=0; i < products.length; i++) {
    if (products[i].variants.nodes[0].id.includes('41898168549474')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Support digestion, immunity, and oral health.';
      kidsProObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('41548237275234')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'For easier bedtimes and more restful sleep. Ages 4-12.';
      kidsMagObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('32050881855586')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Helps fill the nutritional gaps left in the diet of picky eaters. For kids ages 4+.';
      kidsMultiObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('41869557334114')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Nutritional support for growing kids ages 2-3.';
      toddlersMultiObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('41898189389922')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Helps support the gut microbiome to support skin health & immunity.';
      teensProObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('41548415041634')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Supporting calmer nights & restful school days Ages 13-17.';
      teensMagObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('39463608516706')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Designed to replenish the missing nutrients of a normal teen diet. For ages 13+.';
      teensMultiObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('41898193584226')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'A combined pre+ post+ probiotic gummy to support gut health, immunity and vaginal health.';
      womensProObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('41550215282786')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Relax before bed and enjoy restorative sleep. Ages 18+.';
      womensMagObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('39271491731554')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Created to help busy women meet their nutritional needs, with 12 organic fruits & veggies.';
      womensMultiObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('41898190766178')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Aids in muscle strength & power while helping improve digestion & immunity.';
      mensProObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('39271491731554')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Nighttime relief from stressful work days. Ages 18+';
      mensMagObject = products[i];
    }
    if (products[i].variants.nodes[0].id.includes('39463537737826')) {
      products[i]["_is_one_time_purchase"] = true;
      products[i]["quantityInOrder"] = quantityInOrder;
      products[i]["updateLineItem"] = products[i].variants.nodes[0].id;
      products[i]["attributes"] = [];
      products[i]["containsSusbcription"] = containsSusbcription;
      products[i]["fullPriceItem"] = fullPriceItem;
      products[i]["blurb"] = 'Supplements 9 key nutrients men most commonly lack, perfect for the modern lifestyle.';
      mensMultiObject = products[i];
    }
  }
  
  if (toddlersMulti) {
    if (kidsMulti == false && kidsMultiUpsell == false) {
      itemsToUpsell.push(kidsMultiObject)
      kidsMultiUpsell = true
    }
    if (kidsPro == false && kidsProUpsell == false) {
      itemsToUpsell.push(kidsProObject)
      kidsProUpsell = true
    }
    if (kidsMag == false && kidsMagUpsell == false) {
      itemsToUpsell.push(kidsMagObject)
      kidsMagUpsell = true
    }
    if (womensMulti == false && womensMultiUpsell == false) {
      itemsToUpsell.push(womensMultiObject)
      womensMultiUpsell = true
    }
    if (womensPro == false && womensProUpsell == false) {
      itemsToUpsell.push(womensProObject)
      womensProUpsell = true
    }    
    if (womensMag == false && womensMagUpsell == false) {
      itemsToUpsell.push(womensMagObject)
      womensMagUpsell = true
    }
    if (mensMulti == false && mensMultiUpsell == false) {
      itemsToUpsell.push(mensMultiObject)
      mensMultiUpsell = true
    }
    if (mensPro == false && mensProUpsell == false) {
      itemsToUpsell.push(mensProObject)
      mensProUpsell = true
    }    
    if (mensMag == false && mensMagUpsell == false) {
      itemsToUpsell.push(mensMagObject)
      mensMagUpsell = true
    }
    if (teensMulti == false && teensMultiUpsell == false) {
      itemsToUpsell.push(teensMultiObject)
      teensMultiUpsell = true
    }    
    if (teensPro == false && teensProUpsell == false) {
      itemsToUpsell.push(teensProObject)
      teensProUpsell = true
    }    
    if (teensMag == false && teensMagUpsell == false) {
      itemsToUpsell.push(teensMagObject)
      teensMagUpsell = true
    }    
  }
  if (kidsMulti) {
    if (toddlersMulti == false && toddlersMultiUpsell == false) {
      itemsToUpsell.push(toddlersMultiObject)
      toddlersMultiUpsell = true
    }
    if (kidsMag == false && kidsMagUpsell == false) {
      itemsToUpsell.push(kidsMagObject)
      kidsMagUpsell = true
    }
    if (kidsPro == false && kidsProUpsell == false) {
      itemsToUpsell.push(kidsProObject)
      kidsProUpsell = true
    }
    if (womensMulti == false && womensMultiUpsell == false) {
      itemsToUpsell.push(womensMultiObject)
      womensMultiUpsell = true
    }
    if (womensPro == false && womensProUpsell == false) {
      itemsToUpsell.push(womensProObject)
      womensProUpsell = true
    }    
    if (womensMag == false && womensMagUpsell == false) {
      itemsToUpsell.push(womensMagObject)
      womensMagUpsell = true
    }
    if (mensMulti == false && mensMultiUpsell == false) {
      itemsToUpsell.push(mensMultiObject)
      mensMultiUpsell = true
    }
    if (mensPro == false && mensProUpsell == false) {
      itemsToUpsell.push(mensProObject)
      mensProUpsell = true
    }    
    if (mensMag == false && mensMagUpsell == false) {
      itemsToUpsell.push(mensMagObject)
      mensMagUpsell = true
    }
    if (teensMulti == false && teensMultiUpsell == false) {
      itemsToUpsell.push(teensMultiObject)
      teensMultiUpsell = true
    }    
    if (teensPro == false && teensProUpsell == false) {
      itemsToUpsell.push(teensProObject)
      teensProUpsell = true
    }    
    if (teensMag == false && teensMagUpsell == false) {
      itemsToUpsell.push(teensMagObject)
      teensMagUpsell = true
    }    
  }
  if (kidsMag) {
    if (kidsMulti == false && kidsMultiUpsell == false) {
      itemsToUpsell.push(kidsMultiObject)
      kidsMultiUpsell = true
    }
    if (kidsPro == false && kidsProUpsell == false) {
      itemsToUpsell.push(kidsProObject)
      kidsProUpsell = true
    }
    if (womensMulti == false && womensMultiUpsell == false) {
      itemsToUpsell.push(womensMultiObject)
      womensMultiUpsell = true
    }
    if (womensPro == false && womensProUpsell == false) {
      itemsToUpsell.push(womensProObject)
      womensProUpsell = true
    }    
    if (womensMag == false && womensMagUpsell == false) {
      itemsToUpsell.push(womensMagObject)
      womensMagUpsell = true
    }
    if (mensMulti == false && mensMultiUpsell == false) {
      itemsToUpsell.push(mensMultiObject)
      mensMultiUpsell = true
    }
    if (mensPro == false && mensProUpsell == false) {
      itemsToUpsell.push(mensProObject)
      mensProUpsell = true
    }    
    if (mensMag == false && mensMagUpsell == false) {
      itemsToUpsell.push(mensMagObject)
      mensMagUpsell = true
    }
    if (teensMulti == false && teensMultiUpsell == false) {
      itemsToUpsell.push(teensMultiObject)
      teensMultiUpsell = true
    }    
    if (teensPro == false && teensProUpsell == false) {
      itemsToUpsell.push(teensProObject)
      teensProUpsell = true
    }    
    if (teensMag == false && teensMagUpsell == false) {
      itemsToUpsell.push(teensMagObject)
      teensMagUpsell = true
    }    
  }
  if (kidsPro) {
    if (kidsMulti == false && kidsMultiUpsell == false) {
      itemsToUpsell.push(kidsMultiObject)
      kidsMultiUpsell = true
    }
    if (kidsMag == false && kidsMagUpsell == false) {
      itemsToUpsell.push(kidsMagObject)
      kidsMagUpsell = true
    }
    if (womensMulti == false && womensMultiUpsell == false) {
      itemsToUpsell.push(womensMultiObject)
      womensMultiUpsell = true
    }
    if (womensPro == false && womensProUpsell == false) {
      itemsToUpsell.push(womensProObject)
      womensProUpsell = true
    }    
    if (womensMag == false && womensMagUpsell == false) {
      itemsToUpsell.push(womensMagObject)
      womensMagUpsell = true
    }
    if (mensMulti == false && mensMultiUpsell == false) {
      itemsToUpsell.push(mensMultiObject)
      mensMultiUpsell = true
    }
    if (mensPro == false && mensProUpsell == false) {
      itemsToUpsell.push(mensProObject)
      mensProUpsell = true
    }    
    if (mensMag == false && mensMagUpsell == false) {
      itemsToUpsell.push(mensMagObject)
      mensMagUpsell = true
    }
    if (teensMulti == false && teensMultiUpsell == false) {
      itemsToUpsell.push(teensMultiObject)
      teensMultiUpsell = true
    }    
    if (teensPro == false && teensProUpsell == false) {
      itemsToUpsell.push(teensProObject)
      teensProUpsell = true
    }    
    if (teensMag == false && teensMagUpsell == false) {
      itemsToUpsell.push(teensMagObject)
      teensMagUpsell = true
    }    
  }
  if (teensMulti) {
    if (teensMag == false && teensMagUpsell == false) {
      itemsToUpsell.push(teensMagObject)
      teensMagUpsell = true
    }
    if (teensPro == false && teensProUpsell == false) {
      itemsToUpsell.push(teensProObject)
      teensProUpsell = true
    }
  }
  if (teensMag) {
    if (teensMulti == false && teensMultiUpsell == false) {
      itemsToUpsell.push(teensMultiObject)
      teensMultiUpsell = true
    }
    if (teensPro == false && teensProUpsell == false) {
      itemsToUpsell.push(teensProObject)
      teensProUpsell = true
    }
  }
  if (teensPro) {
    if (teensMulti == false && teensMultiUpsell == false) {
      itemsToUpsell.push(teensMultiObject)
      teensMultiUpsell = true
    }
    if (teensMag == false && teensMagUpsell == false) {
      itemsToUpsell.push(teensMagObject)
      teensMagUpsell = true
    }
  }
  if (womensMulti) {
    if (womensMag == false && womensMagUpsell == false) {
      itemsToUpsell.push(womensMagObject)
      womensMagUpsell = true
    }
    if (womensPro == false && womensProUpsell == false) {
      itemsToUpsell.push(womensProObject)
      womensProUpsell = true
    }
  }
  if (womensMag) {
    if (womensMulti == false && womensMultiUpsell == false) {
      itemsToUpsell.push(womensMultiObject)
      womensMultiUpsell = true
    }
    if (womensPro == false && womensProUpsell == false) {
      itemsToUpsell.push(womensProObject)
      womensProUpsell = true
    }
  }
  if (womensPro) {
    if (womensMulti == false && womensMultiUpsell == false) {
      itemsToUpsell.push(womensMultiObject)
      womensMultiUpsell = true
    }
    if (womensMag == false && womensMagUpsell == false) {
      itemsToUpsell.push(womensMagObject)
      womensMagUpsell = true
    }
  }
  if (mensMulti) {
    if (mensMag == false && mensMagUpsell == false) {
      itemsToUpsell.push(mensMagObject)
      mensMagUpsell = true
    }
    if (mensPro == false && mensProUpsell == false) {
      itemsToUpsell.push(mensProObject)
      mensProUpsell = true
    }
  }
  if (mensMag) {
    if (mensMulti == false && mensMultiUpsell == false) {
      itemsToUpsell.push(mensMultiObject)
      mensMultiUpsell = true
    }
    if (mensPro == false && mensProUpsell == false) {
      itemsToUpsell.push(mensProObject)
      mensProUpsell = true
    }
  }
  if (mensPro) {
    if (mensMulti == false && mensMultiUpsell == false) {
      itemsToUpsell.push(mensMultiObject)
      mensMultiUpsell = true
    }
    if (mensMag == false && mensMagUpsell == false) {
      itemsToUpsell.push(mensMagObject)
      mensMagUpsell = true
    }
  }

  return itemsToUpsell;
}

function updateProductComponentsForSelect(
  newSellingPlan,
  merchandise,
) {
  merchandise.sellingPlan = newSellingPlan
}

function updateProductComponents(
  product,
  imageComponent,
  titleMarkup,
  blurbMarkup,
  priceMarkup,
  addButtonComponent,
  merchandise,
  i18n
) {
  var { images, title, variants } = product;
  //console.log('product BlockStack ', product)

  var discountPercent = 0;
  if (product.containsSusbcription == true) {
    if (product.quantityInOrder == 1){
      discountPercent = .85;
    }  
  
    if (product.quantityInOrder == 2){
      discountPercent = .80;
    }  
  
    if (product.quantityInOrder == 3){
      discountPercent = .75;
    }  
  
    if (product.quantityInOrder >= 4){
      discountPercent = .70;
    }    
  } else {
    if (product.quantityInOrder == 1){
      discountPercent = .95;
    }  
  
    if (product.quantityInOrder == 2){
      discountPercent = .90;
    }  
  
    if (product.quantityInOrder >= 3){
      discountPercent = .85;
    }  
  }

  var containsFullPrice = false;
  product.attributes.push({key:"_added_from_checkout", value: "true"})
  product.attributes.push({key:"_is_one_time_purchase", value: "true"})
  product.attributes.push({key: "_product_type", value: "rebrand"})
  product.attributes = product.attributes.filter(function(el) { return el.key != "_is_one_time_purchase"; });
  product.attributes = product.attributes.filter(function(el) { return el.key != "_selling_plan"; });
  if (product.fullPriceItem) {
    containsFullPrice = true;
    product.attributes.push({key:"_full_price", value: "true"})
  }  
  // for (var i =0; i < product.attributes.length;i++){
  //   if (product.attributes[i].key == "_full_price") {
  //     containsFullPrice = true;
  //     product.attributes.push({key:"_discount", value: "15.0"})
  //   }
  // }

  if(containsFullPrice) {
    discountPercent = .85;
  }

  var originalPrice = i18n.formatCurrency(variants.nodes[0].price.amount);
  var finalPrice = i18n.formatCurrency(variants.nodes[0].price.amount * discountPercent);

  var packageType = "pouch"
  if (product.id.includes('4526304198754') || product.id.includes('6610494062690') || product.id.includes('4538633814114') || product.id.includes('6610526765154') || product.id.includes('7338812702818') || product.id.includes('7338819256418') || product.id.includes('7338820960354') || product.id.includes('7338819780706')) {
    packageType = "bottle"
  }
  var blurb = product.blurb;
  var imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  imageComponent.updateProps({ source: imageUrl });
  titleMarkup.updateText(title);
  blurbMarkup.updateText(blurb);
  addButtonComponent.updateProps({
    accessibilityLabel: `Add ${title} to cart,`,
  });
  if (containsFullPrice) {
    priceMarkup.updateText(`Add to order for ${originalPrice} per ${packageType}`);
  } else {
    priceMarkup.updateText(`Normally ${originalPrice} per ${packageType}. Add to order for ${finalPrice} per ${packageType}`);
  }
  merchandise.id = product.updateLineItem;
  merchandise.attributes = product.attributes;
}

function updateProductComponentsTwo(
  product,
  imageComponentTwo,
  titleMarkupTwo,
  blurbMarkupTwo,
  priceMarkupTwo,
  addButtonComponentTwo,
  merchandiseTwo,
  i18n
) {
  var { images, title, variants } = product;
  //console.log('product BlockStack ', product)
  var discountPercent = 0;

  if (product.containsSusbcription == true) {
    if (product.quantityInOrder == 1){
      discountPercent = .85;
    }  
  
    if (product.quantityInOrder == 2){
      discountPercent = .80;
    }  
  
    if (product.quantityInOrder == 3){
      discountPercent = .75;
    }  
  
    if (product.quantityInOrder >= 4){
      discountPercent = .70;
    }    
  } else {
    if (product.quantityInOrder == 1){
      discountPercent = .95;
    }  
  
    if (product.quantityInOrder == 2){
      discountPercent = .90;
    }  
  
    if (product.quantityInOrder >= 3){
      discountPercent = .85;
    }    
  }

  var containsFullPrice = false;
  product.attributes.push({key:"_added_from_checkout", value: "true"})
  product.attributes.push({key:"_is_one_time_purchase", value: "true"})
  product.attributes.push({key: "_product_type", value: "rebrand"})
  product.attributes = product.attributes.filter(function(el) { return el.key != "_is_subscription_purchase"; });
  product.attributes = product.attributes.filter(function(el) { return el.key != "_selling_plan"; });
  if (product.fullPriceItem) {
    containsFullPrice = true;
    product.attributes.push({key:"_full_price", value: "true"})
  }  
  // for (var i =0; i < product.attributes.length;i++){
  //   if (product.attributes[i].key == "_full_price") {
  //     containsFullPrice = true;
  //     product.attributes.push({key:"_discount", value: "15.0"})
  //   }
  // }

  if(containsFullPrice) {
    discountPercent = .85;
  }

  var originalPrice = i18n.formatCurrency(variants.nodes[0].price.amount);
  var finalPrice = i18n.formatCurrency(variants.nodes[0].price.amount * discountPercent);

  var packageType = "pouch"
  if (product.id.includes('4526304198754') || product.id.includes('6610494062690') || product.id.includes('4538633814114') || product.id.includes('6610526765154') || product.id.includes('7338812702818') || product.id.includes('7338819256418') || product.id.includes('7338820960354') || product.id.includes('7338819780706')) {
    packageType = "bottle"
  }  
  var blurb = product.blurb;
  var imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  imageComponentTwo.updateProps({ source: imageUrl });
  titleMarkupTwo.updateText(title);
  blurbMarkupTwo.updateText(blurb);
  addButtonComponentTwo.updateProps({
    accessibilityLabel: `Add ${title} to cart,`,
  });
  if (containsFullPrice) {
    priceMarkupTwo.updateText(`Add to order for ${originalPrice} per ${packageType}`);
  } else {
    priceMarkupTwo.updateText(`Normally ${originalPrice} per ${packageType}. Add to order for ${finalPrice} per ${packageType}`);
  }
  merchandiseTwo.id = product.updateLineItem;
  merchandiseTwo.attributes = product.attributes;  
}

function removeProductComponentsTwo(
  product,
  imageComponentTwo,
  titleMarkupTwo,
  blurbMarkupTwo,
  priceMarkupTwo,
  addButtonComponentTwo,
  merchandiseTwo,
  //selectFrequencyTwo,
  i18n
) {
  var { images, title, variants } = product;
  //console.log('product BlockStack ', product)

  var renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);
  var blurb = product.blurb;

  var imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  imageComponentTwo.remove({ source: imageUrl });
  titleMarkupTwo.remove(title);
  blurbMarkupTwo.remove(blurb);
  addButtonComponentTwo.remove({
    accessibilityLabel: `Add ${title} to cart,`,
  });
  priceMarkupTwo.remove(renderPrice);
  //selectFrequencyTwo.remove();
  merchandiseTwo.id = product.updateLineItem;
}
