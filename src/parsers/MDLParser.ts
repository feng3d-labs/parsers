import { Quaternion, Vector2, Vector3 } from '@feng3d/math';
import { AnimInfo, AnimInfo1, BoneObject, BoneRotation, BoneScaling, BoneTranslation, FBitmap, Geoset, GeosetAnim, Globalsequences, Interval, Layer, Material, Model, Rotation, Scaling, Translation } from './mdl/MdlModel';
import { War3Model } from './mdl/War3Model';

/**
 * war3的mdl文件解析器
 */
export class MDLParser
{
	/**
	 * 解析war3的mdl文件
	 * @param data MDL模型数据
	 * @param completed 完成回调
	 */
	parse(data: string, completed?: (war3Model: War3Model) => void): void
	{
		parse(data, completed);
	}
}

/**
 * war3的mdl文件解析器
 */
export const mdlParser = new MDLParser();

const VERSION_TOKEN = 'Version';
const COMMENT_TOKEN = '//';
const MODEL = 'Model';
const SEQUENCES = 'Sequences';
const GLOBALSEQUENCES = 'GlobalSequences';
const TEXTURES = 'Textures';
const MATERIALS = 'Materials';
const GEOSET = 'Geoset';
const GEOSETANIM = 'GeosetAnim';
const BONE = 'Bone';
const HELPER = 'Helper';

function parse(data: string, onParseComplete?: (war3Model: War3Model) => void)
{
	let token: string;

	let bone: BoneObject;
	let geoset: Geoset;
	let junpStr: string;

	// const num = 0;
	const war3Model = new War3Model();

	/** 字符串数据 */
	const context = data;
	/** 当前解析位置 */
	let _parseIndex = 0;
	/** 是否文件尾 */
	let _reachedEOF = false;
	/** 当前解析行号 */
	let _line: number;
	/** 当前行的字符位置 */
	let _charLineIndex = 0;

	// eslint-disable-next-line no-unmodified-loop-condition
	while (!_reachedEOF)
	{
		// 获取关键字
		token = getNextToken();
		switch (token)
		{
			case COMMENT_TOKEN:
				ignoreLine();
				break;
			case VERSION_TOKEN:
				war3Model._version = parseVersion();
				break;
			case MODEL:
				war3Model.model = parseModel();
				break;
			case SEQUENCES:
				war3Model.sequences = parseSequences();
				break;
			case GLOBALSEQUENCES:
				war3Model.globalsequences = parseGlobalsequences();
				break;
			case TEXTURES:
				war3Model.textures = parseTextures();
				break;
			case MATERIALS:
				war3Model.materials = parseMaterials();
				break;
			case GEOSET:
				geoset = parseGeoset();
				war3Model.geosets.push(geoset);
				break;
			case GEOSETANIM:
				parseGeosetanim();
				break;
			case BONE:
				bone = parseBone();
				war3Model.bones[bone.ObjectId] = bone;
				break;
			case HELPER:
				bone = parseHelper();
				war3Model.bones[bone.ObjectId] = bone;
				break;
			case 'PivotPoints':
				war3Model.pivotPoints = parsePivotPoints();
				break;
			case 'ParticleEmitter2':
				parseLiteralString();
				junpStr = jumpChunk();
				break;
			case 'EventObject':
				parseLiteralString();
				junpStr = jumpChunk();
				break;
			case 'Attachment':
				parseLiteralString();
				junpStr = jumpChunk();
				break;
			case 'RibbonEmitter':
				parseLiteralString();
				junpStr = jumpChunk();
				break;
			case 'CollisionShape':
				parseLiteralString();
				junpStr = jumpChunk();
				break;
			case 'Camera':
				parseLiteralString();
				junpStr = jumpChunk();
				break;
			case 'Light':
				parseLiteralString();
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				junpStr = jumpChunk();
				break;
			default:
				if (!_reachedEOF)
				{
					sendUnknownKeywordError(token);
				}
		}
	}
	onParseComplete && onParseComplete(war3Model);

	// /**
	//  * 获取骨骼深度
	//  * @param bone
	//  * @param bones
	//  * @return
	//  */
	// function getBoneDepth(bone: BoneObject, bones: BoneObject[]): number
	// {
	// 	if (bone.Parent === -1)
	// 	{
	// 		return 0;
	// 	}

	// 	return getBoneDepth(bones[bone.Parent], bones) + 1;
	// }

	/**
	 * 解析版本号
	 */
	function parseVersion()
	{
		let token: string = getNextToken();

		if (token !== '{')
		{
			sendParseError(token);
		}

		token = getNextToken();
		if (token !== 'FormatVersion')
		{
			sendUnknownKeywordError(token);
		}

		const version = getNextInt();

		token = getNextToken();

		if (token !== '}')
		{
			sendParseError(token);
		}

		return version;
	}

	/**
	 * 解析模型数据统计结果
	 */
	function parseModel(): Model
	{
		const model: Model = new Model();

		model.name = parseLiteralString();

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'BlendTime':
					model.BlendTime = getNextInt();
					break;
				case 'MinimumExtent':
					model.MinimumExtent = parseVector3D();
					break;
				case 'MaximumExtent':
					model.MaximumExtent = parseVector3D();
					break;
				case '}':
					break;
				default:
					ignoreLine();
					break;
			}
		}

		return model;
	}

	/**
	 * 解析动作序列
	 */
	function parseSequences(): AnimInfo[]
	{
		// 跳过动作个数
		getNextInt();
		const sequences: AnimInfo[] = [];

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'Anim':
					const anim: AnimInfo = parseAnim();
					sequences.push(anim);
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return sequences;
	}

	/**
	 * 解析全局序列
	 */
	function parseGlobalsequences(): Globalsequences
	{
		const globalsequences: Globalsequences = new Globalsequences();

		globalsequences.id = getNextInt();

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'Duration':
					const duration: number = getNextInt();
					globalsequences.durations.push(duration);
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return globalsequences;
	}

	/**
	 * 解析纹理列表
	 */
	function parseTextures(): FBitmap[]
	{
		// 跳过纹理个数
		getNextInt();
		const bitmaps: FBitmap[] = [];

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'Bitmap':
					const bitmap: FBitmap = parseBitmap();
					bitmaps.push(bitmap);
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return bitmaps;
	}

	/**
	 * 解析材质
	 */
	function parseMaterials(): Material[]
	{
		// 跳过纹理个数
		getNextInt();
		const materials: Material[] = [];

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'Material':
					const material: Material = parseMaterial();
					materials.push(material);
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return materials;
	}

	function parseGeoset(): Geoset
	{
		const geoset: Geoset = new Geoset();

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'Vertices':
					geoset.Vertices = parseVertices();
					break;
				case 'Normals':
					geoset.Normals = parseNormals();
					break;
				case 'TVertices':
					geoset.TVertices = parseTVertices();
					break;
				case 'VertexGroup':
					geoset.VertexGroup = parseVertexGroup();
					break;
				case 'Faces':
					geoset.Faces = parseFaces();
					break;
				case 'Groups':
					geoset.Groups = parseGroups();
					break;
				case 'MinimumExtent':
					geoset.MinimumExtent = parseVector3D();
					break;
				case 'MaximumExtent':
					geoset.MaximumExtent = parseVector3D();
					break;
				case 'BoundsRadius':
					geoset.BoundsRadius = getNextNumber();
					break;
				case 'Anim':
					const anim: AnimInfo1 = parseAnim1();
					geoset.Anims.push(anim);
					break;
				case 'MaterialID':
					geoset.MaterialID = getNextInt();
					break;
				case 'SelectionGroup':
					geoset.SelectionGroup = getNextInt();
					break;
				case 'Unselectable':
					geoset.Unselectable = true;
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return geoset;
	}

	/**
	 * 解析骨骼动画
	 */
	function parseBone(): BoneObject
	{
		const bone: BoneObject = new BoneObject();
		bone.type = 'bone';

		bone.name = parseLiteralString();

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'ObjectId':
					bone.ObjectId = getNextInt();
					break;
				case 'Parent':
					bone.Parent = getNextInt();
					break;
				case 'GeosetId':
					bone.GeosetId = getNextToken();
					break;
				case 'GeosetAnimId':
					bone.GeosetAnimId = getNextToken();
					break;
				case 'Billboarded':
					bone.Billboarded = true;
					break;
				case 'Translation':
					parseBoneTranslation(bone.Translation);
					break;
				case 'Scaling':
					parseBoneScaling(bone.Scaling);
					break;
				case 'Rotation':
					parseBoneRotation(bone.Rotation);
					break;
				case 'BillboardedLockZ':
					break;
				case 'BillboardedLockY':
					break;
				case 'BillboardedLockX':
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return bone;
	}

	/**
	 * 解析骨骼动画
	 */
	function parseHelper(): BoneObject
	{
		const bone: BoneObject = new BoneObject();
		bone.type = 'helper';

		bone.name = parseLiteralString();

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'ObjectId':
					bone.ObjectId = getNextInt();
					break;
				case 'Parent':
					bone.Parent = getNextInt();
					break;
				case 'GeosetId':
					bone.GeosetId = getNextToken();
					break;
				case 'GeosetAnimId':
					bone.GeosetAnimId = getNextToken();
					break;
				case 'Billboarded':
					bone.Billboarded = true;
					break;
				case 'Translation':
					parseBoneTranslation(bone.Translation);
					break;
				case 'Scaling':
					parseBoneScaling(bone.Scaling);
					break;
				case 'Rotation':
					parseBoneRotation(bone.Rotation);
					break;
				case 'BillboardedLockX':
					break;
				case 'BillboardedLockY':
					break;
				case 'BillboardedLockZ':
					break;
				case 'DontInherit':
					jumpChunk();
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return bone;
	}

	/**
	 * 解析骨骼角度
	 */
	function parseBoneScaling(boneScaling: BoneScaling): void
	{
		// 跳过长度
		const len: number = getNextInt();

		check('{');
		boneScaling.type = getNextToken();

		const currentIndex: number = _parseIndex;
		const token: string = getNextToken();
		if (token === 'GlobalSeqId')
		{
			boneScaling.GlobalSeqId = getNextInt();
		}
		else
		{
			_parseIndex = currentIndex;
		}

		let i = 0;
		let scaling: Scaling;
		switch (boneScaling.type)
		{
			case 'Hermite':
			case 'Bezier':
				for (i = 0; i < len; i++)
				{
					scaling = new Scaling();
					scaling.time = getNextInt();
					scaling.value = parseVector3D();
					scaling[getNextToken()] = parseVector3D();
					scaling[getNextToken()] = parseVector3D();
					boneScaling.scalings.push(scaling);
				}
				break;
			case 'Linear':
				for (i = 0; i < len; i++)
				{
					scaling = new Scaling();
					scaling.time = getNextInt();
					scaling.value = parseVector3D();
					boneScaling.scalings.push(scaling);
				}
				break;
			case 'DontInterp':
				for (i = 0; i < len; i++)
				{
					scaling = new Scaling();
					scaling.time = getNextInt();
					scaling.value = parseVector3D();
					boneScaling.scalings.push(scaling);
				}
				break;
			default:
				throw new Error(`未处理${boneScaling.type}类型角度`);
		}
		check('}');
	}

	/**
	 * 解析骨骼角度
	 */
	function parseBoneTranslation(boneTranslation: BoneTranslation): void
	{
		// 跳过长度
		const len: number = getNextInt();

		check('{');
		boneTranslation.type = getNextToken();

		const currentIndex: number = _parseIndex;
		const token: string = getNextToken();
		if (token === 'GlobalSeqId')
		{
			boneTranslation.GlobalSeqId = getNextInt();
		}
		else
		{
			_parseIndex = currentIndex;
		}

		let i = 0;
		let translation: Translation;
		switch (boneTranslation.type)
		{
			case 'Hermite':
			case 'Bezier':
				for (i = 0; i < len; i++)
				{
					translation = new Translation();
					translation.time = getNextInt();
					translation.value = parseVector3D();
					translation[getNextToken()] = parseVector3D();
					translation[getNextToken()] = parseVector3D();
					boneTranslation.translations.push(translation);
				}
				break;
			case 'Linear':
				for (i = 0; i < len; i++)
				{
					translation = new Translation();
					translation.time = getNextInt();
					translation.value = parseVector3D();
					boneTranslation.translations.push(translation);
				}
				break;
			case 'DontInterp':
				for (i = 0; i < len; i++)
				{
					translation = new Translation();
					translation.time = getNextInt();
					translation.value = parseVector3D();
					boneTranslation.translations.push(translation);
				}
				break;
			default:
				throw new Error(`未处理${boneTranslation.type}类型角度`);
		}
		check('}');
	}

	/**
	 * 解析骨骼角度
	 */
	function parseBoneRotation(boneRotation: BoneRotation): void
	{
		const len: number = getNextInt();

		check('{');
		boneRotation.type = getNextToken();

		const currentIndex: number = _parseIndex;
		const token: string = getNextToken();
		if (token === 'GlobalSeqId')
		{
			boneRotation.GlobalSeqId = getNextInt();
		}
		else
		{
			_parseIndex = currentIndex;
		}

		let i = 0;
		let rotation: Rotation;
		switch (boneRotation.type)
		{
			case 'Hermite':
			case 'Bezier':
				for (i = 0; i < len; i++)
				{
					rotation = new Rotation();
					rotation.time = getNextInt();
					rotation.value = parseVector3D4();
					rotation[getNextToken()] = parseVector3D4();
					rotation[getNextToken()] = parseVector3D4();
					boneRotation.rotations.push(rotation);
				}
				break;
			case 'Linear':
				for (i = 0; i < len; i++)
				{
					rotation = new Rotation();
					rotation.time = getNextInt();
					rotation.value = parseVector3D4();
					boneRotation.rotations.push(rotation);
				}
				break;
			case 'DontInterp':
				for (i = 0; i < len; i++)
				{
					rotation = new Rotation();
					rotation.time = getNextInt();
					rotation.value = parseVector3D4();
					boneRotation.rotations.push(rotation);
				}
				break;
			default:
				throw new Error(`未处理${boneRotation.type}类型角度`);
		}
		check('}');
	}

	/**
	 * 解析多边形动画
	 */
	function parseGeosetanim(): GeosetAnim | null
	{
		// const jumpStr = jumpChunk();

		return null;

		// if (war3Model.geosetAnims == null)
		// 	war3Model.geosetAnims = [];
		// var geosetAnim: GeosetAnim = new GeosetAnim();
		// war3Model.geosetAnims.push(geosetAnim);

		// var token: string = getNextToken();

		// if (token != "{")
		// 	sendParseError(token);

		// var ch: string;
		// while (ch != "}")
		// {
		// 	ch = getNextToken();
		// 	switch (ch)
		// 	{
		// 		case COMMENT_TOKEN:
		// 			ignoreLine();
		// 			break;
		// 		case "Alpha":
		// 			//						parseAnimAlpha();
		// 			break;
		// 		case "}":
		// 			break;
		// 		default:
		// 			sendUnknownKeywordError(ch);
		// 			break;
		// 	}
		// }
		// return geosetAnim;
	}

	/**
	 * 解析顶点
	 */
	function parseVertices(): number[]
	{
		const vertices: number[] = [];

		// 跳过长度
		const len: number = getNextInt();
		let token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let vertex: Vector3;
		for (let i = 0; i < len; i++)
		{
			vertex = parseVector3D();
			vertices.push(vertex.x, vertex.y, vertex.z);
		}

		token = getNextToken();
		if (token !== '}')
		{ sendParseError(token); }

		return vertices;
	}

	/**
	 * 解析法线
	 */
	function parseNormals(): number[]
	{
		const normals: number[] = [];

		// 跳过长度
		const len: number = getNextInt();
		let token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let vertex: Vector3;
		for (let i = 0; i < len; i++)
		{
			vertex = parseVector3D();
			normals.push(vertex.x, vertex.y, vertex.z);
		}

		token = getNextToken();
		if (token !== '}')
		{ sendParseError(token); }

		return normals;
	}

	/**
	 * 解析纹理坐标
	 */
	function parseTVertices(): number[]
	{
		const tVertices: number[] = [];

		// 跳过长度
		const len: number = getNextInt();
		let token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let uv: Vector2;
		for (let i = 0; i < len; i++)
		{
			uv = parsePoint();
			tVertices.push(uv.x, uv.y);
		}

		token = getNextToken();
		if (token !== '}')
		{ sendParseError(token); }

		return tVertices;
	}

	/**
	 * 解析顶点分组
	 */
	function parseVertexGroup(): number[]
	{
		const vertexGroup: number[] = [];

		let token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		token = getNextToken();
		while (token !== '}')
		{
			vertexGroup.push(Number(token));
			token = getNextToken();
		}

		return vertexGroup;
	}

	/**
	 * 解析面
	 */
	function parseFaces(): number[]
	{
		const faces: number[] = [];

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const faceNum: number = getNextInt();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const indexNum: number = getNextInt();

		let token: string;

		check('{');
		check('Triangles');
		check('{');
		check('{');

		token = getNextToken();
		while (token !== '}')
		{
			faces.push(Number(token));
			token = getNextToken();
		}

		check('}');
		check('}');

		return faces;
	}

	/**
	 * 解顶点分组
	 */
	function parseGroups(): number[][]
	{
		const groups: number[][] = [];

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const groupNum: number = getNextInt();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const valueNum: number = getNextInt();

		let token: string;

		check('{');

		token = getNextToken();
		while (token !== '}')
		{
			if (token === 'Matrices')
			{
				check('{');
				token = getNextToken();
				const Matrices: number[] = [];
				while (token !== '}')
				{
					Matrices.push(Number(token));
					token = getNextToken();
				}
				groups.push(Matrices);
			}
			token = getNextToken();
		}

		return groups;
	}

	/**
	 * 解析纹理
	 */
	function parseBitmap(): FBitmap
	{
		const bitmap: FBitmap = new FBitmap();

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'Image':
					bitmap.image = parseLiteralString();
					bitmap.image = bitmap.image.replace(/\\/g, '/');
					break;
				case 'ReplaceableId':
					bitmap.ReplaceableId = getNextInt();
					break;
				case 'WrapWidth':
					break;
				case 'WrapHeight':
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return bitmap;
	}

	/**
	 * 解析材质
	 */
	function parseMaterial(): Material
	{
		const material: Material = new Material();

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'Layer':
					const layer: Layer = parseLayer();
					material.layers.push(layer);
					break;
				case 'SortPrimsFarZ':
					break;
				case 'ConstantColor':
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return material;
	}

	/**
	 * 解析材质层
	 */
	function parseLayer(): Layer
	{
		const layer: Layer = new Layer();

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let staticSigned = false;
		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'FilterMode':
					layer.FilterMode = getNextToken();
					break;
				case 'static':
					staticSigned = true;
					break;
				case 'TextureID':
					if (staticSigned)
					{
						layer.TextureID = getNextInt();
					}
					else
					{
						sendUnknownKeywordError(ch);
					}
					staticSigned = false;
					break;
				case 'Alpha':
					if (staticSigned)
					{
						layer.Alpha = getNextNumber();
					}
					else
					{
						getNextInt();
						jumpChunk();

						//							sendUnknownKeywordError(ch);
					}
					staticSigned = false;
					break;
				case 'Unshaded':
					layer.Unshaded = true;
					break;
				case 'Unfogged':
					layer.Unfogged = true;
					break;
				case 'TwoSided':
					layer.TwoSided = true;
					break;
				case 'SphereEnvMap':
					layer.SphereEnvMap = true;
					break;
				case 'NoDepthTest':
					layer.NoDepthTest = true;
					break;
				case 'NoDepthSet':
					layer.NoDepthSet = true;
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return layer;
	}

	/**
	 * 解析动作信息
	 */
	function parseAnim(): AnimInfo
	{
		const anim: AnimInfo = new AnimInfo();

		anim.name = parseLiteralString();

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'Interval':
					anim.interval = parseInterval();
					break;
				case 'MinimumExtent':
					anim.MinimumExtent = parseVector3D();
					break;
				case 'MaximumExtent':
					anim.MaximumExtent = parseVector3D();
					break;
				case 'BoundsRadius':
					anim.BoundsRadius = getNextNumber();
					break;
				case 'Rarity':
					anim.Rarity = getNextNumber();
					break;
				case 'NonLooping':
					anim.loop = false;
					break;
				case 'MoveSpeed':
					anim.MoveSpeed = getNextNumber();
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return anim;
	}

	/**
	 * 解析几何体动作信息
	 */
	function parseAnim1(): AnimInfo1
	{
		const anim: AnimInfo1 = new AnimInfo1();

		const token: string = getNextToken();

		if (token !== '{')
		{ sendParseError(token); }

		let ch = '';
		while (ch !== '}')
		{
			ch = getNextToken();
			switch (ch)
			{
				case COMMENT_TOKEN:
					ignoreLine();
					break;
				case 'MinimumExtent':
					anim.MinimumExtent = parseVector3D();
					break;
				case 'MaximumExtent':
					anim.MaximumExtent = parseVector3D();
					break;
				case 'BoundsRadius':
					anim.BoundsRadius = getNextNumber();
					break;
				case '}':
					break;
				default:
					sendUnknownKeywordError(ch);
					break;
			}
		}

		return anim;
	}

	/**
	 * 解析骨骼轴心坐标
	 */
	function parsePivotPoints(): Vector3[]
	{
		const points: Vector3[] = [];

		const len: number = getNextInt();

		check('{');

		for (let i = 0; i < len; i++)
		{
			const point: Vector3 = parseVector3D();
			points.push(point);
		}

		check('}');

		return points;
	}

	/**
	 * 解析3d向量
	 */
	function parseVector3D(): Vector3
	{
		const vec: Vector3 = new Vector3();
		let ch: string = getNextToken();

		if (ch !== '{')
		{ sendParseError('{'); }
		vec.x = getNextNumber();
		vec.y = getNextNumber();
		vec.z = getNextNumber();

		ch = getNextToken();
		if (!(ch === '}' || ch === '},'))
		{ sendParseError('}'); }

		return vec;
	}

	/**
	 * 解析四元素
	 */
	function parseVector3D4(): Quaternion
	{
		const vec: Quaternion = new Quaternion();
		let ch: string = getNextToken();

		if (ch !== '{')
		{ sendParseError('{'); }
		vec.x = getNextNumber();
		vec.y = getNextNumber();
		vec.z = getNextNumber();
		vec.w = getNextNumber();

		ch = getNextToken();
		if (!(ch === '}' || ch === '},'))
		{ sendParseError('}'); }

		return vec;
	}

	/**
	 * 解析2d坐标
	 */
	function parsePoint(): Vector2
	{
		const point: Vector2 = new Vector2();
		let ch: string = getNextToken();

		if (ch !== '{')
		{
			sendParseError('{');
		}
		point.x = getNextNumber();
		point.y = getNextNumber();

		ch = getNextToken();
		if (!(ch === '}' || ch === '},'))
		{
			sendParseError('}');
		}

		return point;
	}

	/**
	 * 解析间隔
	 */
	function parseInterval(): Interval
	{
		const interval: Interval = new Interval();
		let ch: string = getNextToken();

		if (ch !== '{')
		{
			sendParseError('{');
		}
		interval.start = getNextInt();
		interval.end = getNextInt();

		ch = getNextToken();
		if (!(ch === '}' || ch === '},'))
		{
			sendParseError('}');
		}

		return interval;
	}

	/**
	 * 解析带双引号的字符串
	 */
	function parseLiteralString(): string
	{
		skipWhiteSpace();

		let ch: string = getNextChar();
		let str = '';

		if (ch !== '"')
		{ sendParseError('"'); }

		do
		{
			if (_reachedEOF)
			{
				sendEOFError();
			}
			ch = getNextChar();
			if (ch !== '"')
			{
				str += ch;
			}
		} while (ch !== '"');

		return str;
	}

	/**
	 * 读取下个Number
	 */
	function getNextNumber(): number
	{
		const f: number = parseFloat(getNextToken());
		if (isNaN(f))
		{ sendParseError('float type'); }

		return f;
	}

	/**
	 * 读取下个字符
	 */
	function getNextChar(): string
	{
		const ch: string = context.charAt(_parseIndex++);

		if (ch === '\n')
		{
			++_line;
			_charLineIndex = 0;
		}
		else if (ch !== '\r')
		{ ++_charLineIndex; }

		if (_parseIndex >= context.length)
		{ _reachedEOF = true; }

		return ch;
	}

	/**
	 * 读取下个int
	 */
	function getNextInt(): number
	{
		const i: number = parseInt(getNextToken(), 10);
		if (isNaN(i))
		{
			sendParseError('int type');
		}

		return i;
	}

	/**
	 * 获取下个关键字
	 */
	function getNextToken(): string
	{
		let ch: string;
		let token = '';

		while (!_reachedEOF)
		{
			ch = getNextChar();
			if (ch === ' ' || ch === '\r' || ch === '\n' || ch === '\t' || ch === ',')
			{
				if (token !== COMMENT_TOKEN)
				{
					skipWhiteSpace();
				}
				if (token !== '')
				{
					return token;
				}
			}
			else
			{
				token += ch;
			}

			if (token === COMMENT_TOKEN)
			{
				return token;
			}
		}

		return token;
	}

	/**
	 * 跳过块
	 * @return 跳过的内容
	 */
	function jumpChunk()
	{
		const start: number = _parseIndex;

		check('{');
		const stack = ['{'];

		let ch: string;

		while (!_reachedEOF)
		{
			ch = getNextChar();
			if (ch === '{')
			{
				stack.push('{');
			}
			if (ch === '}')
			{
				stack.pop();
				if (stack.length === 0)
				{
					return context.substring(start, _parseIndex);
				}
			}
		}

		return '';
	}

	/**
	 * 返回到上个字符位置
	 */
	function putBack(): void
	{
		_parseIndex--;
		_charLineIndex--;
		_reachedEOF = _parseIndex >= context.length;
	}

	/**
	 * 跳过空白
	 */
	function skipWhiteSpace(): void
	{
		let ch: string;

		do
		{ ch = getNextChar(); }
		while (ch === '\n' || ch === ' ' || ch === '\r' || ch === '\t');

		putBack();
	}

	/**
	 * 忽略该行
	 */
	function ignoreLine(): void
	{
		let ch = '';
		while (!_reachedEOF && ch !== '\n')
		{
			ch = getNextChar();
		}
	}

	function check(key: string): void
	{
		const token: string = getNextToken();
		if (token !== key)
		{
			sendParseError(token);
		}
	}

	/**
	 * 抛出一个文件尾过早结束文件时遇到错误
	 */
	function sendEOFError(): void
	{
		throw new Error('Unexpected end of file');
	}

	/**
	 * 遇到了一个意想不到的令牌时将抛出一个错误。
	 * @param expected 发生错误的标记
	 */
	function sendParseError(expected: string): void
	{
		throw new Error(`Unexpected token at line ${_line + 1}, character ${_charLineIndex}. ${expected} expected, but ${context.charAt(_parseIndex - 1)} encountered`);
	}

	/**
	 * 发生未知关键字错误
	 */
	function sendUnknownKeywordError(keyword: string): void
	{
		throw new Error(`Unknown keyword[${keyword}] at line ${_line + 1}, character ${_charLineIndex}. `);
	}
}
