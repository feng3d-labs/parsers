namespace feng3d
{
    /**
     * MDL模型加载器
     */
    export var mdlLoader: MDLLoader;

    /**
     * MDL模型加载器
     */
    export class MDLLoader
    {
        /**
         * 加载MDL模型
         * @param mdlurl MDL模型路径
         * @param callback 加载完成回调
         */
        load(mdlurl: string, callback?: (node3d: Node3D) => void)
        {
            fs.readString(mdlurl, (err, content) =>
            {
                war3.mdlParser.parse(content, (war3Model) =>
                {
                    var showMesh = war3Model.getMesh();

                    var node3d = serialization.setValue(new GameObject(), { name: pathUtils.getName(mdlurl) }).addComponent("Node3D", (node3d) =>
                    {
                        node3d.children = [showMesh];
                    });

                    globalEmitter.emit("asset.parsed", node3d);
                    callback && callback(node3d);
                });
            });
        }
    }

    mdlLoader = new MDLLoader();
}