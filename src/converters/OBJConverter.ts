import { CustomGeometry, GameObject, Material, Renderable } from '@feng3d/core';
import { globalEmitter } from '@feng3d/event';
import { serialization } from '@feng3d/serialization';
import { OBJ_Face, OBJ_OBJ, OBJ_OBJData, OBJ_SubOBJ } from '../parsers/OBJParser';

/**
 * OBJ模型转换器
 */
export class OBJConverter
{
    /**
     * OBJ模型数据转换为游戏对象
     * @param objData OBJ模型数据
     * @param materials 材质列表
     * @param completed 转换完成回调
     */
    convert(objData: OBJ_OBJData, materials: { [name: string]: Material; }, completed: (gameObject: GameObject) => void)
    {
        const object = new GameObject();
        object.name = objData.name;
        const objs = objData.objs;
        for (let i = 0; i < objs.length; i++)
        {
            const obj = objs[i];
            const gameObject = createSubObj(objData, obj, materials);
            object.addChild(gameObject);
        }

        globalEmitter.emit('asset.parsed', object);

        completed && completed(object);
    }
}

/**
 * OBJ模型转换器
 */
export const objConverter = new OBJConverter();

function createSubObj(objData: OBJ_OBJData, obj: OBJ_OBJ, materials: { [name: string]: Material; })
{
    const gameObject = serialization.setValue(new GameObject(), { name: obj.name });

    const subObjs = obj.subObjs;
    for (let i = 0; i < subObjs.length; i++)
    {
        const materialObj = createMaterialObj(objData, subObjs[i], materials);
        gameObject.addChild(materialObj);
    }

    return gameObject;
}

let _realIndices: string[];
let _vertexIndex: number;

function createMaterialObj(obj: OBJ_OBJData, subObj: OBJ_SubOBJ, materials: { [name: string]: Material; })
{
    const gameObject = new GameObject();
    gameObject.name = subObj.g || gameObject.name;
    const model = gameObject.addComponent(Renderable);
    if (materials && materials[subObj.material])
    { model.material = materials[subObj.material]; }

    const geometry = model.geometry = new CustomGeometry();
    geometry.name = subObj.g || geometry.name;
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    _realIndices = [];
    _vertexIndex = 0;
    const faces = subObj.faces;
    const indices: number[] = [];
    for (let i = 0; i < faces.length; i++)
    {
        const face = faces[i];
        const numVerts = face.indexIds.length - 1;
        for (let j = 1; j < numVerts; ++j)
        {
            translateVertexData(face, j, vertices, uvs, indices, normals, obj);
            translateVertexData(face, 0, vertices, uvs, indices, normals, obj);
            translateVertexData(face, j + 1, vertices, uvs, indices, normals, obj);
        }
    }
    geometry.indices = indices;
    geometry.positions = vertices;

    if (normals.length > 0)
    { geometry.normals = normals; }

    if (uvs.length > 0)
    { geometry.uvs = uvs; }

    globalEmitter.emit('asset.parsed', geometry);

    return gameObject;

    function translateVertexData(face: OBJ_Face, vertexIndex: number, vertices: Array<number>, uvs: Array<number>, indices: Array<number>, normals: Array<number>, obj: OBJ_OBJData)
    {
        let index: number;
        let vertex: { x: number; y: number; z: number; };
        let vertexNormal: { x: number; y: number; z: number; };
        let uv: { u: number, v: number, s: number };
        if (!_realIndices[face.indexIds[vertexIndex]])
        {
            index = _vertexIndex;
            _realIndices[face.indexIds[vertexIndex]] = ++_vertexIndex;
            vertex = obj.vertex[parseInt(face.vertexIndices[vertexIndex]) - 1];
            vertices.push(vertex.x, vertex.y, vertex.z);
            if (face.normalIndices && face.normalIndices.length > 0)
            {
                vertexNormal = obj.vn[parseInt(face.normalIndices[vertexIndex]) - 1];
                normals.push(vertexNormal.x, vertexNormal.y, vertexNormal.z);
            }
            if (face.uvIndices && face.uvIndices.length > 0)
            {
                try
                {
                    uv = obj.vt[parseInt(face.uvIndices[vertexIndex]) - 1];
                    uvs.push(uv.u, uv.v);
                }
                catch (e)
                {
                    switch (vertexIndex)
                    {
                        case 0:
                            uvs.push(0, 1);
                            break;
                        case 1:
                            uvs.push(0.5, 0);
                            break;
                        case 2:
                            uvs.push(1, 1);
                    }
                }
            }
        }
        else
        { index = _realIndices[face.indexIds[vertexIndex]] - 1; }
        indices.push(index);
    }
}
