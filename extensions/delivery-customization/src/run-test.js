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
var totalCost = 0;
var toHide = []
var domesticShipping = false;
var containsTryNow = false;
var cartTotalGreaterThanFifty = false;

export function run(input) {
  if (parseFloat(input.cart.cost.totalAmount.amount) > 49.99) {
    cartTotalGreaterThanFifty = true
  }
  for (var i=0; i < input.cart.lines.length; i++){
    if (input.cart.lines[i].sellingPlanAllocation != null) {
      containsSubscription = true;
    }
    if ((input.cart.lines[i].tryNow != null) || (input.cart.lines[i].tryNow == 'true') ){
      containsTryNow = true;
    }
  }

  if (input.cart.deliveryGroups[0].deliveryAddress.countryCode == "US"){
    domesticShipping = true;
  }

  if (input.cart.method != null){
    containsSubscription = true;
  }
  if (containsTryNow) {
    containsSubscription = false;
  }

  // if (containsSubscription) {
  //   console.log('containsSubscription ', containsSubscription)
  //   if (parseFloat(input.cart.cost.totalAmount.amount) > 50) {
  //     for (var i=0; i < input.cart.deliveryGroups.length; i++){
  //       for (var ii=0; ii < input.cart.deliveryGroups[i].deliveryOptions.length; ii++) {
  //         if (input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Ground")){
  //           toHide.push({"hide": {"deliveryOptionHandle": input.cart.deliveryGroups[i].deliveryOptions[ii].handle}})
  //         }
  //       }
  //     } 
  //   }
  // }
  if (containsSubscription) {
    if (domesticShipping) {
      for (var i=0; i < input.cart.deliveryGroups.length; i++){
        for (var ii=0; ii < input.cart.deliveryGroups[i].deliveryOptions.length; ii++) {
          if ((input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Ground")) || input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Standard")){
            toHide.push({"hide": {"deliveryOptionHandle": input.cart.deliveryGroups[i].deliveryOptions[ii].handle}})
          }
        }
      } 
    }
    if (!domesticShipping) {
      for (var i=0; i < input.cart.deliveryGroups.length; i++){
        for (var ii=0; ii < input.cart.deliveryGroups[i].deliveryOptions.length; ii++) {
          if (input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Shipping")){
            toHide.push({"hide": {"deliveryOptionHandle": input.cart.deliveryGroups[i].deliveryOptions[ii].handle}})
          }
        }
      } 
    }
  }

  if (!containsSubscription) {
    if(cartTotalGreaterThanFifty){
      if (containsTryNow) {
        if (domesticShipping) {
          for (var i=0; i < input.cart.deliveryGroups.length; i++){
            for (var ii=0; ii < input.cart.deliveryGroups[i].deliveryOptions.length; ii++) {
              if (input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Free")){
                toHide.push({"hide": {"deliveryOptionHandle": input.cart.deliveryGroups[i].deliveryOptions[ii].handle}})
              }
            }
          } 
        }
        if (!domesticShipping) {
          for (var i=0; i < input.cart.deliveryGroups.length; i++){
            for (var ii=0; ii < input.cart.deliveryGroups[i].deliveryOptions.length; ii++) {
              if (input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Delivery")){
                toHide.push({"hide": {"deliveryOptionHandle": input.cart.deliveryGroups[i].deliveryOptions[ii].handle}})
              }
            }
          } 
        }
      } else {
        if (domesticShipping) {
          for (var i=0; i < input.cart.deliveryGroups.length; i++){
            for (var ii=0; ii < input.cart.deliveryGroups[i].deliveryOptions.length; ii++) {
              if ((input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Ground")) || input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Standard")){
                toHide.push({"hide": {"deliveryOptionHandle": input.cart.deliveryGroups[i].deliveryOptions[ii].handle}})
              }
            }
          } 
        }
        if (!domesticShipping) {
          for (var i=0; i < input.cart.deliveryGroups.length; i++){
            for (var ii=0; ii < input.cart.deliveryGroups[i].deliveryOptions.length; ii++) {
              if (input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Shipping")){
                toHide.push({"hide": {"deliveryOptionHandle": input.cart.deliveryGroups[i].deliveryOptions[ii].handle}})
              }
            }
          } 
        }      
      }
    } else {
      if (domesticShipping) {
        for (var i=0; i < input.cart.deliveryGroups.length; i++){
          for (var ii=0; ii < input.cart.deliveryGroups[i].deliveryOptions.length; ii++) {
            if (input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Free")){
              toHide.push({"hide": {"deliveryOptionHandle": input.cart.deliveryGroups[i].deliveryOptions[ii].handle}})
            }
          }
        } 
      }
      if (!domesticShipping) {
        for (var i=0; i < input.cart.deliveryGroups.length; i++){
          for (var ii=0; ii < input.cart.deliveryGroups[i].deliveryOptions.length; ii++) {
            if (input.cart.deliveryGroups[i].deliveryOptions[ii].title.includes("Delivery")){
              toHide.push({"hide": {"deliveryOptionHandle": input.cart.deliveryGroups[i].deliveryOptions[ii].handle}})
            }
          }
        } 
      }
    }
  }

  // The @shopify/shopify_function package applies JSON.stringify() to your function result
  // and writes it to STDOUT
  return {
    operations: toHide
  };
};