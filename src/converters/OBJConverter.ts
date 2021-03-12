namespace feng3d
{
    /**
     * OBJ模型转换器
     */
    export var objConverter: OBJConverter;

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
        convert(objData: OBJ_OBJData, materials: { [name: string]: Material; }, completed: (node3d: Node3D) => void)
        {
            var object = new Entity().addComponent(Node3D);
            object.name = objData.name;
            var objs = objData.objs;
            for (var i = 0; i < objs.length; i++)
            {
                var obj = objs[i];
                var node3d = createSubObj(objData, obj, materials);
                object.addChild(node3d);
            }

            globalEmitter.emit("asset.parsed", object);

            completed && completed(object);
        }
    }
    objConverter = new OBJConverter();

    function createSubObj(objData: OBJ_OBJData, obj: OBJ_OBJ, materials: { [name: string]: Material; })
    {
        var node3d = serialization.setValue(new Entity(), { name: obj.name }).addComponent(Node3D);

        var subObjs = obj.subObjs;
        for (var i = 0; i < subObjs.length; i++)
        {
            var materialTransform = createMaterialObj(objData, subObjs[i], materials);
            node3d.addChild(materialTransform);
        }
        return node3d;
    }

    var _realIndices: string[];
    var _vertexIndex: number;

    function createMaterialObj(obj: OBJ_OBJData, subObj: OBJ_SubOBJ, materials: { [name: string]: Material; })
    {
        var node3d = new Entity().addComponent(Node3D, (component) =>
        {
            component.entity.name = subObj.g || node3d.name;
        });
        var model = node3d.addComponent(Renderable);
        if (materials && materials[subObj.material])
            model.material = materials[subObj.material];

        var geometry = model.geometry = new CustomGeometry();
        geometry.name = subObj.g || geometry.name;
        var vertices: number[] = [];
        var normals: number[] = [];
        var uvs: number[] = [];
        _realIndices = [];
        _vertexIndex = 0;
        var faces = subObj.faces;
        var indices: number[] = [];
        for (var i = 0; i < faces.length; i++)
        {
            var face = faces[i];
            var numVerts = face.indexIds.length - 1;
            for (var j = 1; j < numVerts; ++j)
            {
                translateVertexData(face, j, vertices, uvs, indices, normals, obj);
                translateVertexData(face, 0, vertices, uvs, indices, normals, obj);
                translateVertexData(face, j + 1, vertices, uvs, indices, normals, obj);
            }
        }
        geometry.indices = indices;
        geometry.positions = vertices;

        if (normals.length > 0)
            geometry.normals = normals;

        if (uvs.length > 0)
            geometry.uvs = uvs;

        globalEmitter.emit("asset.parsed", geometry);

        return node3d;

        function translateVertexData(face: OBJ_Face, vertexIndex: number, vertices: Array<number>, uvs: Array<number>, indices: Array<number>, normals: Array<number>, obj: OBJ_OBJData)
        {
            var index: number;
            var vertex: { x: number; y: number; z: number; };
            var vertexNormal: { x: number; y: number; z: number; };
            var uv: { u: number, v: number, s: number };
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
                                uvs.push(.5, 0);
                                break;
                            case 2:
                                uvs.push(1, 1);
                        }
                    }
                }
            }
            else
                index = _realIndices[face.indexIds[vertexIndex]] - 1;
            indices.push(index);
        }
    }
}