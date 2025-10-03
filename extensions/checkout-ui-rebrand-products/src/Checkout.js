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

    console.log('attributes ', attributes)
    console.log('discountCodes ', discountCodes)
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

      const productsOnOffer = addRebrandAttributes(lines, applyCartLinesChange);

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

function addRebrandAttributes(lines, applyCartLinesChange) {
  for (var x=0; x < lines.current.length; x++){
      if (lines.current[x].attributes.length > 0) {
        var array = lines.current[x].attributes;
        var objectToCheck = { key: "_product_type", value: "rebrand" };
        
        var objectExists = array.some(obj => obj.key === objectToCheck.key);
          if (!objectExists) {
            console.log('Object does not exists in the array');
            lines.current[x].attributes.push({ key: "_product_type", value: "rebrand" })
            applyCartLinesChange({
              type: "updateCartLine",
              id: lines.current[x].id,
              quantity: lines.current[x].quantity,
              attributes: lines.current[x].attributes
            });
          } else {
              // Object exists in the array
              console.log('Object exists in the array');
          }  
      } else {
        lines.current[x].attributes.push({ key: "_product_type", value: "rebrand" })
        applyCartLinesChange({
          type: "updateCartLine",
          id: lines.current[x].id,
          quantity: lines.current[x].quantity,
          attributes: lines.current[x].attributes
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
