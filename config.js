const StyleDictionary = require("style-dictionary");

StyleDictionary.registerTransform({
  name: 'size/special',
  type: 'value',
  matcher: function (prop) {

    return prop.attributes.category === 'border' || prop.attributes.category === 'border-radius' || prop.attributes.category === 'spacing';
  },
  transformer: function (prop) {
    if (prop.value === "auto" || prop.value.includes('%')) {
      return prop.value
    } else {
      return prop.value + "px";
    }

  }
});

StyleDictionary.registerTransform({
  name: 'size/shadow',
  type: 'value',
  matcher: function (prop) {
    return prop.attributes.category === 'input';
  },
  transformer: function (prop) {
    if (prop.value === "auto" || prop.value.includes('#')) {
      return prop.value
    } else {
      return prop.value + "px";
    }

  }
});

StyleDictionary.registerTransform({
  name: 'size/rem',
  type: 'value',
  matcher: function (prop) {
    return prop.attributes.category === 'letter-spacing';
  },
  transformer: function (prop) {
    return prop.value / 10 + "rem";
  }
});


module.exports = {
  source: ["tokens/**/*.json"],
  platforms: {
    scss: {
      transformGroup: "scss",
      transforms: ["attribute/cti", "name/cti/kebab", "color/hex", "size/px", "size/special", "size/rem", "size/shadow"],
      buildPath: './figma/',
      files: [{
        destination: "scss/_variables.scss",
        format: "scss/variables",
      }, {
        destination: "css/variables.css",
        format: 'css/variables',
      }],
    }
  }
};