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
  (root, { lines, applyCartLinesChange, query, i18n }) => {
    let products = [];
    let loading = true;
    let appRendered = false;
    var productIds = ["gid://shopify/Product/4526304198754", "gid://shopify/Product/7252075380834", "gid://shopify/Product/6960192356450", "gid://shopify/Product/7338819256418", "gid://shopify/Product/7252123189346", "gid://shopify/Product/6610526765154", "gid://shopify/Product/7252590297186", "gid://shopify/Product/7338819780706", "gid://shopify/Product/6610494062690", "gid://shopify/Product/7252587642978", "gid://shopify/Product/7338820960354", "gid://shopify/Product/4538633814114", "gid://shopify/Product/7331745267810"]
  

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

    const { imageComponent, titleMarkup, priceMarkup, merchandise, imageComponentTwo, titleMarkupTwo, priceMarkupTwo, merchandiseTwo } =
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
      priceMarkup,
      addButtonComponent,
      //selectFrequency,
      imageComponentTwo,
      titleMarkupTwo,
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

      // console.log('productsOnOffer ', productsOnOffer)
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
          priceMarkup,
          addButtonComponent,
          merchandise,
          i18n
        );
        updateProductComponentsTwo(
          productsOnOffer[1],
          imageComponentTwo,
          titleMarkupTwo,
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
          priceMarkup,
          addButtonComponent,
          merchandise,
          i18n
        );        
        removeProductComponentsTwo(
          productsOnOffer[0],
          imageComponentTwo,
          titleMarkupTwo,
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
    root.createComponent(Heading, { level: 2 }, ["Upgrade To Subscription And Save"]),
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
            root.createText("Subscribe"),
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
  const priceMarkup = root.createText("");
  const merchandise = { id: "", sellingPlan: "", attributes: "" };
  const imageComponentTwo = root.createComponent(Image, {
    border: "base",
    borderWidth: "base",
    borderRadius: "loose",
    source: "",
    accessibilityDescription: "",
    aspectRatio: 1,
  });
  const titleMarkupTwo = root.createText("");
  const priceMarkupTwo = root.createText("");
  const merchandiseTwo = { id: "", sellingPlan: "", attributes: "" };

  return { imageComponent, titleMarkup, priceMarkup, merchandise, imageComponentTwo, titleMarkupTwo, priceMarkupTwo, merchandiseTwo };
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
    ["Subscribe"]
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
    type: "updateCartLine",
    id: merchandise.id,
    sellingPlanId: merchandise.sellingPlan,
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
  priceMarkup,
  addButtonComponent,
  //selectFrequency,
  imageComponentTwo,
  titleMarkupTwo,
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
      root.createComponent(Heading, { level: 2 }, "Upgrade To Subscription And Save"),
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
  console.log('filterProductsOnOfferUpgradeToSubscription products ', products)
  console.log('filterProductsOnOfferUpgradeToSubscription lines ', lines)
  var itemsWithoutSubscriptions = []
  var quantityInOrder = 0;
  var newLines = []

  for (var i =0; i <lines.current.length; i++){
    //console.log(lines.current[i])
    var pushToNewLines = false
    if (lines.current[i].attributes.length > 0){
      for (var ii =0; ii <lines.current[i].attributes.length; ii++){
        //console.log(lines.current[i].attributes[ii])
        if (lines.current[i].attributes[ii].key != '_add_on') {
          pushToNewLines = true
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
  console.log('newLines ', newLines)
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
  for (var i=0; i < products.length; i++){
    for (var ii=0; ii < newLines.length; ii++) {
      if (products[i].variants.nodes[0].id == newLines[ii].merchandise.id) {
        if (newLines[ii].merchandise.sellingPlan == undefined){
          products[i]["updateLineItem"] = newLines[ii].id
          products[i]["quantityInOrder"] = quantityInOrder
          products[i]["attributes"] = newLines[ii].attributes
          itemsWithoutSubscriptions.push(products[i])
        }
      }
    }
  }
  return itemsWithoutSubscriptions;
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
  priceMarkup,
  addButtonComponent,
  merchandise,
  i18n
) {
  var { images, title, variants } = product;
  //console.log('product BlockStack ', product)

  var discountPercent = 0;

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

  var containsFullPrice = false;
  product.attributes.push({key:"_upgrade_from_checkout", value: "true"})
  product.attributes.push({key:"_is_subscription_purchase", value: "true"})
  product.attributes = product.attributes.filter(function(el) { return el.key != "_is_one_time_purchase"; });
  product.attributes = product.attributes.filter(function(el) { return el.key != "_selling_plan"; });
  for (var i =0; i < product.attributes.length;i++){
    if (product.attributes[i].key == "_full_price") {
      containsFullPrice = true;
      product.attributes.push({key:"_discount", value: "15.0"})
    }
  }

  if(containsFullPrice) {
    discountPercent = .85;
  }

  var originalPrice = i18n.formatCurrency(variants.nodes[0].price.amount);
  var finalPrice = i18n.formatCurrency(variants.nodes[0].price.amount * discountPercent);

  var packageType = "pouch"
  if (product.id.includes('4526304198754') || product.id.includes('6610494062690') || product.id.includes('4538633814114') || product.id.includes('6610526765154')) {
    packageType = "bottle"
  }

  var imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  imageComponent.updateProps({ source: imageUrl });
  titleMarkup.updateText(title);
  addButtonComponent.updateProps({
    accessibilityLabel: `Add ${title} to cart,`,
  });
  priceMarkup.updateText(`Normally ${originalPrice} per ${packageType}. Upgrade for ${finalPrice} per ${packageType}`);
  merchandise.id = product.updateLineItem;
  merchandise.sellingPlan = 'gid://shopify/SellingPlan/2882076770';
  merchandise.attributes = product.attributes;
}

function updateProductComponentsTwo(
  product,
  imageComponentTwo,
  titleMarkupTwo,
  priceMarkupTwo,
  addButtonComponentTwo,
  merchandiseTwo,
  i18n
) {
  var { images, title, variants } = product;
  console.log('product BlockStack ', product)
  var discountPercent = 0;

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

  var containsFullPrice = false;
  product.attributes.push({key:"_upgrade_from_checkout", value: "true"})
  product.attributes.push({key:"_is_subscription_purchase", value: "true"})
  product.attributes = product.attributes.filter(function(el) { return el.key != "_is_one_time_purchase"; });
  product.attributes = product.attributes.filter(function(el) { return el.key != "_selling_plan"; });
  for (var i =0; i < product.attributes.length;i++){
    if (product.attributes[i].key == "_full_price") {
      containsFullPrice = true;
      product.attributes.push({key:"_discount", value: "15.0"})
    }
  }

  if(containsFullPrice) {
    discountPercent = .85;
  }

  var originalPrice = i18n.formatCurrency(variants.nodes[0].price.amount);
  var finalPrice = i18n.formatCurrency(variants.nodes[0].price.amount * discountPercent);

  var packageType = "pouch"
  if (product.id.includes('4526304198754') || product.id.includes('6610494062690') || product.id.includes('4538633814114') || product.id.includes('6610526765154')) {
    packageType = "bottle"
  }  

  var imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  imageComponentTwo.updateProps({ source: imageUrl });
  titleMarkupTwo.updateText(title);
  addButtonComponentTwo.updateProps({
    accessibilityLabel: `Add ${title} to cart,`,
  });
  priceMarkupTwo.updateText(`Normally ${originalPrice} per ${packageType}. Upgrade for ${finalPrice} per ${packageType}`);
  merchandiseTwo.id = product.updateLineItem;
  merchandiseTwo.sellingPlan = 'gid://shopify/SellingPlan/2882076770'
  merchandiseTwo.attributes = product.attributes;  
}

function removeProductComponentsTwo(
  product,
  imageComponentTwo,
  titleMarkupTwo,
  priceMarkupTwo,
  addButtonComponentTwo,
  merchandiseTwo,
  //selectFrequencyTwo,
  i18n
) {
  var { images, title, variants } = product;
  console.log('product BlockStack ', product)

  var renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);

  var imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  imageComponentTwo.remove({ source: imageUrl });
  titleMarkupTwo.remove(title);
  addButtonComponentTwo.remove({
    accessibilityLabel: `Add ${title} to cart,`,
  });
  priceMarkupTwo.remove(renderPrice);
  //selectFrequencyTwo.remove();
  merchandiseTwo.id = product.updateLineItem;
}
