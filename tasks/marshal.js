"use strict";


var Path = require("path");


module.exports = function(grunt)
{
    function mapExternals(files, info)
    {
        var filepath, i, l = files.length;

        info.out += "//externals\r\n"

        for(i = 0; i < l; ++i)
        {
            filepath = files[i];
            if(grunt.file.exists(filepath) && !grunt.file.isDir(filepath))
            {
                info.externalMap[filepath] = true;
                info.out += "/// <reference path=\"" + Path.relative(info.base, filepath) + "\" />\r\n";
            }
        }
    }


    function mapSource(files, info)
    {
        var filepath,
            i, l        = files.length,
            moduleRegex = /module\s+((\w+\.*)+)/g,
            classRegex  = /export\s+class\s+(\w+)(\s+extends\s+((\w+\.*)+))*/g,
            content,
            result,
            moduleName,
            moduleArray,
            className,
            superClassName,
            fileExtends;

        for(i = 0; i < l; ++i)
        {
            filepath = files[i];

            if(grunt.file.exists(filepath)
                && !grunt.file.isDir(filepath)
                && !info.externalMap[filepath]
                && info.dest != filepath)
            {
                content                = grunt.file.read(filepath);
                moduleName             = null;
                fileExtends            = {};
                info.fileMap[filepath] = fileExtends
                info.fileList.push(filepath);

                while(result = moduleRegex.exec(content))
                {
                    if(moduleName)
                        grunt.fail.warn("Multiple modules per file not supported.")
                    else
                        moduleName = result[1];
                }

                if(moduleName)
                    moduleArray = moduleName.split(".");

                while(result = classRegex.exec(content))
                {
                    className               = moduleName + "." + result[1];
                    superClassName          = result[3];
                    info.classes[className] = filepath;

                    if(!superClassName)
                        continue;

                    // no module or superClass already prefixed
                    if(!moduleName || superClassName.indexOf(moduleName) == 0)
                        fileExtends[superClassName] = true;
                    else
                        addModuleNamespace(moduleArray, fileExtends, superClassName);
                }
            }
        }

        l = info.fileList.length;
        for(i = 0; i < l; ++i)
        {
            filepath    = info.fileList[i];
            fileExtends = info.fileMap[filepath];
            for(superClassName in fileExtends)
            {
                if(!info.classes[superClassName])
                    delete fileExtends[superClassName];
            }
        }

        sortDependencies(info);

        info.out += "//references\r\n";

        for(i = 0; i < l; ++i)
        {
            info.out += "/// <reference path=\"" + Path.relative(info.base, info.fileList[i]) + "\" />\r\n";
        }
    }


    function addModuleNamespace(moduleArray, fileExtends, superClassName)
    {
        var moduleName, part, i, l  = moduleArray.length;
        fileExtends[superClassName] = true;
        for(i = 0; i < l; ++i)
        {
            part       = moduleArray[i];
            moduleName = i == 0 ? part : moduleName + "." + part;
            fileExtends[moduleName + "." + superClassName] = true;
        }
    }


    function sortDependencies(info)
    {
        var fileList = info.fileList,
            index,
            sorted,
            filepath,
            fileExtends,
            superClassName,
            superFilepath,
            superIndex;
        do
        {
            index  = 0;
            sorted = false;

            while(index < fileList.length)
            {
                filepath = fileList[index];
                fileExtends = info.fileMap[filepath];

                for(superClassName in fileExtends)
                {
                    superFilepath = info.classes[superClassName];
                    if(superFilepath)
                    {
                        superIndex = fileList.indexOf(superFilepath);
                        if(index < superIndex)
                        {
                            fileList.splice(superIndex, 1);
                            fileList.unshift(superFilepath);
                            ++index;
                            sorted = true;
                        }
                    }
                }
                ++index;
            }
        }
        while(sorted);
    }




    grunt.registerMultiTask("marshal", "Manages typescript dependencies.", function()
    {
        var options = this.options({}),
            file,
            srcFiles,
            destFile,
            externalFiles,
            info =
            {
                dest:        null,
                base:        null,
                externalMap: {},
                fileList:    [],
                fileMap:     {},
                classes:     {},
                out:         ""
            };

        externalFiles = this.data.externals;
        file          = this.files[0];
        srcFiles      = file ? file.src  : null;
        destFile      = file ? file.dest : null;

        if(!srcFiles || srcFiles.length == 0)
        {
            grunt.log.writeln("Nothing to do. No source files found.");
        }
        else if(!destFile)
        {
            grunt.fail.warn("No destination file specified: " + destFile.path);
        }
        else if(grunt.file.isDir(destFile))
        {
            grunt.fail.warn("Can not write to directory.");
        }
        else
        {
            info.dest = destFile;
            info.base = Path.dirname(info.dest);

            if(externalFiles && externalFiles.length)
                mapExternals(externalFiles, info);

            mapSource(srcFiles, info);

            grunt.log.writeln("result:\r\n" + info.out);

            grunt.file.write(info.dest, info.out);
        }
    });
};
