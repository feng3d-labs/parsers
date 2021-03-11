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
        load(mdlurl: string, callback?: (transform: Node3D) => void)
        {
            fs.readString(mdlurl, (err, content) =>
            {
                war3.mdlParser.parse(content, (war3Model) =>
                {
                    var showMesh = war3Model.getMesh();

                    var transform = serialization.setValue(new GameObject(), { name: pathUtils.getName(mdlurl) }).addComponent("Node3D", (transform) =>
                    {
                        transform.children = [showMesh];
                    });

                    globalEmitter.emit("asset.parsed", transform);
                    callback && callback(transform);
                });
            });
        }
    }

    mdlLoader = new MDLLoader();
}