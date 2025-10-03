import {extension, Grid, View, Image, Text, TextBlock, Style} from '@shopify/ui-extensions/checkout';

export default extension('purchase.checkout.block.render', (root) => {
  const grid = root.createComponent(
    Grid,
    {
      columns: Style.default(['0%', '33%', '33%', '33%', '0%'])
        .when({viewportInlineSize: {min: 'extraSmall'}}, ['0%', '33%', '33%', '33%', '0%'])
        .when({viewportInlineSize: {min: 'small'}}, ['5%', '30%', '30%', '30%', '5%'])
        .when({viewportInlineSize: {min: 'medium'}}, ['5%', '30%', '30%', '30%', '5%'])
        .when({viewportInlineSize: {min: 'large'}}, ['5%', '30%', '30%', '30%', '5%']),
      rows: ['auto', 'auto'],
    },
    [
      root.createComponent(
        View,
        {padding: Style.default('small500')
        .when({viewportInlineSize: {min: 'extraSmall'}}, 'base')
        .when({viewportInlineSize: {min: 'small'}}, 'base')
        .when({viewportInlineSize: {min: 'medium'}}, 'base')
        .when({viewportInlineSize: {min: 'large'}}, 'base'),},
        '',
      ),
      root.createComponent(
        View,
        {padding: Style.default('small500')
        .when({viewportInlineSize: {min: 'extraSmall'}}, 'base')
        .when({viewportInlineSize: {min: 'small'}}, 'base')
        .when({viewportInlineSize: {min: 'medium'}}, 'base')
        .when({viewportInlineSize: {min: 'large'}}, 'base'),},      
        [root.createComponent(Image, {
          source: "https://cdn.shopify.com/s/files/1/0028/0533/4131/files/1-new.png?v=1744814385",
          accessibilityDescription: "",
          aspectRatio: 1,
        }),
        root.createComponent(TextBlock, { size: "small", inlineAlignment: "center" }, '45 Day Money-Back Guarantee',),]
      ),
      root.createComponent(
        View,
        {padding: Style.default('small500')
        .when({viewportInlineSize: {min: 'extraSmall'}}, 'base')
        .when({viewportInlineSize: {min: 'small'}}, 'base')
        .when({viewportInlineSize: {min: 'medium'}}, 'base')
        .when({viewportInlineSize: {min: 'large'}}, 'base'),},      
        [root.createComponent(Image, {
          source: "https://cdn.shopify.com/s/files/1/0028/0533/4131/files/2-height.png?v=1744813907",
          accessibilityDescription: "",
          aspectRatio: 1,
        }),
        root.createComponent(TextBlock, { size: "small", inlineAlignment: "center" }, '800,000+ Happy Customers',),]
      ),
      root.createComponent(
        View,
        {padding: Style.default('small500')
        .when({viewportInlineSize: {min: 'extraSmall'}}, 'base')
        .when({viewportInlineSize: {min: 'small'}}, 'base')
        .when({viewportInlineSize: {min: 'medium'}}, 'base')
        .when({viewportInlineSize: {min: 'large'}}, 'base'),},      
        [root.createComponent(Image, {
          source: "https://cdn.shopify.com/s/files/1/0028/0533/4131/files/NoJunk-1.png?v=1744814385",
          accessibilityDescription: "",
          aspectRatio: 1,
        }),
        root.createComponent(TextBlock, { size: "small", inlineAlignment: "center" }, 'No Junk Ingredients',),]
      ),
      root.createComponent(
        View,
        {padding: Style.default('small500')
        .when({viewportInlineSize: {min: 'extraSmall'}}, 'base')
        .when({viewportInlineSize: {min: 'small'}}, 'base')
        .when({viewportInlineSize: {min: 'medium'}}, 'base')
        .when({viewportInlineSize: {min: 'large'}}, 'base'),},
        ''
      ),      
    ],
  );

  root.appendChild(grid);
});
