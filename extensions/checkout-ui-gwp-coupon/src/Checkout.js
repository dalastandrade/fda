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
    var l,y,x,w,v,u,t,s,r,q
    l = lines;
    y = applyCartLinesChange
    x = query
    w = i18n
    v = attributes
    u = discountCodes
    t = settings
    
    let p = [];
    let loading = true;
    let appRendered = false;

    // Fetch products from the server
    couponCode(query).then((fetchedProducts) => {
      p = fetchedProducts;
      loading = false;
      renderApp();
    });

    l.subscribe(() => renderApp());

    const loadingState = createLoadingState(root);
    if (loading) {
      root.appendChild(loadingState);
    }

    const { imageComponent, titleMarkup, priceMarkup, merchandise } =
      createProductComponents(root);
    const addButtonComponent = createAddButtonComponent(
      root,
      y,
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

      if (!loading && p.length === 0) {
        root.removeChild(loadingState);
        return;
      }

      const productsOnOffer = offer(l, p, u, y, t);

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

function couponCode(query) {
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

function createAddButtonComponent(root, y, merchandise) {
  return root.createComponent(
    Button,
    {
      kind: "secondary",
      loading: false,
      onPress: async () => {
        await handleAddButtonPress(root, y, merchandise);
      },
    },
    ["Add"]
  );
}

async function handleAddButtonPress(root, y, merchandise) {
  const result = await y({
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

function offer(l, p, u, y, t) {
  console.log('t', t)
  console.log('t.current.o ', t.current.o)
  var z =  JSON.parse(t.current.o)
  console.log('z ', z)
  var q = 0; 

  for (var i=0; i < z.length; i++){
      z[i]['a'] = false
      z[i]['b'] = 0;
      z[i]['c'] = 0;
      z[i]['d'] = '';
  
      z[i]['e'] = '';
      z[i]['f'] = false
      z[i]['g'] = z[i].v
      z[i]['h'] = z[i].k
      z[i]['i'] = z[i].q
      z[i]['j'] = z[i].s
      for (var x = 0; x < l.current.length; x++) {
        if (!l.current[x].merchandise.id.includes(z[i].g)){
            q += l.current[x].quantity
        }
    
        if (l.current[x].merchandise.id.includes(z[i].g)) {
          z[i].d = l.current[x].id
          z[i].a = true;
          z[i].b = l.current[x].quantity         
        }    
        
        if (l.current[x].merchandise.sellingPlan != undefined){
          if (!l.current[x].merchandise.sellingPlan.id.includes(2972057698)) {
            z[i].f = true;
          }
        }
      }      
      if (q >= 1) {
        z[i].c = parseInt(z[i].i)
      }
    
      z[i].e = z[i].b != z[i].c ? true : false;
    
      if (z[i].j == 'N') {
        nSR(z[i].g, z[i].a, z[i].b, z[i].c, z[i].d, z[i].e, u, z[i].h, y)
      }
      if (z[i].j == 'Y') {
        sR(z[i].g, z[i].a, z[i].b, z[i].c, z[i].d, z[i].e, z[i].f, u, z[i].h, y)
      }
      
  }



  const cartLineProductVariantIds = l.current.map(
    (item) => item.merchandise.id
  );
  return p.filter((product) => {
    const isProductVariantInCart = product.variants.nodes.some(({ id }) =>
      cartLineProductVariantIds.includes(id)
    );
    return !isProductVariantInCart;
  });
}

function nSR(m, a, b, c, d, e, u, h, y) {
  if (u.current[0] != undefined ){
    if (u.current[0].code.toUpperCase() == h) {
      if (e){
        if (a){
            y({
                type: "updateCartLine",
                id: d,
                quantity: c,
            });
        } else {
            y({
                type: "addCartLine",
                merchandiseId: "gid://shopify/ProductVariant/" + m,
                quantity: 1,
            });
        }
      }
    } else if (u.current[0].code.toUpperCase() != h) {
      if (a == true) {
        y({
          type: "updateCartLine",
          id: d,
          quantity: 0,
        });               
      }
    }
  }
  if ((u.current == '')){
    if (a == true) {
      y({
        type: "updateCartLine",
        id: d,
        quantity: 0,
      });               
    }    
  }
}

function sR(m, a, b, c, d, e, f, u, h, y) {

  if (f) {
    if (u.current[0] != undefined ){
      if (u.current[0].code.toUpperCase() == h) {
        if (e){
          if (a){
              y({
                  type: "updateCartLine",
                  id: d,
                  quantity: c,
              });
          } else {
              y({
                  type: "addCartLine",
                  merchandiseId: "gid://shopify/ProductVariant/" + m,
                  quantity: 1,
              });
          }
        }
      } else if (u.current[0].code.toUpperCase() != h) {
        if (a == true) {
          y({
            type: "updateCartLine",
            id: d,
            quantity: 0,
          });               
        }
      }
    }


    if ((u.current == '')){
      if (a == true) {
        y({
          type: "updateCartLine",
          id: d,
          quantity: 0,
        });               
      }    
    }
  } else {
    if (a == true) {
      y({
        type: "updateCartLine",
        id: d,
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
