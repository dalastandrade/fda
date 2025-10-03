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
  CheckoutApi,
} from "@shopify/ui-extensions/checkout";
// Set up the entry point for the extension
export default extension(
  "purchase.checkout.block.render",
  (root, { lines, applyCartLinesChange, query, i18n, attributes, discountCodes, settings }) => {
    let products = [];
    let loading = true;
    let appRendered = false;

    //console.log('attributes ', attributes)
    //console.log('discountCodes ', discountCodes)
    // Fetch products from the server
    fetchProductsGwpCouponCode(query).then((fetchedProducts) => {
      products = fetchedProducts;
      loading = false;
      renderApp();
    });

    lines.subscribe(() => renderApp());

    const loadingState = createLoadingState(root);
    if (loading) {
      root.appendChild(loadingState);
    }

    const { imageComponent, titleMarkup, priceMarkup, merchandise } =
      createProductComponents(root);
    const addButtonComponent = createAddButtonComponent(
      root,
      applyCartLinesChange,
      merchandise
    );

    const app = createApp(
      root,
      imageComponent,
      titleMarkup,
      priceMarkup,
      addButtonComponent
    );

    function renderApp() {
      if (loading) {
        return;
      }

      if (!loading && products.length === 0) {
        root.removeChild(loadingState);
        return;
      }

      const productsOnOffer = filterProductsOnOffer(lines, products, discountCodes, applyCartLinesChange, settings);

      if (!loading && productsOnOffer.length === 0) {
        if (loadingState.parent) root.removeChild(loadingState);
        if (root.children) root.removeChild(root.children[0]);
        return;
      }

      updateProductComponents(
        productsOnOffer[0],
        imageComponent,
        titleMarkup,
        priceMarkup,
        addButtonComponent,
        merchandise,
        i18n
      );

      if (!appRendered) {
        root.removeChild(loadingState);
        root.appendChild(app);
        appRendered = true;
      }
    }
  }
);

function fetchProductsGwpCouponCode(query) {
  return query(
    `query ($first: Int!) {
        products(first: $first) {
          nodes {
            id
            title
            images(first:1){
              nodes {
                url
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
      variables: { first: 5 },
    }
  )
    .then(({ data }) => data.products.nodes)
    .catch((err) => {
      console.error(err);
      return [];
    });
}
function createLoadingState(root) {
  // return root.createComponent(BlockStack, { spacing: "loose" }, [
  //   root.createComponent(Divider),
  //   root.createComponent(Heading, { level: 2 }, ["You might also like"]),
  //   root.createComponent(BlockStack, { spacing: "loose" }, [
  //     root.createComponent(
  //       InlineLayout,
  //       {
  //         spacing: "base",
  //         columns: [64, "fill", "auto"],
  //         blockAlignment: "center",
  //       },
  //       [
  //         root.createComponent(SkeletonImage, { aspectRatio: 1 }),
  //         root.createComponent(BlockStack, { spacing: "none" }, [
  //           root.createComponent(SkeletonText, { inlineSize: "large" }),
  //           root.createComponent(SkeletonText, { inlineSize: "small" }),
  //         ]),
  //         root.createComponent(Button, { kind: "secondary", disabled: true }, [
  //           root.createText("Add"),
  //         ]),
  //       ]
  //     ),
  //   ]),
  // ]);
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
  const merchandise = { id: "" };

  return { imageComponent, titleMarkup, priceMarkup, merchandise };
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
    ["Add"]
  );
}

async function handleAddButtonPress(root, applyCartLinesChange, merchandise) {
  const result = await applyCartLinesChange({
    type: "addCartLine",
    merchandiseId: merchandise.id,
    quantity: 1,
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
  addButtonComponent
) {
  return root.createComponent(BlockStack, { spacing: "loose" }, [
    root.createComponent(Divider),
    root.createComponent(Heading, { level: 2 }, "You might also like"),
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
          addButtonComponent,
        ]
      ),
    ]),
  ]);
}

function filterProductsOnOffer(lines, products, discountCodes, applyCartLinesChange, settings) {
  //console.log('settings ', settings)
  //console.log('settings.current.gwp_array_of_objects ', settings.current.gwp_array_of_objects)
  var z =  JSON.parse(settings.current.gwp_array_of_objects)
  console.log('Array Z ', z)
  //console.log('discountCodes.current[0] ', discountCodes.current[0])

  var quantity = 0; 
  
  //No tier GWP
  for (var i=0; i < z.length; i++){
      z[i]['promoInCartNoTierGWP'] = false
      z[i]['promoQtyInCartNoTierGWP'] = 0;
      z[i]['promoQuantityNoTierGWP'] = 0;
      z[i]['lineIdNoTierGWP'] = '';
  
      z[i]['quantityCheckNoTierGWP'] = '';
      z[i]['containsSubscription'] = false
      for (var x = 0; x < lines.current.length; x++) {
        if (!lines.current[x].merchandise.id.includes(z[i].variant)){
            quantity += lines.current[x].quantity
        }
    
        if (lines.current[x].merchandise.id.includes(z[i].variant)) {
          z[i].lineIdNoTierGWP = lines.current[x].id
          z[i].promoInCartNoTierGWP = true;
          z[i].promoQtyInCartNoTierGWP = lines.current[x].quantity         
        }    
        
        if (lines.current[x].merchandise.sellingPlan != undefined){
          if (!lines.current[x].merchandise.sellingPlan.id.includes(2972057698)) {
            z[i].containsSubscription = true;
          }
        }
      }      
      if (quantity >= 1) {
        z[i].promoQuantityNoTierGWP = parseInt(z[i].quantity)
      }
    
      z[i].quantityCheckNoTierGWP = z[i].promoQtyInCartNoTierGWP != z[i].promoQuantityNoTierGWP ? true : false;
      //console.log('promoInCartNoTierGWP Before ', z[i].promoInCartNoTierGWP)
      //console.log('Z after everything ', z)
    
      ////console.log('settings.current.require_subscription_purchase before ', settings.current.require_subscription_purchase)
    
      if (z[i].subscription == 'No') {
        //console.log('settings.current.require_subscription_purchase after ', z[i].subscription)
        noSubscriptionRequired(z[i].variant, z[i].promoInCartNoTierGWP, z[i].promoQtyInCartNoTierGWP, z[i].promoQuantityNoTierGWP, z[i].lineIdNoTierGWP, z[i].quantityCheckNoTierGWP, discountCodes, z[i].coupon, applyCartLinesChange)
      }
      if (z[i].subscription == 'Yes') {
        subscriptionRequired(z[i].variant, z[i].promoInCartNoTierGWP, z[i].promoQtyInCartNoTierGWP, z[i].promoQuantityNoTierGWP, z[i].lineIdNoTierGWP, z[i].quantityCheckNoTierGWP, z[i].containsSubscription, discountCodes, z[i].coupon, applyCartLinesChange)
      }
      
  }



  const cartLineProductVariantIds = lines.current.map(
    (item) => item.merchandise.id
  );
  return products.filter((product) => {
    const isProductVariantInCart = product.variants.nodes.some(({ id }) =>
      cartLineProductVariantIds.includes(id)
    );
    return !isProductVariantInCart;
  });
}

function noSubscriptionRequired(variantIdNoTierGWP, promoInCartNoTierGWP, promoQtyInCartNoTierGWP, promoQuantityNoTierGWP, lineIdNoTierGWP, quantityCheckNoTierGWP, discountCodes, coupon, applyCartLinesChange) {
  //console.log('noSubscriptionRequired discountCodes.current[0] ', discountCodes.current[0])
  //console.log('noSubscriptionRequired coupon ', coupon)
  //console.log('noSubscriptionRequired quantityCheckNoTierGWP ', quantityCheckNoTierGWP)
  //console.log('noSubscriptionRequired promoInCartNoTierGWP ', promoInCartNoTierGWP)
  //console.log('noSubscriptionRequired lineIdNoTierGWP ', lineIdNoTierGWP)
  //console.log('noSubscriptionRequired promoQuantityNoTierGWP ', promoQuantityNoTierGWP)
  //console.log('noSubscriptionRequired variantIdNoTierGWP ', variantIdNoTierGWP)
  if (discountCodes.current[0] != undefined ){
    if (discountCodes.current[0].code.toUpperCase() == coupon) {
      if (quantityCheckNoTierGWP){
        if (promoInCartNoTierGWP){
          //console.log('updateCartLine')
            applyCartLinesChange({
                type: "updateCartLine",
                id: lineIdNoTierGWP,
                quantity: promoQuantityNoTierGWP,
            });
        } else {
          //console.log('promoInCartNoTierGWP ', promoInCartNoTierGWP)
          //console.log('addCartLine')
            applyCartLinesChange({
                type: "addCartLine",
                merchandiseId: "gid://shopify/ProductVariant/" + variantIdNoTierGWP,
                quantity: 1,
            });
        }
      }
    } else if (discountCodes.current[0].code.toUpperCase() != coupon) {
      if (promoInCartNoTierGWP == true) {
        //console.log('lineIdNoTierGWP ', lineIdNoTierGWP)
        applyCartLinesChange({
          type: "updateCartLine",
          id: lineIdNoTierGWP,
          quantity: 0,
        });               
      }
    }
  }
  if ((discountCodes.current == '')){
    if (promoInCartNoTierGWP == true) {
      //console.log('lineIdNoTierGWP ', lineIdNoTierGWP)
      applyCartLinesChange({
        type: "updateCartLine",
        id: lineIdNoTierGWP,
        quantity: 0,
      });               
    }    
  }
}

function subscriptionRequired(variantIdNoTierGWP, promoInCartNoTierGWP, promoQtyInCartNoTierGWP, promoQuantityNoTierGWP, lineIdNoTierGWP, quantityCheckNoTierGWP, containsSubscription, discountCodes, coupon, applyCartLinesChange) {

  if (containsSubscription) {
    if (discountCodes.current[0] != undefined ){
      if (discountCodes.current[0].code.toUpperCase() == coupon) {
        if (quantityCheckNoTierGWP){
          if (promoInCartNoTierGWP){
              applyCartLinesChange({
                  type: "updateCartLine",
                  id: lineIdNoTierGWP,
                  quantity: promoQuantityNoTierGWP,
              });
          } else {
              applyCartLinesChange({
                  type: "addCartLine",
                  merchandiseId: "gid://shopify/ProductVariant/" + variantIdNoTierGWP,
                  quantity: 1,
              });
          }
        }
      } else if (discountCodes.current[0].code.toUpperCase() != coupon) {
        if (promoInCartNoTierGWP == true) {
          //console.log('lineIdNoTierGWP ', lineIdNoTierGWP)
          applyCartLinesChange({
            type: "updateCartLine",
            id: lineIdNoTierGWP,
            quantity: 0,
          });               
        }
      }
    }


    if ((discountCodes.current == '')){
      if (promoInCartNoTierGWP == true) {
        //console.log('lineIdNoTierGWP ', lineIdNoTierGWP)
        applyCartLinesChange({
          type: "updateCartLine",
          id: lineIdNoTierGWP,
          quantity: 0,
        });               
      }    
    }
  } else {
    if (promoInCartNoTierGWP == true) {
      //console.log('lineIdNoTierGWP ', lineIdNoTierGWP)
      applyCartLinesChange({
        type: "updateCartLine",
        id: lineIdNoTierGWP,
        quantity: 0,
      });               
    }      
  }
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
  const { images, title, variants } = product;

  const renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);

  const imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  imageComponent.updateProps({ source: imageUrl });
  titleMarkup.updateText(title);
  addButtonComponent.updateProps({
    accessibilityLabel: `Add ${title} to cart,`,
  });
  priceMarkup.updateText(renderPrice);
  merchandise.id = variants.nodes[0].id;
}
