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
  useSettings,
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
    />
  );
}

function LoadingSkeleton() {
  return (
    <BlockStack spacing='loose'>
      <Divider />
      <Heading level={2}>Why 600,000+ Customers Trust Us</Heading>
      <BlockStack spacing='loose'>
      </BlockStack>
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

function ProductOffer({showError }) {
  const {container_heading: checkoutBannerTitle, section_one_title: sectionOneTitle, section_one_description: sectionOneDescription, section_one_image: sectionOneImg, section_two_title: sectionTwoTitle, section_two_description: sectionTwoDescription, section_two_image: sectionTwoImg, section_three_title: sectionThreeTitle, section_three_description: sectionThreeDescription, section_three_image: sectionThreeImg  } = useSettings()

  const containerHeading = checkoutBannerTitle ?? 'Custom Banner';
  const secOneTitle = sectionOneTitle ?? 'Custom Title';
  const secOneDesc = sectionOneDescription ?? 'Custom Description';
  const secOneImg = sectionOneImg ?? 'https://placehold.co/200';
  const secTwoTitle = sectionTwoTitle ?? 'Custom Title';
  const secTwoDesc = sectionTwoDescription ?? 'Custom Description';
  const secTwoImg = sectionTwoImg ?? 'https://placehold.co/200';
  const secThreeTitle = sectionThreeTitle ?? 'Custom Title';
  const secThreeDesc = sectionThreeDescription ?? 'Custom Description';
  const secThreeImg = sectionThreeImg ?? 'https://placehold.co/200';


  return (
    <BlockStack spacing='loose'>
      <Divider />
      <Heading level={2} inlineAlignment='center'>{containerHeading}</Heading>
      <BlockStack spacing='loose'>
        <InlineLayout
          spacing='base'
          columns={[64, 'fill', 'auto']}
          blockAlignment='center'
        >
          <Image
            source={secOneImg}
            aspectRatio={1}
            fit='contain'
          />
          <BlockStack spacing='none'>
          <Heading level={2}>{secOneTitle}</Heading>
            <Text appearance='subdued'>{secOneDesc}</Text>
          </BlockStack>
        </InlineLayout>
      </BlockStack>
      <BlockStack spacing='loose'>
        <InlineLayout
          spacing='base'
          columns={[64, 'fill', 'auto']}
          blockAlignment='center'
        >
          <Image
            source={secTwoImg}
            aspectRatio={1}
            fit='contain'
          />
          <BlockStack spacing='none'>
          <Heading level={2}>{secTwoTitle}</Heading>
            <Text appearance='subdued'>{secTwoDesc}</Text>
          </BlockStack>
        </InlineLayout>
      </BlockStack>
      <BlockStack spacing='loose'>
        <InlineLayout
          spacing='base'
          columns={[64, 'fill', 'auto']}
          blockAlignment='center'
        >
          <Image
            source={secThreeImg}
            aspectRatio={1}
            fit='contain'
          />
          <BlockStack spacing='none'>
          <Heading level={2}>{secThreeTitle}</Heading>
            <Text appearance='subdued'>{secThreeDesc}</Text>
          </BlockStack>
        </InlineLayout>
      </BlockStack>      
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