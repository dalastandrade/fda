
import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from "remix-utils/cors";

// get request: accept request with request: customerId, shop, productId.
// read database and return giftwrap items for that customer.
export async function loader({ request }) {
  const url = new URL(request.url);
  const shopifyCustomerId = url.searchParams.get("shopifyCustomerId");
  console.log('shopifyCustomerId ', shopifyCustomerId)
 
  if (!shopifyCustomerId) {
    return json({
      message: "Missing data. Required data: customerId, productId, shop",
      method: "GET",
    });
  }

  // If customerId, shop, productId is provided, return giftwrap items for that customer.
  const subscriptionData = await db.subscriptionData.findMany({
    where: {
      shopifyCustomerId: shopifyCustomerId,
    },
  });
  console.log('subscriptionData ', subscriptionData)
  const fields = ['subscriptionId', 'subscriptionIdString', 'status', 'nextBillingDate']

  var subscriptionDataUpdated = subscriptionData.map(i=>Object.fromEntries(fields.map(f=>[f, i[f]])))

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
  const shopifyCustomerEmail = data.shopifyCustomerEmail
  const shopifyCustomerId = data.shopifyCustomerId
  const subscriptionStatusType = data.subscriptionStatusType
  const _action = data._action
  if (!shopifyCustomerId || !shopifyCustomerEmail || !_action || !subscriptionStatusType) {
      return json({
          message:
          "Missing data. Required data: customerId, productId, shop, _action",
          method: _action,
      });
  }  
  let response;
    const baseUrl = "https://api.retextion.com/api/v2/subscriptions?";
    const stayResponse = await fetch (baseUrl + new URLSearchParams({
        "email": shopifyCustomerEmail,
        "status": subscriptionStatusType
    }), {
        headers: {
            "X-RETEXTION-ACCESS-TOKEN": 'rcn3xqy-4cleq3q-rrknd6y-ktkacxy'
        },
    })
    const resp = await stayResponse.json()
    console.log('stayResponse ', resp)
    // response = json({
    //   message: resp,
    //   method: _action,
    //   open: true,
    // });
    
      
    for (var i = 0; i < resp.data.length; i++){
      var baseUrlOfIndividualSub = "https://api.retextion.com/api/v2/subscriptions/";
      var individualSubResponse = await fetch (baseUrlOfIndividualSub + resp.data[i].id, {
          headers: {
            "X-RETEXTION-ACCESS-TOKEN": 'rcn3xqy-4cleq3q-rrknd6y-ktkacxy'
          },
      })
      // console.log('individualSubResponse ', individualSubResponse)
      var individualSubResp = await individualSubResponse.json()
      // console.log(individualSubResp)
      for (var a=0; a < resp.data.length; a++) {
        if ((individualSubResp.id) == (resp.data[a].subscriptionId)) {
            individualSubResp['subscriptionIdString'] = resp.data[a].id
        }
      }      
      var assignedPricingPolicy = JSON.stringify(individualSubResp.assignedPricingPolicy);
      var billingPolicy = JSON.stringify(individualSubResp.billingPolicy);
      var createdAt = individualSubResp.createdAt;
      var currencyCode = individualSubResp.currencyCode;
      var customAttributes = JSON.stringify(individualSubResp.customAttributes);
      var customer = JSON.stringify(individualSubResp.customer);
      var customerLtv = individualSubResp.customerLtv;
      var customerPaymentMethod = JSON.stringify(individualSubResp.customerPaymentMethod);
      var deliveryMethod = JSON.stringify(individualSubResp.deliveryMethod);
      var deliveryPrice = JSON.stringify(individualSubResp.deliveryPrice);
      var discounts = JSON.stringify(individualSubResp.discounts);
      var isInDunning = JSON.stringify(individualSubResp.isInDunning);
      var lastChargeDate = individualSubResp.lastChargeDate;
      var lineCount = JSON.stringify(individualSubResp.lineCount);
      var lines = JSON.stringify(individualSubResp.lines);
      var nextBillingDate = individualSubResp.nextBillingDate;
      var scheduledBillingDate = individualSubResp.scheduledBillingDate;
      var sellingPlanGroupData = individualSubResp.sellingPlanGroupData == null ? '' : JSON.stringify(individualSubResp.sellingPlanGroupData);
      var shopifyOrders = JSON.stringify(individualSubResp.shopifyOrders);
      var status = JSON.stringify(individualSubResp.status);
      var subscriptionId = individualSubResp.id;
      var subscriptionIdString = individualSubResp.subscriptionIdString;
      var subscriptionLtv = individualSubResp.subscriptionLtv;
      var updatedAt = individualSubResp.updatedAt;

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
    }  
    response = json({
      message: "Product added to giftwrap",
      method: _action,
      open: true,
    });
    return cors(request, response);  
    
}

/* TO USE */
/* PAUSED 
var subscription = new URLSearchParams({
  shopifyCustomerId: '7206107545698',
  shopifyCustomerEmail: 'rigi@firstday.com',
  subscriptionStatusType: 'PAUSED',
  _action: "CREATE",
});

const response = await fetch ("/apps/firstday/customer-portal-update-subscriptions", {
  headers: {
      "ngrok-skip-browser-warning": "aaa", 
      "Bypass-Tunnel-Reminder": "false", 
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/hal+json",
  },
  method: "POST",
  body: subscription,
})
const resp = await response.json()
console.log('postSubData resp ', resp)
*/

/* ACTIVE

var subscription = new URLSearchParams({
  shopifyCustomerId: '7206107545698',
  shopifyCustomerEmail: 'rigi@firstday.com',
  subscriptionStatusType: ‘ACTIVE',
  _action: "CREATE",
});

const response = await fetch ("/apps/firstday/customer-portal-update-subscriptions", {
  headers: {
      "ngrok-skip-browser-warning": "aaa", 
      "Bypass-Tunnel-Reminder": "false", 
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/hal+json",
  },
  method: "POST",
  body: subscription,
})
const resp = await response.json()
console.log('postSubData resp ', resp)
*/

/* CANCELLED
var subscription = new URLSearchParams({
  shopifyCustomerId: '7206107545698',
  shopifyCustomerEmail: 'rigi@firstday.com',
  subscriptionStatusType: 'CANCELLED',
  _action: "CREATE",
}); 

const response = await fetch ("/apps/firstday/customer-portal-update-subscriptions", {
    headers: {
        "ngrok-skip-browser-warning": "aaa", 
        "Bypass-Tunnel-Reminder": "false", 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/hal+json",
    },
    method: "POST",
    body: subscription,
  })
  const resp = await response.json()
  console.log('postSubData resp ', resp)


*/