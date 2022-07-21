import { GameObject } from '@feng3d/core';
import { globalEmitter } from '@feng3d/event';
import { FS, pathUtils } from '@feng3d/filesystem';
import { serialization } from '@feng3d/serialization';
import { mdlParser } from '../parsers/MDLParser';

/**
 * MDL模型加载器
 */
export class MDLLoader
{
    /**
     * 加载MDL模型
     * @param mdlurl MDL模型路径
     * @param callback 加载完成回调
     */
    load(mdlurl: string, callback?: (gameObject: GameObject) => void)
    {
        FS.fs.readString(mdlurl, (_err, content) =>
        {
            mdlParser.parse(content, (war3Model: { getMesh: () => any; }) =>
            {
                const showMesh = war3Model.getMesh();

                const gameObject = serialization.setValue(new GameObject(), { name: pathUtils.getName(mdlurl), children: <any>[showMesh] });

                globalEmitter.emit('asset.parsed', gameObject);
                callback && callback(gameObject);
            });
        });
    }
}

/**
 * MDL模型加载器
 */
export const mdlLoader = new MDLLoader();
