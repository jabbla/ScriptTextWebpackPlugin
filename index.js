var Path = require('path');
var fs = require('fs');
var utils = require('./lib/utils.js');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

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
    var defaultConfig = this.option.default;

    singleConfig = utils.deepAssign({}, defaultConfig, singleConfig);
    
    var source = singleConfig.source,
        output = singleConfig.output,
        self = this;

    this.readFile(source, singleConfig).then(function(sourceStr){
        return self.generateText(sourceStr, singleConfig);
    }).then(function(resultStr){
        return self.outputFile(resultStr, output, singleConfig);
    }).catch(function(e){
        throw new Error(e);
    });

};

ScriptTextWebpackPlugin.prototype.readFile = function(fileConfig, singleConfig){
    var path = this.resolveText(fileConfig.path, singleConfig),
        filename = this.resolveText(fileConfig.filename, singleConfig),
        filePath = Path.resolve(path, filename);
    
    return fs.readFileAsync(filePath, 'utf-8');
};

ScriptTextWebpackPlugin.prototype.generateText = function(sourceStr, singleConfig){
    var flag = (singleConfig.script && singleConfig.script.positionFlag) || this.positionFlag,
        positionFlag = new RegExp(utils.invertRegExpSymbols(flag), 'g'),
        hasFlag = positionFlag.test(sourceStr),
        scriptStrs = this.genScripts(singleConfig),
        result = '';

    if(!scriptStrs) return;

    if(hasFlag){
        result = sourceStr.replace(positionFlag, scriptStrs);
    }else{
        result = sourceStr.replace('</body>', scriptStrs+'</body>');
    }

    return result;
};

ScriptTextWebpackPlugin.prototype.genScriptSrc = function(scriptPattern, scriptConfig, singleConfig){
    var chunkName = scriptConfig.name,
        path = this.resolveText(scriptConfig.path, singleConfig),
        base = this.resolveScriptBase(chunkName);


    return Path.join(path, base);
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

    return utils.mustWriteFileAsync(Path.resolve(path, filename), outputStr);
};

ScriptTextWebpackPlugin.prototype.resolveScriptBase = function(chunkName){
    var compilation = this.compilation,
        chunk = compilation.namedChunks[chunkName];
    if(chunk){
        var distPath = chunk.files[0];
        return Path.basename(distPath);
    }else{
        throw new Error('no chunk: '+chunkName);
    }
};

ScriptTextWebpackPlugin.prototype.resolveText = function(text, singleConfig){
    var textNamePattern = /\[pageName\]/g,
        textName = singleConfig.pageName || '';
    
    return text.replace(textNamePattern, textName);
};

module.exports = ScriptTextWebpackPlugin;