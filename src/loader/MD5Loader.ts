import { AnimationClip, GameObject } from '@feng3d/core';
import { FS, pathUtils } from '@feng3d/filesystem';
import { md5AnimConverter } from '../converters/MD5AnimConverter';
import { md5MeshConverter } from '../converters/MD5MeshConverter';
import { md5AnimParser } from '../parsers/MD5AnimParser';
import { md5MeshParser } from '../parsers/MD5MeshParser';

/**
 * MD5模型加载类
 */
export class MD5Loader
{
    /**
     * 加载资源
     * @param url   路径
     * @param completed 加载完成回调
     */
    load(url: string, completed?: (gameObject: GameObject) => void)
    {
        FS.fs.readString(url, (_err, content) =>
        {
            const md5MeshData = md5MeshParser.parse(content);
            md5MeshData.name = pathUtils.getName(url);
            md5MeshConverter.convert(md5MeshData, completed);
        });
    }

    /**
     * 加载MD5模型动画
     * @param url MD5模型动画资源路径
     * @param completed 加载完成回调
     */
    loadAnim(url: string, completed?: (animationClip: AnimationClip) => void)
    {
        FS.fs.readString(url, (_err, content) =>
        {
            const md5AnimData = md5AnimParser.parse(content);
            md5AnimData.name = pathUtils.getName(url);
            md5AnimConverter.convert(md5AnimData, completed);
        });
    }
}

/**
 * MD5模型加载类
 */
export const md5Loader = new MD5Loader();

