import React, { useEffect, useState, useRef } from "react";
import {
  reactExtension,
  Divider,
  Image,
  Banner,
  Heading,
  Button,
  InlineLayout,
  BlockStack,
  Text,
  SkeletonText,
  SkeletonImage,
  useCartLines,
  useApplyCartLinesChange,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
// Set up the entry point for the extension
export default reactExtension("purchase.checkout.block.render", () => <App />);

function App() {
  const { query, i18n } = useApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showError, setShowError] = useState(false);
  const lines = useCartLines();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  
  // Start Countdown
  let [timerClock, setTimerClock] = useState(900);                         
  let [timerClockMinutes, setTimerClockMinutes] = useState(15);                         
  let [timerClockSeconds, setTimerClockSeconds] = useState(0o0);    
  let [formattedTimerClockSeconds, setFormattedTimerClockSeconds] = useState('00');                         
  let [formattedString, setFormattedString] = useState('We are reserving your cart for 15:00 minutes!');                         
                     
  useEffect(() => {
    const timerNew = setTimeout(function() {
        //console.log("minus: ", timerClock)
        if (timerClock >= 0) {
          setTimerClock(timerClock - 1);
        }
        timerClockMinutes = Math.floor(timerClock / 60);
        //console.log("minutes: ", timerClockMinutes)
        setTimerClockMinutes(timerClockMinutes);
        timerClockSeconds = timerClock - timerClockMinutes * 60;
        //console.log("seconds: ", timerClockSeconds)
        //console.log("timerClockSeconds.toString(): ", timerClockSeconds.toString())
        formattedTimerClockSeconds = timerClockSeconds.toString()
        //console.log("formatted seconds: ", formattedTimerClockSeconds)
        if (timerClock > 0) {
          if (timerClockSeconds >= 10) {
            //console.log('greater than or equal to 10 seconds ', timerClockSeconds)
            //console.log('greater than or equal to 10 seconds ', formattedTimerClockSeconds)
            const numberString = timerClockSeconds.toString();
            setFormattedTimerClockSeconds(numberString);
            const textString = 'We are reserving your cart for ' + timerClockMinutes.toString() + ':' + timerClockSeconds.toString() + ' minutes!'; 
            setFormattedString(textString)
          } else if (timerClockSeconds <= 9) {
            //console.log('under 9 seconds ', timerClockSeconds)
            const numberString = "0" + timerClockSeconds.toString();
            formattedTimerClockSeconds = numberString
            setFormattedTimerClockSeconds(formattedTimerClockSeconds);
            //console.log('under 9 seconds ', formattedTimerClockSeconds)
            const textString = 'We are reserving your cart for ' + timerClockMinutes.toString() + ':' + formattedTimerClockSeconds + ' minutes!'; 
            setFormattedString(textString)
          }
        } else if (timerClock < 0){
          setFormattedString("Check out now so you don't lose your cart!")
          clearTimeout(timerNew)
        }
        setTimerClockSeconds(timerClockSeconds)
        setFormattedTimerClockSeconds(formattedTimerClockSeconds);
    }, 1000)

    return () => { // this should work flawlessly besides some milliseconds lost here and there 
       clearTimeout(timerNew)
       //console.log('clearTimeout timerNew')
    }
   }, [timerClock]);
  // End Countdown

    async function handleAddToCart(variantId) {
      setAdding(true);
      const result = await applyCartLinesChange({
        type: 'addCartLine',
        merchandiseId: variantId,
        quantity: 1,
      });
      setAdding(false);
      if (result.type === 'error') {
        setShowError(true);
        console.error(result.message);
      }
    }

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data } = await query(
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
      );
      setProducts(data.products.nodes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!loading && products.length === 0) {
    return null;
  }

  const productsOnOffer = getProductsOnOffer(lines, products);

  if (!productsOnOffer.length) {
    return null;
  }


  return (
    <ProductOffer
      product={productsOnOffer[0]}
      i18n={i18n}
      adding={adding}
      handleAddToCart={handleAddToCart}
      showError={showError}
      timerClock={timerClock}
      timerClockMinutes={timerClockMinutes}
      timerClockSeconds={timerClockSeconds}
      formattedTimerClockSeconds={formattedTimerClockSeconds}
      formattedString={formattedString}
    />
  );
}

function LoadingSkeleton() {
  return (
    <BlockStack spacing='loose'>
      <Divider />
      <Heading level={3}>We are reserving your cart for 15:00 minutes!</Heading>
    </BlockStack>
  );
}

function getProductsOnOffer(lines, products) {
  const cartLineProductVariantIds = lines.map((item) => item.merchandise.id);
  return products.filter((product) => {
    const isProductVariantInCart = product.variants.nodes.some(({ id }) =>
      cartLineProductVariantIds.includes(id)
    );
    return !isProductVariantInCart;
  });
}

function ProductOffer({ product, i18n, adding, handleAddToCart, showError, timerClock, timerClockMinutes, timerClockSeconds, formattedTimerClockSeconds, formattedString }) {
  const { images, title, variants } = product;
  const renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);
  const imageUrl =
    images.nodes[0]?.url ??
    'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081';

  return (
    <BlockStack spacing='loose'>
      <Heading level={3} inlineAlignment='center'>{formattedString}</Heading>
      {showError && <ErrorBanner />}
    </BlockStack>
  );
}

function ErrorBanner() {
  return (
    <Banner status='critical'>
      There was an issue adding this product. Please try again.
    </Banner>
  );
}