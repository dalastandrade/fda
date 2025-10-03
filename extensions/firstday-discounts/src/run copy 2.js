// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").Target} Target
 * @typedef {import("../generated/api").ProductVariant} ProductVariant
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};
/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */

const eligibleVariants = [32050881855586, 39463608516706, 39271491731554, 39463537737826, 41898168549474, 40815626551394, 40721859084386, 40911397093474, 40645903548514, 40815640871010, 40721867112546, 40918780641378]
var discountPercentage = '0.0';
var containsSubscription = false;
var targets = [];
var eligibleItems = 0;


export function run(input) {
  if (input.cart.buyerIdentity != null) {
    if (input.cart.buyerIdentity.customer?.hasAnyTag == true){
  for (var i=0; i < input.cart.lines.length; i++){
    //console.log(input.cart.lines[i])
    for (var ii=0; ii < eligibleVariants.length; ii++){
        if (input.cart.lines[i].merchandise.id.includes(eligibleVariants[ii])) {
            console.log(JSON.stringify(input.cart.lines[i]))
            targets.push({"cartLine":{"id":input.cart.lines[i].id}},)
            eligibleItems += input.cart.lines[i].quantity;
        }
        if (input.cart.lines[i].sellingPlanAllocation != null) {
          containsSubscription = true;
        }
    }
  }

  //var lineLength = input.cart.lines.length

  if (containsSubscription == true) {
    if (eligibleItems == 1) {
      discountPercentage = '15.0'
      //discountPercentage = '0.0'
    }
    if (eligibleItems == 2) {
      discountPercentage = '20.0'
    }
    if (eligibleItems == 3) {
      discountPercentage = '25.0'
    }
    if (eligibleItems >= 4) {
      discountPercentage = '30.0'
    }
  } else {
    if (eligibleItems == 1) {
      discountPercentage = '0.0'
    }
    if (eligibleItems == 2) {
      discountPercentage = '5.0'
    }
    if (eligibleItems == 3) {
      discountPercentage = '10.0'
    }
    if (eligibleItems >= 4) {
      discountPercentage = '15.0'
    }
  }
 
//  const targets = input.cart.lines
//    // Only include cart lines with a quantity of two or more
//    .filter(line => line.quantity >= 1 &&
//      line.merchandise.__typename == "ProductVariant" &&
//      line.merchandise.product.hasAnyTag == true)
//    .map((line) => {
//      return /** @type {Target} */ ({
//        // Use the cart line ID to create a discount target
//        cartLine: {
//          id: line.id,
//        },
//      });
//    });
//  if (!targets.length) {
//    // You can use STDERR for debug logs in your function
//    console.error("No cart lines qualify for volume discount.");
//    return EMPTY_DISCOUNT;
//  }
//  console.log('targets ', JSON.stringify(targets))
  if (!targets.length) {
    // You can use STDERR for debug logs in your function
    console.error("No cart lines qualify for volume discount.");
    return EMPTY_DISCOUNT;
  }

  console.log('targets ', JSON.stringify(targets))

  return {
    discounts: [
      {
        // Apply the discount to the collected targets
        targets,
        // Define a percentage-based discount
        value: {
          percentage: {
            value: discountPercentage,
          },
        },
      },
    ],
    discountApplicationStrategy: DiscountApplicationStrategy.First,
  };
    } else {
      console.error("Invalid customer.");
      return EMPTY_DISCOUNT;
    }
  } else {
    console.error("Invalid customer.");
    return EMPTY_DISCOUNT;
  }
}
