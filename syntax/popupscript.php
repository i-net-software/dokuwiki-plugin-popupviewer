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

class syntax_plugin_popupviewer_popupscript extends DokuWiki_Syntax_Plugin {

    function getType() { return 'protected'; }
    function getPType() { return 'normal'; }
    function getSort() { return 98; }

    function connectTo($mode) {
        $this->Lexer->addEntryPattern('<popupscript>(?=.*?</popupscript>)', $mode, 'plugin_popupviewer_popupscript');
    }

    function postConnect() {
        $this->Lexer->addExitPattern('</popupscript>', 'plugin_popupviewer_popupscript');
    }

    function handle($match, $state, $pos, Doku_Handler $handler) {
        if ( $state == DOKU_LEXER_UNMATCHED ) {
            return $match;
        }
        
        return false;
    }

    function render($mode, Doku_Renderer $renderer, $data) {

        global $ID;

        if ( $mode == "metadata" && $this->getConf('allowpopupscript')) {
            p_set_metadata($ID, array( 'popupscript' => trim($data)));
        }
    }
}
// vim:ts=4:sw=4:et:enc=utf-8:
