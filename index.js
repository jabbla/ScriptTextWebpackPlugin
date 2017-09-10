var Path = require('path');
var fs = require('fs');
var utils = require('./lib/utils.js');

var ScriptTextWebpackPlugin = function(option){
    this.option = option;
    this.positionFlag = '{{{webpack-chunks}}}';
};

ScriptTextWebpackPlugin.prototype.apply = function(compiler){
    var self = this;
    compiler.plugin('entry-option', function(rootPath, entryOption){
        self.entry = entryOption;
    });
    
    compiler.plugin('emit', function(compilation, callback) {
        self.compilation = compilation;
        self.main(self.option.config);
        callback();
    });
};

ScriptTextWebpackPlugin.prototype.main = function(config){
    if(config && config.length){
        var self = this;
        config.forEach(function(item){
            self.execSingleTask(item);
        });
    }
};

ScriptTextWebpackPlugin.prototype.execSingleTask = function(singleConfig){
    singleConfig = utils.deepAssign({}, defaultConfig, singleConfig);

    var defaultConfig = this.option.default,
        source = singleConfig.source,
        output = singleConfig.output;

    var sourceStr = this.readFile(source, singleConfig);

    var resultStr = this.generateText(sourceStr, singleConfig);

    this.outputFile(resultStr, output, singleConfig);
};

ScriptTextWebpackPlugin.prototype.readFile = function(fileConfig, singleConfig){
    var path = this.resolveText(fileConfig.path, singleConfig),
        filename = this.resolveText(fileConfig.filename, singleConfig),
        filePath = Path.resolve(path, filename);
    
    return fs.readFileSync(filePath, 'utf-8');
};

ScriptTextWebpackPlugin.prototype.generateText = function(sourceStr, singleConfig){
    var flag = (singleConfig.script && singleConfig.script.positionFlag) || this.positionFlag,
        positionFlag = new RegExp(utils.invertRegExpSymbols(flag), 'g'),
        scriptStrs = this.genScripts(singleConfig);

    if(!scriptStrs) return;


    return sourceStr.replace(positionFlag, scriptStrs);
};

ScriptTextWebpackPlugin.prototype.genScriptSrc = function(scriptPattern, scriptConfig, singleConfig){
    var compilation = this.compilation,
        entry = this.entry,
        hash = compilation.hash,
        chunkName = scriptConfig.name,
        path = this.resolveText(scriptConfig.path, singleConfig),
        chunkhash = compilation.namedChunks[chunkName].renderedHash;
        

    if(entry[chunkName]){
        scriptPattern = scriptPattern.replace(/\[name\]/g, chunkName);
        scriptPattern = scriptPattern.replace(/\[hash:?([0-9]*)\]/g, function(str, num){
            if(/[0-9]+/.test(num)){
                hash = hash.slice(0, +num);
            }
            return hash;
        });
        scriptPattern = scriptPattern.replace(/\[chunkhash:?([0-9]*)\]/g, function(str, num){
            if(/[0-9]+/.test(num)){
                chunkhash = chunkhash.slice(0, +num);
            }
            return chunkhash;
        });

        return Path.join(path, scriptPattern);
    }else{
        new Error('no '+chunkName+' entry');
    }
};

ScriptTextWebpackPlugin.prototype.genScripts = function(singleConfig){
    var compilation = this.compilation,
        namedChunks = compilation.namedChunks,
        chunks = singleConfig.chunks,
        scriptBase = Path.parse(compilation.outputOptions.filename).base,
        scriptPattern = scriptBase,
        result = '';

    var self = this;
    chunks.forEach(function(item){
        var chunk = namedChunks[item.name];
        if(!chunk) return;
        result += '<script src="'+self.genScriptSrc(scriptPattern, item, singleConfig)+'"></script>\n';
    });
    return result;
};

ScriptTextWebpackPlugin.prototype.outputFile = function(outputStr, outputConfig, singleConfig){
    var filename = this.resolveText(outputConfig.filename, singleConfig),
        path = this.resolveText(outputConfig.path, singleConfig);

    try{
        fs.writeFileSync(Path.resolve(path, filename), outputStr);
    }catch(e){
        if(e.code==='ENOENT'){
            fs.mkdirSync(Path.resolve(path));
            fs.writeFileSync(Path.resolve(path, filename), outputStr);
        }
    }
};

ScriptTextWebpackPlugin.prototype.resolveText = function(text, singleConfig){
    var textNamePattern = /\[pageName\]/g,
        textName = singleConfig.pageName || '';
    
    return text.replace(textNamePattern, textName);
};

module.exports = ScriptTextWebpackPlugin;