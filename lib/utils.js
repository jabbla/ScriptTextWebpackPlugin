var utils = {};

utils.symbols = (function(){
    var SYMBOLS = [
        '{', '}', '[', ']', '+', '$', '(', ')', '*', '.', '?', '\\', '^', '|', '\\cx',
        '\\f', '\\n', '\\r', '\\s', '\\S', '\\t', '\\v', '\\b', '\\B'
    ];

    var result = {};
    SYMBOLS.forEach(function(item){
        result[item] = true;
    });
    return result;
})();

/**转义特殊字符 */
utils.invertRegExpSymbols = function(str){
    var chars = str.split(''),
        result = '',
        SYMBOLS = utils.symbols;
    
    chars.forEach(function(item){
        if(SYMBOLS[item]){
            item = '\\' + item;
        }
        result += item;
    });

    return result;
};

utils.deepAssign = (function(){
    var assignSingle = function(target, source){
        for(var key in source){
            if(typeof target[key] !== 'object' || typeof source[key] !== 'object'){
                target[key] = source[key];
            }else{
                assignSingle(target[key], source[key]);
            }
        }
        return target;
    };

    return function(){
        var args = [].slice.call(arguments, 0);
        var result = args[0];

        args.slice(1).forEach(function(item){
            assignSingle(result, item);
        });
        return result;
    };
})();
module.exports = utils;