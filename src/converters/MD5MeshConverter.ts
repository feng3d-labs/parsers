import { Animation, CustomGeometry, GameObject, SkeletonComponent, SkeletonJoint, SkinnedMeshRenderer, SkinSkeletonTemp } from '@feng3d/core';
import { globalEmitter } from '@feng3d/event';
import { Matrix4x4, Quaternion, Vector3 } from '@feng3d/math';
import { MD5MeshData, MD5_Joint, MD5_Mesh, MD5_Vertex, MD5_Weight } from '../parsers/MD5MeshParser';

/**
 * MD5模型转换器
 */
export class MD5MeshConverter
{
    /**
     * MD5模型数据转换为游戏对象
     * @param md5MeshData MD5模型数据
     * @param completed 转换完成回调
     */
    convert(md5MeshData: MD5MeshData, completed?: (gameObject: GameObject) => void)
    {
        const gameObject = new GameObject();
        gameObject.name = md5MeshData.name;
        gameObject.addComponent(Animation);
        gameObject.transform.rx = -90;

        // 顶点最大关节关联数
        const _maxJointCount = this.calculateMaxJointCount(md5MeshData);
        console.assert(_maxJointCount <= 8, '顶点最大关节关联数最多支持8个');

        const skeletonjoints = this.createSkeleton(md5MeshData.joints);

        const skeletonComponent = gameObject.addComponent(SkeletonComponent);
        skeletonComponent.joints = skeletonjoints;

        for (let i = 0; i < md5MeshData.meshs.length; i++)
        {
            const skinSkeleton = new SkinSkeletonTemp();
            const geometry = this.createGeometry(md5MeshData.meshs[i], skeletonComponent, skinSkeleton);

            const skeletonGameObject = new GameObject();

            const skinnedModel = skeletonGameObject.addComponent(SkinnedMeshRenderer);
            skinnedModel.geometry = geometry;
            skinnedModel.skinSkeleton = skinSkeleton;

            gameObject.addChild(skeletonGameObject);
        }

        globalEmitter.emit('asset.parsed', gameObject);
        completed && completed(gameObject);
    }

    /**
     * 计算最大关节数量
     */
    private calculateMaxJointCount(md5MeshData: MD5MeshData)
    {
        let _maxJointCount = 0;

        // 遍历所有的网格数据
        const numMeshData = md5MeshData.meshs.length;
        for (let i = 0; i < numMeshData; ++i)
        {
            const meshData: MD5_Mesh = md5MeshData.meshs[i];
            const vertexData: MD5_Vertex[] = meshData.verts;
            const numVerts = vertexData.length;

            // 遍历每个顶点 寻找关节关联最大数量
            for (let j = 0; j < numVerts; ++j)
            {
                const zeroWeights = this.countZeroWeightJoints(vertexData[j], meshData.weights);
                const totalJoints = vertexData[j].countWeight - zeroWeights;
                if (totalJoints > _maxJointCount)
                { _maxJointCount = totalJoints; }
            }
        }

        return _maxJointCount;
    }

    /**
     * 计算0权重关节数量
     * @param vertex 顶点数据
     * @param weights 关节权重数组
     * @return
     */
    private countZeroWeightJoints(vertex: MD5_Vertex, weights: MD5_Weight[]): number
    {
        const start = vertex.startWeight;
        const end = vertex.startWeight + vertex.countWeight;
        let count = 0;
        let weight: number;

        for (let i = start; i < end; ++i)
        {
            weight = weights[i].bias;
            if (weight == 0)
            { ++count; }
        }

        return count;
    }

    private createSkeleton(joints: MD5_Joint[])
    {
        const skeletonjoints: SkeletonJoint[] = [];
        for (let i = 0; i < joints.length; i++)
        {
            const skeletonJoint = this.createSkeletonJoint(joints[i]);
            skeletonjoints.push(skeletonJoint);
        }

        return skeletonjoints;
    }

    private createSkeletonJoint(joint: MD5_Joint)
    {
        const skeletonJoint = new SkeletonJoint();
        skeletonJoint.name = joint.name;
        skeletonJoint.parentIndex = joint.parentIndex;
        const position = joint.position;
        const rotation = joint.rotation;
        const quat = new Quaternion(rotation[0], -rotation[1], -rotation[2]);
        // quat supposed to be unit length
        const t = 1 - quat.x * quat.x - quat.y * quat.y - quat.z * quat.z;
        quat.w = t < 0 ? 0 : -Math.sqrt(t);
        //
        const matrix = quat.toMatrix();
        matrix.appendTranslation(-position[0], position[1], position[2]);
        //
        skeletonJoint.matrix = matrix;

        return skeletonJoint;
    }

    private createGeometry(md5Mesh: MD5_Mesh, skeleton: SkeletonComponent, skinSkeleton: SkinSkeletonTemp)
    {
        const vertexData = md5Mesh.verts;
        const weights = md5Mesh.weights;
        const indices = md5Mesh.tris;

        const geometry = new CustomGeometry();

        const len = vertexData.length;
        let vertex: MD5_Vertex;
        let weight: MD5_Weight;
        let bindPose: Matrix4x4;
        let pos: Vector3;
        // uv数据
        const uvs: number[] = [];
        uvs.length = len * 2;
        // 顶点位置数据
        const vertices: number[] = [];
        vertices.length = len * 3;
        // 关节索引数据
        const jointIndices0: number[] = [];
        jointIndices0.length = len * 4;
        const jointIndices1: number[] = [];
        jointIndices1.length = len * 4;
        // 关节权重数据
        const jointWeights0: number[] = [];
        jointWeights0.length = len * 4;
        const jointWeights1: number[] = [];
        jointWeights1.length = len * 4;

        for (let i = 0; i < len; ++i)
        {
            vertex = vertexData[i];
            vertices[i * 3] = vertices[i * 3 + 1] = vertices[i * 3 + 2] = 0;

            /**
             * 参考 http://blog.csdn.net/summerhust/article/details/17421213
             * VertexPos = (MJ-0 * weight[index0].pos * weight[index0].bias) + ... + (MJ-N * weight[indexN].pos * weight[indexN].bias)
             * 变量对应  MJ-N -> bindPose; 第J个关节的变换矩阵
             * weight[indexN].pos -> weight.pos;
             * weight[indexN].bias -> weight.bias;
             */
            const weightJoints: number[] = [];
            const weightBiass: number[] = [];
            for (let j = 0; j < 8; ++j)
            {
                weightJoints[j] = 0;
                weightBiass[j] = 0;
                if (j < vertex.countWeight)
                {
                    weight = weights[vertex.startWeight + j];
                    if (weight.bias > 0)
                    {
                        bindPose = skeleton.joints[weight.joint].matrix;
                        pos = bindPose.transformPoint3(new Vector3(-weight.pos[0], weight.pos[1], weight.pos[2]));
                        vertices[i * 3] += pos.x * weight.bias;
                        vertices[i * 3 + 1] += pos.y * weight.bias;
                        vertices[i * 3 + 2] += pos.z * weight.bias;

                        weightJoints[j] = weight.joint;
                        weightBiass[j] = weight.bias;
                    }
                }
            }

            jointIndices0[i * 4] = weightJoints[0];
            jointIndices0[i * 4 + 1] = weightJoints[1];
            jointIndices0[i * 4 + 2] = weightJoints[2];
            jointIndices0[i * 4 + 3] = weightJoints[3];
            jointIndices1[i * 4] = weightJoints[4];
            jointIndices1[i * 4 + 1] = weightJoints[5];
            jointIndices1[i * 4 + 2] = weightJoints[6];
            jointIndices1[i * 4 + 3] = weightJoints[7];
            //
            jointWeights0[i * 4] = weightBiass[0];
            jointWeights0[i * 4 + 1] = weightBiass[1];
            jointWeights0[i * 4 + 2] = weightBiass[2];
            jointWeights0[i * 4 + 3] = weightBiass[3];
            jointWeights1[i * 4] = weightBiass[4];
            jointWeights1[i * 4 + 1] = weightBiass[5];
            jointWeights1[i * 4 + 2] = weightBiass[6];
            jointWeights1[i * 4 + 3] = weightBiass[7];

            uvs[vertex.index * 2] = vertex.u;
            uvs[vertex.index * 2 + 1] = vertex.v;
        }

        skinSkeleton.resetJointIndices(jointIndices0, skeleton);
        skinSkeleton.resetJointIndices(jointIndices1, skeleton);

        // 更新索引数据
        geometry.indices = indices;
        // 更新顶点坐标与uv数据
        geometry.positions = vertices;
        geometry.uvs = uvs;
        // 更新关节索引与权重索引
        geometry.skinIndices = jointIndices0;
        geometry.skinWeights = jointWeights0;
        geometry.skinIndices1 = jointIndices1;
        geometry.skinWeights1 = jointWeights1;

        return geometry;
    }
}

/**
 * MD5模型转换器
 */
export const md5MeshConverter = new MD5MeshConverter();
