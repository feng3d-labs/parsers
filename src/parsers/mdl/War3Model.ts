import { Animation, AnimationClip, CustomGeometry, GameObject, geometryUtils, Material as Feng3dMaterial, PropertyClip, SkeletonComponent, SkeletonJoint, SkinnedMeshRenderer, SkinSkeletonTemp } from '@feng3d/core';
import { globalEmitter } from '@feng3d/event';
import { Matrix4x4, Vector3 } from '@feng3d/math';
import { CullFace } from '@feng3d/renderer';
import { serialization } from '@feng3d/serialization';
import { AnimInfo, BoneObject, FBitmap, Geoset, GeosetAnim, Globalsequences, Material, Model } from './MdlModel';

/**
 * war3模型数据
 */
export class War3Model
{
	/** 版本号 */
	_version: number;
	/** 模型数据统计结果 */
	model: Model;
	/** 动作序列 */
	sequences: AnimInfo[];
	/** 全局序列 */
	globalsequences: Globalsequences;
	/** 纹理列表 */
	textures: FBitmap[];
	/** 材质列表 */
	materials: Material[];
	/** 几何设置列表 */
	geosets: Geoset[] = [];
	/** 几何动画列表 */
	geosetAnims: GeosetAnim[];
	/** 骨骼动画列表 */
	bones: BoneObject[] = [];
	/** 骨骼轴心坐标 */
	pivotPoints: Vector3[];

	// -------------------------------------
	//
	//	以下数据计算得出
	//
	// ---------------------------------------

	private meshs: GameObject[];
	private skeletonComponent: SkeletonComponent;

	getMesh(): GameObject
	{
		this.meshs = [];
		this.meshs.length = this.geosets.length;

		const container = serialization.setValue(new GameObject(), { name: this.model.name });

		const skeletonjoints = createSkeleton(this);
		this.skeletonComponent = container.addComponent(SkeletonComponent);
		this.skeletonComponent.joints = skeletonjoints;

		for (let i = 0; i < this.geosets.length; i++)
		{
			const geoset: Geoset = this.geosets[i];

			const mesh: GameObject = this.meshs[i] = new GameObject();
			// var model = mesh.addComponent("Model");
			const model = mesh.addComponent(SkinnedMeshRenderer);

			const geometry: CustomGeometry = new CustomGeometry();
			geometry.positions = geoset.Vertices;
			geometry.uvs = geoset.TVertices;
			geometry.indices = geoset.Faces;
			const normals = geometryUtils.createVertexNormals(geometry.indices, geometry.positions, true);
			geometry.normals = normals;

			const skins = BuildAnimatedMeshSkin(geoset);

			const skinSkeleton = new SkinSkeletonTemp();
			skinSkeleton.resetJointIndices(skins.jointIndices0, this.skeletonComponent);

			// 更新关节索引与权重索引
			geometry.skinIndices = skins.jointIndices0;
			geometry.skinWeights = skins.jointWeights0;

			const material: Material = this.materials[geoset.MaterialID];
			if (!material.material)
			{
				const fBitmap: FBitmap = this.getFBitmap(material);
				const image: string = fBitmap.image;
				// if (image && image.length > 0)
				// {
				// image = image.substring(0, image.indexOf("."));
				// image += ".JPG";
				material.material = model.material = serialization.setValue(new Feng3dMaterial(), { name: image, renderParams: { cullFace: CullFace.FRONT } });
				// }

				globalEmitter.emit('asset.parsed', material.material);
			}

			globalEmitter.emit('asset.parsed', geometry);

			model.geometry = geometry;
			model.skinSkeleton = skinSkeleton;

			container.addChild(mesh);
		}

		const animationclips = createAnimationClips(this);
		const animation = container.addComponent(Animation);
		animation.animation = animationclips[0];
		animation.animations = animationclips;

		//
		container.transform.rx = 90;
		container.transform.sx = 0.01;
		container.transform.sy = 0.01;
		container.transform.sz = -0.01;

		return container;
	}

	private getFBitmap(material: Material): FBitmap
	{
		let TextureID = 0;
		for (let i = 0; i < material.layers.length; i++)
		{
			const layer = material.layers[i];
			TextureID = layer.TextureID;
			break;
		}

		const fBitmap: FBitmap = this.textures[TextureID];

		return fBitmap;
	}
}

function createSkeleton(war3Model: War3Model)
{
	const bones = war3Model.bones;

	const skeletonjoints: SkeletonJoint[] = [];
	for (let i = 0; i < bones.length; i++)
	{
		createSkeletonJoint(i);
	}

	return skeletonjoints;

	function createSkeletonJoint(index)
	{
		if (skeletonjoints[index])
		{ return skeletonjoints[index]; }

		const joint = bones[index];
		const skeletonJoint = new SkeletonJoint();
		skeletonJoint.name = joint.name;
		skeletonJoint.parentIndex = joint.Parent;

		const position = war3Model.pivotPoints[joint.ObjectId];

		const matrix = new Matrix4x4().fromTRS(
			position,
			new Vector3(),
			new Vector3(1, 1, 1)
		);
		if (skeletonJoint.parentIndex !== -1)
		{
			const parentskeletonJoint = createSkeletonJoint(skeletonJoint.parentIndex);
			joint.pivotPoint = matrix.getPosition().subTo(parentskeletonJoint.matrix.getPosition());
		}
		else
		{
			joint.pivotPoint = position;
		}
		skeletonJoint.matrix = matrix;
		skeletonjoints[index] = skeletonJoint;

		return skeletonJoint;
	}
}

function BuildAnimatedMeshSkin(geoset: Geoset)
{
	// 关节索引数据
	const jointIndices0: number[] = [];
	// 关节权重数据
	const jointWeights0: number[] = [];

	const numVertexs: number = geoset.Vertices.length / 3;
	for (let i = 0; i < numVertexs; i++)
	{
		// 顶点所在组索引
		const iGroupIndex: number = geoset.VertexGroup[i];
		// 顶点所在组索引
		const group = geoset.Groups[iGroupIndex];
		// 顶点关联骨骼数量
		const numBones: number = group.length;
		const weightJoints = [0, 0, 0, 0];
		for (let j = 0; j < numBones; j++)
		{
			const boneIndex: number = group[j];
			weightJoints[j] = boneIndex;
		}
		const weightBiass = [0, 0, 0, 0];
		for (let j = 0; j < 4; j++)
		{
			if (j < numBones)
			{
				weightBiass[j] = 1 / numBones;
			}
		}
		//
		jointIndices0[i * 4] = weightJoints[0];
		jointIndices0[i * 4 + 1] = weightJoints[1];
		jointIndices0[i * 4 + 2] = weightJoints[2];
		jointIndices0[i * 4 + 3] = weightJoints[3];
		//
		jointWeights0[i * 4] = weightBiass[0];
		jointWeights0[i * 4 + 1] = weightBiass[1];
		jointWeights0[i * 4 + 2] = weightBiass[2];
		jointWeights0[i * 4 + 3] = weightBiass[3];
	}

	return { jointIndices0, jointWeights0 };
}

function createAnimationClips(war3Model: War3Model)
{
	const sequences = war3Model.sequences;
	const animationclips: AnimationClip[] = [];
	for (let i = 0; i < sequences.length; i++)
	{
		const sequence = sequences[i];
		const animationclip = new AnimationClip();
		animationclip.name = sequence.name;
		animationclip.loop = sequence.loop;
		animationclip.length = sequence.interval.end - sequence.interval.start;
		animationclip.propertyClips = [];

		const __chache__: { [key: string]: PropertyClip } = {};

		war3Model.bones.forEach((bone) =>
		{
			bone.buildAnimationclip(animationclip, __chache__, sequence.interval.start, sequence.interval.end);
		});

		globalEmitter.emit('asset.parsed', animationclip);

		animationclips.push(animationclip);
	}

	return animationclips;
}
