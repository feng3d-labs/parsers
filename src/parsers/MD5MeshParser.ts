/**
 * MD5模型解析器
 */
export class MD5MeshParser
{
    /**
     * 解析
     * @param context
     */
    parse(context: string)
    {
        //
        const md5MeshData = <MD5MeshData>{};
        const lines = context.split('\n');
        for (let i = 0; i < lines.length; i++)
        {
            parserLine(lines[i], md5MeshData);
        }

        return md5MeshData;
    }
}
/**
 * MD5模型解析器
 */
export const md5MeshParser = new MD5MeshParser();

/**
 * 关节权重数据
 */
export type MD5_Weight = {
    /** weight 序号 */
    index: number;
    /** 对应的Joint的序号 */
    joint: number;
    /** 作用比例 */
    bias: number;
    /** 位置值 */
    pos: number[];
};

export type MD5_Vertex = {
    /** 顶点索引 */
    index: number;
    /** 纹理坐标u */
    u: number;
    /** 纹理坐标v */
    v: number;
    /** weight的起始序号 */
    startWeight: number;
    /** weight总数 */
    countWeight: number;
};

export type MD5_Mesh = {
    shader: string;
    numverts: number;
    verts: MD5_Vertex[];
    numtris: number;
    tris: number[];
    numweights: number;
    weights: MD5_Weight[];
};

export type MD5_Joint = {
    name: string;
    parentIndex: number;
    position: number[];
    /** 旋转数据 */
    rotation: number[];
};

export type MD5MeshData = {
    name?: string;
    MD5Version: number;
    commandline: string;
    numJoints: number;
    numMeshes: number;
    joints: MD5_Joint[];
    meshs: MD5_Mesh[];
};

const MD5VersionReg = /MD5Version\s+(\d+)/;
const commandlineReg = /commandline\s+"([\w\s/.-]+)"/;
const numJointsReg = /numJoints\s+(\d+)/;
const numMeshesReg = /numMeshes\s+(\d+)/;
const jointsStartReg = /joints\s+{/;
const jointsReg = /"(\w+)"\s+([-\d]+)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)(\s+\/\/(\s+\w+)?)?/;
const endBlockReg = /}/;
const meshStartReg = /mesh\s+{/;
const annotationReg = /\/\/[\s\w:]+/;
const shaderReg = /shader\s+"([\w\/]+)"/;
const numvertsReg = /numverts\s+(\d+)/;
const vertReg = /vert\s+(\d+)\s+\(\s+([\d.]+)\s+([\d.]+)\s+\)\s+(\d+)\s+(\d+)/;
const numtrisReg = /numtris\s+(\d+)/;
const triReg = /tri\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
const numweightsReg = /numweights\s+(\d+)/;
const weightReg = /weight\s+(\d+)\s+(\d+)\s+([\d.]+)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)/;

/**
 * 状态
 */
enum State
{
    /** 读取关节 */
    joints,
    mesh
}

/** 当前处于状态 */
const states: State[] = [];
let currentMesh: MD5_Mesh;

function parserLine(line: string, md5MeshData: MD5MeshData)
{
    if (!line)
    { return; }
    line = line.trim();
    if (!line.length)
    { return; }

    let result: RegExpExecArray | null;
    if ((result = MD5VersionReg.exec(line)) && result[0] === line)
    {
        md5MeshData.MD5Version = parseInt(result[1], 10);
    }
    else if ((result = commandlineReg.exec(line)) && result[0] === line)
    {
        md5MeshData.commandline = result[1];
    }
    else if ((result = numJointsReg.exec(line)) && result[0] === line)
    {
        md5MeshData.numJoints = parseInt(result[1], 10);
    }
    else if ((result = numMeshesReg.exec(line)) && result[0] === line)
    {
        md5MeshData.numMeshes = parseInt(result[1], 10);
    }
    else if ((result = jointsStartReg.exec(line)) && result[0] === line)
    {
        states.push(State.joints);
        md5MeshData.joints = [];
    }
    else if ((result = jointsReg.exec(line)) && result[0] === line)
    {
        md5MeshData.joints.push({
            name: result[1], parentIndex: parseInt(result[2], 10),
            position: [parseFloat(result[3]), parseFloat(result[4]), parseFloat(result[5])],
            rotation: [parseFloat(result[6]), parseFloat(result[7]), parseFloat(result[8])]
        });
    }
    else if ((result = endBlockReg.exec(line)) && result[0] === line)
    {
        const exitState = states.pop();
        if (exitState === State.mesh)
        {
            currentMesh = <any>null;
        }
    }
    else if ((result = meshStartReg.exec(line)) && result[0] === line)
    {
        states.push(State.mesh);
        if (!md5MeshData.meshs)
        {
            md5MeshData.meshs = [];
        }
        currentMesh = <any>{};
        md5MeshData.meshs.push(currentMesh);
    }
    else if ((result = annotationReg.exec(line)) && result[0] === line)
    // eslint-disable-next-line no-empty
    {

    }
    else if ((result = shaderReg.exec(line)) && result[0] === line)
    {
        currentMesh.shader = result[1];
    }
    else if ((result = numvertsReg.exec(line)) && result[0] === line)
    {
        currentMesh.numverts = parseInt(result[1], 10);
        currentMesh.verts = [];
    }
    else if ((result = vertReg.exec(line)) && result[0] === line)
    {
        currentMesh.verts.push({
            index: parseFloat(result[1]), u: parseFloat(result[2]), v: parseFloat(result[3]),
            startWeight: parseFloat(result[4]), countWeight: parseFloat(result[5])
        });
    }
    else if ((result = numtrisReg.exec(line)) && result[0] === line)
    {
        currentMesh.numtris = parseInt(result[1], 10);
        currentMesh.tris = [];
    }
    else if ((result = triReg.exec(line)) && result[0] === line)
    {
        const index = parseInt(result[1], 10) * 3;
        currentMesh.tris[index] = parseInt(result[2], 10);
        currentMesh.tris[index + 1] = parseInt(result[3], 10);
        currentMesh.tris[index + 2] = parseInt(result[4], 10);
    }
    else if ((result = numweightsReg.exec(line)) && result[0] === line)
    {
        currentMesh.numweights = parseInt(result[1], 10);
        currentMesh.weights = [];
    }
    else if ((result = weightReg.exec(line)) && result[0] === line)
    {
        currentMesh.weights.push({
            index: parseInt(result[1], 10), joint: parseInt(result[2], 10), bias: parseFloat(result[3]),
            pos: [parseFloat(result[4]), parseFloat(result[5]), parseFloat(result[6])]
        });
    }
    else
    {
        throw new Error(`无法解析${line}`);
    }
}
