<?php
/**
 * PopUpViewer
 *
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     i-net software <tools@inetsoftware.de>
 * @author     Gerry Weissbach <gweissbach@inetsoftware.de>
 */

// must be run within Dokuwiki
if(!defined('DOKU_INC')) die();

class helper_plugin_popupviewer extends DokuWiki_Plugin {

    function _getWidthHeightParams($w, $h) {
        $params = ''; $params2 = '';
        if ( !empty($w) && intval($w) == $w ) $params2 .= ',\'' . intval($w) . '\'';
        else {
            if ( !empty($w) && doubleVal($w) == $w )
            $params .= 'viewer.maxWidthFactor=' . doubleVal($w) . ';';
            $params2 .= ',null';
        }

        if ( !empty($h) && intval($h) == $h ) $params2 .= ',\'' . intval($h) . '\'';
        else {
            if ( !empty($h) && doubleVal($h) == $h )
            $params .= 'viewer.maxHeightFactor=' . doubleVal($h) . ';';
            $params2 .= ',null';
        }

        return array($params, $params2);
    }

}
