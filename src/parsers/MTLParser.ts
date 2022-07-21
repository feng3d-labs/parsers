/**
 * OBJ模型MTL材质解析器
 */
export class MTLParser
{
    /**
     * 解析
     * @param context
     */
    parser(context: string): Mtl_Mtl
    {
        const mtl: Mtl_Mtl = {};
        const lines = context.split('\n');
        for (let i = 0; i < lines.length; i++)
        {
            parserLine(lines[i], mtl);
        }

        return mtl;
    }
}
/**
 * OBJ模型MTL材质解析器
 */
export const mtlParser = new MTLParser();

export type Mtl_Material = {
    name: string;
    ka: number[];
    kd: number[];
    ks: number[];
    ns: number;
    ni: number;
    d: number;
    illum: number;
    map_Bump: string;
    map_Ka: string;
    map_Kd: string;
    map_Ks: string;
};
export type Mtl_Mtl = { [name: string]: Mtl_Material };

const newmtlReg = /newmtl\s+([\w.]+)/;
const kaReg = /Ka\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/;
const kdReg = /Kd\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/;
const ksReg = /Ks\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/;
const nsReg = /Ns\s+([\d.]+)/;
const niReg = /Ni\s+([\d.]+)/;
const dReg = /d\s+([\d.]+)/;
const illumReg = /illum\s+([\d]+)/;
const map_Bump_Reg = /map_Bump\s+([\w\W]+\.[\w\W]+)/;
const map_Ka_Reg = /map_Ka\s+([\w\W]+\.[\w\W]+)/;
const map_Kd_Reg = /map_Kd\s+([\w\W]+\.[\w\W]+)/;
const map_Ks_Reg = /map_Ks\s+([\w\W]+\.[\w\W]+)/;
let currentMaterial: Mtl_Material;

function parserLine(line: string, mtl: Mtl_Mtl)
{
    if (!line)
    { return; }
    line = line.trim();
    if (!line.length)
    { return; }
    if (line.charAt(0) === '#')
    { return; }

    let result: RegExpExecArray | null;
    if ((result = newmtlReg.exec(line)) && result[0] === line)
    {
        currentMaterial = { name: result[1], ka: [], kd: [], ks: [], ns: 0, ni: 0, d: 0, illum: 0, map_Bump: '', map_Ka: '', map_Kd: '', map_Ks: '' };
        mtl[currentMaterial.name] = currentMaterial;
    }
    else if ((result = kaReg.exec(line)) && result[0] === line)
    {
        currentMaterial.ka = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
    }
    else if ((result = kdReg.exec(line)) && result[0] === line)
    {
        currentMaterial.kd = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
    }
    else if ((result = ksReg.exec(line)) && result[0] === line)
    {
        currentMaterial.ks = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
    }
    else if ((result = nsReg.exec(line)) && result[0] === line)
    {
        currentMaterial.ns = parseFloat(result[1]);
    }
    else if ((result = niReg.exec(line)) && result[0] === line)
    {
        currentMaterial.ni = parseFloat(result[1]);
    }
    else if ((result = dReg.exec(line)) && result[0] === line)
    {
        currentMaterial.d = parseFloat(result[1]);
    }
    else if ((result = illumReg.exec(line)) && result[0] === line)
    {
        currentMaterial.illum = parseFloat(result[1]);
    }
    else if ((result = map_Bump_Reg.exec(line)) && result[0] === line)
    {
        currentMaterial.map_Bump = result[1];
    }
    else if ((result = map_Ka_Reg.exec(line)) && result[0] === line)
    {
        currentMaterial.map_Ka = result[1];
    }
    else if ((result = map_Kd_Reg.exec(line)) && result[0] === line)
    {
        currentMaterial.map_Kd = result[1];
    }
    else if ((result = map_Ks_Reg.exec(line)) && result[0] === line)
    {
        currentMaterial.map_Ks = result[1];
    }
    else
    {
        throw new Error(`无法解析${line}`);
    }
}
