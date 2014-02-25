#DokuWiki PopUpViewer

A DokuWiki plugin that allows for simple popups of images or even pages from the wiki.

##Syntax

```
{{popup>%IMAGE/PAGE%[?%SIZE]|[%TEXT/IMAGE%]}}
Note: [?%SIZE%] and [%TEXT/IMAGE%] are optional parameters.
```

 Option | Description
 :----- | :----------
```%IMAGE/PAGE%``` | an image or a page as you know it from DokuWiki
```%SIZE%``` (optional) | Width and height (optional) in px. Example: 200×300
```%TEXT/IMAGE%``` (optional) |  Here you can set the name or an additional image. This will be displayed to the user as link to click on for the popup

##Extra JavaScript for loaded pages

You can add JavaSCript that is being executed for pages that load in a popup. The script has to be placed in the page to load. it will not get executed anywhere else. You have to enable this.

```
<popupscript>
/* JavaScript */
</popupscript>
```
