# Scripttext Webpack Plugin

Webpack插件，用来自动生成script标签

应用场景：在html文件中自动添加webpack打包后的script引用

## 使用说明
### 安装
```bash
npm install scripttext-webpack-plugin --save-dev
```

### 基本使用
该插件会自动将位置标记替换为引用目标chunk的script标签

#### 文件目录结构

```js
var path = require('path');
var ScriptTextPlugin = require('scripttext-webpack-plugin');

module.exports = {
    entry: {
        page1: './src/page1/js/index.js'
    },
    output: {
        filename: '[name]/js/index.[chunkhash:10].js',
        path: path.resolve(__dirname, './dist')
    },
    plugins: [
        new ScriptTextPlugin(option)
    ]
};
```

#### option
> 插件配置对象

```js
{
    default: {},            //默认选项
    config: [configItems]   //config数组   
}
```
#### default
> 默认配置，与configItem对应，基于deep assign

```js
/*configItem*/
{
    source: {
        filename: 'index.html',
    }
}

/*default*/
{
    pageName: 'index1',
    source: {
        path: p2
    }
}

/*result configItem*/
{
    pageName: 'index1',
    source: {
        filename: 'index.html',
        path: p2
    }
}
```

#### configItem
> option.config数组项

##### configItem各属性含义
1. source：用来配置源文件的名称及路径
2. output: 用来配置生成后的文件及路径
3. pageName: 用来设置[pageName]代表的字符串
4. chunks: 配置引用的各个chunk
5. script: 插入生成的script的相关规则

```js
{
    pageName: 'page1',      //页面名称，在所有的path和filename中可以用[pageName]代替
    source: {},
    output: {},
    chunks: [chunk],
    script: {}
}
```
#### pageName
> 用来设置[pageName]代表的字符串

```js
有效范围
source.filename source.path
output.filename output.path
chunk.path
```
#### source
> 用来配置源文件的名称及路径，路径为绝对路径

```js
{
    filename: 'index.html',
    path: path.resolve(__dirname, './src/[pageName]/')
}
```

#### output
> 用来配置生成后的文件及路径，绝对路径

```js
{
    filename: 'index.html',
    path: path.resolve(__dirname, './dist/[pageName]/')
}
```

#### chunk
> 配置要生成script标签的chunk，其中path会原样输出

```js
{
    name: 'page1',          //entry配置中的chunkName
    path: './[pageName]/js' //生成的script中路径
}
```

#### script
> 插入生成的script的相关规则

```js
{
    positionFlag: '!!!{{{webpack-chunks}}}' //位置标记
}
```

## 例子

源文件
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
<!--positionFlag默认为{{{webpack-chunks}}}-->
{{{webpack-chunks}}}
</body>
</html>
```

webpack.config.js
```js
var path = require('path');
var ScriptTextPlugin = require('scripttext-webpack-plugin');

module.exports = {
    entry: {
        chunk1: './src/js/chunk1.js'
        chunk2: './src/js/chunk2.js'
    },
    output: {
        filename: '[name].[chunkhash:10].js',
        path: path.resolve(__dirname, './dist/js')
    },
    plugins: [
        new ScriptTextPlugin({
           default: ...,
            config: [
                {
                    pageName: 'page1',
                    chunks: [
                        {name: 'chunk1', path: './[pageName]/dist/js'},
                        {name: 'chunk2', path: './[pageName]/dist/js'}
                    ]
                }
            ]
        })
    ]
};
```

生成的文件
```js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
<script src="page1\dist\js\chunk1.947b04c5d3.js"></script>
<script src="page1\dist\js\chunk2.a7213u22d3.js"></script>

</body>
</html>
```






