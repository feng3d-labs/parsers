/**
 * MD5动画解析器
 */
export class MD5AnimParser
{
    /**
     * 解析
     * @param context
     */
    parse(context: string)
    {
        const md5AnimData = <MD5AnimData>{};
        const lines = context.split('\n').reverse();
        let line: string;
        do
        {
            line = lines.pop();
            line && parserLine(line, md5AnimData);
        } while (line);

        return md5AnimData;
    }
}

/**
 * MD5动画解析器
 */
export const md5AnimParser = new MD5AnimParser();

/**
 * 帧数据
 */
export type MD5_Frame = {
    index: number;
    components: number[];
};

/**
 * 基础帧数据
 */
export type MD5_BaseFrame = {
    /** 位置 */
    position: number[];
    /** 方向 */
    orientation: number[];
};

/**
 * 包围盒信息
 */
export type MD5_Bounds = {
    /** 最小坐标 */
    min: number[];
    /** 最大坐标 */
    max: number[];
};

/**
 * 层级数据
 */
export type MD5_HierarchyData = {
    /** Joint 名字 */
    name: string;
    /** 父结点序号 */
    parentIndex: number;
    /** flag */
    flags: number;
    /** 影响的帧数据起始索引 */
    startIndex: number;
};

export type MD5AnimData = {
    name?: string;
    MD5Version: number;
    commandline: string;
    numFrames: number;
    numJoints: number;
    frameRate: number;
    numAnimatedComponents: number;
    hierarchy: MD5_HierarchyData[];
    bounds: MD5_Bounds[];
    baseframe: MD5_BaseFrame[];
    frame: MD5_Frame[];
};

const MD5VersionReg = /MD5Version\s+(\d+)/;
const commandlineReg = /commandline\s+"([\w\s/.-]+)"/;
const numFramesReg = /numFrames\s+(\d+)/;
const numJointsReg = /numJoints\s+(\d+)/;
const frameRateReg = /frameRate\s+(\d+)/;
const numAnimatedComponentsReg = /numAnimatedComponents\s+(\d+)/;
const hierarchyStartReg = /hierarchy\s+{/;
const hierarchyReg = /"(\w+)"\s+([\d-]+)\s+(\d+)\s+(\d+)(\s+\/\/(\s+\w+)?(\s+\([\s\w]+\))?)?/;
const endBlockReg = /}/;
const boundsStartReg = /bounds\s+{/;
// 2组3个number
const number32Reg = /\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)/;
const baseframeStartReg = /baseframe\s+{/;
const frameStartReg = /frame\s+(\d+)\s+{/;
const numbersReg = /(-?[\d.]+)(\s+-?[\d.]+){0,}/;

/**
 * 状态
 */
enum State
{
    hierarchy,
    bounds,
    baseframe,
    frame
}

/** 当前处于状态 */
const states: State[] = [];
let currentFrame: MD5_Frame | null;

function parserLine(line: string, md5AnimData: MD5AnimData)
{
    if (!line)
    {
        return;
    }
    line = line.trim();
    if (!line.length)
    {
        return;
    }

    let result: RegExpExecArray | null;
    if ((result = MD5VersionReg.exec(line)) && result[0] === line)
    {
        md5AnimData.MD5Version = parseInt(result[1], 10);
    }
    else if ((result = commandlineReg.exec(line)) && result[0] === line)
    {
        md5AnimData.commandline = result[1];
    }
    else if ((result = numFramesReg.exec(line)) && result[0] === line)
    {
        md5AnimData.numFrames = parseInt(result[1], 10);
    }
    else if ((result = numJointsReg.exec(line)) && result[0] === line)
    {
        md5AnimData.numJoints = parseInt(result[1], 10);
    }
    else if ((result = frameRateReg.exec(line)) && result[0] === line)
    {
        md5AnimData.frameRate = parseInt(result[1], 10);
    }
    else if ((result = numAnimatedComponentsReg.exec(line)) && result[0] === line)
    {
        md5AnimData.numAnimatedComponents = parseInt(result[1], 10);
    }
    else if ((result = hierarchyStartReg.exec(line)) && result[0] === line)
    {
        md5AnimData.hierarchy = [];
        states.push(State.hierarchy);
    }
    else if ((result = hierarchyReg.exec(line)) && result[0] === line)
    {
        switch (states[states.length - 1])
        {
            case State.hierarchy:
                md5AnimData.hierarchy.push({
                    name: result[1], parentIndex: parseInt(result[2], 10),
                    flags: parseInt(result[3], 10), startIndex: parseInt(result[4], 10)
                });
                break;
            default:
                throw new Error('没有对应的数据处理');
        }
    }
    else if ((result = endBlockReg.exec(line)) && result[0] === line)
    {
        const state = states.pop();
        if (state === State.frame)
        {
            if (currentFrame && currentFrame.components.length !== md5AnimData.numAnimatedComponents)
            {
                throw new Error('frame中数据不对');
            }
            currentFrame = null;
        }
    }
    else if ((result = boundsStartReg.exec(line)) && result[0] === line)
    {
        md5AnimData.bounds = [];
        states.push(State.bounds);
    }
    else if ((result = baseframeStartReg.exec(line)) && result[0] === line)
    {
        md5AnimData.baseframe = [];
        states.push(State.baseframe);
    }
    else if ((result = number32Reg.exec(line)) && result[0] === line)
    {
        switch (states[states.length - 1])
        {
            case State.bounds:
                md5AnimData.bounds.push({ min: [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])], max: [parseFloat(result[4]), parseFloat(result[5]), parseFloat(result[6])] });
                break;
            case State.baseframe:
                md5AnimData.baseframe.push({ position: [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])], orientation: [parseFloat(result[4]), parseFloat(result[5]), parseFloat(result[6])] });
                break;
            default:
                throw new Error('没有对应的数据处理');
        }
    }
    else if ((result = frameStartReg.exec(line)) && result[0] === line)
    {
        if (!md5AnimData.frame)
        {
            md5AnimData.frame = [];
        }
        currentFrame = { index: parseInt(result[1], 10), components: [] };
        md5AnimData.frame.push(currentFrame);
        states.push(State.frame);
    }
    else if ((result = numbersReg.exec(line)) && result[0] === line)
    {
        switch (states[states.length - 1])
        {
            case State.frame:
                if (currentFrame)
                {
                    const numbers = line.split(' ');
                    for (let i = 0; i < numbers.length; i++)
                    {
                        currentFrame.components.push(parseFloat(numbers[i]));
                    }
                }
                break;
            default:
                throw new Error('没有对应的数据处理');
        }
    }
    else
    {
        throw new Error(`无法解析${line}`);
    }
}
