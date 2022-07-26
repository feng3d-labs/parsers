import { Material } from '@feng3d/core';
import { globalEmitter } from '@feng3d/event';
import { serialization } from '@feng3d/serialization';
import { Mtl_Mtl } from '../parsers/MTLParser';

/**
 * OBJ模型MTL材质转换器
 */
export class MTLConverter
{
    /**
     * OBJ模型MTL材质原始数据转换引擎中材质对象
     * @param mtl MTL材质原始数据
     */
    convert(mtl: Mtl_Mtl, completed?: (err: Error, materials: { [name: string]: Material; }) => void)
    {
        const materials: { [name: string]: Material } = {};
        for (const name in mtl)
        {
            const materialInfo = mtl[name];
            const material = materials[name] = serialization.setValue(new Material(), {
                name: materialInfo.name,
                uniforms: {
                    u_diffuse: { r: materialInfo.kd[0], g: materialInfo.kd[1], b: materialInfo.kd[2] },
                    u_specular: { r: materialInfo.ks[0], g: materialInfo.ks[1], b: materialInfo.ks[2] },
                },
            });
            globalEmitter.emit('asset.parsed', material);
        }
        completed && completed(null, materials);
    }
}

/**
 * OBJ模型MTL材质转换器
 */
export const mtlConverter = new MTLConverter();
