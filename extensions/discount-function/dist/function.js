// node_modules/@shopify/shopify_function/run.ts
function run_default(userfunction) {
  const input_obj = Javy.JSON.fromStdin();
  const output_obj = userfunction(input_obj);
  Javy.JSON.toStdout(output_obj);
}

// extensions/discount-function/src/cart_lines_discounts_generate_run.js
function cartLinesDiscountsGenerateRun(input) {
  if (!input.cart.lines.length) {
    throw new Error("No cart lines found");
  }
  const { cartLinePercentage, orderPercentage, collectionIds } = parseMetafield(
    input.discount.metafield
  );
  const hasOrderDiscountClass = input.discount.discountClasses.includes(
    "ORDER" /* Order */
  );
  const hasProductDiscountClass = input.discount.discountClasses.includes(
    "PRODUCT" /* Product */
  );
  if (!hasOrderDiscountClass && !hasProductDiscountClass) {
    return { operations: [] };
  }
  const operations = [];
  if (hasProductDiscountClass && cartLinePercentage > 0) {
    const cartLineTargets = input.cart.lines.reduce((targets, line) => {
      if ("product" in line.merchandise && (line.merchandise.product.inAnyCollection || collectionIds.length === 0)) {
        targets.push({
          cartLine: {
            id: line.id
          }
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
                  value: cartLinePercentage
                }
              }
            }
          ],
          selectionStrategy: "FIRST" /* First */
        }
      });
    }
  }
  if (hasOrderDiscountClass && orderPercentage > 0) {
    operations.push({
      orderDiscountsAdd: {
        candidates: [
          {
            message: `${orderPercentage}% OFF ORDER`,
            targets: [
              {
                orderSubtotal: {
                  excludedCartLineIds: []
                }
              }
            ],
            value: {
              percentage: {
                value: orderPercentage
              }
            }
          }
        ],
        selectionStrategy: "FIRST" /* First */
      }
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
      collectionIds: value.collectionIds || []
    };
  } catch (error) {
    console.error("Error parsing metafield", error);
    return {
      cartLinePercentage: 0,
      orderPercentage: 0,
      collectionIds: []
    };
  }
}

// extensions/discount-function/src/cart_delivery_options_discounts_generate_run.js
function cartDeliveryOptionsDiscountsGenerateRun(input) {
  const firstDeliveryGroup = input.cart.deliveryGroups[0];
  if (!firstDeliveryGroup) {
    throw new Error("No delivery groups found");
  }
  const { deliveryPercentage } = parseMetafield2(input.discount.metafield);
  const hasShippingDiscountClass = input.discount.discountClasses.includes(
    "SHIPPING" /* Shipping */
  );
  console.log(input.discount.discountClasses);
  console.log(JSON.stringify(input.discount.metafield));
  if (!hasShippingDiscountClass) {
    return { operations: [] };
  }
  var containsSubscription = false;
  var cartTotalGreaterThanFifty = parseFloat(input.cart.cost.totalAmount.amount) > 49.99 ? true : false;
  var domesticShipping = false;
  if (input.cart.deliveryGroups[0].deliveryAddress != null) {
    domesticShipping = input.cart.deliveryGroups[0].deliveryAddress.countryCode == "US" ? true : false;
  }
  var executeOperations = false;
  for (var i = 0; i < input.cart.lines.length; i++) {
    if (input.cart.lines[i].sellingPlanAllocation != null) {
      containsSubscription = true;
    }
  }
  if (input.cart.method != null) {
    containsSubscription = true;
  }
  if (domesticShipping) {
    if (containsSubscription) {
      executeOperations = true;
    }
    if (cartTotalGreaterThanFifty) {
      executeOperations = true;
    }
  }
  const operations = [];
  if (hasShippingDiscountClass && deliveryPercentage > 0 && executeOperations) {
    operations.push({
      deliveryDiscountsAdd: {
        candidates: [
          {
            message: `Free Shipping!`,
            targets: [
              {
                deliveryGroup: {
                  id: firstDeliveryGroup.id
                }
              }
            ],
            value: {
              percentage: {
                value: deliveryPercentage
              }
            }
          }
        ],
        selectionStrategy: "ALL" /* All */
      }
    });
  }
  return { operations };
}
function parseMetafield2(metafield) {
  try {
    const value = JSON.parse(metafield.value);
    return { deliveryPercentage: value.deliveryPercentage || 0 };
  } catch (error) {
    console.error("Error parsing metafield", error);
    return { deliveryPercentage: 0 };
  }
}

// <stdin>
function cartLinesDiscountsGenerateRun2() {
  return run_default(cartLinesDiscountsGenerateRun);
}
function cartDeliveryOptionsDiscountsGenerateRun2() {
  return run_default(cartDeliveryOptionsDiscountsGenerateRun);
}
export {
  cartDeliveryOptionsDiscountsGenerateRun2 as cartDeliveryOptionsDiscountsGenerateRun,
  cartLinesDiscountsGenerateRun2 as cartLinesDiscountsGenerateRun
};
