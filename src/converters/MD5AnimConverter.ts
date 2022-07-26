import { AnimationClip, PropertyClip, PropertyClipPath, PropertyClipPathItemType } from '@feng3d/core';
import { globalEmitter } from '@feng3d/event';
import { Vector3, Quaternion } from '@feng3d/math';
import { MD5AnimData, MD5_Frame, MD5_HierarchyData, MD5_BaseFrame } from '../parsers/MD5AnimParser';

/**
 * MD5动画转换器
 */
export class MD5AnimConverter
{
    /**
     * MD5动画数据转换为引擎动画数据
     * @param md5AnimData MD5动画数据
     * @param completed 转换完成回调
     */
    convert(md5AnimData: MD5AnimData, completed?: (animationClip: AnimationClip) => void)
    {
        const animationClip = new AnimationClip();
        animationClip.name = md5AnimData.name;
        animationClip.length = md5AnimData.numFrames / md5AnimData.frameRate * 1000;
        animationClip.propertyClips = [];

        const __chache__: { [key: string]: PropertyClip } = {};

        for (let i = 0; i < md5AnimData.numFrames; ++i)
        {
            translatePose(md5AnimData, md5AnimData.frame[i], animationClip);
        }

        globalEmitter.emit('asset.parsed', animationClip);

        completed && completed(animationClip);

        /**
         * 将一个关键帧数据转换为SkeletonPose
         * @param frameData 帧数据
         * @return 包含帧数据的SkeletonPose对象
         */
        function translatePose(md5AnimData: MD5AnimData, frameData: MD5_Frame, animationclip: AnimationClip)
        {
            let hierarchy: MD5_HierarchyData;
            let base: MD5_BaseFrame;
            let flags: number;
            let j: number;
            // 偏移量
            const translation: Vector3 = new Vector3();
            // 旋转四元素
            const components: number[] = frameData.components;

            for (let i = 0; i < md5AnimData.numJoints; ++i)
            {
                // 通过原始帧数据与层级数据计算出当前骨骼pose数据
                j = 0;
                // 层级数据
                hierarchy = md5AnimData.hierarchy[i];
                // 基础帧数据
                base = md5AnimData.baseframe[i];
                // 层级标记
                flags = hierarchy.flags;
                translation.x = base.position[0];
                translation.y = base.position[1];
                translation.z = base.position[2];
                const orientation: Quaternion = new Quaternion();
                orientation.x = base.orientation[0];
                orientation.y = base.orientation[1];
                orientation.z = base.orientation[2];

                // 调整位移与角度数据
                if (flags & 1)
                { translation.x = components[hierarchy.startIndex + (j++)]; }
                if (flags & 2)
                { translation.y = components[hierarchy.startIndex + (j++)]; }
                if (flags & 4)
                { translation.z = components[hierarchy.startIndex + (j++)]; }
                if (flags & 8)
                { orientation.x = components[hierarchy.startIndex + (j++)]; }
                if (flags & 16)
                { orientation.y = components[hierarchy.startIndex + (j++)]; }
                if (flags & 32)
                { orientation.z = components[hierarchy.startIndex + (j++)]; }

                // 计算四元素w值
                const w = 1 - orientation.x * orientation.x - orientation.y * orientation.y - orientation.z * orientation.z;
                orientation.w = w < 0 ? 0 : -Math.sqrt(w);

                orientation.y = -orientation.y;
                orientation.z = -orientation.z;
                translation.x = -translation.x;

                const eulers = orientation.toEulerAngles();
                eulers.scaleNumber(180 / Math.PI);

                const path: PropertyClipPath = [
                    [PropertyClipPathItemType.GameObject, hierarchy.name],
                    [PropertyClipPathItemType.Component, 'Transform'],
                ];

                const time = (frameData.index / md5AnimData.frameRate) * 1000;
                setPropertyClipFrame(path, 'position', time, translation.toArray(), 'Vector3');
                setPropertyClipFrame(path, 'orientation', time, orientation.toArray(), 'Quaternion');
            }

            function setPropertyClipFrame(path: PropertyClipPath, propertyName: string, time: number, propertyValue: number[], type: string)
            {
                const propertyClip = getPropertyClip(path, propertyName);
                propertyClip.type = <any>type;
                propertyClip.propertyValues.push([time, propertyValue]);
            }

            function getPropertyClip(path: PropertyClipPath, propertyName: string)
            {
                const key = path.join('-') + propertyName;
                if (__chache__[key])
                { return __chache__[key]; }
                if (!__chache__[key])
                {
                    const propertyClip = __chache__[key] = new PropertyClip();
                    propertyClip.path = path;
                    propertyClip.propertyName = propertyName;
                    propertyClip.propertyValues = [];
                    animationclip.propertyClips.push(propertyClip);
                }

                return __chache__[key];
            }
        }
    }
}

/**
 * MD5动画转换器
 */
export const md5AnimConverter = new MD5AnimConverter();
