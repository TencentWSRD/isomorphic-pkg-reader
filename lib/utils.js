function toArray(arrayLikeObj) {
  if (!arrayLikeObj) return [];

  return Array.prototype.slice.call(arrayLikeObj);
}

function extend(destObject) {
  var args = toArray(arguments);
  var dest;

  if (args.length == 1) {
    return destObject;
  }

  args.shift();

  // 从前往后遍历
  for (var i = 0, l = args.length; i < l; i++) {
    for (var key in args[i]) {
      if (args[i].hasOwnProperty(key)) {
        destObject[key] = args[i][key];
      }
    }
  }

  return destObject;
}

function isEmpty(obj) {
  for (var i in obj) {
    return false;
  }
  return true;
}

function isTypeOf(something, type) {
  if (!type) return false;

  type = type.toLowerCase();

  var realTypeString = Object.prototype.toString.call(something);

  return realTypeString.toLowerCase() === '[object ' + type + ']';
}

function isArray(something) {
  return isTypeOf(something, 'array');
}

function isFunction(something) {
  return typeof something === 'function';
}

function isString(something) {
  return typeof something === 'string';
}

function isDefined(something) {
  return !(typeof something === 'undefined');
}

function isObject(something) {
  return typeof something === 'object';
}

function isPrimitive(something) {
  return something === null ||
    typeof something === 'boolean' ||
    typeof something === 'number' ||
    typeof something === 'string' ||
    typeof something === 'undefined';
}

function isReg(something) {
  return isTypeOf(something, 'regexp');
}

function redraw(icon) {
  var height, width, h, i, j, k, canvas, context, n, o;
  // d -> index
  // f -> width
  // e -> height
  // a -> icon
  // l -> canvas
  // m -> context
  // c -> pixcel

  width = null != icon ? icon.width : undefined;
  height = null != icon ? icon.height : undefined;
  canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext("2d");

  if (typeof icon === "string") {
    return icon;
  }

  if (typeof icon === "object") {
    var index = 0,
      pixel;

    var image = context.getImageData(0, 0, width, height);
    o = h = 0;
    j = height;

    for (; j >= 0 ? j > h : h > j; o = j >= 0 ? ++h : --h) {

      for (n = i = 0, k = width; k >= 0 ? k > i : i > k; n = k >= 0 ? ++i : --i) {

        pixel = icon.getPixel(n, o);
        image.data[index++] = pixel[0];
        image.data[index++] = pixel[1];
        image.data[index++] = pixel[2];
        image.data[index++] = pixel[3];
      }
    }

    context.putImageData(image, 0, 0);
    const dataUrl = canvas.toDataURL();
    canvas = null;

    return dataUrl;
  }
}


function findOutResources(apkInfo, resourceMapStr) {

  var resourceMap = {};

  iteratorObj(apkInfo);

  return resourceMap;

  function iteratorObj(obj) {
    for (var i in obj) {
      if (isArray(obj[i])) {
        iteratorArray(obj[i]);
      } else if (isObject(obj[i])) {
        iteratorObj(obj[i]);
      } else if (isPrimitive(obj[i])) {
        if (isResouces(obj[i])) {
          obj[i] = resourceMapStr[transKeyToMatchResourceMap(obj[i])];
        }
      }
    }
  }

  function iteratorArray(array) {
    for (var i = 0, l = array.length; i < l; i++) {
      if (isArray(array[i])) {
        iteratorArray(array[i]);
      } else if (isObject(array[i])) {
        iteratorObj(array[i]);
      } else if (isPrimitive(array[i])) {
        if (isResouces(array[i])) {
          array[i] = resourceMapStr[transKeyToMatchResourceMap(array[i])];
        }
      }
    }
  }
}

function base64ToBlob(base64, contentType, callback) {
  if (typeof atob !== 'function') {
    return callback(new Error('atob is not a function, maybe you\'re not in browser?'));
  }

  if (base64.indexOf('data:') === 0) {
    base64 = base64.substr(base64.indexOf(',') + 1);
  }

  if (typeof contentType === 'function') {
    callback = contentType;
    contentType = undefined;
  }

  var byteCharacters = atob(base64);
  var byteNumbers = new Array(byteCharacters.length);
  for (var i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  var byteArray = new Uint8Array(byteNumbers);

  callback(null, new Blob([byteArray], { type: contentType }));
}

function blobToBase64(blob, callback) {
  if (typeof Blob === 'undefined' || typeof FileReader === 'undefined' || !(blob instanceof Blob)) {
    return callback(new Error('Error happened, please make sure you\'re in browser environment.'));
  }

  var fileReader = new FileReader();

  var removeListener = function() {
    fileReader.removeEventListener('load', handleOnload);
    fileReader.removeEventListener('error', handleError);
  };

  function handleOnload(e) {
    removeListener();
    callback(null, e.target.result);
  }

  function handleError(err) {
    removeListener();
    callback(err);
  }

  fileReader.addEventListener('load', handleOnload);
  fileReader.addEventListener('error', handleError);
  fileReader.readAsDataURL(blob);
}

/**
 *
 * @param str
 * @param prefix
 * @returns {boolean}
 */
function startWith(str, prefix) {
  return str.indexOf(prefix) === 0;
}

function isResouces(attrValue) {
  if (!attrValue) return false;
  if (typeof attrValue !== 'string') {
    attrValue = attrValue.toString();
  }
  return startWith(attrValue, 'resourceId:');
}

function transKeyToMatchResourceMap(resourceId) {
  return '@' + resourceId.replace('resourceId:0x', '').toUpperCase();
}

function castLogger(doWhat, fromWhen) {
  console.log(doWhat + ' cost: ' + (Date.now() - fromWhen) + 'ms');
}

function findOutIcon(pkgInfo, extension) {
  if (extension === 'apk') {
    if (pkgInfo.application.icon && pkgInfo.application.icon.splice) {
      var rulesMap = {
        'ldpi': 120,
        'mdpi': 160,
        'hdpi': 240,
        'xhdpi': 320
      };

      var resultMap = {};

      var maxDpiIcon = {
        dpi: 120,
        icon: ''
      };

      for (var i in rulesMap) {
        pkgInfo.application.icon.some(function(icon) {
          if (icon && icon.indexOf(i) > -1) {
            resultMap['application-icon-' + rulesMap[i]] = icon;
            return true;
          }
        });

        // 单独取出最大的
        if (resultMap['application-icon-' + rulesMap[i]] && rulesMap[i] >= maxDpiIcon.dpi) {
          maxDpiIcon = {
            dpi: rulesMap[i],
            icon: resultMap['application-icon-' + rulesMap[i]]
          };
        }
      }

      if (isEmpty(resultMap) || !maxDpiIcon.icon) {
        maxDpiIcon = {
          dpi: 120,
          icon: pkgInfo.application.icon[0] || ''
        };
        resultMap['applicataion-icon-120'] = maxDpiIcon.icon;
      }

      return maxDpiIcon.icon;
    } else {
      console.error('Unexpected icon type,', pkgInfo.application.icon);
    }
  } else if (extension === 'ipa') {
    if (pkgInfo.CFBundleIcons && pkgInfo.CFBundleIcons.CFBundlePrimaryIcon
      && pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles &&
      pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length) {
      // It's an array...just try the last one
      return pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles[pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length - 1];
    } else {
      // Maybe there is a default one
      return '\.app/Icon.png';
    }
  } else {
    console.warn('Unexpected extension', extension);
  }
}

module.exports = {
  findOutResources: findOutResources,
  toArray: toArray,
  extend: extend,
  startWith: startWith,
  isResouces: isResouces,
  transKeyToMatchResourceMap: transKeyToMatchResourceMap,
  castLogger: castLogger,
  isTypeOf: isTypeOf,
  isArray: isArray,
  isFunction: isFunction,
  isString: isString,
  isDefined: isDefined,
  isObject: isObject,
  isReg: isReg,
  redraw: redraw,
  findOutIcon: findOutIcon,
  isEmpty: isEmpty,
  base64ToBlob: base64ToBlob,
  blobToBase64: blobToBase64
};
