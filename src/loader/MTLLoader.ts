import { Material } from '@feng3d/core';
import { FS } from '../../../filesystem/dist';
import { mtlConverter } from '../converters/MTLConverter';
import { mtlParser } from '../parsers/MTLParser';

/**
 * OBJ模型MTL材质加载器
 */
export class MTLLoader
{
    /**
     * 加载MTL材质
     * @param path MTL材质文件路径
     * @param completed 加载完成回调
     */
    load(path: string, completed?: (err: Error, materials: { [name: string]: Material; }) => void)
    {
        FS.fs.readString(path, (err, content) =>
        {
            if (err)
            {
                completed(err, null);

                return;
            }
            const mtlData = mtlParser.parser(content);
            mtlConverter.convert(mtlData, completed);
        });
    }
}

/**
 * OBJ模型MTL材质加载器
 */
export const mtlLoader = new MTLLoader();
