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
} from "@shopify/ui-extensions/checkout";
// Set up the entry point for the extension
export default extension(
  "purchase.checkout.block.render",
  (root, { lines, applyCartLinesChange, query, i18n }) => {
    let products = [];
    let loading = true;
    let appRendered = false;
    var productIds = ["gid://shopify/Product/4526304198754", "gid://shopify/Product/7252075380834", "gid://shopify/Product/6960192356450", "gid://shopify/Product/7338819256418", "gid://shopify/Product/7252123189346", "gid://shopify/Product/6610526765154", "gid://shopify/Product/7252590297186", "gid://shopify/Product/7338819780706", "gid://shopify/Product/6610494062690", "gid://shopify/Product/7252587642978", "gid://shopify/Product/7338820960354", "gid://shopify/Product/4538633814114", "gid://shopify/Product/7338812702818", "gid://shopify/Product/7338819256418", "gid://shopify/Product/7338820960354", "gid://shopify/Product/7338819780706",]
    //console.log('query ', query)

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
      merchandise
    );

    const app = createApp(
      root,
      imageComponent,
      titleMarkup,
      priceMarkup,
      addButtonComponent,
      imageComponentTwo,
      titleMarkupTwo,
      priceMarkupTwo,
      addButtonComponentTwo,
    );

    function renderApp() {
      if (loading) {
        return;
      }

      if (!loading && products.length === 0) {
        root.removeChild(loadingState);
        return;
      }

      const productsOnOffer = filterProductsOnOffer(lines, products);

      console.log('productsOnOffer ', productsOnOffer)
      console.log('productsOnOffer[0] ', productsOnOffer[0])


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
    root.createComponent(Heading, { level: 2 }, ["You might also like"]),
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
  const priceMarkup = root.createText("");
  const merchandise = { id: "" };
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
  const merchandiseTwo = { id: "" };

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
    ["Add"]
  );
}

async function handleAddButtonPress(root, applyCartLinesChange, merchandise) {
  console.log('merchandise.id ', merchandise.id)
  // const result = await applyCartLinesChange({
  //   type: "addCartLine",
  //   merchandiseId: merchandise.id,
  //   quantity: 1,
  //   sellingPlanId: 'gid://shopify/SellingPlan/2882076770',
  // });
  const result = await applyCartLinesChange({
    type: "updateCartLine",
    id: merchandise.id,
    sellingPlanId: 'gid://shopify/SellingPlan/2882076770',
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
  imageComponentTwo,
  titleMarkupTwo,
  priceMarkupTwo,
  addButtonComponentTwo
) {
  console.log('imageComponent ', imageComponent)
  console.log('titleMarkup ', titleMarkup)
  console.log('addButtonComponent ', addButtonComponent)
  console.log('priceMarkup ', priceMarkup)
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
            addButtonComponentTwo,
          ]
        ),
      ]),
    ]);
}

function filterProductsOnOffer(lines, products) {
  console.log('products ', products)
  console.log('lines ', lines)
  // const cartLineProductVariantIds = lines.current.map(
  //   (item) => item.merchandise.id
  // );
  // return products.filter((product) => {
  //   const isProductVariantInCart = product.variants.nodes.some(({ id }) =>
  //     cartLineProductVariantIds.includes(id)
  //   );
  //   return !isProductVariantInCart;
  // });
  var itemsWithoutSubscriptions = []
  for (var i=0; i < products.length; i++){
    for (var ii=0; ii < lines.current.length; ii++) {
      if (products[i].variants.nodes[0].id == lines.current[ii].merchandise.id) {
        if (lines.current[ii].merchandise.sellingPlan == undefined){
          products[i]["updateLineItem"] = lines.current[ii].id
          itemsWithoutSubscriptions.push(products[i])
        }
      }
    }
  }
  return itemsWithoutSubscriptions;
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
  console.log('product BlockStack ', product)

  var renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);

  var imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  imageComponent.updateProps({ source: imageUrl });
  titleMarkup.updateText(title);
  addButtonComponent.updateProps({
    accessibilityLabel: `Add ${title} to cart,`,
  });
  priceMarkup.updateText(renderPrice);
  //merchandise.id = variants.nodes[0].id;
  merchandise.id = product.updateLineItem;
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

  var renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);

  var imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";

  imageComponentTwo.updateProps({ source: imageUrl });
  titleMarkupTwo.updateText(title);
  addButtonComponentTwo.updateProps({
    accessibilityLabel: `Add ${title} to cart,`,
  });
  priceMarkupTwo.updateText(renderPrice);
  //merchandiseTwo.id = variants.nodes[0].id;
  merchandiseTwo.id = product.updateLineItem;
}

function removeProductComponentsTwo(
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
  //merchandiseTwo.id = variants.nodes[0].id;
  merchandiseTwo.id = product.updateLineItem;
}
