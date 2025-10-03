import {
  OrderDiscountSelectionStrategy,
  ProductDiscountSelectionStrategy,
  DiscountClass,
} from "../generated/api";

export function cartLinesDiscountsGenerateRun(input) {
  if (!input.cart.lines.length) {
    throw new Error("No cart lines found");
  }

  const { cartLinePercentage, orderPercentage, collectionIds } = parseMetafield(
    input.discount.metafield,
  );

  const hasOrderDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Order,
  );
  const hasProductDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Product,
  );

  if (!hasOrderDiscountClass && !hasProductDiscountClass) {
    return { operations: [] };
  }

  const operations = [];
  // Add product discounts first if available and allowed
  if (hasProductDiscountClass && cartLinePercentage > 0) {
    const cartLineTargets = input.cart.lines.reduce((targets, line) => {
      if (
        "product" in line.merchandise &&
        (line.merchandise.product.inAnyCollection || collectionIds.length === 0)
      ) {
        targets.push({
          cartLine: {
            id: line.id,
          },
        });
      }
      return targets;
    }, []);

    if (cartLineTargets.length > 0) {
      operations.push({
        productDiscountsAdd: {
          candidates: [
            {
              message: `${cartLinePercentage}% OFF PRODUCT`,
              targets: cartLineTargets,
              value: {
                percentage: {
                  value: cartLinePercentage,
                },
              },
            },
          ],
          selectionStrategy: ProductDiscountSelectionStrategy.First,
        },
      });
    }
  }

  // Then add order discounts if available and allowed
  if (hasOrderDiscountClass && orderPercentage > 0) {
    operations.push({
      orderDiscountsAdd: {
        candidates: [
          {
            message: `${orderPercentage}% OFF ORDER`,
            targets: [
              {
                orderSubtotal: {
                  excludedCartLineIds: [],
                },
              },
            ],
            value: {
              percentage: {
                value: orderPercentage,
              },
            },
          },
        ],
        selectionStrategy: OrderDiscountSelectionStrategy.First,
      },
    });
  }

  return { operations };
}

function parseMetafield(metafield) {
  try {
    const value = JSON.parse(metafield.value);
    return {
      cartLinePercentage: value.cartLinePercentage || 0,
      orderPercentage: value.orderPercentage || 0,
      collectionIds: value.collectionIds || [],
    };
  } catch (error) {
    console.error("Error parsing metafield", error);
    return {
      cartLinePercentage: 0,
      orderPercentage: 0,
      collectionIds: [],
    };
  }
}
