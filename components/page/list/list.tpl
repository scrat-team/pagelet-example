
{% pagelet $id="header" %}

{% endpagelet %}

{% pagelet $id="main" class="p-list" %}
  {% require $id="widget/list" %}
{% endpagelet %}

{###### 在正式部署后，此标签“以上”所有样式文件会内连到page中输出 ######}
{% ATF %}

{% pagelet $id="footer" %}
  {% require $id="widget/dock" %}
{% endpagelet %}
