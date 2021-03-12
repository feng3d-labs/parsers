var feng3d;
(function (feng3d) {
    /**
     * OBJ模型解析器
     */
    var OBJParser = /** @class */ (function () {
        function OBJParser() {
        }
        /**
         * 解析
         * @param context
         */
        OBJParser.prototype.parser = function (context) {
            currentObj = null;
            currentSubObj = null;
            //
            var objData = { mtl: null, objs: [], vertex: [], vn: [], vt: [] };
            var lines = context.split("\n").reverse();
            do {
                var line = lines.pop();
                line && parserLine(line, objData);
            } while (lines.length > 0);
            return objData;
        };
        return OBJParser;
    }());
    feng3d.OBJParser = OBJParser;
    feng3d.objParser = new OBJParser();
    /** mtl正则 */
    var mtlReg = /mtllib\s+([\w\s]+\.mtl)/;
    /** 对象名称正则 */
    var objReg = /o\s+([\w\.]+)/;
    /** 顶点坐标正则 */
    var vertexReg = /v\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/;
    /** 顶点法线正则 */
    var vnReg = /vn\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/;
    /** 顶点uv正则 */
    var vtReg = /vt\s+([-\d.]+)\s+([-\d.]+)(\s+([-\d.]+))?/;
    /** 使用材质正则 */
    var usemtlReg = /usemtl\s+([\w.]+)/;
    /** 面正则 vertex */
    var faceV3Reg = /f\s+(\d+)\s+(\d+)\s+(\d+)/;
    /** 面正则 vertex */
    var faceVReg = /f\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
    /** 面正则 vertex/uv/normal */
    var faceVUNReg = /f\s+((\d+)\/(\d+)\/(\d+))\s+((\d+)\/(\d+)\/(\d+))\s+((\d+)\/(\d+)\/(\d+))/;
    /** 面正则 vertex//normal */
    var faceVN3Reg = /f\s+(\d+)\/\/(\d+)\s+(\d+)\/\/(\d+)\s+(\d+)\/\/(\d+)/;
    // g
    var gReg = /g\s+([\(\)\w]+)?/;
    var sReg = /s\s+(\w+)/;
    //
    var currentObj;
    var currentSubObj;
    function parserLine(line, objData) {
        if (!line)
            return;
        line = line.trim();
        if (!line.length)
            return;
        if (line.charAt(0) == "#")
            return;
        var result;
        if ((result = mtlReg.exec(line)) && result[0] == line) {
            objData.mtl = result[1];
        }
        else if ((result = objReg.exec(line)) && result[0] == line) {
            currentObj = { name: result[1], subObjs: [] };
            objData.objs.push(currentObj);
        }
        else if ((result = vertexReg.exec(line)) && result[0] == line) {
            if (currentObj == null) {
                currentObj = { name: "", subObjs: [] };
                objData.objs.push(currentObj);
            }
            objData.vertex.push({ x: parseFloat(result[1]), y: parseFloat(result[2]), z: parseFloat(result[3]) });
        }
        else if ((result = vnReg.exec(line)) && result[0] == line) {
            objData.vn.push({ x: parseFloat(result[1]), y: parseFloat(result[2]), z: parseFloat(result[3]) });
        }
        else if ((result = vtReg.exec(line)) && result[0] == line) {
            objData.vt.push({ u: parseFloat(result[1]), v: 1 - parseFloat(result[2]), s: parseFloat(result[4]) });
        }
        else if ((result = gReg.exec(line)) && result[0] == line) {
            currentSubObj = { faces: [] };
            currentObj.subObjs.push(currentSubObj);
            currentSubObj.g = result[1];
        }
        else if ((result = sReg.exec(line)) && result[0] == line) {
        }
        else if ((result = usemtlReg.exec(line)) && result[0] == line) {
            currentSubObj = { faces: [] };
            currentObj.subObjs.push(currentSubObj);
            currentSubObj.material = result[1];
        }
        else if ((result = faceV3Reg.exec(line)) && result[0] == line) {
            currentSubObj.faces.push({
                indexIds: [result[2], result[1], result[3]],
                vertexIndices: [result[2], result[1], result[3]]
            });
        }
        else if ((result = faceVN3Reg.exec(line)) && result[0] == line) {
            currentSubObj.faces.push({
                indexIds: [result[3], result[1], result[5]],
                vertexIndices: [result[3], result[1], result[5]],
                normalIndices: [result[4], result[2], result[6]],
            });
        }
        else if ((result = faceVReg.exec(line)) && result[0] == line) {
            currentSubObj.faces.push({
                indexIds: [result[2], result[1], result[3]],
                vertexIndices: [result[2], result[1], result[3]]
            });
            currentSubObj.faces.push({
                indexIds: [result[4], result[3], result[1]],
                vertexIndices: [result[4], result[3], result[1]]
            });
        }
        else if ((result = faceVUNReg.exec(line)) && result[0] == line) {
            currentSubObj.faces.push({
                indexIds: [result[5], result[1], result[9]],
                vertexIndices: [result[6], result[2], result[10]],
                uvIndices: [result[7], result[3], result[11]],
                normalIndices: [result[8], result[4], result[12]]
            });
        }
        else {
            throw new Error("\u65E0\u6CD5\u89E3\u6790" + line);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * OBJ模型MTL材质解析器
     */
    var MTLParser = /** @class */ (function () {
        function MTLParser() {
        }
        /**
         * 解析
         * @param context
         */
        MTLParser.prototype.parser = function (context) {
            var mtl = {};
            var lines = context.split("\n");
            for (var i = 0; i < lines.length; i++) {
                var element = lines[i];
                parserLine(lines[i], mtl);
            }
            return mtl;
        };
        return MTLParser;
    }());
    feng3d.MTLParser = MTLParser;
    feng3d.mtlParser = new MTLParser();
    var newmtlReg = /newmtl\s+([\w.]+)/;
    var kaReg = /Ka\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/;
    var kdReg = /Kd\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/;
    var ksReg = /Ks\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/;
    var nsReg = /Ns\s+([\d.]+)/;
    var niReg = /Ni\s+([\d.]+)/;
    var dReg = /d\s+([\d.]+)/;
    var illumReg = /illum\s+([\d]+)/;
    var map_Bump_Reg = /map_Bump\s+([\w\W]+\.[\w\W]+)/;
    var map_Ka_Reg = /map_Ka\s+([\w\W]+\.[\w\W]+)/;
    var map_Kd_Reg = /map_Kd\s+([\w\W]+\.[\w\W]+)/;
    var map_Ks_Reg = /map_Ks\s+([\w\W]+\.[\w\W]+)/;
    var currentMaterial;
    function parserLine(line, mtl) {
        if (!line)
            return;
        line = line.trim();
        if (!line.length)
            return;
        if (line.charAt(0) == "#")
            return;
        var result;
        if ((result = newmtlReg.exec(line)) && result[0] == line) {
            currentMaterial = { name: result[1], ka: [], kd: [], ks: [], ns: 0, ni: 0, d: 0, illum: 0, map_Bump: "", map_Ka: "", map_Kd: "", map_Ks: "" };
            mtl[currentMaterial.name] = currentMaterial;
        }
        else if ((result = kaReg.exec(line)) && result[0] == line) {
            currentMaterial.ka = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
        }
        else if ((result = kdReg.exec(line)) && result[0] == line) {
            currentMaterial.kd = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
        }
        else if ((result = ksReg.exec(line)) && result[0] == line) {
            currentMaterial.ks = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
        }
        else if ((result = nsReg.exec(line)) && result[0] == line) {
            currentMaterial.ns = parseFloat(result[1]);
        }
        else if ((result = niReg.exec(line)) && result[0] == line) {
            currentMaterial.ni = parseFloat(result[1]);
        }
        else if ((result = dReg.exec(line)) && result[0] == line) {
            currentMaterial.d = parseFloat(result[1]);
        }
        else if ((result = illumReg.exec(line)) && result[0] == line) {
            currentMaterial.illum = parseFloat(result[1]);
        }
        else if ((result = map_Bump_Reg.exec(line)) && result[0] == line) {
            currentMaterial.map_Bump = result[1];
        }
        else if ((result = map_Ka_Reg.exec(line)) && result[0] == line) {
            currentMaterial.map_Ka = result[1];
        }
        else if ((result = map_Kd_Reg.exec(line)) && result[0] == line) {
            currentMaterial.map_Kd = result[1];
        }
        else if ((result = map_Ks_Reg.exec(line)) && result[0] == line) {
            currentMaterial.map_Ks = result[1];
        }
        else {
            throw new Error("\u65E0\u6CD5\u89E3\u6790" + line);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * MD5模型解析器
     */
    var MD5MeshParser = /** @class */ (function () {
        function MD5MeshParser() {
        }
        /**
         * 解析
         * @param context
         */
        MD5MeshParser.prototype.parse = function (context) {
            //
            var md5MeshData = {};
            var lines = context.split("\n");
            for (var i = 0; i < lines.length; i++) {
                parserLine(lines[i], md5MeshData);
            }
            return md5MeshData;
        };
        return MD5MeshParser;
    }());
    feng3d.MD5MeshParser = MD5MeshParser;
    feng3d.md5MeshParser = new MD5MeshParser();
    var MD5VersionReg = /MD5Version\s+(\d+)/;
    var commandlineReg = /commandline\s+"([\w\s/.-]+)"/;
    var numJointsReg = /numJoints\s+(\d+)/;
    var numMeshesReg = /numMeshes\s+(\d+)/;
    var jointsStartReg = /joints\s+{/;
    var jointsReg = /"(\w+)"\s+([-\d]+)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)(\s+\/\/(\s+\w+)?)?/;
    var endBlockReg = /}/;
    var meshStartReg = /mesh\s+{/;
    var annotationReg = /\/\/[\s\w:]+/;
    var shaderReg = /shader\s+"([\w\/]+)"/;
    var numvertsReg = /numverts\s+(\d+)/;
    var vertReg = /vert\s+(\d+)\s+\(\s+([\d.]+)\s+([\d.]+)\s+\)\s+(\d+)\s+(\d+)/;
    var numtrisReg = /numtris\s+(\d+)/;
    var triReg = /tri\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
    var numweightsReg = /numweights\s+(\d+)/;
    var weightReg = /weight\s+(\d+)\s+(\d+)\s+([\d.]+)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)/;
    /**
     * 状态
     */
    var State;
    (function (State) {
        /** 读取关节 */
        State[State["joints"] = 0] = "joints";
        State[State["mesh"] = 1] = "mesh";
    })(State || (State = {}));
    /** 当前处于状态 */
    var states = [];
    var currentMesh;
    function parserLine(line, md5MeshData) {
        if (!line)
            return;
        line = line.trim();
        if (!line.length)
            return;
        var result;
        if ((result = MD5VersionReg.exec(line)) && result[0] == line) {
            md5MeshData.MD5Version = parseInt(result[1]);
        }
        else if ((result = commandlineReg.exec(line)) && result[0] == line) {
            md5MeshData.commandline = result[1];
        }
        else if ((result = numJointsReg.exec(line)) && result[0] == line) {
            md5MeshData.numJoints = parseInt(result[1]);
        }
        else if ((result = numMeshesReg.exec(line)) && result[0] == line) {
            md5MeshData.numMeshes = parseInt(result[1]);
        }
        else if ((result = jointsStartReg.exec(line)) && result[0] == line) {
            states.push(State.joints);
            md5MeshData.joints = [];
        }
        else if ((result = jointsReg.exec(line)) && result[0] == line) {
            md5MeshData.joints.push({
                name: result[1], parentIndex: parseInt(result[2]),
                position: [parseFloat(result[3]), parseFloat(result[4]), parseFloat(result[5])],
                rotation: [parseFloat(result[6]), parseFloat(result[7]), parseFloat(result[8])]
            });
        }
        else if ((result = endBlockReg.exec(line)) && result[0] == line) {
            var exitState = states.pop();
            if (exitState == State.mesh) {
                currentMesh = null;
            }
        }
        else if ((result = meshStartReg.exec(line)) && result[0] == line) {
            states.push(State.mesh);
            if (!md5MeshData.meshs) {
                md5MeshData.meshs = [];
            }
            currentMesh = {};
            md5MeshData.meshs.push(currentMesh);
        }
        else if ((result = annotationReg.exec(line)) && result[0] == line) {
        }
        else if ((result = shaderReg.exec(line)) && result[0] == line) {
            currentMesh.shader = result[1];
        }
        else if ((result = numvertsReg.exec(line)) && result[0] == line) {
            currentMesh.numverts = parseInt(result[1]);
            currentMesh.verts = [];
        }
        else if ((result = vertReg.exec(line)) && result[0] == line) {
            currentMesh.verts.push({
                index: parseFloat(result[1]), u: parseFloat(result[2]), v: parseFloat(result[3]),
                startWeight: parseFloat(result[4]), countWeight: parseFloat(result[5])
            });
        }
        else if ((result = numtrisReg.exec(line)) && result[0] == line) {
            currentMesh.numtris = parseInt(result[1]);
            currentMesh.tris = [];
        }
        else if ((result = triReg.exec(line)) && result[0] == line) {
            var index = parseInt(result[1]) * 3;
            currentMesh.tris[index] = parseInt(result[2]);
            currentMesh.tris[index + 1] = parseInt(result[3]);
            currentMesh.tris[index + 2] = parseInt(result[4]);
        }
        else if ((result = numweightsReg.exec(line)) && result[0] == line) {
            currentMesh.numweights = parseInt(result[1]);
            currentMesh.weights = [];
        }
        else if ((result = weightReg.exec(line)) && result[0] == line) {
            currentMesh.weights.push({
                index: parseInt(result[1]), joint: parseInt(result[2]), bias: parseFloat(result[3]),
                pos: [parseFloat(result[4]), parseFloat(result[5]), parseFloat(result[6])]
            });
        }
        else {
            throw new Error("\u65E0\u6CD5\u89E3\u6790" + line);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * MD5动画解析器
     */
    var MD5AnimParser = /** @class */ (function () {
        function MD5AnimParser() {
        }
        /**
         * 解析
         * @param context
         */
        MD5AnimParser.prototype.parse = function (context) {
            var md5AnimData = {};
            var lines = context.split("\n").reverse();
            do {
                var line = lines.pop();
                line && parserLine(line, md5AnimData);
            } while (line);
            return md5AnimData;
        };
        return MD5AnimParser;
    }());
    feng3d.MD5AnimParser = MD5AnimParser;
    feng3d.md5AnimParser = new MD5AnimParser();
    var MD5VersionReg = /MD5Version\s+(\d+)/;
    var commandlineReg = /commandline\s+"([\w\s/.-]+)"/;
    var numFramesReg = /numFrames\s+(\d+)/;
    var numJointsReg = /numJoints\s+(\d+)/;
    var frameRateReg = /frameRate\s+(\d+)/;
    var numAnimatedComponentsReg = /numAnimatedComponents\s+(\d+)/;
    var hierarchyStartReg = /hierarchy\s+{/;
    var hierarchyReg = /"(\w+)"\s+([\d-]+)\s+(\d+)\s+(\d+)(\s+\/\/(\s+\w+)?(\s+\([\s\w]+\))?)?/;
    var endBlockReg = /}/;
    var boundsStartReg = /bounds\s+{/;
    //2组3个number
    var number32Reg = /\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)/;
    var baseframeStartReg = /baseframe\s+{/;
    var frameStartReg = /frame\s+(\d+)\s+{/;
    var numbersReg = /(-?[\d.]+)(\s+-?[\d.]+){0,}/;
    /**
     * 状态
     */
    var State;
    (function (State) {
        State[State["hierarchy"] = 0] = "hierarchy";
        State[State["bounds"] = 1] = "bounds";
        State[State["baseframe"] = 2] = "baseframe";
        State[State["frame"] = 3] = "frame";
    })(State || (State = {}));
    /** 当前处于状态 */
    var states = [];
    var currentFrame;
    function parserLine(line, md5AnimData) {
        if (!line)
            return;
        line = line.trim();
        if (!line.length)
            return;
        var result;
        if ((result = MD5VersionReg.exec(line)) && result[0] == line) {
            md5AnimData.MD5Version = parseInt(result[1]);
        }
        else if ((result = commandlineReg.exec(line)) && result[0] == line) {
            md5AnimData.commandline = result[1];
        }
        else if ((result = numFramesReg.exec(line)) && result[0] == line) {
            md5AnimData.numFrames = parseInt(result[1]);
        }
        else if ((result = numJointsReg.exec(line)) && result[0] == line) {
            md5AnimData.numJoints = parseInt(result[1]);
        }
        else if ((result = frameRateReg.exec(line)) && result[0] == line) {
            md5AnimData.frameRate = parseInt(result[1]);
        }
        else if ((result = numAnimatedComponentsReg.exec(line)) && result[0] == line) {
            md5AnimData.numAnimatedComponents = parseInt(result[1]);
        }
        else if ((result = hierarchyStartReg.exec(line)) && result[0] == line) {
            md5AnimData.hierarchy = [];
            states.push(State.hierarchy);
        }
        else if ((result = hierarchyReg.exec(line)) && result[0] == line) {
            switch (states[states.length - 1]) {
                case State.hierarchy:
                    md5AnimData.hierarchy.push({
                        name: result[1], parentIndex: parseInt(result[2]),
                        flags: parseInt(result[3]), startIndex: parseInt(result[4])
                    });
                    break;
                default:
                    throw new Error("没有对应的数据处理");
            }
        }
        else if ((result = endBlockReg.exec(line)) && result[0] == line) {
            var state = states.pop();
            if (state == State.frame) {
                if (currentFrame && currentFrame.components.length != md5AnimData.numAnimatedComponents) {
                    throw new Error("frame中数据不对");
                }
                currentFrame = null;
            }
        }
        else if ((result = boundsStartReg.exec(line)) && result[0] == line) {
            md5AnimData.bounds = [];
            states.push(State.bounds);
        }
        else if ((result = baseframeStartReg.exec(line)) && result[0] == line) {
            md5AnimData.baseframe = [];
            states.push(State.baseframe);
        }
        else if ((result = number32Reg.exec(line)) && result[0] == line) {
            switch (states[states.length - 1]) {
                case State.bounds:
                    md5AnimData.bounds.push({ min: [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])], max: [parseFloat(result[4]), parseFloat(result[5]), parseFloat(result[6])] });
                    break;
                case State.baseframe:
                    md5AnimData.baseframe.push({ position: [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])], orientation: [parseFloat(result[4]), parseFloat(result[5]), parseFloat(result[6])] });
                    break;
                default:
                    throw new Error("没有对应的数据处理");
            }
        }
        else if ((result = frameStartReg.exec(line)) && result[0] == line) {
            if (!md5AnimData.frame) {
                md5AnimData.frame = [];
            }
            currentFrame = { index: parseInt(result[1]), components: [] };
            md5AnimData.frame.push(currentFrame);
            states.push(State.frame);
        }
        else if ((result = numbersReg.exec(line)) && result[0] == line) {
            switch (states[states.length - 1]) {
                case State.frame:
                    if (currentFrame) {
                        var numbers = line.split(" ");
                        for (var i = 0; i < numbers.length; i++) {
                            currentFrame.components.push(parseFloat(numbers[i]));
                        }
                    }
                    break;
                default:
                    throw new Error("没有对应的数据处理");
            }
        }
        else {
            throw new Error("\u65E0\u6CD5\u89E3\u6790" + line);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var war3;
    (function (war3) {
        /**
         * 透明度动画
         */
        var AnimAlpha = /** @class */ (function () {
            function AnimAlpha() {
            }
            return AnimAlpha;
        }());
        war3.AnimAlpha = AnimAlpha;
        /**
         * 全局动作信息
         */
        var AnimInfo = /** @class */ (function () {
            function AnimInfo() {
                /** 是否循环 */
                this.loop = true;
            }
            return AnimInfo;
        }());
        war3.AnimInfo = AnimInfo;
        /**
         * 几何体动作信息
         */
        var AnimInfo1 = /** @class */ (function () {
            function AnimInfo1() {
            }
            return AnimInfo1;
        }());
        war3.AnimInfo1 = AnimInfo1;
        /**
         * 骨骼的角度信息
         */
        var BoneRotation = /** @class */ (function () {
            function BoneRotation() {
                this.rotations = [];
            }
            BoneRotation.prototype.getRotationItem = function (rotation) {
                var quaternion = new feng3d.Quaternion();
                if (this.type == "DontInterp") {
                    quaternion.fromEulerAngles(rotation.value.x, rotation.value.y, rotation.value.z);
                }
                else {
                    quaternion.copy(rotation.value);
                }
                return quaternion;
            };
            BoneRotation.prototype.getRotation = function (keyFrameTime) {
                var rotationQuaternion = new feng3d.Quaternion();
                if (this.rotations.length == 0 || keyFrameTime < this.rotations[0].time || keyFrameTime > this.rotations[this.rotations.length - 1].time)
                    return new feng3d.Quaternion();
                var key1 = this.rotations[0];
                var key2 = this.rotations[0];
                for (var i = 0; i < this.rotations.length; i++) {
                    key2 = this.rotations[i];
                    if (key2.time > keyFrameTime) {
                        break;
                    }
                    key1 = key2;
                }
                if (key1 == key2) {
                    rotationQuaternion.copy(key1.value);
                    return rotationQuaternion;
                }
                var Factor = (keyFrameTime - key1.time) / (key2.time - key1.time);
                var InverseFactor = 1.0 - Factor;
                var tempVec;
                var Factor1;
                var Factor2;
                var Factor3;
                var Factor4;
                var FactorTimesTwo;
                var InverseFactorTimesTwo;
                var q;
                var q1;
                var q2;
                switch (this.type) {
                    case "DontInterp":
                        rotationQuaternion.fromEulerAngles(key1.value.x, key1.value.y, key1.value.z);
                        break;
                    case "Linear":
                        q1 = key1.value.clone();
                        q2 = key2.value.clone();
                        q1.slerpTo(q2, Factor, rotationQuaternion);
                        break;
                    case "Hermite":
                    case "Bezier":
                        q1 = key1.value.clone();
                        q2 = key2.value.clone();
                        q1.slerpTo(q2, Factor, rotationQuaternion);
                        break;
                }
                return rotationQuaternion;
            };
            return BoneRotation;
        }());
        war3.BoneRotation = BoneRotation;
        /**
         * 骨骼信息(包含骨骼，helper等其他对象)
         */
        var BoneObject = /** @class */ (function () {
            function BoneObject() {
                /** 父对象 */
                this.Parent = -1;
                /** 骨骼位移动画 */
                this.Translation = new BoneTranslation();
                /** 骨骼缩放动画 */
                this.Scaling = new BoneScaling();
                /** 骨骼角度动画 */
                this.Rotation = new BoneRotation();
                /** 当前对象变换矩阵 */
                this.c_transformation = new feng3d.Matrix4x4();
                /** 当前全局变换矩阵 */
                this.c_globalTransformation = new feng3d.Matrix4x4();
            }
            BoneObject.prototype.calculateTransformation = function (keyFrameTime) {
                var pScalingCenter = this.pivotPoint;
                var pScaling = this.Scaling.getScaling(keyFrameTime);
                var pRotation = this.Rotation.getRotation(keyFrameTime);
                var pTranslation = this.Translation.getTranslation(keyFrameTime);
                var matrix = this.c_transformation;
                matrix.appendScale(pScaling.x, pScaling.y, pScaling.z).append(pRotation.toMatrix());
                //设置旋转缩放中心
                matrix.prependTranslation(-this.pivotPoint.x, -this.pivotPoint.y, -this.pivotPoint.z);
                matrix.appendTranslation(this.pivotPoint.x, this.pivotPoint.y, this.pivotPoint.z);
                //平移
                matrix.appendTranslation(pTranslation.x, pTranslation.y, pTranslation.z);
                //
            };
            BoneObject.prototype.buildAnimationclip = function (animationclip, __chache__, start, end) {
                var path = [
                    [feng3d.PropertyClipPathItemType.Entity, this.name],
                    [feng3d.PropertyClipPathItemType.Component, "Transform"],
                ];
                if (this.Scaling.scalings.length > 0) {
                    var scalings = this.Scaling.scalings;
                    for (var i = 0, n = scalings.length; i < n; i++) {
                        var scaling = scalings[i];
                        if (start <= scaling.time && scaling.time <= end) {
                            setPropertyClipFrame(path, "scale", scaling.time - start, scaling.value.toArray(), "Vector3");
                        }
                    }
                }
                if (this.Translation.translations.length > 0) {
                    var translations = this.Translation.translations;
                    for (var i = 0, n = translations.length; i < n; i++) {
                        var translation = translations[i];
                        if (start <= translation.time && translation.time <= end) {
                            setPropertyClipFrame(path, "position", translation.time - start, translation.value.addTo(this.pivotPoint).toArray(), "Vector3");
                        }
                    }
                }
                if (this.Rotation.rotations.length > 0) {
                    var rotations = this.Rotation.rotations;
                    for (var i = 0, n = rotations.length; i < n; i++) {
                        var rotation = rotations[i];
                        if (start <= rotation.time && rotation.time <= end) {
                            setPropertyClipFrame(path, "orientation", rotation.time - start, this.Rotation.getRotationItem(rotation).toArray(), "Quaternion");
                        }
                    }
                }
                function setPropertyClipFrame(path, propertyName, time, propertyValue, type) {
                    var propertyClip = getPropertyClip(path, propertyName);
                    propertyClip.type = type;
                    propertyClip.propertyValues.push([time, propertyValue]);
                }
                function getPropertyClip(path, propertyName) {
                    var key = path.join("-") + propertyName;
                    if (__chache__[key])
                        return __chache__[key];
                    if (!__chache__[key]) {
                        var propertyClip = __chache__[key] = new feng3d.PropertyClip();
                        propertyClip.path = path;
                        propertyClip.propertyName = propertyName;
                        propertyClip.propertyValues = [];
                        animationclip.propertyClips.push(propertyClip);
                    }
                    return __chache__[key];
                }
            };
            BoneObject.prototype.getMatrix = function (time) {
                var pScaling = this.Scaling.getScaling(time);
                var pRotation = this.Rotation.getRotation(time);
                var pTranslation = this.Translation.getTranslation(time);
                var matrix = new feng3d.Matrix4x4().appendScale(pScaling.x, pScaling.y, pScaling.z).append(pRotation.toMatrix());
                //平移
                matrix.appendTranslation(pTranslation.x + this.pivotPoint.x, pTranslation.y + this.pivotPoint.y, pTranslation.z + this.pivotPoint.z);
                //
                return matrix;
            };
            return BoneObject;
        }());
        war3.BoneObject = BoneObject;
        /**
         * 骨骼的位移信息
         */
        var BoneScaling = /** @class */ (function () {
            function BoneScaling() {
                this.scalings = [];
            }
            BoneScaling.prototype.getScaling = function (keyFrameTime) {
                var scalingVector = new feng3d.Vector3();
                if (this.scalings.length == 0 || keyFrameTime < this.scalings[0].time || keyFrameTime > this.scalings[this.scalings.length - 1].time)
                    return new feng3d.Vector3(1, 1, 1);
                var key1 = this.scalings[0];
                var key2 = this.scalings[0];
                for (var i = 0; i < this.scalings.length; i++) {
                    key2 = this.scalings[i];
                    if (key2.time >= keyFrameTime) {
                        break;
                    }
                    key1 = key2;
                }
                if (key1.time == key2.time) {
                    scalingVector.copy(key1.value);
                    return scalingVector;
                }
                var Factor = (keyFrameTime - key1.time) / (key2.time - key1.time);
                var InverseFactor = 1.0 - Factor;
                var tempVec;
                var Factor1;
                var Factor2;
                var Factor3;
                var Factor4;
                var FactorTimesTwo;
                var InverseFactorTimesTwo;
                switch (this.type) {
                    case "DontInterp":
                        scalingVector.copy(key1.value);
                        break;
                    case "Linear":
                        tempVec = key1.value.clone();
                        tempVec.scaleNumber(InverseFactor);
                        scalingVector.add(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleNumber(Factor);
                        scalingVector.add(tempVec);
                        break;
                    case "Hermite":
                        FactorTimesTwo = Factor * Factor;
                        Factor1 = FactorTimesTwo * (2.0 * Factor - 3.0) + 1;
                        Factor2 = FactorTimesTwo * (Factor - 2.0) + Factor;
                        Factor3 = FactorTimesTwo * (Factor - 1.0);
                        Factor4 = FactorTimesTwo * (3.0 - 2.0 * Factor);
                        tempVec = key1.value.clone();
                        tempVec.scaleNumber(Factor1);
                        scalingVector.add(tempVec);
                        tempVec = key1.OutTan.clone();
                        tempVec.scaleNumber(Factor2);
                        scalingVector.add(tempVec);
                        tempVec = key2.InTan.clone();
                        tempVec.scaleNumber(Factor3);
                        scalingVector.add(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleNumber(Factor4);
                        scalingVector.add(tempVec);
                        break;
                    case "Bezier":
                        FactorTimesTwo = Factor * Factor;
                        InverseFactorTimesTwo = InverseFactor * InverseFactor;
                        Factor1 = InverseFactorTimesTwo * InverseFactor;
                        Factor2 = 3.0 * Factor * InverseFactorTimesTwo;
                        Factor3 = 3.0 * FactorTimesTwo * InverseFactor;
                        Factor4 = FactorTimesTwo * Factor;
                        tempVec = key1.value.clone();
                        tempVec.scaleNumber(Factor1);
                        scalingVector.add(tempVec);
                        tempVec = key1.OutTan.clone();
                        tempVec.scaleNumber(Factor2);
                        scalingVector.add(tempVec);
                        tempVec = key2.InTan.clone();
                        tempVec.scaleNumber(Factor3);
                        scalingVector.add(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleNumber(Factor4);
                        scalingVector.add(tempVec);
                        break;
                }
                return scalingVector;
            };
            return BoneScaling;
        }());
        war3.BoneScaling = BoneScaling;
        /**
         * 骨骼的位移信息
         */
        var BoneTranslation = /** @class */ (function () {
            function BoneTranslation() {
                this.translations = [];
            }
            BoneTranslation.prototype.getTranslation = function (keyFrameTime) {
                var TranslationVector = new feng3d.Vector3();
                if (this.translations.length == 0)
                    return new feng3d.Vector3();
                var key1 = this.translations[0];
                var key2 = this.translations[0];
                for (var i = 0; i < this.translations.length; i++) {
                    key2 = this.translations[i];
                    if (key2.time > keyFrameTime) {
                        break;
                    }
                    key1 = key2;
                }
                if (key1 == key2) {
                    TranslationVector.copy(key1.value);
                    return TranslationVector;
                }
                var Factor = (keyFrameTime - key1.time) / (key2.time - key1.time);
                var InverseFactor = 1.0 - Factor;
                var tempVec;
                var Factor1;
                var Factor2;
                var Factor3;
                var Factor4;
                var FactorTimesTwo;
                var InverseFactorTimesTwo;
                switch (this.type) {
                    case "DontInterp":
                        TranslationVector.copy(key1.value);
                        break;
                    case "Linear":
                        tempVec = key1.value.clone();
                        tempVec.scaleNumber(InverseFactor);
                        TranslationVector.add(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleNumber(Factor);
                        TranslationVector.add(tempVec);
                        break;
                    case "Hermite":
                        FactorTimesTwo = Factor * Factor;
                        Factor1 = FactorTimesTwo * (2.0 * Factor - 3.0) + 1;
                        Factor2 = FactorTimesTwo * (Factor - 2.0) + Factor;
                        Factor3 = FactorTimesTwo * (Factor - 1.0);
                        Factor4 = FactorTimesTwo * (3.0 - 2.0 * Factor);
                        tempVec = key1.value.clone();
                        tempVec.scaleNumber(Factor1);
                        TranslationVector.add(tempVec);
                        tempVec = key1.OutTan.clone();
                        tempVec.scaleNumber(Factor2);
                        TranslationVector.add(tempVec);
                        tempVec = key2.InTan.clone();
                        tempVec.scaleNumber(Factor3);
                        TranslationVector.add(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleNumber(Factor4);
                        TranslationVector.add(tempVec);
                        break;
                    case "Bezier":
                        FactorTimesTwo = Factor * Factor;
                        InverseFactorTimesTwo = InverseFactor * InverseFactor;
                        Factor1 = InverseFactorTimesTwo * InverseFactor;
                        Factor2 = 3.0 * Factor * InverseFactorTimesTwo;
                        Factor3 = 3.0 * FactorTimesTwo * InverseFactor;
                        Factor4 = FactorTimesTwo * Factor;
                        tempVec = key1.value.clone();
                        tempVec.scaleNumber(Factor1);
                        TranslationVector.add(tempVec);
                        tempVec = key1.OutTan.clone();
                        tempVec.scaleNumber(Factor2);
                        TranslationVector.add(tempVec);
                        tempVec = key2.InTan.clone();
                        tempVec.scaleNumber(Factor3);
                        TranslationVector.add(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleNumber(Factor4);
                        TranslationVector.add(tempVec);
                        break;
                }
                return TranslationVector;
            };
            return BoneTranslation;
        }());
        war3.BoneTranslation = BoneTranslation;
        /**
         * 纹理
         */
        var FBitmap = /** @class */ (function () {
            function FBitmap() {
            }
            return FBitmap;
        }());
        war3.FBitmap = FBitmap;
        /**
         * 几何设置
         */
        var Geoset = /** @class */ (function () {
            function Geoset() {
                /** 动作信息 */
                this.Anims = [];
            }
            return Geoset;
        }());
        war3.Geoset = Geoset;
        /**
         * 几何体动画
         */
        var GeosetAnim = /** @class */ (function () {
            function GeosetAnim() {
            }
            return GeosetAnim;
        }());
        war3.GeosetAnim = GeosetAnim;
        /**
         * 全局序列
         */
        var Globalsequences = /** @class */ (function () {
            function Globalsequences() {
                /** 持续时间 */
                this.durations = [];
            }
            return Globalsequences;
        }());
        war3.Globalsequences = Globalsequences;
        /**
         * 动作间隔
         */
        var Interval = /** @class */ (function () {
            function Interval() {
            }
            return Interval;
        }());
        war3.Interval = Interval;
        /**
         * 材质层
         */
        var Layer = /** @class */ (function () {
            function Layer() {
            }
            return Layer;
        }());
        war3.Layer = Layer;
        /**
         * 材质
         */
        var Material = /** @class */ (function () {
            function Material() {
                /** 材质层列表 */
                this.layers = [];
            }
            return Material;
        }());
        war3.Material = Material;
        /**
         * 模型信息
         */
        var Model = /** @class */ (function () {
            function Model() {
            }
            return Model;
        }());
        war3.Model = Model;
        /**
         *
         */
        var Rotation = /** @class */ (function () {
            function Rotation() {
            }
            return Rotation;
        }());
        war3.Rotation = Rotation;
        /**
         *
         */
        var Scaling = /** @class */ (function () {
            function Scaling() {
            }
            return Scaling;
        }());
        war3.Scaling = Scaling;
        /**
         *
         */
        var Translation = /** @class */ (function () {
            function Translation() {
            }
            return Translation;
        }());
        war3.Translation = Translation;
    })(war3 = feng3d.war3 || (feng3d.war3 = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var war3;
    (function (war3) {
        /**
         * war3模型数据
         */
        var War3Model = /** @class */ (function () {
            function War3Model() {
                /** 几何设置列表 */
                this.geosets = [];
                /** 骨骼动画列表 */
                this.bones = [];
            }
            War3Model.prototype.getMesh = function () {
                this.meshs = [];
                this.meshs.length = this.geosets.length;
                var container = feng3d.serialization.setValue(new feng3d.Entity(), { name: this.model.name }).addComponent("Node3D");
                var skeletonjoints = createSkeleton(this);
                this.skeletonComponent = container.addComponent("SkeletonComponent");
                this.skeletonComponent.joints = skeletonjoints;
                for (var i = 0; i < this.geosets.length; i++) {
                    var geoset = this.geosets[i];
                    var mesh = this.meshs[i] = new feng3d.Entity().addComponent("Node3D");
                    // var model = mesh.addComponent("Model");
                    var model = mesh.addComponent("SkinnedMeshRenderer");
                    var geometry = new feng3d.CustomGeometry();
                    geometry.positions = geoset.Vertices;
                    geometry.uvs = geoset.TVertices;
                    geometry.indices = geoset.Faces;
                    var normals = feng3d.geometryUtils.createVertexNormals(geometry.indices, geometry.positions, true);
                    geometry.normals = normals;
                    var skins = BuildAnimatedMeshSkin(geoset);
                    var skinSkeleton = new feng3d.SkinSkeletonTemp();
                    skinSkeleton.resetJointIndices(skins.jointIndices0, this.skeletonComponent);
                    //更新关节索引与权重索引
                    geometry.skinIndices = skins.jointIndices0;
                    geometry.skinWeights = skins.jointWeights0;
                    var material = this.materials[geoset.MaterialID];
                    if (!material.material) {
                        var fBitmap = this.Node3D(material);
                        var image = fBitmap.image;
                        // if (image && image.length > 0)
                        // {
                        // image = image.substring(0, image.indexOf("."));
                        // image += ".JPG";
                        material.material = model.material = feng3d.serialization.setValue(new feng3d.Material(), { name: image, renderParams: { cullFace: feng3d.CullFace.FRONT } });
                        // }
                        feng3d.globalEmitter.emit("asset.parsed", material.material);
                    }
                    feng3d.globalEmitter.emit("asset.parsed", geometry);
                    model.geometry = geometry;
                    model.skinSkeleton = skinSkeleton;
                    container.addChild(mesh);
                }
                var animationclips = createAnimationClips(this);
                var animation = container.addComponent("Animation");
                animation.animation = animationclips[0];
                animation.animations = animationclips;
                //
                container.node3d.rx = 90;
                container.node3d.sx = 0.01;
                container.node3d.sy = 0.01;
                container.node3d.sz = -0.01;
                return container;
            };
            War3Model.prototype.Node3D = function (material) {
                var TextureID = 0;
                for (var i = 0; i < material.layers.length; i++) {
                    var layer = material.layers[i];
                    TextureID = layer.TextureID;
                    break;
                }
                var fBitmap = this.textures[TextureID];
                return fBitmap;
            };
            return War3Model;
        }());
        war3.War3Model = War3Model;
        function createSkeleton(war3Model) {
            var bones = war3Model.bones;
            var skeletonjoints = [];
            for (var i = 0; i < bones.length; i++) {
                createSkeletonJoint(i);
            }
            return skeletonjoints;
            function createSkeletonJoint(index) {
                if (skeletonjoints[index])
                    return skeletonjoints[index];
                var joint = bones[index];
                var skeletonJoint = new feng3d.SkeletonJoint();
                skeletonJoint.name = joint.name;
                skeletonJoint.parentIndex = joint.Parent;
                var position = war3Model.pivotPoints[joint.ObjectId];
                ;
                var matrix = new feng3d.Matrix4x4().fromTRS(position, new feng3d.Vector3(), new feng3d.Vector3(1, 1, 1));
                if (skeletonJoint.parentIndex != -1) {
                    var parentskeletonJoint = createSkeletonJoint(skeletonJoint.parentIndex);
                    joint.pivotPoint = matrix.getPosition().subTo(parentskeletonJoint.matrix.getPosition());
                }
                else {
                    joint.pivotPoint = position;
                }
                skeletonJoint.matrix = matrix;
                skeletonjoints[index] = skeletonJoint;
                return skeletonJoint;
            }
        }
        function BuildAnimatedMeshSkin(geoset) {
            //关节索引数据
            var jointIndices0 = [];
            //关节权重数据
            var jointWeights0 = [];
            var numVertexs = geoset.Vertices.length / 3;
            for (var i = 0; i < numVertexs; i++) {
                //顶点所在组索引
                var iGroupIndex = geoset.VertexGroup[i];
                //顶点所在组索引
                var group = geoset.Groups[iGroupIndex];
                //顶点关联骨骼数量
                var numBones = group.length;
                var weightJoints = [0, 0, 0, 0];
                for (var j = 0; j < numBones; j++) {
                    var boneIndex = group[j];
                    weightJoints[j] = boneIndex;
                }
                var weightBiass = [0, 0, 0, 0];
                for (var j = 0; j < 4; j++) {
                    if (j < numBones)
                        weightBiass[j] = 1 / numBones;
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
            return { jointIndices0: jointIndices0, jointWeights0: jointWeights0 };
        }
        function createAnimationClips(war3Model) {
            var sequences = war3Model.sequences;
            var animationclips = [];
            for (var i = 0; i < sequences.length; i++) {
                var sequence = sequences[i];
                var animationclip = new feng3d.AnimationClip();
                animationclip.name = sequence.name;
                animationclip.loop = sequence.loop;
                animationclip.length = sequence.interval.end - sequence.interval.start;
                animationclip.propertyClips = [];
                var __chache__ = {};
                war3Model.bones.forEach(function (bone) {
                    bone.buildAnimationclip(animationclip, __chache__, sequence.interval.start, sequence.interval.end);
                });
                feng3d.globalEmitter.emit("asset.parsed", animationclip);
                animationclips.push(animationclip);
            }
            return animationclips;
        }
    })(war3 = feng3d.war3 || (feng3d.war3 = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var war3;
    (function (war3) {
        /**
         * war3的mdl文件解析器
         */
        var MDLParser = /** @class */ (function () {
            function MDLParser() {
            }
            /**
             * 解析war3的mdl文件
             * @param data MDL模型数据
             * @param completed 完成回调
             */
            MDLParser.prototype.parse = function (data, completed) {
                parse(data, completed);
            };
            return MDLParser;
        }());
        war3.MDLParser = MDLParser;
        war3.mdlParser = new MDLParser();
        var VERSION_TOKEN = "Version";
        var COMMENT_TOKEN = "//";
        var MODEL = "Model";
        var SEQUENCES = "Sequences";
        var GLOBALSEQUENCES = "GlobalSequences";
        var TEXTURES = "Textures";
        var MATERIALS = "Materials";
        var GEOSET = "Geoset";
        var GEOSETANIM = "GeosetAnim";
        var BONE = "Bone";
        var HELPER = "Helper";
        function parse(data, onParseComplete) {
            var token;
            var bone;
            var geoset;
            var junpStr;
            var num = 0;
            var war3Model = new war3.War3Model();
            /** 字符串数据 */
            var context = data;
            /** 当前解析位置 */
            var _parseIndex = 0;
            /** 是否文件尾 */
            var _reachedEOF = false;
            /** 当前解析行号 */
            var _line;
            /** 当前行的字符位置 */
            var _charLineIndex = 0;
            while (!_reachedEOF) {
                //获取关键字
                token = getNextToken();
                switch (token) {
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
                    case "PivotPoints":
                        war3Model.pivotPoints = parsePivotPoints();
                        break;
                    case "ParticleEmitter2":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "EventObject":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "Attachment":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "RibbonEmitter":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "CollisionShape":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "Camera":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "Light":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    default:
                        if (!_reachedEOF)
                            sendUnknownKeywordError(token);
                }
            }
            onParseComplete && onParseComplete(war3Model);
            /**
             * 获取骨骼深度
             * @param bone
             * @param bones
             * @return
             */
            function getBoneDepth(bone, bones) {
                if (bone.Parent == -1)
                    return 0;
                return getBoneDepth(bones[bone.Parent], bones) + 1;
            }
            /**
             * 解析版本号
             */
            function parseVersion() {
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                token = getNextToken();
                if (token != "FormatVersion")
                    sendUnknownKeywordError(token);
                var version = getNextInt();
                token = getNextToken();
                if (token != "}")
                    sendParseError(token);
                return version;
            }
            /**
             * 解析模型数据统计结果
             */
            function parseModel() {
                var model = new war3.Model();
                model.name = parseLiteralString();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "BlendTime":
                            model.BlendTime = getNextInt();
                            break;
                        case "MinimumExtent":
                            model.MinimumExtent = parseVector3D();
                            break;
                        case "MaximumExtent":
                            model.MaximumExtent = parseVector3D();
                            break;
                        case "}":
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
            function parseSequences() {
                //跳过动作个数
                getNextInt();
                var sequences = [];
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Anim":
                            var anim = parseAnim();
                            sequences.push(anim);
                            break;
                        case "}":
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
            function parseGlobalsequences() {
                var globalsequences = new war3.Globalsequences();
                globalsequences.id = getNextInt();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Duration":
                            var duration = getNextInt();
                            globalsequences.durations.push(duration);
                            break;
                        case "}":
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
            function parseTextures() {
                //跳过纹理个数
                getNextInt();
                var bitmaps = [];
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Bitmap":
                            var bitmap = parseBitmap();
                            bitmaps.push(bitmap);
                            break;
                        case "}":
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
            function parseMaterials() {
                //跳过纹理个数
                getNextInt();
                var materials = [];
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Material":
                            var material = parseMaterial();
                            materials.push(material);
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return materials;
            }
            function parseGeoset() {
                var geoset = new war3.Geoset();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Vertices":
                            geoset.Vertices = parseVertices();
                            break;
                        case "Normals":
                            geoset.Normals = parseNormals();
                            break;
                        case "TVertices":
                            geoset.TVertices = parseTVertices();
                            break;
                        case "VertexGroup":
                            geoset.VertexGroup = parseVertexGroup();
                            break;
                        case "Faces":
                            geoset.Faces = parseFaces();
                            break;
                        case "Groups":
                            geoset.Groups = parseGroups();
                            break;
                        case "MinimumExtent":
                            geoset.MinimumExtent = parseVector3D();
                            break;
                        case "MaximumExtent":
                            geoset.MaximumExtent = parseVector3D();
                            break;
                        case "BoundsRadius":
                            geoset.BoundsRadius = getNextNumber();
                            break;
                        case "Anim":
                            var anim = parseAnim1();
                            geoset.Anims.push(anim);
                            break;
                        case "MaterialID":
                            geoset.MaterialID = getNextInt();
                            break;
                        case "SelectionGroup":
                            geoset.SelectionGroup = getNextInt();
                            break;
                        case "Unselectable":
                            geoset.Unselectable = true;
                            break;
                        case "}":
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
            function parseBone() {
                var bone = new war3.BoneObject();
                bone.type = "bone";
                bone.name = parseLiteralString();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "ObjectId":
                            bone.ObjectId = getNextInt();
                            break;
                        case "Parent":
                            bone.Parent = getNextInt();
                            break;
                        case "GeosetId":
                            bone.GeosetId = getNextToken();
                            break;
                        case "GeosetAnimId":
                            bone.GeosetAnimId = getNextToken();
                            break;
                        case "Billboarded":
                            bone.Billboarded = true;
                            break;
                        case "Translation":
                            parseBoneTranslation(bone.Translation);
                            break;
                        case "Scaling":
                            parseBoneScaling(bone.Scaling);
                            break;
                        case "Rotation":
                            parseBoneRotation(bone.Rotation);
                            break;
                        case "BillboardedLockZ":
                            break;
                        case "BillboardedLockY":
                            break;
                        case "BillboardedLockX":
                            break;
                        case "}":
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
            function parseHelper() {
                var bone = new war3.BoneObject();
                bone.type = "helper";
                bone.name = parseLiteralString();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "ObjectId":
                            bone.ObjectId = getNextInt();
                            break;
                        case "Parent":
                            bone.Parent = getNextInt();
                            break;
                        case "GeosetId":
                            bone.GeosetId = getNextToken();
                            break;
                        case "GeosetAnimId":
                            bone.GeosetAnimId = getNextToken();
                            break;
                        case "Billboarded":
                            bone.Billboarded = true;
                            break;
                        case "Translation":
                            parseBoneTranslation(bone.Translation);
                            break;
                        case "Scaling":
                            parseBoneScaling(bone.Scaling);
                            break;
                        case "Rotation":
                            parseBoneRotation(bone.Rotation);
                            break;
                        case "BillboardedLockX":
                            break;
                        case "BillboardedLockY":
                            break;
                        case "BillboardedLockZ":
                            break;
                        case "DontInherit":
                            jumpChunk();
                            break;
                        case "}":
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
            function parseBoneScaling(boneScaling) {
                //跳过长度
                var len = getNextInt();
                check("{");
                boneScaling.type = getNextToken();
                var currentIndex = _parseIndex;
                var token = getNextToken();
                if (token == "GlobalSeqId") {
                    boneScaling.GlobalSeqId = getNextInt();
                }
                else {
                    _parseIndex = currentIndex;
                }
                var i = 0;
                var scaling;
                switch (boneScaling.type) {
                    case "Hermite":
                    case "Bezier":
                        for (i = 0; i < len; i++) {
                            scaling = new war3.Scaling();
                            scaling.time = getNextInt();
                            scaling.value = parseVector3D();
                            scaling[getNextToken()] = parseVector3D();
                            scaling[getNextToken()] = parseVector3D();
                            boneScaling.scalings.push(scaling);
                        }
                        break;
                    case "Linear":
                        for (i = 0; i < len; i++) {
                            scaling = new war3.Scaling();
                            scaling.time = getNextInt();
                            scaling.value = parseVector3D();
                            boneScaling.scalings.push(scaling);
                        }
                        break;
                    case "DontInterp":
                        for (i = 0; i < len; i++) {
                            scaling = new war3.Scaling();
                            scaling.time = getNextInt();
                            scaling.value = parseVector3D();
                            boneScaling.scalings.push(scaling);
                        }
                        break;
                    default:
                        throw new Error("未处理" + boneScaling.type + "类型角度");
                }
                check("}");
            }
            /**
             * 解析骨骼角度
             */
            function parseBoneTranslation(boneTranslation) {
                //跳过长度
                var len = getNextInt();
                check("{");
                boneTranslation.type = getNextToken();
                var currentIndex = _parseIndex;
                var token = getNextToken();
                if (token == "GlobalSeqId") {
                    boneTranslation.GlobalSeqId = getNextInt();
                }
                else {
                    _parseIndex = currentIndex;
                }
                var i = 0;
                var translation;
                switch (boneTranslation.type) {
                    case "Hermite":
                    case "Bezier":
                        for (i = 0; i < len; i++) {
                            translation = new war3.Translation();
                            translation.time = getNextInt();
                            translation.value = parseVector3D();
                            translation[getNextToken()] = parseVector3D();
                            translation[getNextToken()] = parseVector3D();
                            boneTranslation.translations.push(translation);
                        }
                        break;
                    case "Linear":
                        for (i = 0; i < len; i++) {
                            translation = new war3.Translation();
                            translation.time = getNextInt();
                            translation.value = parseVector3D();
                            boneTranslation.translations.push(translation);
                        }
                        break;
                    case "DontInterp":
                        for (i = 0; i < len; i++) {
                            translation = new war3.Translation();
                            translation.time = getNextInt();
                            translation.value = parseVector3D();
                            boneTranslation.translations.push(translation);
                        }
                        break;
                    default:
                        throw new Error("未处理" + boneTranslation.type + "类型角度");
                }
                check("}");
            }
            /**
             * 解析骨骼角度
             */
            function parseBoneRotation(boneRotation) {
                var len = getNextInt();
                check("{");
                boneRotation.type = getNextToken();
                var currentIndex = _parseIndex;
                var token = getNextToken();
                if (token == "GlobalSeqId") {
                    boneRotation.GlobalSeqId = getNextInt();
                }
                else {
                    _parseIndex = currentIndex;
                }
                var i = 0;
                var rotation;
                switch (boneRotation.type) {
                    case "Hermite":
                    case "Bezier":
                        for (i = 0; i < len; i++) {
                            rotation = new war3.Rotation();
                            rotation.time = getNextInt();
                            rotation.value = parseVector3D4();
                            rotation[getNextToken()] = parseVector3D4();
                            rotation[getNextToken()] = parseVector3D4();
                            boneRotation.rotations.push(rotation);
                        }
                        break;
                    case "Linear":
                        for (i = 0; i < len; i++) {
                            rotation = new war3.Rotation();
                            rotation.time = getNextInt();
                            rotation.value = parseVector3D4();
                            boneRotation.rotations.push(rotation);
                        }
                        break;
                    case "DontInterp":
                        for (i = 0; i < len; i++) {
                            rotation = new war3.Rotation();
                            rotation.time = getNextInt();
                            rotation.value = parseVector3D4();
                            boneRotation.rotations.push(rotation);
                        }
                        break;
                    default:
                        throw new Error("未处理" + boneRotation.type + "类型角度");
                }
                check("}");
            }
            /**
             * 解析多边形动画
             */
            function parseGeosetanim() {
                var jumpStr = jumpChunk();
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
            function parseVertices() {
                var vertices = [];
                //跳过长度
                var len = getNextInt();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var vertex;
                for (var i = 0; i < len; i++) {
                    vertex = parseVector3D();
                    vertices.push(vertex.x, vertex.y, vertex.z);
                }
                token = getNextToken();
                if (token != "}")
                    sendParseError(token);
                return vertices;
            }
            /**
             * 解析法线
             */
            function parseNormals() {
                var normals = [];
                //跳过长度
                var len = getNextInt();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var vertex;
                for (var i = 0; i < len; i++) {
                    vertex = parseVector3D();
                    normals.push(vertex.x, vertex.y, vertex.z);
                }
                token = getNextToken();
                if (token != "}")
                    sendParseError(token);
                return normals;
            }
            /**
             * 解析纹理坐标
             */
            function parseTVertices() {
                var tVertices = [];
                //跳过长度
                var len = getNextInt();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var uv;
                for (var i = 0; i < len; i++) {
                    uv = parsePoint();
                    tVertices.push(uv.x, uv.y);
                }
                token = getNextToken();
                if (token != "}")
                    sendParseError(token);
                return tVertices;
            }
            /**
             * 解析顶点分组
             */
            function parseVertexGroup() {
                var vertexGroup = [];
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                token = getNextToken();
                while (token != "}") {
                    vertexGroup.push(Number(token));
                    token = getNextToken();
                }
                return vertexGroup;
            }
            /**
             * 解析面
             */
            function parseFaces() {
                var faces = [];
                var faceNum = getNextInt();
                var indexNum = getNextInt();
                var token;
                check("{");
                check("Triangles");
                check("{");
                check("{");
                token = getNextToken();
                while (token != "}") {
                    faces.push(Number(token));
                    token = getNextToken();
                }
                check("}");
                check("}");
                return faces;
            }
            /**
             * 解顶点分组
             */
            function parseGroups() {
                var groups = [];
                var groupNum = getNextInt();
                var valueNum = getNextInt();
                var token;
                check("{");
                token = getNextToken();
                while (token != "}") {
                    if (token == "Matrices") {
                        check("{");
                        token = getNextToken();
                        var Matrices = [];
                        while (token != "}") {
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
            function parseBitmap() {
                var bitmap = new war3.FBitmap();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Image":
                            bitmap.image = parseLiteralString();
                            bitmap.image = bitmap.image.replace(/\\/g, "/");
                            break;
                        case "ReplaceableId":
                            bitmap.ReplaceableId = getNextInt();
                            break;
                        case "WrapWidth":
                            break;
                        case "WrapHeight":
                            break;
                        case "}":
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
            function parseMaterial() {
                var material = new war3.Material();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Layer":
                            var layer = parseLayer();
                            material.layers.push(layer);
                            break;
                        case "SortPrimsFarZ":
                            break;
                        case "ConstantColor":
                            break;
                        case "}":
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
            function parseLayer() {
                var layer = new war3.Layer();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var staticSigned = false;
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "FilterMode":
                            layer.FilterMode = getNextToken();
                            break;
                        case "static":
                            staticSigned = true;
                            break;
                        case "TextureID":
                            if (staticSigned) {
                                layer.TextureID = getNextInt();
                            }
                            else {
                                sendUnknownKeywordError(ch);
                            }
                            staticSigned = false;
                            break;
                        case "Alpha":
                            if (staticSigned) {
                                layer.Alpha = getNextNumber();
                            }
                            else {
                                getNextInt();
                                jumpChunk();
                                //							sendUnknownKeywordError(ch);
                            }
                            staticSigned = false;
                            break;
                        case "Unshaded":
                            layer.Unshaded = true;
                            break;
                        case "Unfogged":
                            layer.Unfogged = true;
                            break;
                        case "TwoSided":
                            layer.TwoSided = true;
                            break;
                        case "SphereEnvMap":
                            layer.SphereEnvMap = true;
                            break;
                        case "NoDepthTest":
                            layer.NoDepthTest = true;
                            break;
                        case "NoDepthSet":
                            layer.NoDepthSet = true;
                            break;
                        case "}":
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
            function parseAnim() {
                var anim = new war3.AnimInfo();
                anim.name = parseLiteralString();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Interval":
                            anim.interval = parseInterval();
                            break;
                        case "MinimumExtent":
                            anim.MinimumExtent = parseVector3D();
                            break;
                        case "MaximumExtent":
                            anim.MaximumExtent = parseVector3D();
                            break;
                        case "BoundsRadius":
                            anim.BoundsRadius = getNextNumber();
                            break;
                        case "Rarity":
                            anim.Rarity = getNextNumber();
                            break;
                        case "NonLooping":
                            anim.loop = false;
                            break;
                        case "MoveSpeed":
                            anim.MoveSpeed = getNextNumber();
                            break;
                        case "}":
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
            function parseAnim1() {
                var anim = new war3.AnimInfo1();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "MinimumExtent":
                            anim.MinimumExtent = parseVector3D();
                            break;
                        case "MaximumExtent":
                            anim.MaximumExtent = parseVector3D();
                            break;
                        case "BoundsRadius":
                            anim.BoundsRadius = getNextNumber();
                            break;
                        case "}":
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
            function parsePivotPoints() {
                var points = [];
                var len = getNextInt();
                check("{");
                for (var i = 0; i < len; i++) {
                    var point = parseVector3D();
                    points.push(point);
                }
                check("}");
                return points;
            }
            /**
             * 解析3d向量
             */
            function parseVector3D() {
                var vec = new feng3d.Vector3();
                var ch = getNextToken();
                if (ch != "{")
                    sendParseError("{");
                vec.x = getNextNumber();
                vec.y = getNextNumber();
                vec.z = getNextNumber();
                ch = getNextToken();
                if (!(ch == "}" || ch == "},"))
                    sendParseError("}");
                return vec;
            }
            /**
             * 解析四元素
             */
            function parseVector3D4() {
                var vec = new feng3d.Quaternion();
                var ch = getNextToken();
                if (ch != "{")
                    sendParseError("{");
                vec.x = getNextNumber();
                vec.y = getNextNumber();
                vec.z = getNextNumber();
                vec.w = getNextNumber();
                ch = getNextToken();
                if (!(ch == "}" || ch == "},"))
                    sendParseError("}");
                return vec;
            }
            /**
             * 解析2d坐标
             */
            function parsePoint() {
                var point = new feng3d.Vector2();
                var ch = getNextToken();
                if (ch != "{")
                    sendParseError("{");
                point.x = getNextNumber();
                point.y = getNextNumber();
                ch = getNextToken();
                if (!(ch == "}" || ch == "},"))
                    sendParseError("}");
                return point;
            }
            /**
             * 解析间隔
             */
            function parseInterval() {
                var interval = new war3.Interval();
                var ch = getNextToken();
                if (ch != "{")
                    sendParseError("{");
                interval.start = getNextInt();
                interval.end = getNextInt();
                ch = getNextToken();
                if (!(ch == "}" || ch == "},"))
                    sendParseError("}");
                return interval;
            }
            /**
             * 解析带双引号的字符串
             */
            function parseLiteralString() {
                skipWhiteSpace();
                var ch = getNextChar();
                var str = "";
                if (ch != "\"")
                    sendParseError("\"");
                do {
                    if (_reachedEOF)
                        sendEOFError();
                    ch = getNextChar();
                    if (ch != "\"")
                        str += ch;
                } while (ch != "\"");
                return str;
            }
            /**
             * 读取下个Number
             */
            function getNextNumber() {
                var f = parseFloat(getNextToken());
                if (isNaN(f))
                    sendParseError("float type");
                return f;
            }
            /**
             * 读取下个字符
             */
            function getNextChar() {
                var ch = context.charAt(_parseIndex++);
                if (ch == "\n") {
                    ++_line;
                    _charLineIndex = 0;
                }
                else if (ch != "\r")
                    ++_charLineIndex;
                if (_parseIndex >= context.length)
                    _reachedEOF = true;
                return ch;
            }
            /**
             * 读取下个int
             */
            function getNextInt() {
                var i = parseInt(getNextToken());
                if (isNaN(i))
                    sendParseError("int type");
                return i;
            }
            /**
             * 获取下个关键字
             */
            function getNextToken() {
                var ch;
                var token = "";
                while (!_reachedEOF) {
                    ch = getNextChar();
                    if (ch == " " || ch == "\r" || ch == "\n" || ch == "\t" || ch == ",") {
                        if (token != COMMENT_TOKEN)
                            skipWhiteSpace();
                        if (token != "")
                            return token;
                    }
                    else
                        token += ch;
                    if (token == COMMENT_TOKEN)
                        return token;
                }
                return token;
            }
            /**
             * 跳过块
             * @return 跳过的内容
             */
            function jumpChunk() {
                var start = _parseIndex;
                check("{");
                var stack = ["{"];
                var ch;
                while (!_reachedEOF) {
                    ch = getNextChar();
                    if (ch == "{") {
                        stack.push("{");
                    }
                    if (ch == "}") {
                        stack.pop();
                        if (stack.length == 0) {
                            return context.substring(start, _parseIndex);
                        }
                    }
                }
                return "";
            }
            /**
             * 返回到上个字符位置
             */
            function putBack() {
                _parseIndex--;
                _charLineIndex--;
                _reachedEOF = _parseIndex >= context.length;
            }
            /**
             * 跳过空白
             */
            function skipWhiteSpace() {
                var ch;
                do
                    ch = getNextChar();
                while (ch == "\n" || ch == " " || ch == "\r" || ch == "\t");
                putBack();
            }
            /**
             * 忽略该行
             */
            function ignoreLine() {
                var ch = "";
                while (!_reachedEOF && ch != "\n")
                    ch = getNextChar();
            }
            function check(key) {
                var token = getNextToken();
                if (token != key)
                    sendParseError(token);
            }
            /**
             * 抛出一个文件尾过早结束文件时遇到错误
             */
            function sendEOFError() {
                throw new Error("Unexpected end of file");
            }
            /**
             * 遇到了一个意想不到的令牌时将抛出一个错误。
             * @param expected 发生错误的标记
             */
            function sendParseError(expected) {
                throw new Error("Unexpected token at line " + (_line + 1) + ", character " + _charLineIndex + ". " + expected + " expected, but " + context.charAt(_parseIndex - 1) + " encountered");
            }
            /**
             * 发生未知关键字错误
             */
            function sendUnknownKeywordError(keyword) {
                throw new Error("Unknown keyword[" + keyword + "] at line " + (_line + 1) + ", character " + _charLineIndex + ". ");
            }
        }
    })(war3 = feng3d.war3 || (feng3d.war3 = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * OBJ模型MTL材质转换器
     */
    var MTLConverter = /** @class */ (function () {
        function MTLConverter() {
        }
        /**
         * OBJ模型MTL材质原始数据转换引擎中材质对象
         * @param mtl MTL材质原始数据
         */
        MTLConverter.prototype.convert = function (mtl, completed) {
            var materials = {};
            for (var name_1 in mtl) {
                var materialInfo = mtl[name_1];
                var material = materials[name_1] = feng3d.serialization.setValue(new feng3d.Material(), {
                    name: materialInfo.name,
                    uniforms: {
                        u_diffuse: { r: materialInfo.kd[0], g: materialInfo.kd[1], b: materialInfo.kd[2], },
                        u_specular: { r: materialInfo.ks[0], g: materialInfo.ks[1], b: materialInfo.ks[2], },
                    },
                });
                feng3d.globalEmitter.emit("asset.parsed", material);
            }
            completed && completed(null, materials);
        };
        return MTLConverter;
    }());
    feng3d.MTLConverter = MTLConverter;
    feng3d.mtlConverter = new MTLConverter();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * OBJ模型转换器
     */
    var OBJConverter = /** @class */ (function () {
        function OBJConverter() {
        }
        /**
         * OBJ模型数据转换为游戏对象
         * @param objData OBJ模型数据
         * @param materials 材质列表
         * @param completed 转换完成回调
         */
        OBJConverter.prototype.convert = function (objData, materials, completed) {
            var object = new feng3d.Entity().addComponent("Node3D");
            object.name = objData.name;
            var objs = objData.objs;
            for (var i = 0; i < objs.length; i++) {
                var obj = objs[i];
                var node3d = createSubObj(objData, obj, materials);
                object.addChild(node3d);
            }
            feng3d.globalEmitter.emit("asset.parsed", object);
            completed && completed(object);
        };
        return OBJConverter;
    }());
    feng3d.OBJConverter = OBJConverter;
    feng3d.objConverter = new OBJConverter();
    function createSubObj(objData, obj, materials) {
        var node3d = feng3d.serialization.setValue(new feng3d.Entity(), { name: obj.name }).addComponent("Node3D");
        var subObjs = obj.subObjs;
        for (var i = 0; i < subObjs.length; i++) {
            var materialTransform = createMaterialObj(objData, subObjs[i], materials);
            node3d.addChild(materialTransform);
        }
        return node3d;
    }
    var _realIndices;
    var _vertexIndex;
    function createMaterialObj(obj, subObj, materials) {
        var node3d = new feng3d.Entity().addComponent("Node3D", function (component) {
            component.entity.name = subObj.g || node3d.name;
        });
        var model = node3d.addComponent("Renderable");
        if (materials && materials[subObj.material])
            model.material = materials[subObj.material];
        var geometry = model.geometry = new feng3d.CustomGeometry();
        geometry.name = subObj.g || geometry.name;
        var vertices = [];
        var normals = [];
        var uvs = [];
        _realIndices = [];
        _vertexIndex = 0;
        var faces = subObj.faces;
        var indices = [];
        for (var i = 0; i < faces.length; i++) {
            var face = faces[i];
            var numVerts = face.indexIds.length - 1;
            for (var j = 1; j < numVerts; ++j) {
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
        feng3d.globalEmitter.emit("asset.parsed", geometry);
        return node3d;
        function translateVertexData(face, vertexIndex, vertices, uvs, indices, normals, obj) {
            var index;
            var vertex;
            var vertexNormal;
            var uv;
            if (!_realIndices[face.indexIds[vertexIndex]]) {
                index = _vertexIndex;
                _realIndices[face.indexIds[vertexIndex]] = ++_vertexIndex;
                vertex = obj.vertex[parseInt(face.vertexIndices[vertexIndex]) - 1];
                vertices.push(vertex.x, vertex.y, vertex.z);
                if (face.normalIndices && face.normalIndices.length > 0) {
                    vertexNormal = obj.vn[parseInt(face.normalIndices[vertexIndex]) - 1];
                    normals.push(vertexNormal.x, vertexNormal.y, vertexNormal.z);
                }
                if (face.uvIndices && face.uvIndices.length > 0) {
                    try {
                        uv = obj.vt[parseInt(face.uvIndices[vertexIndex]) - 1];
                        uvs.push(uv.u, uv.v);
                    }
                    catch (e) {
                        switch (vertexIndex) {
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
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * MD5模型转换器
     */
    var MD5MeshConverter = /** @class */ (function () {
        function MD5MeshConverter() {
        }
        /**
         * MD5模型数据转换为游戏对象
         * @param md5MeshData MD5模型数据
         * @param completed 转换完成回调
         */
        MD5MeshConverter.prototype.convert = function (md5MeshData, completed) {
            var node3d = new feng3d.Entity().addComponent("Node3D", function (component) {
                component.entity.name = md5MeshData.name;
            });
            node3d.addComponent("Animation");
            node3d.rx = -90;
            //顶点最大关节关联数
            var _maxJointCount = this.calculateMaxJointCount(md5MeshData);
            console.assert(_maxJointCount <= 8, "顶点最大关节关联数最多支持8个");
            var skeletonjoints = this.createSkeleton(md5MeshData.joints);
            var skeletonComponent = node3d.addComponent("SkeletonComponent");
            skeletonComponent.joints = skeletonjoints;
            for (var i = 0; i < md5MeshData.meshs.length; i++) {
                var skinSkeleton = new feng3d.SkinSkeletonTemp();
                var geometry = this.createGeometry(md5MeshData.meshs[i], skeletonComponent, skinSkeleton);
                var skeletonTransform = new feng3d.Entity().addComponent("Node3D");
                var skinnedModel = skeletonTransform.addComponent("SkinnedMeshRenderer");
                skinnedModel.geometry = geometry;
                skinnedModel.skinSkeleton = skinSkeleton;
                node3d.addChild(skeletonTransform);
            }
            feng3d.globalEmitter.emit("asset.parsed", node3d);
            completed && completed(node3d);
        };
        /**
         * 计算最大关节数量
         */
        MD5MeshConverter.prototype.calculateMaxJointCount = function (md5MeshData) {
            var _maxJointCount = 0;
            //遍历所有的网格数据
            var numMeshData = md5MeshData.meshs.length;
            for (var i = 0; i < numMeshData; ++i) {
                var meshData = md5MeshData.meshs[i];
                var vertexData = meshData.verts;
                var numVerts = vertexData.length;
                //遍历每个顶点 寻找关节关联最大数量
                for (var j = 0; j < numVerts; ++j) {
                    var zeroWeights = this.countZeroWeightJoints(vertexData[j], meshData.weights);
                    var totalJoints = vertexData[j].countWeight - zeroWeights;
                    if (totalJoints > _maxJointCount)
                        _maxJointCount = totalJoints;
                }
            }
            return _maxJointCount;
        };
        /**
         * 计算0权重关节数量
         * @param vertex 顶点数据
         * @param weights 关节权重数组
         * @return
         */
        MD5MeshConverter.prototype.countZeroWeightJoints = function (vertex, weights) {
            var start = vertex.startWeight;
            var end = vertex.startWeight + vertex.countWeight;
            var count = 0;
            var weight;
            for (var i = start; i < end; ++i) {
                weight = weights[i].bias;
                if (weight == 0)
                    ++count;
            }
            return count;
        };
        MD5MeshConverter.prototype.createSkeleton = function (joints) {
            var skeletonjoints = [];
            for (var i = 0; i < joints.length; i++) {
                var skeletonJoint = this.createSkeletonJoint(joints[i]);
                skeletonjoints.push(skeletonJoint);
            }
            return skeletonjoints;
        };
        MD5MeshConverter.prototype.createSkeletonJoint = function (joint) {
            var skeletonJoint = new feng3d.SkeletonJoint();
            skeletonJoint.name = joint.name;
            skeletonJoint.parentIndex = joint.parentIndex;
            var position = joint.position;
            var rotation = joint.rotation;
            var quat = new feng3d.Quaternion(rotation[0], -rotation[1], -rotation[2]);
            // quat supposed to be unit length
            var t = 1 - quat.x * quat.x - quat.y * quat.y - quat.z * quat.z;
            quat.w = t < 0 ? 0 : -Math.sqrt(t);
            //
            var matrix = quat.toMatrix();
            matrix.appendTranslation(-position[0], position[1], position[2]);
            //
            skeletonJoint.matrix = matrix;
            return skeletonJoint;
        };
        MD5MeshConverter.prototype.createGeometry = function (md5Mesh, skeleton, skinSkeleton) {
            var vertexData = md5Mesh.verts;
            var weights = md5Mesh.weights;
            var indices = md5Mesh.tris;
            var geometry = new feng3d.CustomGeometry();
            var len = vertexData.length;
            var vertex;
            var weight;
            var bindPose;
            var pos;
            //uv数据
            var uvs = [];
            uvs.length = len * 2;
            //顶点位置数据
            var vertices = [];
            vertices.length = len * 3;
            //关节索引数据
            var jointIndices0 = [];
            jointIndices0.length = len * 4;
            var jointIndices1 = [];
            jointIndices1.length = len * 4;
            //关节权重数据
            var jointWeights0 = [];
            jointWeights0.length = len * 4;
            var jointWeights1 = [];
            jointWeights1.length = len * 4;
            for (var i = 0; i < len; ++i) {
                vertex = vertexData[i];
                vertices[i * 3] = vertices[i * 3 + 1] = vertices[i * 3 + 2] = 0;
                /**
                 * 参考 http://blog.csdn.net/summerhust/article/details/17421213
                 * VertexPos = (MJ-0 * weight[index0].pos * weight[index0].bias) + ... + (MJ-N * weight[indexN].pos * weight[indexN].bias)
                 * 变量对应  MJ-N -> bindPose; 第J个关节的变换矩阵
                 * weight[indexN].pos -> weight.pos;
                 * weight[indexN].bias -> weight.bias;
                 */
                var weightJoints = [];
                var weightBiass = [];
                for (var j = 0; j < 8; ++j) {
                    weightJoints[j] = 0;
                    weightBiass[j] = 0;
                    if (j < vertex.countWeight) {
                        weight = weights[vertex.startWeight + j];
                        if (weight.bias > 0) {
                            bindPose = skeleton.joints[weight.joint].matrix;
                            pos = bindPose.transformPoint3(new feng3d.Vector3(-weight.pos[0], weight.pos[1], weight.pos[2]));
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
            //更新索引数据
            geometry.indices = indices;
            //更新顶点坐标与uv数据
            geometry.positions = vertices;
            geometry.uvs = uvs;
            //更新关节索引与权重索引
            geometry.skinIndices = jointIndices0;
            geometry.skinWeights = jointWeights0;
            geometry.skinIndices1 = jointIndices1;
            geometry.skinWeights1 = jointWeights1;
            return geometry;
        };
        return MD5MeshConverter;
    }());
    feng3d.MD5MeshConverter = MD5MeshConverter;
    feng3d.md5MeshConverter = new MD5MeshConverter();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * MD5动画转换器
     */
    var MD5AnimConverter = /** @class */ (function () {
        function MD5AnimConverter() {
        }
        /**
         * MD5动画数据转换为引擎动画数据
         * @param md5AnimData MD5动画数据
         * @param completed 转换完成回调
         */
        MD5AnimConverter.prototype.convert = function (md5AnimData, completed) {
            var animationClip = new feng3d.AnimationClip();
            animationClip.name = md5AnimData.name;
            animationClip.length = md5AnimData.numFrames / md5AnimData.frameRate * 1000;
            animationClip.propertyClips = [];
            var __chache__ = {};
            for (var i = 0; i < md5AnimData.numFrames; ++i) {
                translatePose(md5AnimData, md5AnimData.frame[i], animationClip);
            }
            feng3d.globalEmitter.emit("asset.parsed", animationClip);
            completed && completed(animationClip);
            /**
             * 将一个关键帧数据转换为SkeletonPose
             * @param frameData 帧数据
             * @return 包含帧数据的SkeletonPose对象
             */
            function translatePose(md5AnimData, frameData, animationclip) {
                var hierarchy;
                var base;
                var flags;
                var j;
                //偏移量
                var translation = new feng3d.Vector3();
                //旋转四元素
                var components = frameData.components;
                for (var i = 0; i < md5AnimData.numJoints; ++i) {
                    //通过原始帧数据与层级数据计算出当前骨骼pose数据
                    j = 0;
                    //层级数据
                    hierarchy = md5AnimData.hierarchy[i];
                    //基础帧数据
                    base = md5AnimData.baseframe[i];
                    //层级标记
                    flags = hierarchy.flags;
                    translation.x = base.position[0];
                    translation.y = base.position[1];
                    translation.z = base.position[2];
                    var orientation = new feng3d.Quaternion();
                    orientation.x = base.orientation[0];
                    orientation.y = base.orientation[1];
                    orientation.z = base.orientation[2];
                    //调整位移与角度数据
                    if (flags & 1)
                        translation.x = components[hierarchy.startIndex + (j++)];
                    if (flags & 2)
                        translation.y = components[hierarchy.startIndex + (j++)];
                    if (flags & 4)
                        translation.z = components[hierarchy.startIndex + (j++)];
                    if (flags & 8)
                        orientation.x = components[hierarchy.startIndex + (j++)];
                    if (flags & 16)
                        orientation.y = components[hierarchy.startIndex + (j++)];
                    if (flags & 32)
                        orientation.z = components[hierarchy.startIndex + (j++)];
                    //计算四元素w值
                    var w = 1 - orientation.x * orientation.x - orientation.y * orientation.y - orientation.z * orientation.z;
                    orientation.w = w < 0 ? 0 : -Math.sqrt(w);
                    orientation.y = -orientation.y;
                    orientation.z = -orientation.z;
                    translation.x = -translation.x;
                    var eulers = orientation.toEulerAngles();
                    eulers.scaleNumber(180 / Math.PI);
                    var path = [
                        [feng3d.PropertyClipPathItemType.Entity, hierarchy.name],
                        [feng3d.PropertyClipPathItemType.Component, "Transform"],
                    ];
                    var time = (frameData.index / md5AnimData.frameRate) * 1000;
                    setPropertyClipFrame(path, "position", time, translation.toArray(), "Vector3");
                    setPropertyClipFrame(path, "orientation", time, orientation.toArray(), "Quaternion");
                }
                function setPropertyClipFrame(path, propertyName, time, propertyValue, type) {
                    var propertyClip = getPropertyClip(path, propertyName);
                    propertyClip.type = type;
                    propertyClip.propertyValues.push([time, propertyValue]);
                }
                function getPropertyClip(path, propertyName) {
                    var key = path.join("-") + propertyName;
                    if (__chache__[key])
                        return __chache__[key];
                    if (!__chache__[key]) {
                        var propertyClip = __chache__[key] = new feng3d.PropertyClip();
                        propertyClip.path = path;
                        propertyClip.propertyName = propertyName;
                        propertyClip.propertyValues = [];
                        animationclip.propertyClips.push(propertyClip);
                    }
                    return __chache__[key];
                }
            }
        };
        return MD5AnimConverter;
    }());
    feng3d.MD5AnimConverter = MD5AnimConverter;
    feng3d.md5AnimConverter = new MD5AnimConverter();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * OBJ模型MTL材质加载器
     */
    var MTLLoader = /** @class */ (function () {
        function MTLLoader() {
        }
        /**
         * 加载MTL材质
         * @param path MTL材质文件路径
         * @param completed 加载完成回调
         */
        MTLLoader.prototype.load = function (path, completed) {
            feng3d.fs.readString(path, function (err, content) {
                if (err) {
                    completed(err, null);
                    return;
                }
                var mtlData = feng3d.mtlParser.parser(content);
                feng3d.mtlConverter.convert(mtlData, completed);
            });
        };
        return MTLLoader;
    }());
    feng3d.MTLLoader = MTLLoader;
    feng3d.mtlLoader = new MTLLoader();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Obj模型加载类
     */
    var ObjLoader = /** @class */ (function () {
        function ObjLoader() {
        }
        /**
         * 加载资源
         * @param url   路径
         */
        ObjLoader.prototype.load = function (url, completed) {
            var root = url.substring(0, url.lastIndexOf("/") + 1);
            feng3d.fs.readString(url, function (err, content) {
                var objData = feng3d.objParser.parser(content);
                objData.name = feng3d.pathUtils.getName(url);
                var mtl = objData.mtl;
                if (mtl) {
                    feng3d.mtlLoader.load(root + mtl, function (err, materials) {
                        feng3d.objConverter.convert(objData, materials, completed);
                    });
                }
                else {
                    feng3d.objConverter.convert(objData, null, completed);
                }
            });
        };
        return ObjLoader;
    }());
    feng3d.ObjLoader = ObjLoader;
    feng3d.objLoader = new ObjLoader();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * MD5模型加载类
     */
    var MD5Loader = /** @class */ (function () {
        function MD5Loader() {
        }
        /**
         * 加载资源
         * @param url   路径
         * @param completed 加载完成回调
         */
        MD5Loader.prototype.load = function (url, completed) {
            feng3d.fs.readString(url, function (err, content) {
                var md5MeshData = feng3d.md5MeshParser.parse(content);
                md5MeshData.name = feng3d.pathUtils.getName(url);
                feng3d.md5MeshConverter.convert(md5MeshData, completed);
            });
        };
        /**
         * 加载MD5模型动画
         * @param url MD5模型动画资源路径
         * @param completed 加载完成回调
         */
        MD5Loader.prototype.loadAnim = function (url, completed) {
            feng3d.fs.readString(url, function (err, content) {
                var md5AnimData = feng3d.md5AnimParser.parse(content);
                md5AnimData.name = feng3d.pathUtils.getName(url);
                feng3d.md5AnimConverter.convert(md5AnimData, completed);
            });
        };
        return MD5Loader;
    }());
    feng3d.MD5Loader = MD5Loader;
    feng3d.md5Loader = new MD5Loader();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * MDL模型加载器
     */
    var MDLLoader = /** @class */ (function () {
        function MDLLoader() {
        }
        /**
         * 加载MDL模型
         * @param mdlurl MDL模型路径
         * @param callback 加载完成回调
         */
        MDLLoader.prototype.load = function (mdlurl, callback) {
            feng3d.fs.readString(mdlurl, function (err, content) {
                feng3d.war3.mdlParser.parse(content, function (war3Model) {
                    var showMesh = war3Model.getMesh();
                    var node3d = feng3d.serialization.setValue(new feng3d.Entity(), { name: feng3d.pathUtils.getName(mdlurl) }).addComponent("Node3D", function (node3d) {
                        node3d.children = [showMesh];
                    });
                    feng3d.globalEmitter.emit("asset.parsed", node3d);
                    callback && callback(node3d);
                });
            });
        };
        return MDLLoader;
    }());
    feng3d.MDLLoader = MDLLoader;
    feng3d.mdlLoader = new MDLLoader();
})(feng3d || (feng3d = {}));
//# sourceMappingURL=index.js.map