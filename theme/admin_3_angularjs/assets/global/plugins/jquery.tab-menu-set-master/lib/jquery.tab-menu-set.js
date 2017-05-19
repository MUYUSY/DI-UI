/**
 * @file jQuery Plugin: jquery.tab-menu-set
 * @version 1.1.2
 * @author Yuusaku Miyazaki [toumin.m7@gmail.com]
 * @license MIT License
 */
(function($) {

/**
 * @desc プラグインをjQueryのプロトタイプに追加する
 * @global
 * @memberof jQuery
 * @param {Object} option - オプションを格納した連想配列
 * @param {number} [option.init_tab=0] - 初期状態で表示するタブのインデックス
 * @param {boolean} [option.chg_by_hover=false] - マウスオーバーだけでタブを開くかどうか
 */
$.fn.tabMenuSet = function(option) {
	return this.each(function() {
		new TabMenuSet(this, option);
	});
};

/**
 * @global
 * @constructor
 * @classdesc 要素ごとに適用される処理を集めたクラス
 * @param {Object} elem - プラグインを適用するHTML要素
 * @param {Object} option - オプションを格納した連想配列
 *
 * @prop {Object} elem - プラグインを適用するHTML要素を整理した連想配列
 * @prop {Object} option - オプションを格納した連想配列
 */
function TabMenuSet(elem, option) {
	this._setOption(option);
	this._setElem(elem);
	this._ehMouseover();
	this._ehMouseout();
	this._ehClick();
	this._initTab();
}

$.extend(TabMenuSet.prototype, /** @lends TabMenuSet.prototype */ {
	/**
	 * @private
	 * @desc オプションを設定
	 * @param {Object} option - オプションを格納した連想配列
	 */
	_setOption: function(option) {
		this.option = $.extend({
			init_tab: 0,
			chg_by_hover: false
		}, option);
	},

	/**
	 * プラグインで使用するHTML要素の初期設定
	 * @param {Object} elem - プラグインを適用するHTML要素
	 */
	_setElem: function(elem) {
		this.elem = {
			root  : $(elem).addClass('jqtab'),
			title : $(elem).children().eq(0).addClass('jqtab_title'),
			body  : $(elem).children().eq(1).addClass('jqtab_body')
		};
	},

	/**
	 * @private
	 * @desc イベントハンドラ: マウスオーバー
	 */
	_ehMouseover: function() {
		var self = this;
		// タブがマウスオーバーされた場合の動作
		$(this.elem.title).children().children('a').mouseover(function(ev) {
			if (self.option.chg_by_hover) {
				self._changeHash(ev);
				self._changeTabBody(ev.target);
			} else {
				var current = $(self.elem.root).find('.jqtab_hover');	
				// マウスオーバーされたタブと表示中のタブが違っている場合のみ、下記を行う
				if (!$(ev.target).is(current)) {
					// クリックされたタブを元に、表示短縮用の変数を作成
					$(current).removeClass('jqtab_hover');
					$(ev.target).addClass('jqtab_hover');
				}
			}
		});
	},

	/**
	 * @private
	 * @desc イベントハンドラ: マウスアウト
	 */
	_ehMouseout: function() {
		var self = this;
		$(self.elem.title).children().children('a').mouseout(function(ev) {
			if (!self.option.chg_by_hover) {
				$(ev.target).removeClass('jqtab_hover');
			}
		});
	},

	/**
	 * @private
	 * @desc イベントハンドラ: クリック
	 */
	_ehClick: function() {
		var self = this;
		$(this.elem.title).children().children('a').click(function(ev) {
			if (!self.option.chg_by_hover) {
				self._changeHash(ev);
				self._changeTabBody(ev.target);
			}
		});
	},

	/**
	 * @private
	 * @desc タブに設定されたページ内リンクの挙動を、ブラウザのデフォルト機能に代わって実行する。
	 * @param {Object} ev - イベントオブジェクト
	 */
	_changeHash: function(ev) {
		var idx = $(this.elem.title).children().children('a').index(ev.target);
		var body_id = $(this.elem.body).children().eq(idx).attr('id');
		if (body_id) {
			ev.preventDefault();
			location.hash = body_id;
		}
	},

	/**
	 * @private
	 * @desc タブ本文の表示を切り替える
	 * @param {Object} target - イベントが発火したHTML要素のオブジェクト
	 */
	_changeTabBody: function(target) {
		// クリックされたタブを元に、表示短縮用の変数を作成
		var current_menu = $(this.elem.root).find('.jqtab_selected');
		var next_index   = $(this.elem.title).children().children('a').index(target);
		var current_body = $(this.elem.body).children(':visible');
		var next_body    = $(this.elem.body).children().eq(next_index);

		// マウスオーバーされたタブと表示中のタブが違っている場合のみ、下記を行う
		if (!$(target).is(current_menu)) {
			$(target).addClass('jqtab_selected');
			$(current_menu).removeClass('jqtab_selected');
			$(current_body).hide();
			$(next_body).show();
		}
	},

	/**
	 * @private
	 * @desc タブの初期状態を設定
	 */
	_initTab: function() {
		var init_idx = this.option.init_tab;
		
		// ページ内リンクへの移動が指定されている場合にのみ実行
		if (location.hash != '') {
			var id = location.hash.replace('#', '');
			$(this.elem.body).children().each(function(idx, obj) {
				if ($(obj).attr('id') == id) init_idx = idx;
			});
		}
		
		$(this.elem.title).children().children().eq(init_idx).addClass('jqtab_selected');
		$(this.elem.body).children().eq(init_idx).show();
	},
});

})( /** namespace */ jQuery);
