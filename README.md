## pagelet-example - scrat pagelet 示例

  - 源码地址: https://github.com/scrat-team/pagelet-example

### 初始化
  - 安装工具: `npm install scrat -g`
  - 实时编译: `scrat release -opmcuDwL`  (平时开发仅需 `scrat release -cwL`)
  - 本地服务: `scrat server start`
  - 访问 http://localhost:5000

### 示例注意事项
  - 按以上指令启动, 注意后面2条是需要开2个命令行执行
  - 浏览器里面观察
    - network
      - doc / ajax 窗口, 可以看到切换页面时, pagelet 的请求
      - 点击进入详情页后, 会发现页面无刷新, 仅为 pagelet 请求, 但若点击刷新, 会发现页面是可以整屏渲染的.(完美支持 SEO )
      - js/css 可以观察资源加载方式, 可以用第2条指令来观察 combo 请求
    - element
      - 可以看到切换页面时的内容替换, 观察指定的 data-pagelet 区域
      - 演示代码仅为替换两个区域, 实际业务可以需求选择前插/后插/替换/自定义
   - 或者观看截图: https://github.com/scrat-team/pagelet-example/tree/master/docs
     - ![静态资源引入-element.png](https://github.com/scrat-team/pagelet-example/raw/master/docs/%E9%9D%99%E6%80%81%E8%B5%84%E6%BA%90%E5%BC%95%E5%85%A5-element.png)
     - ![静态资源引入-network.png](https://github.com/scrat-team/pagelet-example/raw/master/docs/%E9%9D%99%E6%80%81%E8%B5%84%E6%BA%90%E5%BC%95%E5%85%A5-network.png)
     - ![pagelet切换1.png](https://github.com/scrat-team/pagelet-example/raw/master/docs/pagelet%E5%88%87%E6%8D%A2.png)
     - ![pagelet切换2.png](https://github.com/scrat-team/pagelet-example/raw/master/docs/pagelet%E5%88%87%E6%8D%A22.png)
     - ![pagelet切换3.png](https://github.com/scrat-team/pagelet-example/raw/master/docs/pagelet%E5%88%87%E6%8D%A23.png)

### 常用指令
  - 开发: `scrat release -cwL` (`-c`代表清理compile缓存, 避免踩坑.)
  - 服务: `scrat server start -L` (`-L`代表修改代码后自动重启node, 如果仅修改前端代码可以不用)
  - 打包:
    - `scrat release -d remote` 发布开发包到UAE
    - `scrat release -opmcuDd remote` 发布正式包到UAE
  - 其他:
    - 大重构后, 建议执行 `scrat server clean -a` 清理缓存目录, 避免踩坑. (`-a`代表清理`node_modules`, 可不加)

### Tip
  - 注意源码目录下不要有`node_modules`, 否则编译速度很慢.
