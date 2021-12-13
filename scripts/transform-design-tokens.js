/**
 * Transforming the jsonbin token file. 
 * 
 * Usage: node ./transform.js [inputFile] [outputFile]
 * inputFile is optional (falls back to default), relative to project root
 * outputFile is optional (falls back to default), relative to project root
 * 
 * It reads the json inputFile and does 3 transformations
 * 
 * 1. It replaces '.' with '-' in strings that start with '$'. String endings are currently space ' '. NB! if there is no spacing in the strings this breaks
 * 2. It restructures the typography objects
 * 3. It removes the root node values.global, and places the content of that in the root
 * 
 * TODO:
 * Fix data types. Right now all data types in the output are strings
 */

const path = require('path');
const fs = require('fs')
const _ = require('lodash');



const generateJson = (obj, key) => {

  let inputFile = `tokens.json`;
  let outputFile = `tokens/${key}.json`;
  const toRoot = '../';
  const inputFilePath = path.resolve(__dirname, toRoot, inputFile);
  const outputFilePath = path.resolve(__dirname, toRoot, outputFile);

  fs.access(inputFilePath, fs.F_OK, (err) => {
    if (err) {
      console.error(err)
      return
    }

    fs.readFile(inputFilePath, (err, data) => {
      if (err) {
        console.error(err)
        return
      }

      let json = JSON.parse(data); // TODO: handle non json content gracefully

      traverse(json, (key, value, scope) => {
        // Restructure typography object
        if (key === 'type' && value === 'typography' || key === 'type' && value === 'boxShadow') {
          // Joins scope (dot syntax) and removes last item, so we get the parent object
          const path = scope.concat(key).map(k => isNaN(k) ? `${k}` : k).slice(0, -1).join('.')
          _.set(json, path, restructureTypographyObject(_.get(json, path)))
        }

        // Add .value if starts with "{" 
        // From figma token we can get vars like this {varname} or $varname
        if (value.toString().indexOf('{') === 0) {
          let parsed = value.split(' ').map(val => {
            if (val.indexOf('{') === 0) {
              return val.split('}').join('.value}')
            }
            return val
          }).join(' ')
          // Joins scope (dot syntax)
          const path = scope.concat(key).map(k => isNaN(k) ? `${k}` : k).join('.')
          _.set(json, path, parsed)
        }
        // Add .value if starts with "$"
        if (value.toString().indexOf('$') === 0) {
          let parsed = value.split(' ').map(val => {
            if (val.indexOf('$') === 0) {
              return val.split('$').join('{') + '.value}'
            }

            return val
          }).join(' ')
          // Joins scope (dot syntax)
          const path = scope.concat(key).map(k => isNaN(k) ? `${k}` : k).join('.')
          _.set(json, path, parsed)
        }
      })

      // Save only what is in values.global
      // NB! Hardcoded path
      const temp = _.get(json, 'values.' + obj, json)

      // Type can conflict if more than one value
      let output = JSON.stringify(temp[obj], null, '').split(',"type":"typography"').join('');
      output = JSON.stringify(temp[obj], null, '').split(',"type":"boxShadow"').join('');


      // Write output file
      fs.writeFile(outputFilePath, output, 'utf8', function (err) {
        if (err) {
          console.log('An error occured while writing JSON Object to File.');
          return console.log(err);
        }

        console.log(`Transformed JSON has been saved to ${outputFile}`);
      });
    })
  })

}



const traverse = (o, fn, scope = []) => {
  for (let i in o) {
    fn.apply(this, [i, o[i], scope]);
    if (o[i] !== null && typeof o[i] === 'object') {
      traverse(o[i], fn, scope.concat(i));
    }
  }
}

const restructureTypographyObject = (obj) => {
  if (!obj.value) {
    return obj
  }

  let parsed = {}
  for (const [key, value] of Object.entries(obj.value)) {
    parsed[key] = {
      value
    }
  }
  return {
    ...parsed,
    ..._.omit(obj, 'value')
  }
}


generateJson("global", "global");