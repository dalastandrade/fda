import {
  DeliveryDiscountSelectionStrategy,
  DiscountClass,
} from "../generated/api";

export function cartDeliveryOptionsDiscountsGenerateRun(input) {
  const firstDeliveryGroup = input.cart.deliveryGroups[0];
  if (!firstDeliveryGroup) {
    throw new Error("No delivery groups found");
  }

  const { deliveryPercentage } = parseMetafield(input.discount.metafield);
  const hasShippingDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Shipping,
  );
  console.log(input.discount.discountClasses)
  console.log(JSON.stringify(input.discount.metafield))
  if (!hasShippingDiscountClass) {
    return { operations: [] };
  }

  var containsSubscription = false;
  var cartTotalGreaterThanFifty = parseFloat(input.cart.cost.totalAmount.amount) > 49.99 ? true : false;
  var domesticShipping = false;
  if (input.cart.deliveryGroups[0].deliveryAddress != null) { 
    domesticShipping = input.cart.deliveryGroups[0].deliveryAddress.countryCode == "US" ? true: false;
  }
  var executeOperations = false;

  for (var i=0; i < input.cart.lines.length; i++){
    if (input.cart.lines[i].sellingPlanAllocation != null) {
      containsSubscription = true;
    }
  }

  if (input.cart.method != null){
    containsSubscription = true;
  }
  
  if (domesticShipping) {
    if (containsSubscription) {
      executeOperations = true
    }
    if (cartTotalGreaterThanFifty) {
      executeOperations = true
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
                  id: firstDeliveryGroup.id,
                },
              },
            ],
            value: {
              percentage: {
                value: deliveryPercentage,
              },
            },
          },
        ],
        selectionStrategy: DeliveryDiscountSelectionStrategy.All,
      },
    });
  }
  return { operations };
}

function parseMetafield(metafield) {
  try {
    const value = JSON.parse(metafield.value);
    return { deliveryPercentage: value.deliveryPercentage || 0 };
  } catch (error) {
    console.error("Error parsing metafield", error);
    return { deliveryPercentage: 0 };
  }
}
