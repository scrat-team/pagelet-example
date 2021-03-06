<!doctype html>
{% html lang="zh-CN"%}
  {% head %}
    {% include 'meta.tpl' %}
    <script> {# 时间打点需要放置在原位, 故不用 {% script %} #}
      // 测试时间起点，实际统计起点为 DNS 查询
      var startTime = new Date().getTime();
    </script>

    <link rel="icon" href="favicon.ico" />
    {% title %}{{title}}{% endtitle %}

    {# 引用模块 #}
    {% require $id="../lib/md.js" %}
    {% require $id="../lib/pagelet/pagelet.js" %}
    {% require $id="../lib/pagelet/pagelet-cache.js" %}

  <script>
    // 头部资源加载时间
    window._headTime = new Date().getTime() - startTime;
  </script>
  {% endhead %}

  {% body %}
    <div class="layout">
      {% block body %}
        {# 用于继承的block区域 #}
      {% endblock %}
    </div>
  {% endbody %}
  <!--livereload-->
{% endhtml %}
