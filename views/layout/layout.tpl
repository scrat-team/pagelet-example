{# 基础布局, 分为上中下 #}
{% extends 'base.tpl' %}
{% block body %}

  {% require $id="layout.js" %}

  {% pagelet $id="layout" class="page-content index-main" %}
    {% block content %}{% endblock %}
  {% endpagelet %}

  <script>
    // 首屏时间
    window._firstPaintTime = new Date().getTime() - startTime;
  </script>
{% endblock %}
