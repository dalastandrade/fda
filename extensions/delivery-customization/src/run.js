// @ts-check

// Use JSDoc annotations for type safety
/**
* @typedef {import("../generated/api").RunInput} RunInput
* @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
* @typedef {import("../generated/api").Operation} Operation
*/

// The configured entrypoint for the 'purchase.delivery-customization.run' extension target
/**
* @param {RunInput} input
* @returns {FunctionRunResult}
*/

const eligibleVariants = [46529415414056, 46529417347368, 47390367711528, 46529416757544, 40983157538864, 40983158259760, 41804925435952]
var containsSubscription = false;
var targets = [];
var eligibleItems = 0;
var totalCost = 0;``
var toHide = []
var domesticShipping = false;

export function run(input) {
  
  for (var i=0; i < input.cart.deliveryGroups.length; i++){
    for (var ii=0; ii < input.cart.deliveryGroups[i].deliveryOptions.length; ii++) {
      console.log(input.cart.deliveryGroups[i].deliveryOptions[ii].title)
      if (input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Expedited")){
        toHide.push({"hide": {"deliveryOptionHandle": input.cart.deliveryGroups[i].deliveryOptions[ii].handle}})
      }
    }
  } 

  // The @shopify/shopify_function package applies JSON.stringify() to your function result
  // and writes it to STDOUT
  return {
    operations: toHide
  };
};