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

const eligibleVariants = [32050881855586, 39463608516706, 39271491731554, 39463537737826, 40616091156578, 40815626551394, 40721859084386, 40911397093474, 40645903548514, 40815640871010, 40721867112546, 40918780641378, 41548237275234, 41550219477090, 41548415041634, 41550215282786, 41869557334114, 41875235733602, 41898168549474, 41898189389922, 41898193584226, 41898190766178, 42056888418402]
var discountPercentage = '0.0';
var containsSubscription = false;
var targets = [];
var eligibleItems = 0;
var skipTiers = false


export function run(input) {
  // for (var i=0; i < input.cart.lines.length; i++){
  //   //console.log(input.cart.lines[i])
  //   for (var ii=0; ii < eligibleVariants.length; ii++){
  //       if (input.cart.lines[i].merchandise.id.includes(eligibleVariants[ii])) {
  //           console.log(JSON.stringify(input.cart.lines[i]))
  //           targets.push({"cartLine":{"id":input.cart.lines[i].id}},)
  //           eligibleItems += input.cart.lines[i].quantity;
  //       }
  //       if (input.cart.lines[i].sellingPlanAllocation != null) {
  //         containsSubscription = true;
  //       }
  //   }
  // }
  for (var i=0; i < input.cart.lines.length; i++){
    console.log('input.cart.lines[i] ', input.cart.lines[i])
    for (var ii=0; ii < eligibleVariants.length; ii++){
      if (input.cart.lines[i].merchandise.id.includes(eligibleVariants[ii])) {
        if ((input.cart.lines[i].threeMonth == null) || (input.cart.lines[i].threeMonth?.value == 'false')){ 
          if ((input.cart.lines[i].fullPrice == null) || (input.cart.lines[i].fullPrice?.value == 'false')){
              console.log(JSON.stringify(input.cart.lines[i]))
              targets.push({"cartLine":{"id":input.cart.lines[i].id}},)
              eligibleItems += input.cart.lines[i].quantity;
          }
          if ((input.cart.lines[i].fullPrice != null) || (input.cart.lines[i].fullPrice?.value == 'true')){
            if ((input.cart.lines[i].discount?.value == '15.0') || (input.cart.lines[i].discount?.value == '15')){
              skipTiers = true;
              discountPercentage = '15.0'
              targets.push({"cartLine":{"id":input.cart.lines[i].id}},)
              eligibleItems += input.cart.lines[i].quantity;            
            }
            // if (input.cart.lines[i].discount == null){
            //   skipTiers = true;
            //   discountPercentage = '0.0'
            //   targets.push({"cartLine":{"id":input.cart.lines[i].id}},)
            //   eligibleItems += input.cart.lines[i].quantity;              
            // }
          }
          if ((input.cart.lines[i].sellingPlanAllocation != null) && (input.cart.lines[i].sellingPlanAllocation.sellingPlan.id == "gid://shopify/SellingPlan/2882076770")){
            containsSubscription = true;
          }
          if ((input.cart.lines[i].sellingPlanAllocation != null) && (input.cart.lines[i].sellingPlanAllocation.sellingPlan.id == "gid://shopify/SellingPlan/2972057698")){
            //containsSubscription = true;
          }
        }
        // if ((input.cart.lines[i].sellingPlanAllocation != null) && (input.cart.lines[i].sellingPlanAllocation.sellingPlan.id == "gid://shopify/SellingPlan/2961703010")){
        //   eligibleItems -= input.cart.lines[i].quantity; 
        // }
      }
    }
  }  
 
  //var lineLength = input.cart.lines.length
if(skipTiers == false){
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
}
  
 
  if (!targets.length) {
    // You can use STDERR for debug logs in your function
    console.error("No cart lines qualify for volume discount.");
    return EMPTY_DISCOUNT;
  }

  if ((eligibleItems == 1) && (containsSubscription == false)){
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
}
