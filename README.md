#DokuWiki PopUpViewer

A DokuWiki plugin that allows for simple popups of images or even pages from the wiki.

##Syntax

```
{{popup>%IMAGE/PAGE%?[%SIZE%]&[keepOpen]|[%TEXT/IMAGE%]}}
Note: [?%SIZE%] and [%TEXT/IMAGE%] are optional parameters.
```

 Option | Description
 :----- | :----------
```%IMAGE/PAGE%``` | an image or a page as you know it from DokuWiki
```%SIZE%``` (optional) | Width and height (optional) in px. Example: 200×300
```keepOpen``` (optional) | All links in a page opened via a popup will also open in a popup.
```%TEXT/IMAGE%``` (optional) |  Here you can set the name or an additional image. This will be displayed to the user as link to click on for the popup

__Hints__:

 * ```?``` is required when using either ```%SIZE%```or ```keepOpen```
 * ```&```is required in between when using both options.
 * ```keepOpen``` only has an effect when using a page id, never with an image.

##Extra JavaScript for loaded pages

You can add JavaScript that is being executed for pages that load in a popup. The script has to be placed in the page to load. it will not get executed anywhere else. You have to enable this.

```
<popupscript>
/* JavaScript */
</popupscript>
```
