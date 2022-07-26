import { GameObject } from '@feng3d/core';
import { FS, pathUtils } from '@feng3d/filesystem';
import { objConverter } from '../converters/OBJConverter';
import { objParser } from '../parsers/OBJParser';
import { mtlLoader } from './MTLLoader';

/**
 * Obj模型加载类
 */
export class ObjLoader
{
    /**
     * 加载资源
     * @param url   路径
     */
    load(url: string, completed?: (gameObject: GameObject) => void)
    {
        const root = url.substring(0, url.lastIndexOf('/') + 1);

        FS.fs.readString(url, (_err, content) =>
        {
            const objData = objParser.parser(content);
            objData.name = pathUtils.getName(url);
            const mtl = objData.mtl;
            if (mtl)
            {
                mtlLoader.load(root + mtl, (_err, materials) =>
                {
                    objConverter.convert(objData, materials, completed);
                });
            }
            else
            {
                objConverter.convert(objData, null, completed);
            }
        });
    }
}

/**
 * Obj模型加载类
 */
export const objLoader = new ObjLoader();
