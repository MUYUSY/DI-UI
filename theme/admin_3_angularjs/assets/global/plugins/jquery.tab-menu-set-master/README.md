# jquery.tab-menu-set
jQuery plugin for simple tabs.


## Demo
http://usamimi.info/~sutara/sample/tab-menu-set/


## Usage
###### HTML
```html
<div id="tabset1">
  <ol><!-- 1st child should be title-container -->
    <li><a>Title1</a></li>
    <li><a>Title2</a></li>
    <li><a>Title3</a></li>
  </ol>
  <div><!-- 2nd child should be body-container -->
    <div>Body1</div>
    <div>Body2</div>
    <div>Body3</div>
  </div>
</div>
```

###### JavaScript
```javascript
$('#tabset1').tabMenuSet();
```


## Options
|Name        |Default|Description                             |
|------------|-------|----------------------------------------|
|init_tab    |0      |Index of the tab to be opened initially.|
|chg_by_hover|false  |Whether change the tab by mouseover.    |


## License
[MIT](http://www.opensource.org/licenses/mit-license.php)


## Author
[Yuusaku Miyazaki](http://d.hatena.ne.jp/sutara_lumpur/20120424/1335269821)
( <toumin.m7@gmail.com> )
