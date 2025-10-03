
import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from "remix-utils/cors";

// get request: accept request with request: customerId, shop, productId.
// read database and return giftwrap items for that customer.
export async function loader({ request }) {
  const url = new URL(request.url);
  const shopifyCustomerId = url.searchParams.get("shopifyCustomerId");
  const subscriptionIdString = url.searchParams.get("subscriptionIdString");
  console.log('shopifyCustomerId ', shopifyCustomerId)
  console.log('subscriptionIdString ', subscriptionIdString)

  if (!shopifyCustomerId || !subscriptionIdString) {
    return json({
      message: "Missing data. Required data: customerId, productId, shop",
      method: "GET",
    });
  }

  // If customerId, shop, productId is provided, return giftwrap items for that customer.
  const subscriptionData = await db.subscriptionData.findMany({
    where: {
      subscriptionIdString: subscriptionIdString,
      shopifyCustomerId: shopifyCustomerId,
    },
  });
  console.log('subscriptionData ', subscriptionData)
  var subscriptionDataUpdated = JSON.stringify(subscriptionData, (key, value) =>
    typeof value === "bigint" ? Number(value) : value,
  );

  const response = json({
    ok: true,
    message: "Success",
    data: subscriptionDataUpdated,
  });

  return cors(request, response);
}

// Expexted data comes from post request. If
// customerID, productID, shop
export async function action({ request }) {
    let data = await request.formData();
    data = Object.fromEntries(data);
    console.log(data)
    const assignedPricingPolicy = data.assignedPricingPolicy
    const billingPolicy = data.billingPolicy
    const createdAt = data.createdAt
    const currencyCode = data.currencyCode
    const customAttributes = data.customAttributes
    const customer = data.customer
    const customerLtv = data.customerLtv
    const customerPaymentMethod = data.customerPaymentMethod
    const deliveryMethod = data.deliveryMethod
    const deliveryPrice = data.deliveryPrice
    const discounts = data.discounts
    const isInDunning = data.isInDunning
    const lastChargeDate = data.lastChargeDate
    const lineCount = data.lineCount
    const lines = data.lines
    const nextBillingDate = data.nextBillingDate
    const scheduledBillingDate = data.scheduledBillingDate
    const sellingPlanGroupData = data.sellingPlanGroupData
    const shopifyCustomerId = data.shopifyCustomerId
    const shopifyCustomerEmail = data.shopifyCustomerEmail
    const shopifyOrders = data.shopifyOrders
    const status = data.status
    const subscriptionId = data.subscriptionId
    const subscriptionIdString = data.subscriptionIdString
    const subscriptionLtv = data.subscriptionLtv
    const updatedAt = data.updatedAt
    const _action = data._action

    if (!shopifyCustomerId || !subscriptionIdString || !_action) {
        return json({
            message:
            "Missing data. Required data: customerId, productId, shop, _action",
            method: _action,
        });
    }

  let response;

  switch (_action) {
    case "CREATE":
      // Handle POST request logic here
      // For example, adding a new item to the giftwrap
    //   const subscriptionData = await db.subscriptionData.create({
      const subscriptionData = await db.subscriptionData.upsert({  
        where: { subscriptionIdString: subscriptionIdString},
        update: {
          assignedPricingPolicy: assignedPricingPolicy,
          billingPolicy: billingPolicy,
          createdAt: createdAt,
          currencyCode: currencyCode,
          customAttributes: customAttributes,
          customer: customer,
          customerLtv: customerLtv,
          customerPaymentMethod: customerPaymentMethod,
          deliveryMethod: deliveryMethod,
          deliveryPrice: deliveryPrice,
          discounts: discounts,
          isInDunning: isInDunning,
          lastChargeDate: lastChargeDate,
          lineCount: lineCount,
          lines: lines,
          nextBillingDate: nextBillingDate,
          scheduledBillingDate: scheduledBillingDate,
          sellingPlanGroupData: sellingPlanGroupData,
          shopifyCustomerId: shopifyCustomerId,
          shopifyCustomerEmail: shopifyCustomerEmail,
          shopifyOrders: shopifyOrders,
          status: status,
          subscriptionId: subscriptionId,
          subscriptionIdString: subscriptionIdString,
          subscriptionLtv: subscriptionLtv,
          updatedAt: updatedAt,
        },
        create: {
          assignedPricingPolicy: assignedPricingPolicy,
          billingPolicy: billingPolicy,
          createdAt: createdAt,
          currencyCode: currencyCode,
          customAttributes: customAttributes,
          customer: customer,
          customerLtv: customerLtv,
          customerPaymentMethod: customerPaymentMethod,
          deliveryMethod: deliveryMethod,
          deliveryPrice: deliveryPrice,
          discounts: discounts,
          isInDunning: isInDunning,
          lastChargeDate: lastChargeDate,
          lineCount: lineCount,
          lines: lines,
          nextBillingDate: nextBillingDate,
          scheduledBillingDate: scheduledBillingDate,
          sellingPlanGroupData: sellingPlanGroupData,
          shopifyCustomerId: shopifyCustomerId,
          shopifyCustomerEmail: shopifyCustomerEmail,
          shopifyOrders: shopifyOrders,
          status: status,
          subscriptionId: subscriptionId,
          subscriptionIdString: subscriptionIdString,
          subscriptionLtv: subscriptionLtv,
          updatedAt: updatedAt,
        }
      })

      response = json({
        message: "Product added to giftwrap",
        method: _action,
        open: true,
      });
      return cors(request, response);

    case "PATCH":
      // Handle PATCH request logic here
      // For example, updating an existing item in the giftwrap
      await db.subscriptionData.update({
        where: {
          subscriptionIdString: subscriptionIdString,
        },
        data: {
          status: status,
        },
      })      
      return json({ message: "Success", method: "Patch" });
      //return cors(request, response);

    case "DELETE":
      // Handle DELETE request logic here (Not tested)
      // For example, removing an item from the giftwrap
      await db.subscriptionData.deleteMany({
        where: {
          customerId: shopifyCustomerId,
          serializedId: serializedId,
        },
      });

      response = json({
        message: "Product removed from your giftwrap",
        method: _action,
        open: false,
      });
      return cors(request, response);

    default:
      // Optional: handle other methods or return a method not allowed response
      return new Response("Method Not Allowed", { status: 405 });
  }
}