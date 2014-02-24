<?php
/**
 * Imageflow Plugin
 *
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     i-net software <tools@inetsoftware.de>
 * @author     Gerry Weissbach <gweissbach@inetsoftware.de>
 */

// must be run within Dokuwiki
if(!defined('DOKU_INC')) die();

if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'action.php');

class action_plugin_popupviewer extends DokuWiki_Action_Plugin {

    function getInfo(){
    	return array_merge(confToHash(dirname(__FILE__).'/plugin.info.txt'), array(
				'name' => 'PopUpViewer Action Component',
				'desc' => 'Delivers pages back to the browser'
				));
    }

    function register(&$controller) {
        // Support given via AJAX
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'ajax_viewer_provider');
    }

    function ajax_viewer_provider( &$event ) {
        global $JSINFO;
        global $INFO;
        global $ID;
        global $ACT;

        if ( $event->data != '_popup_load_file' && $event->data != '_popup_load_image_meta' ) {
            return;
        }

        // Registers ACT
        if (isset($_SERVER['HTTP_X_DOKUWIKI_DO'])){
            $ACT = trim(strtolower($_SERVER['HTTP_X_DOKUWIKI_DO']));
        } elseif (!empty($_REQUEST['idx'])) {
            $ACT = 'index';
        } elseif (isset($_REQUEST['do'])) {
            $ACT = $_REQUEST['do'];
        } else {
            $ACT = 'show';
        }

        $event->preventDefault();
        $event->stopPropagation();

        $data = "";
        $head = array();
		$ID = getID('id');

        switch($event->data) {
            case '_popup_load_file' :
                $INFO = pageinfo();
                $json = new JSON();
                $JSINFO['id'] = $ID;
                $JSINFO['namespace'] = (string) $INFO['namespace'];
                trigger_event('POPUPVIEWER_DOKUWIKI_STARTED',$head,null,true);

                $script = 'var JSINFO = '.$json->encode($JSINFO).';';
                $meta = p_get_metadata($ID, 'popupscript', true);
                
                foreach($meta as $popupscript) {
	                $script .= "try{(function($){".$popupscript."}(jQuery))}catch(e){alert('Could not execute popupscript: '+e);}";
                }

                $head['popupscript'][] = array( 'type'=>'text/javascript', '_data'=> $script);

                $data = '<div class="dokuwiki" style="padding-bottom: 10px;">' . p_wiki_xhtml($ID,'',true) . '</div>';
                break;
            case '_popup_load_image_meta' :

				global $SRC;
				$SRC = mediaFN($ID);
                $title = hsc(tpl_img_getTag('IPTC.Headline'));
                $caption = hsc(tpl_img_getTag('IPTC.Caption'));

                if ( !empty($title) ) { $title = "<h3 class=\"title\">$title</h3>"; }
                if ( !empty($caption) ) { $caption = "<div class=\"text\"><p>$caption</p></div>"; }
                $data = preg_replace("%(\n|\r)%", '', nl2br($title.$caption));
                break;
        }

        header('Content-Type: text/html; charset=utf-8');

        if ( !empty($head) ) {
            trigger_event('TPL_METAHEADER_OUTPUT',$head,'_tpl_metaheaders_action',true);
        }

        print $data;
        return;
    }
}