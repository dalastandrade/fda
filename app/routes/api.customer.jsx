
import { json } from "@remix-run/node";
import { cors } from "remix-utils/cors";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
const { shop, payload } = await authenticate.cors(request)
console.log(`Received ${payload} for ${shop}`);
console.log(JSON.stringify(payload, null, 2));

  const response = json({ body: 'data' });

  return await cors(request, response);
}