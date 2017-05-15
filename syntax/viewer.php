<?php
/**
 * popoutviewer Plugin
 *
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     i-net software <tools@inetsoftware.de>
 * @author     Gerry Weissbach <gweissbach@inetsoftware.de>
 */

// must be run within Dokuwiki
if(!defined('DOKU_INC')) die();
if (!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');

require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_popupviewer_viewer extends DokuWiki_Syntax_Plugin {

    private $headers = array();

    function getInfo(){
        return array_merge(confToHash(dirname(__FILE__).'/plugin.info.txt'), array(
                'name' => 'PopUpViewer Linking Component',
                'desc' => 'Takes a Page to be diplayed in an overlay pop-out'
                ));
    }

    function getType() { return 'substition'; }
    function getPType() { return 'normal'; }
    function getSort() { return 98; }

    function connectTo($mode) {
         
        $this->Lexer->addSpecialPattern('{{popup>[^}]+}}}}', $mode, 'plugin_popupviewer_viewer');
        $this->Lexer->addSpecialPattern('{{popup>[^}]+}}', $mode, 'plugin_popupviewer_viewer');
        $this->Lexer->addSpecialPattern('{{popupclose>[^}]+}}}}', $mode, 'plugin_popupviewer_viewer');
        $this->Lexer->addSpecialPattern('{{popupclose>[^}]+}}', $mode, 'plugin_popupviewer_viewer');
    }

    function handle($match, $state, $pos, Doku_Handler $handler) {

        $close = strstr( $match, "{{popupclose>") !== false;

        $orig = substr($match, $close ? 13 : 8, -2);
        list($id, $name) = explode('|', $orig, 2); // find ID/Params + Name Extension
        list($name, $title) = explode('%', $name, 2); // find Name and Title
        list($id, $param) = explode('?', $id, 2); // find ID + Params
        
        $params = explode('&', strtolower($param));
        $w = $h = $keepOpen = null;
        foreach( $params as $p ) {
            if ( $p === 'keepOpen' ) {
                $keepOpen = true;
            } else {
                list($w, $h) = explode('x', $p, 2); // find Size
            }
        } 
        
        return array(trim($id), $name, $title, $w, $h, $orig, $close, null, $keepOpen);
    }

    function render($mode, Doku_Renderer $renderer, $data) {
        global $ID, $conf, $JSINFO;

        if ( $mode != 'xhtml' && $mode != 'metadata' ) { return true; }

        list($id, $name, $title, $w, $h, $orig, $close, $isImageMap, $keepOpen) = $data;

        $exists = false;
        if ( !empty($id) ) {
            $origID = $id;
            resolve_mediaid(getNS($ID),$id,$exists);
            if ( !$exists ) {
                $id = $origID;
            }
        }

        if($mode === 'metadata') {
            $renderer->internalmedia($id,$title);
            return;
        }

        $scID = sectionID(noNs($id), $this->headers);
        $more = 'id="' . $scID . '"';
        $script = '';

        if ( $exists ) {
            // is Media

            $p1 = Doku_Handler_Parse_Media($orig);

            if ( empty($name) ) {
                
                if ( !method_exists($renderer, '_media') ) {
                    $p = array();
                    $p['alt'] = $id;
                    $p['class'] = 'popupimage';
                    $p['title'] = $title;
                    $p['id'] = 'popupimage_' . $scID;
                    if ($p1['width']) $p['width'] = $p1['width'];
                    if ($p1['height']) $p['height'] = $p1['height'];
                    if ($p1['title'] && !$p['title']) { $p['title'] = $p1['title']; $p['alt'] = $p1['title']; }
                    if ($p1['align']) $p['class'] .= ' media' . $p1['align'];
    
                    $p2 = buildAttributes($p);
                    $name = '<img src="' . ml($id, array( 'w' => $p['width'], 'h' => $p['height'] ) ) . '" '.$p2.'/>';
                } else {
                    $name = $renderer->_media($id, ($title ? $title : ($p1['title'] ? $p1['title'] : $id) ), ' popupimage' . ($p1['align'] ? ' media' . $p1['align'] : '' ), $p1['width'], $p1['height']);
                }
            } else {
                $name = trim(p_render($mode, p_get_instructions(trim($name)), $info));
                $name = trim(preg_replace("%^(\s|\r|\n)*?<a.+?>(.*)?</a>(\s|\r|\n)*?$%is", "$2", preg_replace("%^(\s|\r|\n)*?<p.*?>(.*)?</p>(\s|\r|\n)*?$%is", "$2", $name)));
                 
                $name = preg_replace("%^(<img[^>]*?)>%", "$1 id=\"popupimage_$scID\">", $name);
            }

            $more = $this->_getOnClickHandler($close, array('isImage' => true, 'id' => $id));
            $id = ml($id);

        } else {
            // is Page
            resolve_pageid(getNS($ID),$id,$exists);
            if ( empty($name) ) {
                $name = htmlspecialchars(noNS($id),ENT_QUOTES,'UTF-8');
                if ($conf['useheading'] && $id ) {
                    $heading = p_get_first_heading($id,true);
                    if ($heading) {
                        $name = htmlspecialchars($heading,ENT_QUOTES,'UTF-8');
                    }
                }
            } else {
                $name = trim(p_render($mode, p_get_instructions(trim($name)), $info));
            }

            $data = array(
                'width' => $w,
                'height' => $h,
                'id' => $id
            );
            
            if ( $keepOpen ) {
                $data['keepOpen'] = true;
            }

            // Add ID for AJAX - this.href for offline versions
            $more = $this->_getOnClickHandler($close, $data);
            $id=wl($id);
        }

        $renderer->doc .= $this->_renderFinalPopupImage($id, $exists, $more, $name, $isImageMap, $script);

        return true;
    }

    function _renderFinalPopupImage($id, $exists, $more, $name, $isImageMap, $script, $class='') {

        $more .= ' class="wikilink' . ($exists?1:2) . (!empty($class) ? ' ' . $class : '' ). '"';
        $name = trim(preg_replace("%^(\s|\r|\n)*?<a.+?>(.*)?</a>(\s|\r|\n)*?$%is", "$2", preg_replace("%^(\s|\r|\n)*?<p.*?>(.*)?</p>(\s|\r|\n)*?$%is", "$2", $name)));
         
        if ( !is_array($isImageMap) ) {
            return '<a href="'.$id.'" ' . trim($more) . ' >' . $name . '</a>' . $script;
        } else {
            $return = '<area href="'.$id.'" ' . trim($more) . '';
            $return .= ' title="'.$name.'" alt="'.$name.'"';
            $return .= ' shape="'.$isImageMap['shape'].'" coords="'.$isImageMap['coords'].'" />' . $script;
            
            return $return;
        }
    }

    function _getOnClickHandler($close, $data=array()) {
        if ( !$close ) {
            return ' data-popupviewer="' . htmlentities(json_encode(array_filter($data))) . '"';
        } else {
            return ' data-popupviewerclose';
        }
    }

    /**
     * Implements API from imagemap
     */
    function convertToImageMapArea($imagemap, $data, $pos) {

        list($id, $name, $title, $w, $h, $orig, $close) = $data;

        if ( !preg_match('/^(.*)@([^@]+)$/u', array_pop(explode('|', $name)), $match)) {
            return;
        }
        
        $coords = explode(',',$match[2]);
        if (count($coords) == 3) {
            $shape = 'circle';
        } elseif (count($coords) == 4) {
            $shape = 'rect';
        } elseif (count($coords) >= 6) {
            $shape = 'poly';
        } else {
            return;
        }
                
        $coords = array_map('trim', $coords);
        $name = trim($match[1]);
        $imagemap->CallWriter->writeCall(array('plugin', array('popupviewer_viewer', array($id, $name, $title, $w, $h, $orig, $close, array('shape' => $shape, 'coords' => join(',',$coords))), DOKU_LEXER_MATCHED), $pos));
    }
}
// vim:ts=4:sw=4:et:enc=utf-8:
